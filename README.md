# Mazidi Group Platform

Production monorepo for the Mazidi Group ecosystem — **Build it. Run it. Grow it.**
Architecture source of truth: `../docs/01–05`. Phase 2's `../index.html` is a design reference only.

## What's implemented (Phase 3, build-order steps 1–5 of docs/05)

| Piece | Where | Status |
|---|---|---|
| Turborepo + pnpm workspaces | root | ✅ |
| Multi-tenant DB (37 models, RLS, seed for 21 tenants) | `packages/db` | ✅ |
| Supabase SSO (magic link + Google/Microsoft/Apple, cross-subdomain cookie) | `packages/auth` | ✅ |
| Meridian design system as React + Tailwind preset | `packages/ui` | ✅ |
| Services + shared Zod schemas | `packages/api` | ✅ |
| Group site + tenant sub-site engine (subdomain middleware) | `apps/web` | ✅ |
| Lead capture → CRM (Contact + Lead + Activity + outbox event) | `apps/web/app/api/leads` | ✅ |
| Client portal (auth-guarded, DB-driven dashboard/invoices/projects/documents, cross-sell recommendations) | `apps/portal` | ✅ |
| Stripe billing: invoice checkout, plan subscriptions, billing portal, signature-verified webhook → Payment/Subscription + Activity + OutboxEvent | `packages/api/src/services/billing.ts`, `apps/portal/app/api/billing/*` | ✅ |
| Employee portal: role-gated (Membership ≥ EMPLOYEE), membership-scoped CRM (leads, deal pipeline), tasks, dashboard | `apps/team` (:3002), `packages/api/src/services/team.ts` | ✅ |
| Admin control plane: tenant CRUD (DRAFT→LIVE), services, users & RBAC (auto Employee profile on staff grant), system analytics, AuditLog on every mutation | `apps/admin` (:3003), `packages/api/src/services/admin.ts` | ✅ |
| Automation engine: outbox consumer, rule matching (event/company/occurrence/amount), recommend → Notification, crm.createLead, AutomationRun log, admin rules UI + cron/n8n drain endpoint | `packages/api/src/services/automations.ts`, `apps/admin` | ✅ |
| AI assistants: portal Business Advisor + team CRM Assistant — real OpenAI, DB-grounded context, persisted AIConversation | `packages/api/src/services/ai.ts`, `/advisor`, `/assistant` | ✅ |

## Setup

Prereqs: Node 20+, pnpm 9 (`corepack enable`), a Supabase project.

```bash
cp .env.example .env          # fill in Supabase keys + DB URLs
pnpm install
pnpm env:link                 # symlinks .env into apps/* and packages/db
                              # (Next.js loads env per app dir; Prisma per package dir)
pnpm db:generate              # prisma client
pnpm db:migrate               # creates all tables (uses DIRECT_URL)
pnpm db:seed                  # 21 tenants, services, insights, automation rules
pnpm dev                      # web :3000 · portal :3001 · team :3002 · admin :3003
```

Then, in Supabase:

1. **Auth → URL Configuration**: add `http://localhost:3001/auth/callback` (and your prod portal URL) to redirect URLs.
2. **Auth → Providers**: enable Email (magic link) — Google/Microsoft/Apple optional.
3. **SQL Editor**: run `packages/db/sql/rls.sql` (defense-in-depth for direct client access).

With `DEMO_MODE=true`, the first portal login auto-provisions a Customer with demo
engagements (construction project, invoices, activity) so every screen has real rows.

## Stripe billing setup (Module 1)

1. Add test-mode keys to **all four** `.env` files (root, `apps/web`, `apps/portal`, `packages/db`) —
   placeholders were appended; replace `sk_test_REPLACE_ME`.
2. `pnpm db:migrate` — adds `Customer.stripeCustomerId` + `Service.stripePriceId`.
3. `pnpm db:seed` — sets monthly prices on 7 billable services.
4. `pnpm --filter @mazidi/api stripe:sync` — creates Stripe Products/Prices, stores ids.
5. Local webhooks: `stripe listen --forward-to localhost:3001/api/webhooks/stripe`,
   copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET` (all four files), restart dev.

Flows: portal → Invoices → **Pay now** (Checkout, card `4242 4242 4242 4242`) → webhook marks
PAID, writes `Payment` + `Activity` + `OutboxEvent("invoice.paid")`. Portal → Billing →
**Subscribe** (subscription Checkout) → webhook creates `Subscription` + `CustomerCompany`
(tenant association — cross-sell recommendations update automatically) + `OutboxEvent("customer.active")`.
**Manage billing** opens the Stripe customer portal (enable it once: Dashboard → Settings →
Billing → Customer portal → Activate test link).

## Employee portal (Module 2)

- `localhost:3002` — sign-in reuses the same SSO (`@mazidi/auth`); add
  `http://localhost:3002/auth/callback` to Supabase → Auth → URL Configuration.
- Access requires an `Employee` row + `Membership` (role ≥ EMPLOYEE). With
  `DEMO_MODE=true`, first team login self-provisions a demo employee scoped to
  Construction + Accounting + Marketing, with sample leads/deals/tasks.
  Production employees are created by the admin module (Module 3).
- Tenancy axis differs from the client portal: employees see rows
  `WHERE companyId IN (their memberships)`; clients see `WHERE customerId = theirs`.
  Shared tables (Project, Invoice, Ticket, Activity) serve both axes; Task,
  Timesheet, Lead, Deal are employee-surface only.
