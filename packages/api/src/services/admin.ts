import { Prisma, prisma } from "@mazidi/db";
import type { CompanyStatus, Pillar, Role } from "@mazidi/db";
import type { User } from "@supabase/supabase-js";

/**
 * Admin control plane (Module 3, docs/01 §Admin dashboard).
 *
 * Access: SUPER_ADMIN (group-level membership, companyId null) sees and
 * manages everything; COMPANY_ADMIN is scoped to their companies and cannot
 * grant admin roles. Every mutation writes AuditLog (docs/01 §7) and emits
 * OutboxEvent where the ecosystem should react.
 */

export class AdminError extends Error {
  constructor(message: string, public status = 403) { super(message); }
}

export interface AdminContext {
  isSuper: boolean;
  companyIds: string[]; // scope for COMPANY_ADMIN; all companies for super
}

const STAFF_ROLES: Role[] = ["EMPLOYEE", "MANAGER", "COMPANY_ADMIN"];

export async function requireAdmin(user: User): Promise<AdminContext | null> {
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "Admin";
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email ?? "", fullName },
    create: { id: user.id, email: user.email ?? "", fullName },
  });

  let memberships = await prisma.membership.findMany({
    where: { userId: user.id, role: { in: ["SUPER_ADMIN", "COMPANY_ADMIN"] } },
  });

  if (memberships.length === 0) {
    if (process.env.DEMO_MODE !== "true") return null;
    // DEV ONLY: first admin login self-provisions SUPER_ADMIN. Production
    // bootstrap: grant via SQL once, then manage successors in this UI.
    try {
      await prisma.membership.create({ data: { userId: user.id, role: "SUPER_ADMIN" } });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    }
    memberships = await prisma.membership.findMany({
      where: { userId: user.id, role: { in: ["SUPER_ADMIN", "COMPANY_ADMIN"] } },
    });
  }

  const isSuper = memberships.some((m) => m.role === "SUPER_ADMIN" && m.companyId === null);
  const companyIds = isSuper
    ? (await prisma.company.findMany({ select: { id: true } })).map((c) => c.id)
    : [...new Set(memberships.map((m) => m.companyId).filter((x): x is string => !!x))];
  if (!isSuper && companyIds.length === 0) return null;
  return { isSuper, companyIds };
}

function assertCompanyInScope(ctx: AdminContext, companyId: string) {
  if (!ctx.isSuper && !ctx.companyIds.includes(companyId))
    throw new AdminError("Outside your company scope");
}

async function audit(userId: string, action: string, entity: string, entityId: string, diff?: unknown, companyId?: string | null) {
  await prisma.auditLog.create({
    data: { userId, companyId: companyId ?? null, action, entity, entityId, diff: (diff as Prisma.InputJsonValue) ?? undefined },
  });
}

// ── Overview / system analytics ──────────────────────────

export async function getAdminOverview(ctx: AdminContext) {
  const scope = ctx.isSuper ? {} : { companyId: { in: ctx.companyIds } };
  const [revenue, revenueByCompany, customers, newLeads, openDeals, outbox, auditTrail, companies] =
    await Promise.all([
      prisma.invoice.aggregate({ where: { status: "PAID", ...scope }, _sum: { amount: true } }),
      prisma.invoice.groupBy({ by: ["companyId"], where: { status: "PAID", ...scope }, _sum: { amount: true } }),
      prisma.customer.count(),
      prisma.lead.count({ where: { status: "NEW", ...scope } }),
      prisma.deal.aggregate({ where: { stage: { notIn: ["WON", "LOST"] }, ...scope }, _sum: { value: true } }),
      prisma.outboxEvent.findMany({ orderBy: { at: "desc" }, take: 8, where: ctx.isSuper ? {} : { companyId: { in: ctx.companyIds } } }),
      prisma.auditLog.findMany({ orderBy: { at: "desc" }, take: 8, where: ctx.isSuper ? {} : { companyId: { in: ctx.companyIds } } }),
      prisma.company.findMany({ select: { id: true, name: true, slug: true, pillar: true, status: true }, orderBy: { name: "asc" } }),
    ]);

  const nameById = new Map(companies.map((c) => [c.id, c.name]));
  return {
    totalRevenue: Number(revenue._sum.amount ?? 0),
    revenueByCompany: revenueByCompany
      .map((r) => ({ company: nameById.get(r.companyId) ?? r.companyId, amount: Number(r._sum.amount ?? 0) }))
      .sort((a, b) => b.amount - a.amount),
    customers, newLeads,
    openPipeline: Number(openDeals._sum.value ?? 0),
    outbox, auditTrail, companies,
  };
}

// ── Tenant manager ───────────────────────────────────────

