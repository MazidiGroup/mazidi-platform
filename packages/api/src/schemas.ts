import { z } from "zod";

/** Shared by the public lead form (client) and /api/leads (server). */
export const leadInputSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(120),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().max(40).optional(),
  // Shape-only: tenant existence is validated against the DB in captureLead —
  // admin-created tenants must work without touching the static edge allowlist.
  companySlug: z.string().regex(/^[a-z][a-z0-9-]{1,30}$/).optional(),
  interest: z.enum(["build", "run", "grow", "unsure"]).default("unsure"),
  message: z.string().max(4000).optional(),
  /** honeypot — must stay empty */
  website: z.string().max(0).optional(),
});
export type LeadInput = z.infer<typeof leadInputSchema>;

/** POST /api/billing/checkout — pay a single invoice via Stripe Checkout. */
export const invoiceCheckoutSchema = z.object({
  invoiceId: z.string().uuid(),
});
export type InvoiceCheckoutInput = z.infer<typeof invoiceCheckoutSchema>;

/** POST /api/billing/subscribe — start a subscription to a priced service (plan). */
export const subscribeSchema = z.object({
  serviceId: z.string().uuid(),
});
export type SubscribeInput = z.infer<typeof subscribeSchema>;

// ── Module 2: employee portal ────────────────────────────
export const LEAD_STATUSES = ["NEW", "QUALIFIED", "CONTACTED", "CONVERTED", "LOST"] as const;
export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

/**
 * Lead state machine (confirmed 2026-07-04):
 *   NEW → QUALIFIED → CONTACTED → CONVERTED, forward-only (skips allowed);
 *   LOST reachable from any pre-CONVERTED state;
 *   CONVERTED and LOST are terminal.
 * To restrict to adjacent-only steps, trim the arrays below.
 * Shared by the dropdown (legal targets only) and updateLeadStatus (enforcement).
 */
export const LEAD_TRANSITIONS: Record<LeadStatusValue, LeadStatusValue[]> = {
  NEW: ["QUALIFIED", "CONTACTED", "CONVERTED", "LOST"],
  QUALIFIED: ["CONTACTED", "CONVERTED", "LOST"],
  CONTACTED: ["CONVERTED", "LOST"],
  CONVERTED: [],
  LOST: [],
};
export const DEAL_STAGES = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

/** PATCH /api/crm/leads */
export const leadStatusSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(LEAD_STATUSES),
});
export type LeadStatusInput = z.infer<typeof leadStatusSchema>;

/** PATCH /api/crm/deals */
export const dealStageSchema = z.object({
  dealId: z.string().uuid(),
  stage: z.enum(DEAL_STAGES),
});
export type DealStageInput = z.infer<typeof dealStageSchema>;

/** POST /api/tasks */
export const taskCreateSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(2, "Give the task a title").max(200),
  priority: z.enum(TASK_PRIORITIES).default("MEDIUM"),
  dueAt: z.string().datetime().optional(),
});
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;

/** PATCH /api/tasks */
export const taskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(TASK_STATUSES),
});
export type TaskStatusInput = z.infer<typeof taskStatusSchema>;

/** POST /api/crm/deals — create a deal, standalone (companyId) or from a lead (leadId). */
export const dealCreateSchema = z
  .object({
    title: z.string().min(2, "Give the deal a title").max(200),
    value: z.coerce.number().positive("Value must be positive").max(100_000_000),
    companyId: z.string().uuid().optional(),
    leadId: z.string().uuid().optional(),
  })
  .refine((d) => d.companyId || d.leadId, { message: "companyId or leadId is required" });
export type DealCreateInput = z.infer<typeof dealCreateSchema>;

// ── Module 3: admin tenant manager ───────────────────────
export const PILLAR_VALUES = ["BUILD", "RUN", "GROW"] as const;
export const COMPANY_STATUSES = ["DRAFT", "LIVE", "ARCHIVED"] as const;
export const GRANTABLE_ROLES = ["CLIENT", "EMPLOYEE", "MANAGER", "COMPANY_ADMIN", "SUPER_ADMIN"] as const;

/** POST /api/admin/companies — create a tenant (config, not code — docs/01 §6). */
export const companyCreateSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().regex(/^[a-z][a-z0-9-]{1,30}$/, "lowercase letters, digits, hyphens; starts with a letter"),
  pillar: z.enum(PILLAR_VALUES),
  description: z.string().min(10).max(400),
});
export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;