- Lead state machine: `NEW → QUALIFIED → CONTACTED → CONVERTED`, forward-only
  (skips allowed); `LOST` reachable from any pre-CONVERTED state; CONVERTED and
  LOST are terminal. Map lives in `LEAD_TRANSITIONS` (`@mazidi/api/schemas`),
  enforced server-side in `updateLeadStatus` (409 on illegal moves) and
  mirrored by the dropdown (terminal states render as pills).
- Leads table view: defaults to **Active** (NEW/QUALIFIED/CONTACTED); Closed
  (CONVERTED/LOST) and All are one click away — leads are permanent history,
  the deal is a linked record, presentation avoids the duplication feel.
- Lead → pipeline: CONVERTED leads get a "→ Deal" action (links `Deal.leadId`,
  starts at QUALIFIED); standalone deals via the form above the pipeline.
  Deal creation emits `OutboxEvent("deal.created")`.
- Writes → CRM/outbox: lead status change → `Activity` (+ `lead.converted`),
  deal → WON → `OutboxEvent("deal.won")` (feeds "Marketing win → Sales Consulting"),
  task create/complete → `Activity`.
- New env var `NEXT_PUBLIC_TEAM_URL` (all four .env files + `apps/team/.env`).

## Admin control plane (Module 3)

- `localhost:3003` — add `http://localhost:3003/auth/callback` to Supabase redirect URLs.
- Access: SUPER_ADMIN (group-level membership) manages everything; COMPANY_ADMIN
  is scoped to their companies and cannot grant admin roles or change publish status.
- Bootstrap: with `DEMO_MODE=true`, first admin login self-provisions SUPER_ADMIN
  (dev only). Production: grant once via SQL —
  `insert into "Membership" ("id","userId","role") values (gen_random_uuid(), '<auth-user-uuid>', 'SUPER_ADMIN');`
  — then manage successors in Users & Roles.
- Tenant lifecycle: created as DRAFT → publish LIVE (emits `tenant.published`).
  `/sites/{slug}` works immediately; the SUBDOMAIN additionally needs the slug in
  `TENANT_SLUGS` (`packages/config`) + deploy, because edge middleware cannot query the DB.
- Users & Roles: granting EMPLOYEE/MANAGER/COMPANY_ADMIN auto-creates the Employee
  profile (team-app access); self-revocation of SUPER_ADMIN is blocked.
- Every admin mutation writes `AuditLog`; tenant/membership changes emit outbox events.
- New env var `NEXT_PUBLIC_ADMIN_URL` (all .env files + `apps/admin/.env`).

## Automations + AI (Module 4)

- **Engine**: `OutboxEvent` (written by every module) → `POST /api/automations/run`
  (admin button on :3003/automations, or `x-cron-secret: $CRON_SECRET` for n8n/Vercel
  cron) → matches enabled `AutomationRule`s → actions:
  `recommend` (Notification to the client + Activity), `crm.createLead` (Contact +
  Lead source AUTOMATION in the target company), `email` (recorded as skipped until
  Resend is wired). Every execution logged in `AutomationRun`; events claimed
  race-safely, exactly once.
- **Conditions supported**: `event`, `companySlug`, `occurrence` (nth PAID invoice
  for that customer+company), `amountGte` (customer lifetime paid).
- **End-to-end demo**: pay 2 invoices to Accounting → `invoice.paid` events →
  Run engine → "2nd invoice paid → Payroll" fires → client gets a Notification
  (portal :3001/notifications) and the rule's run appears in admin.
- **AI**: set `OPENAI_API_KEY` (all .env files). Portal `/advisor` = Business
  Advisor grounded in the client's live projects/invoices/subscriptions;
  team `/assistant` = CRM assistant grounded in the employee's scoped pipeline.
  Conversations persist in `AIConversation`; missing key → honest 503, no canned replies.
- New env vars: `OPENAI_API_KEY`, `OPENAI_MODEL` (optional), `CRON_SECRET`.

## Local tenant preview

The middleware maps subdomains to `/sites/{slug}`:

- `http://localhost:3000` → group site
- `http://construction.localhost:3000` → Mazidi Construction sub-site
- Any of the 21 slugs in `packages/config` work the same way.

## Deployment (docs/05)

Vercel: two projects (`apps/web`, `apps/portal`). Give `apps/web` the wildcard domain
`*.mazidigroup.com` + apex; give `apps/portal` `portal.mazidigroup.com`.
Set `AUTH_COOKIE_DOMAIN=".mazidigroup.com"` so one login works everywhere.
Cloudflare in front for DNS/WAF/cache.

## Adding a company (zero code — docs/01 §6)

1. Add the slug to `TENANT_SLUGS` in `packages/config`.
2. Insert the `Company` row + services (or extend `packages/db/src/seed.ts`).
3. Done — sub-site, navigation, sitemap, cross-sell and portal wiring inherit automatically.

## Server/client boundary rule (critical)

Next.js compiles one module graph per runtime. Packages therefore expose
runtime-scoped entry points — importing the wrong one is a build error by design:

| Runtime | Import |
|---|---|
| Server Components / Route Handlers | `@mazidi/auth/server`, `@mazidi/api` |
| Client Components (`"use client"`) | `@mazidi/auth/client`, `@mazidi/api/schemas`, `@mazidi/ui` |
| Edge middleware | `@mazidi/auth/middleware`, `@mazidi/config` |

Never re-export server modules from a barrel that client code imports.
`node scripts/check-boundaries.mjs` enforces this statically (run it in CI).

## Conventions

- All UI from `@mazidi/ui`; apps compose, never restyle (docs/02).
- Every form validates with a Zod schema shared with its route handler (`@mazidi/api`).
- Every interaction writes CRM data; every domain event goes through `OutboxEvent` for n8n.
- Tenant tables carry `companyId`; customers are group-level. One account, one journey.
