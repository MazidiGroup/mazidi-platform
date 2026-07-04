import { Prisma, prisma } from "@mazidi/db";
import type { User } from "@supabase/supabase-js";

/**
 * Client-portal data access. Every query is scoped by the authenticated
 * user's Customer row — the app-layer twin of the RLS policies.
 */

export async function ensureCustomer(user: User) {
  // Mirror the auth user into our User table, then guarantee a Customer.
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "Client";

  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email ?? "", fullName },
    create: { id: user.id, email: user.email ?? "", fullName },
  });

  // Race-safe: layout + page components call this in parallel within one
  // request (App Router). create → on P2002 re-fetch; membership + demo
  // seeding run only in the branch that won the create (exactly once).
  let customer = await prisma.customer.findUnique({ where: { userId: user.id } });
  if (!customer) {
    try {
      customer = await prisma.customer.create({ data: { userId: user.id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return prisma.customer.findUniqueOrThrow({ where: { userId: user.id } });
      }
      throw e;
    }
    // Compound unique (userId, companyId, role) has companyId = null here and
    // Postgres treats NULLs as distinct — so guard instead of relying on upsert.
    const existingClientRole = await prisma.membership.findFirst({
      where: { userId: user.id, companyId: null, role: "CLIENT" },
    });
    if (!existingClientRole) {
      await prisma.membership.create({ data: { userId: user.id, role: "CLIENT" } });
    }
    if (process.env.DEMO_MODE === "true") await seedDemoEngagements(customer.id);
  }
  return customer;
}

export async function getDashboard(customerId: string) {
  const [projects, invoices, activities, recommendations] = await Promise.all([
    prisma.project.findMany({
      where: { customerId, status: { in: ["PLANNED", "ACTIVE"] } },
      include: { company: { select: { name: true, slug: true, pillar: true } } },
      orderBy: { dueAt: "asc" },
    }),
    prisma.invoice.findMany({
      where: { customerId },
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.activity.findMany({ where: { customerId }, orderBy: { at: "desc" }, take: 8 }),
    // Cross-sell: live companies the customer is NOT yet using (docs/01 Journey C)
    prisma.company.findMany({
      where: { status: "LIVE", customers: { none: { customerId } } },
      select: { slug: true, name: true, pillar: true, description: true, brand: true },
      take: 3,
    }),
  ]);

  const outstanding = invoices
    .filter((i) => i.status === "DUE" || i.status === "OVERDUE" || i.status === "SENT")
    .reduce((sum, i) => sum + Number(i.amount) + Number(i.tax), 0);

  return { projects, invoices, activities, recommendations, outstanding };
}

export async function listInvoices(customerId: string) {
  return prisma.invoice.findMany({
    where: { customerId },
    include: { company: { select: { name: true, slug: true } }, payments: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listProjects(customerId: string) {
  return prisma.project.findMany({
    where: { customerId },
    include: {
      company: { select: { name: true, slug: true, pillar: true } },
      milestones: { orderBy: { dueAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listDocuments(customerId: string) {
  return prisma.document.findMany({ where: { customerId }, orderBy: { createdAt: "desc" } });
}

/** DEMO_MODE=true only: give a first-time login something real to look at. */
async function seedDemoEngagements(customerId: string) {
  const bySlug = async (slug: string) =>
    prisma.company.findUniqueOrThrow({ where: { slug }, select: { id: true, name: true } });
  const [construction, accounting, marketing] = await Promise.all([
    bySlug("construction"), bySlug("accounting"), bySlug("marketing"),
  ]);
  const now = Date.now();
  const days = (n: number) => new Date(now + n * 86_400_000);

  await prisma.customerCompany.createMany({
    data: [construction, accounting, marketing].map((c) => ({ customerId, companyId: c.id })),
  });

  const project = await prisma.project.create({
    data: {
      companyId: construction.id, customerId, name: "Clinic fit-out — Meridian House",
      status: "ACTIVE", progress: 82, startsAt: days(-120), dueAt: days(21),
      budget: 96000,
      milestones: {
        create: [
          { name: "Design freeze", dueAt: days(-90), done: true },
          { name: "First fix complete", dueAt: days(-30), done: true },
          { name: "Practical completion", dueAt: days(21) },
        ],
      },
    },
  });

  await prisma.invoice.createMany({
    data: [
      { number: `INV-${customerId.slice(0, 4)}-2214`, companyId: construction.id, customerId, amount: 3600, tax: 720, status: "DUE", dueAt: days(7), lines: [{ desc: "Fit-out stage 4", qty: 1, unit: 3600 }] },
      { number: `INV-${customerId.slice(0, 4)}-2209`, companyId: accounting.id, customerId, amount: 449, tax: 89.8, status: "DUE", dueAt: days(9), lines: [{ desc: "Growth plan — July", qty: 1, unit: 449 }] },
      { number: `INV-${customerId.slice(0, 4)}-2198`, companyId: marketing.id, customerId, amount: 2400, tax: 480, status: "PAID", dueAt: days(-14), lines: [{ desc: "Scale plan — June", qty: 1, unit: 2400 }] },
    ],
  });

  await prisma.activity.createMany({
    data: [
      { companyId: construction.id, customerId, kind: "SYSTEM", refId: project.id, title: "Site inspection passed", body: {} },
      { companyId: marketing.id, customerId, kind: "NOTE", title: "Campaign draft ready for review", body: {} },
      { companyId: accounting.id, customerId, kind: "SYSTEM", title: "June management accounts published", body: {} },
    ],
  });
}

/** Notifications — written by the automation engine's "recommend" action. */
export async function listNotifications(userId: string) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { at: "desc" }, take: 50 });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
