# DEPLOYMENT.md — First Production Deploy

Taking the Mazidi Group platform live on `mazidigroup.com`. Written for a first-time
Vercel user. Follow top to bottom; each part depends on the previous one.

**What you're deploying:** one GitHub repo → four Vercel projects (web, portal, team,
admin) → one production Supabase project → Stripe live mode → your domain.

**Total time:** roughly 2–3 hours, most of it waiting on DNS.

---

## Part 0 — Accounts & prerequisites

| Need | Where | Notes |
|---|---|---|
| GitHub repo | github.com | Push the `platform/` folder as a repo (root = the folder containing `turbo.json`). Vercel deploys from GitHub. |
| Vercel account | vercel.com | Free Hobby works for first deploy; Pro ($20/mo) recommended once real clients arrive. Sign up **with your GitHub account**. |
| Production Supabase project | supabase.com | Create a **new, separate project** for production (region: London `eu-west-2` fits UK/UAE audience). Never point production apps at your dev project. |
| Stripe account, activated | stripe.com | "Activate payments" completed (business details, bank account) — required for live mode. |
| OpenAI API key | platform.openai.com | Separate key for production; set a monthly usage limit (Settings → Limits). |
| Domain `mazidigroup.com` | your registrar | You'll change its nameservers to Vercel in Part 4. |

Push the repo now if you haven't:

```bash
cd platform
git remote add origin https://github.com/YOUR_USER/mazidi-platform.git
git push -u origin main
```

Check `.gitignore` kept every `.env` out: `git ls-files | grep -c "\.env$"` must print `0`
(`.env.example` is fine and should be committed).

---

## Part 1 — Production Supabase

### 1.1 Create the project & collect keys

Supabase → New project → name `mazidi-prod`, strong DB password (save it), region London.
When it finishes provisioning, collect five values:

| Value | Where in Supabase | Becomes env var |
|---|---|---|
| Project URL | Settings → API | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | Settings → API | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key | Settings → API (click reveal) | `SUPABASE_SERVICE_ROLE_KEY` — **secret, server-only** |
| Pooled connection string | Settings → Database → Connection string → **Transaction** mode (port **6543**) | `DATABASE_URL` — append `?pgbouncer=true` |
| Direct connection string | Same page → **Session** mode (port **5432**) | `DIRECT_URL` |

### 1.2 Run migrations + seed against production (one-time, from your Mac)

Temporarily point your local `packages/db/.env` at production:

```bash
# packages/db/.env — TEMPORARILY replace with PROD values:
DATABASE_URL="postgresql://...6543/postgres?pgbouncer=true"   # prod pooled
DIRECT_URL="postgresql://...5432/postgres"                     # prod direct
```

```bash
pnpm --filter @mazidi/db deploy     # applies ALL migrations (no prompts)
pnpm db:seed                        # 21 tenants, services, plan prices, rules
```

Then, in the Supabase **SQL Editor**, run the contents of `packages/db/sql/rls.sql`.

**⚠ Restore your dev values in `packages/db/.env` immediately afterwards.** From now
on, production schema changes happen by repeating this step (CI later).

### 1.3 Auth configuration

Supabase → Authentication:

1. **URL Configuration → Site URL:** `https://portal.mazidigroup.com`
2. **URL Configuration → Redirect URLs** — add all three:
   ```
   https://portal.mazidigroup.com/auth/callback
   https://team.mazidigroup.com/auth/callback
   https://admin.mazidigroup.com/auth/callback
   ```
3. **Providers → Email:** enabled (magic links). Enable Google/Microsoft/Apple later if
   wanted — each needs its own OAuth app; not required for launch.
4. **Custom SMTP (strongly recommended):** Authentication → Emails → SMTP settings.
   Supabase's built-in sender is limited to ~2 emails/hour — real clients will hit that
   on day one. Any SMTP provider works (e.g. Resend SMTP, free tier): host
   `smtp.resend.com`, user `resend`, password = Resend API key, sender
   `login@mazidigroup.com` (after verifying the domain there).

### 1.4 Bootstrap your super admin (production has `DEMO_MODE=false`)

After your **first login** to any app in production (Part 6), your auth user exists.
Get its UUID (Authentication → Users), then run in SQL Editor:

```sql
insert into "Membership" ("id", "userId", "role")
values (gen_random_uuid(), 'YOUR-AUTH-USER-UUID', 'SUPER_ADMIN');
```

From then on you manage every other user inside admin → Users & Roles. Do **not** leave
`DEMO_MODE=true` in production — it lets any first login self-provision access.