export async function adminListCompanies(ctx: AdminContext) {
  return prisma.company.findMany({
    where: ctx.isSuper ? {} : { id: { in: ctx.companyIds } },
    include: { services: { orderBy: { sortOrder: "asc" } }, _count: { select: { customers: true, leads: true, invoices: true } } },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
}

export async function adminCreateCompany(
  ctx: AdminContext, userId: string,
  input: { name: string; slug: string; pillar: Pillar; description: string },
) {
  if (!ctx.isSuper) throw new AdminError("Only a group admin can create companies");
  const mono = input.name.replace(/^Mazidi\s+/i, "").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  try {
    const company = await prisma.company.create({
      data: {
        name: input.name, slug: input.slug, pillar: input.pillar, description: input.description,
        status: "DRAFT",
        brand: { accent: input.pillar.toLowerCase(), mono },
        domains: [`${input.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "mazidigroup.com"}`],
      },
    });
    await audit(userId, "company.create", "Company", company.id, { input }, company.id);
    await prisma.outboxEvent.create({
      data: { event: "tenant.created", companyId: company.id, payload: { slug: company.slug } },
    });
    return company;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      throw new AdminError(`Slug "${input.slug}" is already taken`, 409);
    throw e;
  }
}

export async function adminUpdateCompany(
  ctx: AdminContext, userId: string,
  input: { companyId: string; tagline?: string; description?: string; status?: CompanyStatus },
) {
  assertCompanyInScope(ctx, input.companyId);
  if (input.status && !ctx.isSuper) throw new AdminError("Only a group admin can change publish status");
  const { companyId, ...data } = input;
  const before = await prisma.company.findUniqueOrThrow({
    where: { id: companyId }, select: { tagline: true, description: true, status: true },
  });
  const company = await prisma.company.update({ where: { id: companyId }, data });
  await audit(userId, "company.update", "Company", companyId, { before, after: data }, companyId);
  if (input.status === "LIVE" && before.status !== "LIVE") {
    await prisma.outboxEvent.create({
      data: { event: "tenant.published", companyId, payload: { slug: company.slug } },
    });
  }
  return company;
}

export async function adminAddService(
  ctx: AdminContext, userId: string,
  input: { companyId: string; name: string; summary: string; priceFrom?: number },
) {
  assertCompanyInScope(ctx, input.companyId);
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const count = await prisma.service.count({ where: { companyId: input.companyId } });
  try {
    const service = await prisma.service.create({
      data: { companyId: input.companyId, slug, name: input.name, summary: input.summary, priceFrom: input.priceFrom, sortOrder: count },
    });
    await audit(userId, "service.create", "Service", service.id, { input }, input.companyId);
    return service;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      throw new AdminError(`Service "${input.name}" already exists for this company`, 409);
    throw e;
  }
}

// ── Users & roles ────────────────────────────────────────

export async function adminListUsers(ctx: AdminContext) {
  return prisma.user.findMany({
    include: {
      memberships: { include: { company: { select: { name: true } } } },
      employee: { select: { id: true, title: true } },
      customer: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function adminSetMembership(
  ctx: AdminContext, actorId: string,
  input: { action: "grant" | "revoke"; targetUserId: string; companyId: string | null; role: Role; title?: string },
) {
  // Authorization matrix (docs/01 §7 RBAC):
  if (input.companyId === null && !ctx.isSuper)
    throw new AdminError("Only a group admin can manage group-level roles");
  if ((input.role === "SUPER_ADMIN" || input.role === "COMPANY_ADMIN") && !ctx.isSuper)
    throw new AdminError("Only a group admin can grant admin roles");
  if (input.companyId) assertCompanyInScope(ctx, input.companyId);
  if (input.action === "revoke" && input.role === "SUPER_ADMIN" && input.targetUserId === actorId)
    throw new AdminError("You cannot revoke your own group admin role", 409);

  if (input.action === "grant") {
    const existing = await prisma.membership.findFirst({
      where: { userId: input.targetUserId, companyId: input.companyId, role: input.role },
    });
    if (!existing) {
      await prisma.membership.create({
        data: { userId: input.targetUserId, companyId: input.companyId, role: input.role },
      });
    }
    // Staff roles need an Employee profile for team-app access
    if (STAFF_ROLES.includes(input.role)) {
      await prisma.employee.upsert({
        where: { userId: input.targetUserId },
        update: input.title ? { title: input.title } : {},
        create: { userId: input.targetUserId, title: input.title ?? "Team member" },
      });
    }
    await prisma.outboxEvent.create({
      data: { event: "membership.granted", companyId: input.companyId, payload: { userId: input.targetUserId, role: input.role } },
    });
  } else {
    await prisma.membership.deleteMany({
      where: { userId: input.targetUserId, companyId: input.companyId, role: input.role },
    });
  }
  await audit(actorId, `membership.${input.action}`, "Membership",
    `${input.targetUserId}:${input.companyId ?? "group"}:${input.role}`, { input }, input.companyId);
}
