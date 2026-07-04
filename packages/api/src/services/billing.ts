import Stripe from "stripe";
import { Prisma, prisma } from "@mazidi/db";

/**
 * Stripe billing (docs/04 §/v1/finance, §Integrations).
 *
 * Model:
 *  - ONE Stripe Customer per group-level Mazidi Customer (one account, docs/01 §6).
 *  - Tenant association travels in metadata (companyId) and lands on the
 *    tenant-scoped rows we own: Invoice, Payment, Subscription (companyId).
 *  - Plans = Service rows with stripePriceId (created by scripts/sync-plans.ts).
 *  - Stripe webhooks are the single source of truth for money state; every
 *    transition writes Activity (CRM) + OutboxEvent (n8n automations).
 *
 * SERVER-ONLY: lives in the @mazidi/api barrel; clients import /schemas only.
 */

export class BillingError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

let stripeSingleton: Stripe | null = null;
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new BillingError("STRIPE_SECRET_KEY is not configured", 500);
  return (stripeSingleton ??= new Stripe(key));
}

/** Find-or-create the Stripe Customer for a Mazidi customer. */
export async function ensureStripeCustomer(customerId: string): Promise<string> {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: customerId },
    include: { user: { select: { email: true, fullName: true } } },
  });
  if (customer.stripeCustomerId) return customer.stripeCustomerId;

  const created = await getStripe().customers.create({
    email: customer.user.email,
    name: customer.orgName ?? customer.user.fullName,
    metadata: { mazidiCustomerId: customer.id },
  });
  await prisma.customer.update({
    where: { id: customer.id },
    data: { stripeCustomerId: created.id },
  });
  return created.id;
}

const PAYABLE = ["SENT", "DUE", "OVERDUE"] as const;

/** Checkout Session for a single invoice (mode: payment). Returns redirect URL. */
export async function createInvoiceCheckout(customerId: string, invoiceId: string, origin: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, customerId },
    include: { company: { select: { id: true, name: true } } },
  });
  if (!invoice) throw new BillingError("Invoice not found", 404);
  if (!(PAYABLE as readonly string[]).includes(invoice.status))
    throw new BillingError(`Invoice is ${invoice.status.toLowerCase()} — nothing to pay`);

  const stripeCustomerId = await ensureStripeCustomer(customerId);
  const total = Math.round((Number(invoice.amount) + Number(invoice.tax)) * 100);

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer: stripeCustomerId,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: invoice.currency.toLowerCase(),
        unit_amount: total,
        product_data: { name: `Invoice ${invoice.number} — ${invoice.company.name}` },
      },
    }],
    success_url: `${origin}/invoices?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/invoices?canceled=1`,
    metadata: {
      kind: "invoice",
      invoiceId: invoice.id,
      companyId: invoice.companyId,
      customerId,
    },
  });
  if (!session.url) throw new BillingError("Stripe did not return a checkout URL", 502);
  return { url: session.url };
}

/** Checkout Session for a plan subscription (mode: subscription). */
export async function createSubscriptionCheckout(customerId: string, serviceId: string, origin: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { company: { select: { id: true, name: true } } },
  });
  if (!service?.stripePriceId)
    throw new BillingError("This service has no billing plan configured", 404);

  const stripeCustomerId = await ensureStripeCustomer(customerId);
  const metadata = {
    kind: "subscription",
    serviceId: service.id,
    companyId: service.companyId,
    customerId,
  };

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: service.stripePriceId, quantity: 1 }],
    subscription_data: { metadata },
    success_url: `${origin}/billing?subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/billing?canceled=1`,
    metadata,
  });
  if (!session.url) throw new BillingError("Stripe did not return a checkout URL", 502);
  return { url: session.url };
}