---

## Part 2 — Production env vars (the complete matrix)

All four Vercel projects get the **same full set** (simplest and safe — secrets are
server-only by design; only `NEXT_PUBLIC_*` values reach browsers, and those are public
by definition). Dev values stay in your local `.env` files and never leave your Mac.

| Variable | Production value | Dev value (for contrast) |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | prod project URL | dev project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod anon key | dev anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | prod service key | dev service key |
| `DATABASE_URL` | prod pooled (6543, `?pgbouncer=true`) | dev pooled |
| `DIRECT_URL` | prod direct (5432) | dev direct |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `mazidigroup.com` | `mazidigroup.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://mazidigroup.com` | `http://localhost:3000` |
| `NEXT_PUBLIC_PORTAL_URL` | `https://portal.mazidigroup.com` | `http://localhost:3001` |
| `NEXT_PUBLIC_TEAM_URL` | `https://team.mazidigroup.com` | `http://localhost:3002` |
| `NEXT_PUBLIC_ADMIN_URL` | `https://admin.mazidigroup.com` | `http://localhost:3003` |
| `AUTH_COOKIE_DOMAIN` | `.mazidigroup.com` ← **the SSO switch; note the leading dot** | *(empty)* |
| `DEMO_MODE` | `false` ← **critical** | `true` |
| `STRIPE_SECRET_KEY` | `sk_live_…` (Part 5) | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | live `whsec_…` (Part 5) | CLI `whsec_…` |
| `OPENAI_API_KEY` | production key | dev key |
| `OPENAI_MODEL` | `gpt-4o-mini` (or better) | same |
| `CRON_SECRET` | long random string — generate: `openssl rand -hex 32` | anything |

---

## Part 3 — Four Vercel projects from one repo

Repeat this four times. Only two settings differ each time: **Root Directory** and (later)
the domain.

### 3.1 Create a project

1. vercel.com → **Add New… → Project** → Import your GitHub repo (first time: click
   **Install** to grant Vercel access to the repo).
2. **Configure Project** screen:
   - **Root Directory** → Edit → select `apps/web` (then `apps/portal`, `apps/team`,
     `apps/admin` for the other three).
   - **Framework Preset:** Next.js (auto-detected).
   - **Build Command** → Override with:
     ```
     pnpm -w db:generate && next build
     ```
     (generates the Prisma client before the Next build — without this the build fails
     with "Cannot find module '.prisma/client'").
   - **Install Command:** leave default (Vercel detects pnpm from the lockfile and
     installs the whole workspace).
   - **Node.js version** (Settings → General after creation): 20.x.
3. **Environment Variables:** paste the entire Part 2 production set (Vercel's env UI
   accepts a pasted `.env` block — paste all lines at once). Apply to **Production**.
4. Click **Deploy**. First build takes a few minutes.

Suggested project names: `mazidi-web`, `mazidi-portal`, `mazidi-team`, `mazidi-admin`.

> **Why the web build needs the database:** marketing pages prerender from the DB at
> build time (ISR). The Supabase pooled URL is reachable from Vercel builds, so this
> just works — but it means the DB (Part 1) must exist **before** your first deploy.

### 3.2 Expected result

Four projects, each with a working `*.vercel.app` preview URL. Portal/team/admin will
redirect to `/login` — correct. The web app should render the group site. Don't test
logins yet — SSO cookies need the real domain (next part).

---

## Part 4 — Domain & DNS

The wildcard (`*.mazidigroup.com`, needed for the 21 tenant subdomains) requires your
DNS to be **hosted by Vercel**. That's one nameserver change.

### 4.1 Point nameservers at Vercel

1. In the `mazidi-web` project → **Settings → Domains** → add `mazidigroup.com`.
   Vercel will show two nameservers, e.g. `ns1.vercel-dns.com` / `ns2.vercel-dns.com`.
2. At your registrar (GoDaddy/Namecheap/etc.): find **Nameservers** → replace the
   existing ones with Vercel's two. Propagation: usually < 1 hour, worst case 24–48 h.
   Vercel's Domains tab shows a ✅ when it takes effect.

### 4.2 Attach domains to projects

A domain attaches to exactly one project — specific subdomains beat the wildcard:

| Domain | Project |
|---|---|
| `mazidigroup.com` | mazidi-web |
| `www.mazidigroup.com` (redirect → apex; Vercel offers this when adding) | mazidi-web |
| `*.mazidigroup.com` (the wildcard — catches all 21 tenant subdomains) | mazidi-web |
| `portal.mazidigroup.com` | mazidi-portal |
| `team.mazidigroup.com` | mazidi-team |
| `admin.mazidigroup.com` | mazidi-admin |

