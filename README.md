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
| Employee portal, admin, AI assistants, n8n runtime | — | Next (steps 7–10) |

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
pnpm dev                      # web on :3000, portal on :3001
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
