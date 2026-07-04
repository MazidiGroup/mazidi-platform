import { Prisma, prisma } from "@mazidi/db";
import type { DealStage, LeadStatus, Priority, TaskStatus } from "@mazidi/db";
import type { User } from "@supabase/supabase-js";
import { LEAD_TRANSITIONS, type LeadStatusValue } from "../schemas";

/**
 * Employee-portal data access (Module 2, docs/01 §Employee portal).
 *
 * Tenancy model — DIFFERENT AXIS from the client portal:
 *   clients   → rows WHERE customerId = their Customer id
 *   employees → rows WHERE companyId IN (their Membership company ids)
 * A group-level membership (companyId = null, e.g. SUPER_ADMIN) grants all
 * live companies. Every query below takes the scope; nothing is unscoped.
 */

const EMPLOYEE_ROLES = ["EMPLOYEE", "MANAGER", "COMPANY_ADMIN", "SUPER_ADMIN"] as const;

export class TeamAccessError extends Error {
  constructor(message: string, public status = 403) { super(message); }
}

export interface TeamContext {
  employee: { id: string; title: string; department: string | null };
  companyIds: string[];
  isGroupLevel: boolean;
}

/** Resolve (or in DEMO_MODE provision) the employee context for a user. */
export async function ensureEmployee(user: User): Promise<TeamContext | null> {
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "Employee";
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email ?? "", fullName },
    create: { id: user.id, email: user.email ?? "", fullName },
  });

  // NOTE: layout + page components call this in PARALLEL within one request
  // (App Router renders them concurrently), so provisioning must be race-safe:
  // create → on P2002 re-fetch; one-time seeding runs only in the winning branch.
  let employee = await prisma.employee.findUnique({ where: { userId: user.id } });
  let createdNow = false;

  if (!employee) {
    if (process.env.DEMO_MODE !== "true") return null;
    // DEV ONLY: first team login self-provisions a scoped demo employee.
    // Production employees are created by the admin module (Module 3).
    try {
      employee = await prisma.employee.create({
        data: { userId: user.id, title: "Growth Strategist", department: "Marketing" },
      });
      createdNow = true;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        employee = await prisma.employee.findUnique({ where: { userId: user.id } });
        if (!employee) throw e; // lost the race AND row vanished — genuine error
      } else {
        throw e;
      }
    }
  }

  if (createdNow) {
    const demoCompanies = await prisma.company.findMany({
      where: { slug: { in: ["construction", "accounting", "marketing"] } },
      select: { id: true },
    });
    for (const c of demoCompanies) {
      await prisma.membership.upsert({
        where: { userId_companyId_role: { userId: user.id, companyId: c.id, role: "EMPLOYEE" } },
        update: {},
        create: { userId: user.id, companyId: c.id, role: "EMPLOYEE" },
      });
    }
    await seedDemoCrm(demoCompanies.map((c) => c.id), user.id);
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id, role: { in: [...EMPLOYEE_ROLES] } },
  });

  const isGroupLevel = memberships.some((m) => m.companyId === null);
  const companyIds = isGroupLevel
    ? (await prisma.company.findMany({ where: { status: "LIVE" }, select: { id: true } })).map((c) => c.id)
    : [...new Set(memberships.map((m) => m.companyId).filter((x): x is string => !!x))];

  if (companyIds.length === 0) return null;
  return {
    employee: { id: employee.id, title: employee.title, department: employee.department },
    companyIds,
    isGroupLevel,
  };
}

/** Guard: entity must belong to a company in scope. */
function assertInScope(companyId: string, ctx: TeamContext) {
  if (!ctx.companyIds.includes(companyId))
    throw new TeamAccessError("Outside your company scope");
}

// ── Dashboard ────────────────────────────────────────────

export async function getTeamDashboard(ctx: TeamContext, userId: string) {
  const scope = { companyId: { in: ctx.companyIds } };
  const [newLeads, openDeals, myOpenTasks, wonDeals, activities] = await Promise.all([
    prisma.lead.count({ where: { ...scope, status: "NEW" } }),
    prisma.deal.findMany({ where: { ...scope, stage: { notIn: ["WON", "LOST"] } }, select: { value: true } }),
    prisma.task.count({ where: { ...scope, assigneeId: userId, status: { not: "DONE" } } }),
    prisma.deal.count({ where: { ...scope, stage: "WON" } }),
    prisma.activity.findMany({ where: scope, orderBy: { at: "desc" }, take: 10 }),
  ]);
  const pipelineValue = openDeals.reduce((sum, d) => sum + Number(d.value), 0);
  return { newLeads, pipelineValue, myOpenTasks, wonDeals, activities };
}

// ── CRM ──────────────────────────────────────────────────