HTTPS certificates (including the wildcard) are issued automatically — nothing to do.

### 4.3 Verify routing

- `https://mazidigroup.com` → group site
- `https://construction.mazidigroup.com` → Construction sub-site (wildcard + middleware)
- `https://portal.mazidigroup.com` → login screen
- Log in at portal → then open team/admin: with `AUTH_COOKIE_DOMAIN=.mazidigroup.com`
  the session carries across — that's the SSO working. (Access is still role-gated:
  team/admin will show their "access only" screens until Part 1.4's SQL grant.)

> **Note (docs/05):** production architecture puts Cloudflare in front for WAF/cache.
> Do that as a later hardening step, not on first deploy — Vercel DNS keeps the wildcard
> simple today, and moving DNS to Cloudflare later is straightforward.

---

## Part 5 — Stripe live mode

Everything so far was test mode. Live mode is a parallel universe: separate keys,
separate products, separate webhooks.

### 5.1 Live keys

Stripe Dashboard → toggle **Test mode OFF** (top right) → Developers → API keys →
copy `sk_live_…` → update `STRIPE_SECRET_KEY` in **all four** Vercel projects
(Settings → Environment Variables → edit).

### 5.2 Live webhook (replaces the local `stripe listen`)

Developers → Webhooks → **Add endpoint** (while in live mode):

- **Endpoint URL:** `https://portal.mazidigroup.com/api/webhooks/stripe`
- **Events to send** — select exactly these five:
  ```
  checkout.session.completed
  customer.subscription.created
  customer.subscription.updated
  customer.subscription.deleted
  invoice.paid
  ```
- Save → copy the **Signing secret** (`whsec_…`) → update `STRIPE_WEBHOOK_SECRET` in all
  four Vercel projects.

### 5.3 Recreate plans in live mode

Test-mode Products/Prices don't exist in live mode, and the DB still holds test price
ids. From your Mac, **one-time** (same pattern as 1.2 — prod DB + live key):

```bash
# packages/db/.env  → temporarily prod DATABASE_URL / DIRECT_URL (as in 1.2)
# root .env         → temporarily STRIPE_SECRET_KEY=sk_live_...
psql "$DIRECT_URL" -c 'UPDATE "Service" SET "stripePriceId" = NULL WHERE "stripePriceId" IS NOT NULL;'
pnpm --filter @mazidi/api stripe:sync      # creates LIVE products/prices, stores ids
# → restore both files to dev values
```

(No `psql`? Run the same UPDATE in the Supabase SQL Editor instead.)

### 5.4 Customer billing portal & redeploy

- Still in live mode: Settings → Billing → **Customer portal** → Save/activate
  (powers the "Manage billing" button).
- Env var changes do **not** apply to already-built deployments: in each Vercel project
  → Deployments → ⋯ on the latest → **Redeploy**.

### 5.5 Verify with a real card

Live mode rejects `4242…` test cards. Pay a small real invoice (e.g. £1 test invoice)
with a real card, confirm it flips to PAID, then refund it in the Stripe Dashboard.
Check Developers → Webhooks → your endpoint shows `200`s.

---

## Part 6 — First-boot sequence & smoke test

In order:

1. **Log in once** at `portal.mazidigroup.com` (magic link — needs 1.3's SMTP, or use
   the email/password user you create in Supabase → Auth → Users → Add user).
2. **Grant yourself SUPER_ADMIN** (Part 1.4 SQL) — you're in a fresh session, so sign
   out/in again afterwards.
3. **Smoke test, end to end:**

| # | Test | Expect |
|---|---|---|
| 1 | `mazidigroup.com` + 2–3 tenant subdomains | render, correct branding, HTTPS |
| 2 | Submit the contact form on a tenant site | success message |
| 3 | `admin.mazidigroup.com` → you're in; team CRM shows the lead | lead present (grant yourself a membership on that company first if using Closed scoping) |
| 4 | Lead → CONVERTED → "→ Deal" → advance to WON | `deal.won` appears queued in admin → Automations |
| 5 | Admin → Automations → **Run engine now** | run logged; recommendation notification lands in the portal |
| 6 | Portal → create/pay a real £1 invoice (5.5) | PAID on redirect; Payment row; refund after |
| 7 | Portal `/advisor` + team `/assistant` | grounded answers (needs `OPENAI_API_KEY`) |
| 8 | Incognito: portal login with a second account | sees only its own (empty) data — tenant isolation |