/** PATCH /api/admin/companies — edit/publish a tenant. */
export const companyUpdateSchema = z.object({
  companyId: z.string().uuid(),
  tagline: z.string().max(140).optional(),
  description: z.string().min(10).max(400).optional(),
  status: z.enum(COMPANY_STATUSES).optional(),
});
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;

/** POST /api/admin/services — add a service to a tenant. */
export const serviceAddSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(2).max(80),
  summary: z.string().min(10).max(300),
  priceFrom: z.coerce.number().positive().optional(),
});
export type ServiceAddInput = z.infer<typeof serviceAddSchema>;

/** POST /api/admin/memberships — grant or revoke a role. */
export const membershipSchema = z.object({
  action: z.enum(["grant", "revoke"]),
  targetUserId: z.string().uuid(),
  companyId: z.string().uuid().nullable(), // null = group-level (SUPER_ADMIN only)
  role: z.enum(GRANTABLE_ROLES),
  title: z.string().max(80).optional(), // employee title when granting staff roles
});
export type MembershipInput = z.infer<typeof membershipSchema>;

// ── Module 4: automations + AI ───────────────────────────
/** POST /api/ai/* — chat message. */
export const aiChatSchema = z.object({
  message: z.string().min(1, "Say something").max(2000),
});
export type AiChatInput = z.infer<typeof aiChatSchema>;

/** PATCH /api/admin/automations — enable/disable a rule. */
export const automationToggleSchema = z.object({
  ruleId: z.string().uuid(),
  enabled: z.boolean(),
});
export type AutomationToggleInput = z.infer<typeof automationToggleSchema>;

// ── Event bridge (inbound from the MongoDB fitness apps) ─
// The two fitness products run on their own MongoDB instances and cannot see
// this database. They POST domain events to /api/events/ingest, which turns
// them into OutboxEvent rows for the existing automation engine to drain.

/**
 * Closed vocabulary. An unrecognised event name means the caller and this
 * deployment disagree — a deploy-skew bug, not data — so reject it rather than
 * storing something no rule will ever match.
 * Keep in sync with EVENT_COMPANY in services/events.ts.
 */
export const INGEST_EVENTS = [
  "coach.signed_up",
  "coach.activated",
  "coach.client_added",
  "coach.went_inactive",
  "coach.subscription_started",
  "coach.subscription_cancelled",
  "consumer.premium_started",
  // RevenueCat CANCELLATION: auto-renew switched off. The user KEEPS access
  // until the period ends. This is a churn-risk signal, not a churn event —
  // conflating it with premium_cancelled would tell the CRM someone left while
  // they are still paying, and would fire win-back automation at a live
  // subscriber.
  "consumer.premium_cancellation_scheduled",
  // RevenueCat EXPIRATION: access has actually ended.
  "consumer.premium_cancelled",
  "consumer.premium_renewed",
  "consumer.billing_issue",
  "consumer.daily_rollup",
] as const;
export type IngestEvent = (typeof INGEST_EVENTS)[number];

export const INGEST_SOURCES = ["fitness_muscle_coach", "musclemapai"] as const;
export type IngestSource = (typeof INGEST_SOURCES)[number];

/**
 * POST /api/events/ingest — machine-to-machine, shared-secret authenticated.
 *
 * .strict() on the envelope so an unknown top-level key is an error rather than
 * silently dropped: a caller sending "custmerId" should find out immediately.
 * `data` stays permissive — it is per-event freeform and is stored as sent.
 */
export const eventIngestSchema = z
  .object({
    source: z.enum(INGEST_SOURCES),
    event: z.enum(INGEST_EVENTS),
    /**
     * Stable dedupe key, "<source>:<native-id>". MUST derive from the
     * underlying fact (RevenueCat transaction id, Mongo user_id) — never a
     * timestamp or a UUID generated at send time, or retries will not dedupe.
     */
    externalId: z.string().min(3).max(200),
    occurredAt: z.string().datetime(),
    actor: z
      .object({
        email: z.string().email().optional(),
        name: z.string().max(200).optional(),
        externalUserId: z.string().max(200).optional(),
      })
      .optional(),
    data: z.record(z.unknown()).default({}),
  })
  .strict();
export type EventIngestInput = z.infer<typeof eventIngestSchema>;