export type LeadViewFilter = "active" | "closed" | "all";
const LEAD_VIEW: Record<Exclude<LeadViewFilter, "all">, LeadStatus[]> = {
  active: ["NEW", "QUALIFIED", "CONTACTED"],
  closed: ["CONVERTED", "LOST"],
};

/** Leads table defaults to Active (working view); Closed keeps the audit trail one click away. */
export async function listLeads(ctx: TeamContext, view: LeadViewFilter = "active") {
  return prisma.lead.findMany({
    where: {
      companyId: { in: ctx.companyIds },
      ...(view === "all" ? {} : { status: { in: LEAD_VIEW[view] } }),
    },
    include: {
      contact: { select: { name: true, email: true } },
      company: { select: { name: true, pillar: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function updateLeadStatus(ctx: TeamContext, userId: string, leadId: string, status: LeadStatus) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new TeamAccessError("Lead not found", 404);
  assertInScope(lead.companyId, ctx);

  // Funnel enforcement: forward-only; CONVERTED and LOST are terminal.
  const legal = LEAD_TRANSITIONS[lead.status as LeadStatusValue] ?? [];
  if (status !== lead.status && !legal.includes(status as LeadStatusValue)) {
    throw new TeamAccessError(
      legal.length === 0
        ? `${lead.status} is terminal — status cannot change`
        : `Illegal transition ${lead.status} → ${status} (allowed: ${legal.join(", ")})`,
      409,
    );
  }
  if (status === lead.status) return; // no-op, no audit noise

  await prisma.$transaction([
    prisma.lead.update({ where: { id: leadId }, data: { status } }),
    prisma.activity.create({
      data: {
        companyId: lead.companyId, kind: "NOTE", refId: leadId, contactId: lead.contactId,
        authorId: userId, title: `Lead status → ${status}`, body: { from: lead.status, to: status },
      },
    }),
    ...(status === "CONVERTED"
      ? [prisma.outboxEvent.create({
          data: { event: "lead.converted", companyId: lead.companyId, payload: { leadId } },
        })]
      : []),
  ]);
}

const STAGE_PROBABILITY: Record<DealStage, number> = {
  LEAD: 20, QUALIFIED: 40, PROPOSAL: 60, NEGOTIATION: 75, WON: 100, LOST: 0,
};

/** Lead ids in scope that already have a linked deal (hide the create action). */
export async function listLeadIdsWithDeals(ctx: TeamContext): Promise<Set<string>> {
  const rows = await prisma.deal.findMany({
    where: { companyId: { in: ctx.companyIds }, leadId: { not: null } },
    select: { leadId: true },
  });
  return new Set(rows.map((r) => r.leadId).filter((x): x is string => !!x));
}

/**
 * Create a deal — standalone or from a lead. From a CONVERTED lead it starts
 * at QUALIFIED and links Deal.leadId, closing the lead → pipeline gap.
 * Emits OutboxEvent("deal.created"); WON later emits "deal.won" as before.
 */
export async function createDeal(
  ctx: TeamContext, userId: string,
  input: { title: string; value: number; companyId?: string; leadId?: string },
) {
  let companyId = input.companyId ?? null;
  let stage: DealStage = "LEAD";

  if (input.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: input.leadId } });
    if (!lead) throw new TeamAccessError("Lead not found", 404);
    assertInScope(lead.companyId, ctx);
    const existing = await prisma.deal.findFirst({ where: { leadId: lead.id } });
    if (existing) throw new TeamAccessError("A deal already exists for this lead", 409);
    companyId = lead.companyId;
    if (lead.status === "CONVERTED") stage = "QUALIFIED";
  }
  if (!companyId) throw new TeamAccessError("companyId or leadId is required", 422);
  assertInScope(companyId, ctx);

  return prisma.$transaction(async (tx) => {
    const deal = await tx.deal.create({
      data: {
        companyId: companyId!,
        leadId: input.leadId ?? null,
        title: input.title,
        value: input.value,
        stage,
        probability: STAGE_PROBABILITY[stage],
        ownerId: userId,
      },
    });
    await tx.activity.create({
      data: {
        companyId: companyId!, kind: "NOTE", dealId: deal.id, authorId: userId,
        title: `Deal created: ${input.title}`,
        body: { value: input.value, stage, fromLeadId: input.leadId ?? null },
      },
    });
    await tx.outboxEvent.create({
      data: { event: "deal.created", companyId: companyId!, payload: { dealId: deal.id, value: input.value } },
    });
    return deal;
  });
}

export async function listDealsBoard(ctx: TeamContext) {
  return prisma.deal.findMany({
    where: { companyId: { in: ctx.companyIds } },
    include: {
      company: { select: { name: true, pillar: true } },
      lead: { select: { id: true, status: true, contact: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
}

export async function updateDealStage(ctx: TeamContext, userId: string, dealId: string, stage: DealStage) {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) throw new TeamAccessError("Deal not found", 404);
  assertInScope(deal.companyId, ctx);

  await prisma.$transaction([
    prisma.deal.update({
      where: { id: dealId },
      data: { stage, probability: STAGE_PROBABILITY[stage] },
    }),
    prisma.activity.create({
      data: {
        companyId: deal.companyId, kind: "NOTE", dealId, authorId: userId,
        title: `Deal "${deal.title}" → ${stage}`, body: { from: deal.stage, to: stage, value: Number(deal.value) },
      },
    }),
    // deal.won feeds AutomationRule "Marketing deal won → Sales Consulting" (docs/04 §4)
    ...(stage === "WON"
      ? [prisma.outboxEvent.create({
          data: {
            event: "deal.won", companyId: deal.companyId,
            payload: { dealId, customerId: deal.customerId, value: Number(deal.value) },
          },
        })]
      : []),
  ]);
}

// ── Tasks ────────────────────────────────────────────────

export async function listTasks(ctx: TeamContext, userId: string) {
  return prisma.task.findMany({
    where: {
      companyId: { in: ctx.companyIds },
      OR: [{ assigneeId: userId }, { assigneeId: null }],
    },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    take: 60,
  });
}

export async function createTask(
  ctx: TeamContext, userId: string,
  input: { companyId: string; title: string; priority: Priority; dueAt?: string },
) {
  assertInScope(input.companyId, ctx);
  const task = await prisma.task.create({
    data: {
      companyId: input.companyId,
      title: input.title,
      priority: input.priority,
      assigneeId: userId,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
    },
  });
  await prisma.activity.create({
    data: {
      companyId: input.companyId, kind: "NOTE", refId: task.id, authorId: userId,
      title: `Task created: ${input.title}`, body: { priority: input.priority },
    },
  });
  return task;
}

export async function setTaskStatus(ctx: TeamContext, userId: string, taskId: string, status: TaskStatus) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new TeamAccessError("Task not found", 404);
  assertInScope(task.companyId, ctx);
  await prisma.task.update({ where: { id: taskId }, data: { status } });
  if (status === "DONE") {
    await prisma.activity.create({
      data: {
        companyId: task.companyId, kind: "NOTE", refId: taskId, authorId: userId,
        title: `Task completed: ${task.title}`, body: {},
      },
    });
  }
}

/** Companies in scope (for the task form's company picker). */
export async function listScopeCompanies(ctx: TeamContext) {
  return prisma.company.findMany({
    where: { id: { in: ctx.companyIds } },
    select: { id: true, name: true, pillar: true },
    orderBy: { name: "asc" },
  });
}

// ── DEMO_MODE bootstrap ──────────────────────────────────

async function seedDemoCrm(companyIds: string[], userId: string) {
  const existing = await prisma.deal.count({ where: { companyId: { in: companyIds } } });
  if (existing > 0 || companyIds.length === 0) return;
  const [c0, c1, c2] = [companyIds[0]!, companyIds[1] ?? companyIds[0]!, companyIds[2] ?? companyIds[0]!];

  const contact = await prisma.contact.create({
    data: { companyId: c2, name: "Hassan Retail Group", email: "ops@hassanretail.example", source: "referral" },
  });
  await prisma.lead.createMany({
    data: [
      { companyId: c2, contactId: contact.id, source: "REFERRAL", status: "NEW", capturedFrom: {} },
      { companyId: c0, contactId: contact.id, source: "WEBSITE_FORM", status: "QUALIFIED", capturedFrom: {} },
    ],
  });
  await prisma.deal.createMany({
    data: [
      { companyId: c2, title: "Nova Dental launch campaign", value: 32000, stage: "QUALIFIED", probability: 40, ownerId: userId },
      { companyId: c2, title: "Whitfield Estates rebrand", value: 21000, stage: "PROPOSAL", probability: 60, ownerId: userId },
      { companyId: c0, title: "Al Reem Residences fit-out", value: 96000, stage: "NEGOTIATION", probability: 75, ownerId: userId },
      { companyId: c1, title: "Fractional CFO — retail group", value: 23400, stage: "LEAD", probability: 20, ownerId: userId },
    ],
  });
  await prisma.task.createMany({
    data: [
      { companyId: c2, title: "Send Nova Dental proposal v2", priority: "HIGH", assigneeId: userId },
      { companyId: c1, title: "Q3 management accounts review", priority: "MEDIUM", assigneeId: userId },
      { companyId: c0, title: "Brief site team on variation VO-018", priority: "MEDIUM", assigneeId: userId },
    ],
  });
}