4. **Schedule the automation engine** (no code change needed): any external cron —
   e.g. cron-job.org free tier — hitting every 5 minutes:
   ```
   POST https://admin.mazidigroup.com/api/automations/run
   Header:  x-cron-secret: <your CRON_SECRET>
   ```
   (This is also exactly where n8n plugs in later — an n8n Schedule → HTTP Request
   workflow with the same header.)

---

## Part 7 — Troubleshooting the usual first-deploy failures

| Symptom | Cause → fix |
|---|---|
| Build: `Cannot find module '.prisma/client'` | Build Command override missing → set `pnpm -w db:generate && next build` (3.1) |
| Runtime: `PrismaClientInitializationError: could not locate the Query Engine for runtime "rhel-openssl-3.0.x"` | Two-part fix in this repo: (1) `binaryTargets = ["native", "rhel-openssl-3.0.x"]` in the generator block; (2) `@prisma/nextjs-monorepo-workaround-plugin` in every app's `next.config.mjs` webpack hook — webpack bundles the client (`transpilePackages`), rewriting `__dirname`, and the plugin copies the engine beside the bundled output. Diagnostic tell: searched paths containing the BUILD path (`/vercel/path0/...`) at runtime = bundling broke resolution |
| Build: Prisma `P1001 can't reach database` | Wrong/missing `DATABASE_URL` in that Vercel project, or DB not created yet (Part 1 before Part 3) |
| A domain serves the WRONG app's login (e.g. portal shows "Super Admin") | That Vercel project's **Root Directory** points at the wrong `apps/*` folder — check Settings → General in all four projects (page `<title>` tells you which app is actually being served). Fix + Redeploy; root-dir changes only apply to new builds |
| Wildcard domain stuck "pending" | Nameservers not switched yet, or apex added to a different project than the wildcard — both belong to `mazidi-web` |
| `500 MIDDLEWARE_INVOCATION_FAILED` on portal/team/admin | An Edge-incompatible import reached middleware (historically: @supabase/supabase-js touching Node APIs at module scope). This repo's middleware is now dependency-free by design (`edgeAuthGuard`, cookie-presence only; verification happens server-side via `getUser()`); `check:boundaries` bans supabase/prisma from edge graphs. If it recurs, run the checker and inspect the middleware import trace in the build log |
| Login loops back to `/login` | `AUTH_COOKIE_DOMAIN` missing/wrong (needs the leading dot) or you're testing on `*.vercel.app` URLs — SSO cookies only work on the real domain |
| Magic link email never arrives | Supabase default SMTP rate limit → 1.3.4 custom SMTP |
| Magic link lands on `localhost:3001` | Prod redirect URLs not added in Supabase (1.3.2) or Site URL still default |
| Stripe webhook 400 "Invalid signature" | Live `whsec_…` not updated after creating the live endpoint, or you didn't redeploy after changing env vars (5.4) |
| Invoice stays unpaid after live payment | Webhook endpoint URL typo / not in live mode — check Developers → Webhooks delivery log |
| Subscribe button: "no billing plan configured" | Live `stripe:sync` not run (5.3) |
| AI pages return 503 | `OPENAI_API_KEY` unset in Vercel, or redeploy missing |
| Admin says "Admin access only" for you | `DEMO_MODE=false` (correct!) — run the 1.4 SQL grant |
| New admin-created tenant's subdomain 404s | Expected: add slug to `TENANT_SLUGS` in `packages/config`, push (auto-redeploys). `/sites/{slug}` works immediately regardless |

---

## Part 8 — After you're live (hardening backlog, in priority order)

1. **CI gate:** GitHub Action running `pnpm -w check:boundaries` + `tsc --noEmit` per app on every PR (Vercel already builds per push).
2. **Error monitoring:** Sentry (docs/05) — one DSN across the four projects.
3. **Cloudflare in front** (docs/05): move nameservers, orange-cloud the records, WAF on `/api/*`.
4. **Resend production domain** → wire the automation engine's `email` action (currently recorded-as-skipped by design).
5. **n8n** instance → replace cron-job.org with a proper workflow on the same drain endpoint.
6. **Stripe billing portal branding** + receipts; Supabase DB backup schedule review (daily included; test a restore once).
7. Rotate `service_role`, `CRON_SECRET` and any key that ever touched a dev machine.

---

*Deployment doc v1.0 — matches the codebase as of Modules 1–4 complete. When the
architecture changes (new env var, new app), update Part 2 and Part 3 in the same PR.*
