import { Prisma, prisma } from "@mazidi/db";
import type { EventIngestInput } from "../schemas";

/**
 * Event bridge (docs: Autopilot/02_EVENT_BRIDGE_SPEC.md) — the inbound half of
 * the outbox. The two fitness apps run on MongoDB and cannot see this database,
 * so they POST domain events here and we translate them into OutboxEvent rows.
 * The existing engine (services/automations.ts) drains them unchanged.
 *
 * This module writes to the outbox and nothing else. No side effects, no
 * notifications, no CRM mutations beyond the identity resolution that the
 * engine's actions require. One place for automation to happen, and it is
 * not here.
 */

export class EventIngestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "EventIngestError";
  }
}

/**
 * Company slug per event namespace. Kept as a map rather than derived from the
 * event string so that adding an event cannot silently attribute revenue to the
 * wrong company.
 */
const EVENT_COMPANY: Record<string, string> = {
  "coach.signed_up": "coachapp",
  "coach.activated": "coachapp",
  "coach.client_added": "coachapp",
  "coach.went_inactive": "coachapp",
  "coach.subscription_started": "coachapp",
  "coach.subscription_cancelled": "coachapp",
  "consumer.premium_started": "gymapp",
  "consumer.premium_cancellation_scheduled": "gymapp",
  "consumer.premium_cancelled": "gymapp",
  "consumer.premium_renewed": "gymapp",
  "consumer.billing_issue": "gymapp",
  "consumer.daily_rollup": "gymapp",
};

/** Events that must resolve to a real Customer — see spec §3 (asymmetric identity). */
const REQUIRES_IDENTITY = new Set([
  "coach.signed_up",
  "coach.activated",
  "coach.client_added",
  "coach.went_inactive",
  "coach.subscription_started",
  "coach.subscription_cancelled",
]);

export async function ingestEvent(input: EventIngestInput) {
  const companySlug = EVENT_COMPANY[input.event];
  if (!companySlug) {
    // Unreachable if the Zod enum and this map agree; guards against them drifting.
    throw new EventIngestError(`No company mapping for event "${input.event}"`, 500);
  }

  const company = await prisma.company.findFirst({
    where: { slug: companySlug },
    select: { id: true },
  });
  if (!company) {
    // Fail loudly: a missing Company means the seed has not run. Storing the
    // event with a null companyId would make every companySlug-scoped rule
    // silently skip it, which is far harder to notice later.
    throw new EventIngestError(
      `Company "${companySlug}" not found — run the seed that creates it`,
      503,
    );
  }

  let customerId: string | null = null;
  if (REQUIRES_IDENTITY.has(input.event)) {
    if (!input.actor?.email) {
      throw new EventIngestError(`Event "${input.event}" requires actor.email`, 422);
    }
    customerId = await resolveCustomer(input.actor.email, input.actor.name);
  }

  const payload: Prisma.InputJsonValue = {
    ...input.data,
    source: input.source,
    occurredAt: input.occurredAt,
    ...(customerId ? { customerId } : {}),
    ...(input.actor?.externalUserId ? { externalUserId: input.actor.externalUserId } : {}),
  };

  try {
    const created = await prisma.outboxEvent.create({
      data: {
        event: input.event,
        companyId: company.id,
        externalId: input.externalId,
        payload,
      },
      select: { id: true },
    });
    return { ok: true as const, eventId: created.id, duplicate: false as const };
  } catch (e) {
    // P2002 on externalId — the caller retried, or delivery was at-least-once.
    // Same discipline as billing.ts:290. Replay is a no-op by construction.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const existing = await prisma.outboxEvent.findUnique({
        where: { externalId: input.externalId },
        select: { id: true },
      });
      return { ok: true as const, eventId: existing?.id ?? null, duplicate: true as const };
    }
    throw e;
  }
}

/**
 * Resolve an app-side coach to a platform Customer, creating both User and
 * Customer if this is the first event we have seen for them.
 *
 * Coaches are B2B customers and belong in the CRM. Consumers deliberately do
 * not go through here — see spec §3 for why per-user consumer identities would
 * be actively harmful.
 *
 * Shadow users: User.id is normally the Supabase auth uid, but a coach who has
 * never opened the client portal has no auth user. We mint a uuid so the FK is
 * satisfiable. auth.uid() will never match that row, so the customer_self RLS
 * policy will not match either — harmless, because these coaches do not use the
 * portal. `origin` marks them so they are distinguishable from real portal
 * accounts and can be reconciled if the coach later signs in properly.
 */
async function resolveCustomer(email: string, name?: string): Promise<string> {
  const normalised = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalised },
    select: { id: true, customer: { select: { id: true } } },
  });

  if (existing?.customer) return existing.customer.id;

  if (existing) {
    // Real portal user who has no Customer row yet (e.g. staff, or a signup
    // that never completed provisioning). Attach one rather than minting a
    // duplicate identity.
    const customer = await prisma.customer.create({
      data: { userId: existing.id, orgName: name ?? null },
      select: { id: true },
    });
    return customer.id;
  }

  const userId = crypto.randomUUID();
  try {
    const created = await prisma.user.create({
      data: {
        id: userId,
        email: normalised,
        fullName: name?.trim() || normalised.split("@")[0],
        customer: { create: { orgName: name ?? null } },
      },
      select: { customer: { select: { id: true } } },
    });
    if (!created.customer) throw new EventIngestError("Customer creation failed", 500);
    return created.customer.id;
  } catch (e) {
    // Concurrent ingest of two events for the same new coach — one loses the
    // race on User.email. Re-read rather than fail; the winner's row is correct.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const raced = await prisma.user.findUnique({
        where: { email: normalised },
        select: { customer: { select: { id: true } } },
      });
      if (raced?.customer) return raced.customer.id;
    }
    throw e;
  }
}

// ── Entitlement lookup (outbound: coach app asks us) ─────

/**
 * Does this email hold an active subscription to a given service?
 *
 * fitness_muscle_coach bills through this platform rather than running its own
 * Stripe integration, so it needs to ask us whether a coach is paid. Read-only,
 * shared-secret authenticated, and deliberately narrow: it answers one boolean
 * plus a start date, never returns customer records or subscription internals.
 */
export async function getEntitlement(email: string, planSlug: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { customer: { select: { id: true } } },
  });
  if (!user?.customer) return { paid: false, plan: planSlug, since: null };

  const service = await prisma.service.findFirst({
    where: { slug: planSlug },
    select: { id: true },
  });
  if (!service) return { paid: false, plan: planSlug, since: null };

  // active, trialing and past_due are all returned. past_due is reported as
  // NOT paid but WITH its status and period end, so the caller can run its own
  // grace window — the coach app keeps full access for a configured number of
  // days after the failed period, then drops to read-only.
  const sub = await prisma.subscription.findFirst({
    where: {
      customerId: user.customer.id,
      serviceId: service.id,
      status: { in: ["active", "trialing", "past_due"] },
    },
    orderBy: { renewsAt: "desc" },
    select: { status: true, renewsAt: true },
  });

  // status and currentPeriodEnd are both returned so the caller can apply its
  // OWN dunning policy. The coach app runs a grace window from the end of the
  // period that failed to pay; baking that policy in here would make it a
  // platform concern and require a deploy to tune.
  return {
    paid: sub !== null && sub.status !== "past_due",
    plan: planSlug,
    status: sub?.status ?? null,
    currentPeriodEnd: sub?.renewsAt?.toISOString() ?? null,
    /** @deprecated use currentPeriodEnd — kept so an older caller keeps working */
    since: sub?.renewsAt?.toISOString() ?? null,
  };
}
