import { Prisma, prisma } from "@mazidi/db";

/**
 * Automation engine (Module 4, docs/04 §4) — the outbox consumer.
 *
 * Every domain event written by Modules 1–3 lands in OutboxEvent. This engine
 * claims events race-safely, matches enabled AutomationRule rows, executes
 * actions, and records AutomationRun results. It runs in-process today and is
 * drainable by admin button, or by n8n / Vercel cron hitting
 * POST /api/automations/run with the x-cron-secret header — n8n becomes the
 * external scheduler without any code change.
 *
 * Rule shape (seeded in @mazidi/db):
 *   trigger:    { event, companySlug?, occurrence?, amountGte? }
 *   actions:    [{ type: "recommend"|"crm.createLead"|"email", companySlug?, ... }]
 */

type Trigger = { event?: string; companySlug?: string; occurrence?: number; amountGte?: number };
type Action = { type?: string; companySlug?: string; service?: string; template?: string };

export async function runAutomations(limit = 25) {
  const events = await prisma.outboxEvent.findMany({
    where: { processedAt: null },
    orderBy: { at: "asc" },
    take: limit,
  });
  const rules = await prisma.automationRule.findMany({ where: { enabled: true } });
  const summary = { scanned: events.length, processed: 0, matchedRules: 0, actions: [] as string[] };

  for (const event of events) {
    // Race-safe claim: only one runner processes each event (same P2002-class
    // discipline as billing/provisioning).
    const claim = await prisma.outboxEvent.updateMany({
      where: { id: event.id, processedAt: null },
      data: { processedAt: new Date() },
    });
    if (claim.count === 0) continue;
    summary.processed++;

    const eventCompany = event.companyId
      ? await prisma.company.findUnique({ where: { id: event.companyId }, select: { slug: true } })
      : null;
    const payload = (event.payload ?? {}) as Record<string, unknown>;

    for (const rule of rules) {
      const trigger = (rule.trigger ?? {}) as Trigger;
      if (trigger.event !== event.event) continue;
      if (trigger.companySlug && trigger.companySlug !== eventCompany?.slug) continue;

      const customerId = typeof payload.customerId === "string" ? payload.customerId : null;
      if (!(await conditionsMet(trigger, event.companyId, customerId))) continue;

      summary.matchedRules++;
      const results: Record<string, string> = {};
      for (const action of (rule.actions ?? []) as Action[]) {
        const key = `${action.type}:${action.companySlug ?? ""}`;
        try {
          results[key] = await executeAction(action, { customerId, sourceCompanyId: event.companyId });
          summary.actions.push(`${rule.name} → ${key}: ${results[key]}`);
        } catch (e) {
          results[key] = `error: ${e instanceof Error ? e.message : String(e)}`;
        }
      }
      await prisma.automationRun.create({
        data: { ruleId: rule.id, refId: event.id, result: results as Prisma.InputJsonValue },
      });
    }
  }
  return summary;
}

async function conditionsMet(trigger: Trigger, companyId: string | null, customerId: string | null) {
  if (trigger.occurrence && trigger.occurrence > 1) {
    if (!customerId || !companyId) return false;
    const paid = await prisma.invoice.count({ where: { customerId, companyId, status: "PAID" } });
    if (paid < trigger.occurrence) return false;
  }
  if (trigger.amountGte) {
    if (!customerId) return false;
    const sum = await prisma.invoice.aggregate({
      where: { customerId, status: "PAID" }, _sum: { amount: true },
    });
    if (Number(sum._sum.amount ?? 0) < trigger.amountGte) return false;
  }
  return true;
}

async function executeAction(
  action: Action,
  ctx: { customerId: string | null; sourceCompanyId: string | null },
): Promise<string> {
  switch (action.type) {
    case "recommend": {
      if (!ctx.customerId) return "skipped: event has no customer";
      if (!action.companySlug) return "skipped: no target company";
      const [customer, target] = await Promise.all([
        prisma.customer.findUnique({ where: { id: ctx.customerId }, include: { user: { select: { id: true } } } }),
        prisma.company.findFirst({ where: { slug: action.companySlug, status: "LIVE" } }),
      ]);
      if (!customer || !target) return "skipped: customer/company not found";
      const already = await prisma.customerCompany.findUnique({
        where: { customerId_companyId: { customerId: customer.id, companyId: target.id } },
      });
      if (already) return "skipped: customer already uses this company";

      await prisma.$transaction([
        prisma.notification.create({
          data: {
            userId: customer.user.id,
            kind: "recommendation",
            title: `Recommended: ${target.name}`,
            body: target.description ?? "The next step in your Mazidi journey.",
            href: `/sites/${target.slug}`,
          },
        }),
        prisma.activity.create({
          data: {
            companyId: target.id, customerId: customer.id, kind: "SYSTEM",
            title: `Cross-sell recommendation sent (${target.slug})`,
            body: { source: "automation", fromCompanyId: ctx.sourceCompanyId },
          },
        }),
      ]);
      return "notification sent";
    }
    case "crm.createLead": {
      if (!ctx.customerId) return "skipped: event has no customer";
      if (!action.companySlug) return "skipped: no target company";
      const [customer, target] = await Promise.all([
        prisma.customer.findUnique({
          where: { id: ctx.customerId },
          include: { user: { select: { email: true, fullName: true } } },
        }),
        prisma.company.findFirst({ where: { slug: action.companySlug, status: "LIVE" } }),
      ]);
      if (!customer || !target) return "skipped: customer/company not found";
      const existing = await prisma.lead.findFirst({
        where: {
          companyId: target.id, source: "AUTOMATION", status: { in: ["NEW", "QUALIFIED", "CONTACTED"] },
          contact: { customerId: customer.id },
        },
      });
      if (existing) return "skipped: open automation lead exists";

      const contact = await prisma.contact.create({
        data: {
          companyId: target.id, customerId: customer.id,
          name: customer.orgName ?? customer.user.fullName, email: customer.user.email,
          source: "automation", tags: ["cross-sell"],
        },
      });
      await prisma.lead.create({
        data: {
          companyId: target.id, contactId: contact.id, source: "AUTOMATION", score: 60,
          capturedFrom: { via: "automation", fromCompanyId: ctx.sourceCompanyId },
        },
      });
      return "lead created";
    }
    case "email":
      // Real integration point: wire Resend here (docs/04 §6). Recorded, not faked.
      return "skipped: email channel not configured (Resend pending)";
    default:
      return `skipped: unknown action type "${action.type}"`;
  }
}

// ── Admin surface ────────────────────────────────────────

export async function listAutomationRules() {
  const [rules, pending] = await Promise.all([
    prisma.automationRule.findMany({
      include: { runs: { orderBy: { at: "desc" }, take: 3 } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.outboxEvent.count({ where: { processedAt: null } }),
  ]);
  return { rules, pending };
}

export async function toggleAutomationRule(actorId: string, ruleId: string, enabled: boolean) {
  const rule = await prisma.automationRule.update({ where: { id: ruleId }, data: { enabled } });
  await prisma.auditLog.create({
    data: { userId: actorId, action: "automation.toggle", entity: "AutomationRule", entityId: ruleId, diff: { enabled } },
  });
  return rule;
}