/** Stripe-hosted customer billing portal (payment methods, invoices, cancellations). */
export async function createBillingPortalSession(customerId: string, origin: string) {
  const stripeCustomerId = await ensureStripeCustomer(customerId);
  const session = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${origin}/billing`,
  });
  return { url: session.url };
}

/** Billing page data: the customer's subscriptions + all available plans. */
export async function getBillingOverview(customerId: string) {
  const [subscriptions, plans] = await Promise.all([
    prisma.subscription.findMany({ where: { customerId }, orderBy: { renewsAt: "asc" } }),
    prisma.service.findMany({
      where: { stripePriceId: { not: null } },
      include: { company: { select: { slug: true, name: true, pillar: true } } },
      orderBy: [{ companyId: "asc" }, { sortOrder: "asc" }],
    }),
  ]);

  // Enrich subscriptions (Subscription keeps scalar FKs by design — docs/03)
  const serviceIds = subscriptions.map((s) => s.serviceId);
  const services = serviceIds.length
    ? await prisma.service.findMany({
        where: { id: { in: serviceIds } },
        include: { company: { select: { name: true, pillar: true } } },
      })
    : [];
  const byId = new Map(services.map((s) => [s.id, s]));

  return {
    subscriptions: subscriptions.map((sub) => ({ ...sub, service: byId.get(sub.serviceId) ?? null })),
    plans,
  };
}

/**
 * Reconcile a Checkout Session on redirect-return. Stripe redirects the
 * browser BEFORE the webhook lands, so the success page would otherwise race
 * the webhook. Runs the same idempotent handlers the webhook runs — whichever
 * arrives second is a no-op. Ownership is verified via session metadata.
 */
export async function reconcileCheckoutSession(customerId: string, sessionId: string) {
  if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) return;
  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });
  if (session.metadata?.customerId !== customerId) return; // not this customer's session

  if (session.mode === "payment" && session.payment_status === "paid" && session.metadata?.invoiceId) {
    await markInvoicePaid(session);
  } else if (session.mode === "subscription" && session.subscription && typeof session.subscription !== "string") {
    await upsertSubscription(session.subscription as Stripe.Subscription);
  }
}

// ── Webhook processing (source of truth for money state) ──────────────

export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "payment" && session.metadata?.invoiceId) {
        await markInvoicePaid(session);
      }
      // mode === "subscription" is handled by customer.subscription.created
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      await upsertSubscription(event.data.object as Stripe.Subscription);
      return;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!existing) return;
      await prisma.$transaction([
        prisma.subscription.update({ where: { id: existing.id }, data: { status: "canceled" } }),
        prisma.outboxEvent.create({
          data: {
            event: "subscription.canceled",
            companyId: existing.companyId,
            payload: { subscriptionId: existing.id, customerId: existing.customerId },
          },
        }),
      ]);
      return;
    }
    case "invoice.paid": {
      // Recurring subscription renewals (Stripe-generated invoices)
      const inv = event.data.object as Stripe.Invoice;
      const subId = typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id;
      if (!subId) return;
      const existing = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: subId } });
      if (!existing) return;
      await prisma.$transaction([
        prisma.activity.create({
          data: {
            companyId: existing.companyId,
            customerId: existing.customerId,
            kind: "INVOICE",
            refId: existing.id,
            title: "Subscription renewed",
            body: { stripeInvoiceId: inv.id, amountPaid: (inv.amount_paid ?? 0) / 100 },
          },
        }),
        prisma.outboxEvent.create({
          data: {
            event: "subscription.renewed",
            companyId: existing.companyId,
            payload: { subscriptionId: existing.id, customerId: existing.customerId },
          },
        }),
      ]);
      return;
    }
    default:
      return; // unhandled event types are fine
  }
}

async function markInvoicePaid(session: Stripe.Checkout.Session) {
  const { invoiceId, companyId, customerId } = session.metadata as Record<string, string>;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  // Idempotent: Stripe retries webhooks
  if (paymentIntentId) {
    const dupe = await prisma.payment.findFirst({ where: { stripePaymentIntentId: paymentIntentId } });
    if (dupe) return;
  }
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice || invoice.status === "PAID") return;

  // Webhook and redirect-reconcile run concurrently by design; the unique
  // constraint on stripePaymentIntentId makes the loser's transaction fail
  // with P2002 — which simply means "already processed".
  try {
  await prisma.$transaction([
    prisma.payment.create({
      data: {
        invoiceId,
        amount: (session.amount_total ?? 0) / 100,
        method: "card",
        stripePaymentIntentId: paymentIntentId,
      },
    }),
    prisma.invoice.update({ where: { id: invoiceId }, data: { status: "PAID" } }),
    prisma.activity.create({
      data: {
        companyId,
        customerId,
        kind: "INVOICE",
        refId: invoiceId,
        title: `Invoice ${invoice.number} paid`,
        body: { amount: (session.amount_total ?? 0) / 100, via: "stripe_checkout" },
      },
    }),
    // Feeds AutomationRule "2nd invoice paid → Payroll" etc. (docs/04 §4)
    prisma.outboxEvent.create({
      data: { event: "invoice.paid", companyId, payload: { invoiceId, customerId } },
    }),
  ]);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return;
    throw e;
  }
}

async function upsertSubscription(sub: Stripe.Subscription) {
  // current_period_end lives on the subscription (≤ acacia) or its items (basil+)
  const periodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    (sub.items?.data?.[0] as unknown as { current_period_end?: number })?.current_period_end;
  const renewsAt = periodEnd ? new Date(periodEnd * 1000) : new Date();

  const existing = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: sub.id } });
  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: { status: sub.status, renewsAt },
    });
    return;
  }

  const { serviceId, companyId, customerId } = (sub.metadata ?? {}) as Record<string, string>;
  if (!serviceId || !companyId || !customerId) return; // not one of ours

  try {
  await prisma.$transaction([
    prisma.subscription.create({
      data: {
        companyId, customerId, serviceId,
        stripeSubscriptionId: sub.id,
        status: sub.status,
        renewsAt,
      },
    }),
    // Tenant-level billing association → customer now "uses" this company,
    // which updates cross-sell recommendations automatically (docs/01 Journey C)
    prisma.customerCompany.upsert({
      where: { customerId_companyId: { customerId, companyId } },
      update: {},
      create: { customerId, companyId },
    }),
    prisma.activity.create({
      data: {
        companyId, customerId,
        kind: "SYSTEM",
        refId: sub.id,
        title: "Subscription started",
        body: { serviceId, status: sub.status },
      },
    }),
    prisma.outboxEvent.create({
      data: { event: "customer.active", companyId, payload: { customerId, serviceId } },
    }),
  ]);
  } catch (e) {
    // Unique stripeSubscriptionId: concurrent webhook/reconcile — already handled.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return;
    throw e;
  }
}
