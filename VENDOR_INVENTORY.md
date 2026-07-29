# Vendor and Subprocessor Inventory — proposed, evidence-based

**Status:** PROPOSED. Not approved, not verified against any contract.
**Prepared:** 29 July 2026
**Prepared from:** source code only.
**Purpose:** input to the UK GDPR privacy notice for MazidiPerformance
(`apps/web/app/(group)/privacy/page.tsx`) and to the vendor/DPA/subprocessor registers in
`MazidiPerformance_Compliance_Register.xlsx`.

---

## 1. Method and scope

### 1.1 What was examined

| Repository | Branch / ref | What it is |
|---|---|---|
| `/Users/mazadi/mazidi-platform` | `feature/privacy-centre` | The Next.js monorepo that **runs in production today** and serves the privacy pages. Apps: `web`, `portal`, `team`, `admin`. Packages: `api`, `auth`, `config`, `db`, `ui`. |
| `/Users/mazadi/mazidiperformance` | `feature/backend-provider-decision` | The MazidiPerformance **iOS app** (Swift 6 / SwiftUI), `App/` + `Packages/MazidiKit`. |

Evidence mined: every `package.json` in the workspace; `pnpm-lock.yaml` (144 distinct
packages, full transitive tree); `.env.example`; `turbo.json` `globalEnv`; `packages/db/prisma/schema.prisma`;
all four `next.config.mjs`; all four `middleware.ts`; `DEPLOYMENT.md`; `README.md`;
`scripts/`; `git remote`; and on the iOS side `Packages/MazidiKit/Package.swift`,
`project.yml`, `App/Info.plist`, `Config/*.xcconfig`, the full import inventory of
`App/` + `Sources/`, and `docs/architecture/adr/ADR-0013-backend-provider-selection.md`.

No secret values were read or recorded. Only variable **names** are cited.

### 1.2 Critical scope finding — the notice covers a narrower service than the repo runs

This must be resolved before the notice is merged.

The privacy notice is written for **MazidiPerformance** (§1, §2: "the MazidiPerformance iOS
app, related web pages, coaching services, customer support and connected integrations").
It is being **published from inside `apps/web`** — the same Vercel project, the same domain,
the same Supabase project and the same Postgres database that back the MazidiGroup
**client portal, employee CRM and admin console**.

`README_FIRST.md` in the compliance pack (line 37–44) assumed these pages would be a
**separate static site** at `mazidiperformance.mazidigroup.com` with no vendors attached.
That assumption no longer holds. Implementing them inside the live platform app means the
notice is now served by a stack that includes an AI provider, a payment processor and a
production database of real customer records.

Two readings are possible and **only counsel can choose**:

- **(a) Narrow reading** — the notice governs only MazidiPerformance coaching data. That data
  today exists **only on-device in the iOS app**; the platform database has no
  fitness/health models at all (verified: no workout, exercise, body-metric, check-in or
  wellness model exists in `packages/db/prisma/schema.prisma`). Under this reading almost
  every platform vendor below is out of scope, but the notice would then be describing a
  service with essentially **no processors at all**, which its §6/§7 wording does not reflect.
- **(b) Broad reading** — the notice speaks for "Mazidi Homes Limited" as controller (§1) and
  covers "related web pages" and "customer support" (§2), and MazidiPerformance is
  "part of MazidiGroup". Under this reading every vendor in §2 below is in scope, and the
  notice's §6 category list is **materially incomplete** (see §3).

This document reports **both estates** and marks which is which, because a repository cannot
settle a scoping question that is legal, not technical.

### 1.3 What could NOT be determined from code alone

Be blunt about this. A repository shows **dependencies and intended data flows**. It does not
show:

- **Contracts.** No DPA, no SCC, no UK International Data Transfer Addendum, no
  subprocessor-notification term, and no vendor questionnaire response exists anywhere in
  either repository. Every DPA field below is therefore `TO BE CONFIRMED`. This is not a
  gap in the research — the documents are simply not in the repo, and the compliance pack
  itself (`README_FIRST.md` line 22) records the vendors as "not yet known".
- **What a vendor actually does with data** once received — retention, training use, support
  access, sub-processing, logging.
- **What is actually deployed.** `DEPLOYMENT.md` is a runbook describing an *intended*
  production configuration. Whether those Vercel projects, that Supabase project, live
  Stripe mode and a production `OPENAI_API_KEY` are actually configured **right now** cannot
  be read from source. Environment variables are set in the Vercel dashboard, which is
  outside the repo. Anywhere this matters, the row below says so.
- **Actual processing regions.** Code shows an intended region string
  (`aws-0-eu-west-2` in `.env.example`, "London `eu-west-2`" in `DEPLOYMENT.md`). It cannot
  show where backups, replicas, support access or subprocessors actually sit.
- **Whether free-text fields contain health data in practice.** Several unbounded text
  columns exist (§2.11). Whether users type Article 9 content into them is a fact about
  behaviour, not code.
- **Real data volumes, real users, or whether the service has launched.**

---

## 2. Provider table

Ordered: production path first, then selected-not-integrated, then absent-but-planned.

### 2.1 Vercel — hosting, edge, DNS, TLS

| Field | Value |
|---|---|
| **Provider** | Vercel Inc. |
| **Evidence** | `DEPLOYMENT.md` Part 3 ("one GitHub repo → four Vercel projects"), Part 4 (nameservers moved to `ns1.vercel-dns.com`/`ns2.vercel-dns.com`, wildcard `*.mazidigroup.com`); `packages/db/prisma/schema.prisma:9` comment `"rhel-openssl-3.0.x" = Vercel serverless runtime`; `binaryTargets` includes the Vercel runtime target; `@prisma/nextjs-monorepo-workaround-plugin` in all four `next.config.mjs`. |
| **Purpose** | Application hosting, serverless/edge function execution, CDN, DNS, TLS termination for `mazidigroup.com` and all subdomains. |
| **Data categories** | As the network and compute layer it can observe **everything in transit and in memory**: IP addresses, user-agent, request URLs, auth session cookies (`AUTH_COOKIE_DOMAIN=.mazidigroup.com`), request/response bodies (including AI chat messages and invoice data), and anything written to `console.error` in runtime logs. Server env vars (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`) are stored in Vercel's environment store. **Could touch Article 9 data** if health content is typed into any free-text field routed through it. |
| **In production?** | **Yes** — for the platform estate, and therefore for the privacy pages themselves. This is the host that serves `/privacy`. |
| **User-facing or infra** | Infrastructure-only (no Vercel branding is user-facing), but it is on the path of every request. |
| **DPA status** | **TO BE CONFIRMED** — no DPA, SCC or UK Addendum in either repository. |
| **Subprocessor list** | Publicly published by Vercel. Exact URL **TO BE CONFIRMED** from the vendor directly rather than cited from memory. |
| **Processing locations** | **INFERRED, not confirmed.** No region is pinned anywhere in the repo — there is no `vercel.json`, and no region setting in any `next.config.mjs`. Vercel is US-headquartered with a global edge network; default function region is **not** configured here. Under the notice's §7 this would fall under "United States … or other disclosed locations". **Must be confirmed and, if UK/EU residency is wanted, explicitly pinned.** |
| **Deletion/export** | **TO BE CONFIRMED.** No log-retention configuration exists in the repo. |

### 2.2 Supabase — database, authentication, transactional auth email

| Field | Value |
|---|---|
| **Provider** | Supabase Inc. (Postgres, Auth/GoTrue; Storage and Realtime present as SDK but unused — see below). |
| **Evidence** | `.env.example` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`/`DIRECT_URL` pointing at `*.pooler.supabase.com`. `packages/auth/package.json` — `@supabase/ssr@^0.6.1`, `@supabase/supabase-js@^2.47.10`. `packages/auth/src/server.ts:9` `createServerClient(...)`. `packages/db/prisma/schema.prisma:16-19` `datasource db { provider = "postgresql"; url = env("DATABASE_URL") }`. `schema.prisma:146` `id String @id @db.Uuid // = Supabase auth.users.id`. `DEPLOYMENT.md` Part 1. Transitive in `pnpm-lock.yaml`: `@supabase/auth-js`, `@supabase/postgrest-js`, `@supabase/storage-js`, `@supabase/realtime-js`, `@supabase/functions-js`. |
| **Purpose** | Primary application database (all 30+ models); user authentication and session issuance (magic-link email, cross-subdomain SSO cookie); auth transactional email via Supabase's sender or custom SMTP. |
| **Data categories** | **Everything the platform stores.** From `schema.prisma`: `User` (email, fullName, phone, avatarUrl, locale, twoFactorEnabled); `Customer` (VAT number, country, `stripeCustomerId`, lifetimeValue); `Contact` (name, email, phone, tags); `Lead`/`Deal` (pipeline, values); `Invoice`/`Payment`/`Subscription` (amounts, Stripe ids); `Message`/`MessageThread`/`Ticket` (free-text); `Document` (`storagePath`, `mime`, `size`, `uploadedBy`); `Contract`; `Employee`/`Timesheet`/`PayrollRun` (HR data); `Notification` (title, body); **`AuditLog.ip String?` — raw IP addresses**; **`AIConversation.messages Json` — the full stored transcript of every AI chat, including the user's free text and the model's reply**. **Could touch Article 9 data**: `Message.body`, `Ticket.subject`, `Notification.body`, `Document`, `KnowledgeDoc.content` and `AIConversation.messages` are all unbounded free text. |
| **In production?** | **Yes** for the platform estate — it is the only datastore, and the app cannot boot without it. **Selected-not-integrated** for the MazidiPerformance iOS app (see 2.6). |
| **User-facing or infra** | Infrastructure-only, except that **auth emails are sent from Supabase and are user-facing** (magic links, `DEPLOYMENT.md` 1.3.3). |
| **DPA status** | **TO BE CONFIRMED.** No DPA in repo. `ADR-0013` (iOS repo) records this as an **OPEN, blocking** question (OQ-2/OQ-2b) and notes the DPA is a PDF whose Schedule 3 must be read in the document body, with a **5-day subprocessor objection window**. |
| **Subprocessor list** | **TO BE CONFIRMED — and flagged.** `ADR-0013` OQ-2b records that Supabase publishes **no public subprocessor page**; the list is **Schedule 3 of the DPA PDF**, and that **Schedule 3 lists OpenAI**. See §3.4. |
| **Processing locations** | **Intended: London `eu-west-2`** — `.env.example` connection strings contain `aws-0-eu-west-2.pooler.supabase.com`, and `DEPLOYMENT.md` Part 0/1.1 instructs "region London `eu-west-2`". **This is an instruction in a runbook, not a confirmation that the production project was created there.** `ADR-0013:22` explicitly warns that region choice "does not eliminate vendor support access from the US". **INFERRED — must be confirmed in the Supabase dashboard and contractually.** |
| **Deletion/export** | Partially evidenced. `onDelete: Cascade` on `User→Membership`, `User→Customer`, `Customer→Invoice`, `Customer→ClientBusiness`, `Invoice→Payment` etc. means deleting a `User` row cascades much of their data. **But `AIConversation` has NO relation and NO cascade** (`schema.prisma:627-636`, `userId String @db.Uuid` is a bare indexed scalar) — **AI transcripts would survive a user deletion**. Same pattern for `Notification`, `Ticket`, `Document`, `AuditLog`. Backup retention **TO BE CONFIRMED** (`DEPLOYMENT.md` Part 8.6 says "daily included; test a restore once"). No export code exists anywhere. |

> **Storage/Realtime note:** `@supabase/storage-js` and `@supabase/realtime-js` are pulled in
> transitively by `@supabase/supabase-js` but a repo-wide grep for `.storage.`, `.channel(`,
> `upload(` and `realtime` returns **zero call sites**. `Document.storagePath` is a plain
> string column with no upload implementation. File storage is therefore **not currently used** —
> but the SDK is present and one line of code would activate it.

### 2.3 OpenAI — LLM inference (**live, user-facing, and not disclosed in the notice**)

| Field | Value |
|---|---|
| **Provider** | OpenAI, L.L.C. |
| **Evidence** | `packages/api/src/services/ai.ts:26` — `await fetch("https://api.openai.com/v1/chat/completions", …)`. Model from `process.env.OPENAI_MODEL ?? "gpt-4o-mini"` (`ai.ts:24`). Key from `process.env.OPENAI_API_KEY` (`ai.ts:22`). Declared in `.env.example` (`OPENAI_API_KEY`, `OPENAI_MODEL`) and in `turbo.json:18-19` `globalEnv`. **Two live user-facing routes**: `apps/portal/app/api/ai/advisor/route.ts` and `apps/team/app/api/ai/assistant/route.ts`. `DEPLOYMENT.md` Part 0 lists "OpenAI API key — platform.openai.com" as a **required production prerequisite**; Part 2 requires `OPENAI_API_KEY = production key` in **all four** Vercel projects; Part 6 smoke test **#7** verifies "Portal `/advisor` + team `/assistant` → grounded answers" **in production**. |
| **Purpose** | Two chat assistants: a client-facing "AI Business Advisor" in the portal, and an employee-facing CRM assistant in the team app. |
| **Data categories** | Concrete, from `ai.ts:85-152`. **Sent to OpenAI on every request:** (i) the user's **free-text message**, unfiltered and unbounded (`aiChatSchema`, `route.ts`); (ii) up to **12 turns of prior conversation** (`MAX_TURNS = 12`, `ai.ts:35`); (iii) a system prompt containing **live database records** — for the portal advisor: active **project names**, progress %, due dates, **client company names**, **invoice numbers**, **invoice amounts in GBP**, **due dates**, subscription counts, and cross-sell candidate company names (`ai.ts:102-108`); for the team assistant: the employee's in-scope **company names**, lead counts, **deal titles**, **deal values in GBP**, deal stages, and open-task counts (`ai.ts:136-142`). The reply and the whole transcript are then written back to `AIConversation.messages`. **Article 9 exposure: YES, plausibly.** The user message field is unbounded free text on a client-facing surface. Nothing in `ai.ts`, `schemas.ts` or either route filters, redacts, classifies or warns. A user typing an injury, a symptom, a medication or a health goal sends it to OpenAI. |
| **In production?** | **Yes — configured to be, by the production runbook.** The code path is unconditional and complete. The only gate is whether `OPENAI_API_KEY` is set in Vercel; if unset the routes return a clean 503 (`ai.ts:23`). `DEPLOYMENT.md` treats setting it as a required deploy step and smoke-tests it. **Whether the key is set right now cannot be read from the repo — confirm in the Vercel dashboard. This is the single most important fact to verify before the notice is merged.** |
| **User-facing or infra** | **User-facing.** A client-visible chat feature at portal `/advisor`. |
| **DPA status** | **TO BE CONFIRMED.** No DPA, no zero-data-retention agreement, no training opt-out record and no enterprise-tier evidence exists in the repo. The API is called with a bare bearer key over plain `fetch` — there is nothing in code indicating an enterprise or ZDR endpoint. |
| **Subprocessor list** | Published by OpenAI. Exact URL **TO BE CONFIRMED** from the vendor. |
| **Processing locations** | **INFERRED: United States.** `api.openai.com` with no region pinning, no data-residency endpoint and no regional routing anywhere in the code. **CONFIRM.** |
| **Deletion/export** | **TO BE CONFIRMED** — depends entirely on the OpenAI account tier and retention settings, which are outside the repo. Note that the **local** copy in `AIConversation` has no deletion cascade (see 2.2). |

### 2.4 Stripe — payments and subscriptions

| Field | Value |
|---|---|
| **Provider** | Stripe, Inc. / Stripe Payments Europe Ltd. |
| **Evidence** | `packages/api/package.json` — `"stripe": "^17.5.0"` (lockfile resolves `stripe@17.7.0`). `packages/api/src/services/billing.ts:1` `import Stripe from "stripe"`, `:23-26` `getStripe()`. `.env.example` — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. `apps/portal/app/api/webhooks/stripe/route.ts`, `apps/portal/app/api/billing/{checkout,portal,subscribe}/route.ts`, `apps/portal/components/BillingButtons.tsx`. `packages/api/src/scripts/sync-plans.ts`. `DEPLOYMENT.md` Part 5 (live mode, live webhook at `https://portal.mazidigroup.com/api/webhooks/stripe`, five subscribed events, 5.5 "Verify with a real card"). |
| **Purpose** | Hosted Checkout for invoices and plan subscriptions; customer billing portal; webhook-driven payment state. Stripe is the **source of truth for money state** (`billing.ts:12`). |
| **Data categories** | **Sent to Stripe** (`billing.ts:36-41`): customer **email address**, **full name or organisation name**, and a `mazidiCustomerId` metadata field. Plus invoice line items, amounts, currency (GBP) and `companyId` metadata. **Card data is entered on Stripe's hosted Checkout, not by this app** — no card fields exist in the codebase, and only `stripeCustomerId` / `stripePaymentIntentId` / `stripeInvoiceId` / `stripeSubscriptionId` references are stored locally. Stripe will also independently hold card details, billing address, IP and fraud signals. **Article 9: no** — no health data is sent, and invoice `lines` are business services. |
| **In production?** | **Yes, intended** — `DEPLOYMENT.md` Part 5 is a full live-mode cutover procedure. Whether live keys are set is **TO BE CONFIRMED** in the Vercel dashboard. Note this is the **platform/portal** billing estate; there is **no** payment code in the MazidiPerformance iOS app at all (no StoreKit — see 2.9). |
| **User-facing or infra** | **User-facing** — users are redirected to Stripe-hosted Checkout and the Stripe billing portal. |
| **DPA status** | **TO BE CONFIRMED.** Not in repo. |
| **Subprocessor list** | Published by Stripe. URL **TO BE CONFIRMED** from the vendor. |
| **Processing locations** | **INFERRED: US and EU/Ireland.** No region configuration exists in the code. **CONFIRM.** |
| **Deletion/export** | **TO BE CONFIRMED.** Note payment records are subject to statutory accounting retention (notice §8), which will legitimately outlive an erasure request. |

### 2.5 GitHub — source control and deployment trigger

| Field | Value |
|---|---|
| **Provider** | GitHub, Inc. (Microsoft). |
| **Evidence** | `git remote -v` → `https://github.com/MazidiGroup/mazidi-platform.git`. `DEPLOYMENT.md` Part 0 ("Vercel deploys from GitHub") and Part 3.1 (Vercel GitHub app installation). |
| **Purpose** | Source hosting; push triggers a Vercel build. |
| **Data categories** | **Source code, `.env.example` (no real secrets — verified: `.gitignore` excludes `.env`/`.env.local`, and `DEPLOYMENT.md` Part 0 mandates `git ls-files \| grep -c "\.env$"` must print `0`). Commit author names and emails.** **No end-user personal data** — the repo contains no user data, no fixtures with real people, and no database dumps. |
| **In production?** | **Yes** as part of the delivery pipeline — but it is **not** on the runtime data path. |
| **User-facing or infra** | Infrastructure-only. |
| **DPA status** | **TO BE CONFIRMED.** Arguably not required if no personal data beyond developer identities is processed — **a legal call, not a technical one.** |
| **Subprocessor list** | Published by GitHub/Microsoft. URL **TO BE CONFIRMED**. |
| **Processing locations** | **INFERRED: United States.** No region setting. |
| **Deletion/export** | Not applicable to end-user data. |

> **No CI exists.** There is no `.github/workflows/` directory (confirmed; also stated in
> `PRIVACY_WORDING_DIFF.md` §8). `pnpm check:privacy` and `pnpm check:boundaries` are manual.
> **The privacy-page release guard is therefore not enforced by any automated gate.**

### 2.6 Supabase (MazidiPerformance iOS) — SELECTED, NOT INTEGRATED

| Field | Value |
|---|---|
| **Provider** | Supabase Inc. |
| **Evidence** | `/Users/mazadi/mazidiperformance/docs/architecture/adr/ADR-0013-backend-provider-selection.md` — Status: "**Accepted — for provider selection only**", region London `eu-west-2`. **Counter-evidence that it is NOT integrated:** `Packages/MazidiKit/Package.swift:25-31` — the only external dependency is `GRDB.swift` exact `7.11.1`; **no `supabase-swift` anywhere**. `Config/Base.xcconfig` — `SYNC_BASE_URL =` and `MEDIA_BASE_URL =` are **empty**, and `Debug`/`Staging`/`Release.xcconfig` each only `#include "Base.xcconfig"` without overriding either. Repo-wide grep for `supabase` returns **zero hits in any `.swift`, `.plist`, `.xcconfig`, `project.yml` or CI file** — only three markdown docs. |
| **Purpose** | *Intended* future backend for iOS sync, auth and storage. |
| **Data categories** | *Would* receive workout and coaching data — see 2.11. Receives **nothing today**. |
| **In production?** | **Selected — not integrated. No data flows.** `ADR-0013:34`: "Until then this ADR authorises no adapter, no transport, no account, no key, no configuration." `ADR-0013:36-38`: "No account was created, nothing was deployed, no dependency was added." Integration is gated behind **four unclosed Phase-0 gates**: (1) DPA executed with UK Addendum verified — **OPEN, blocking**; (2) DPIA completed; (3) ICO registration + data protection fee paid; (4) solicitor confirmation of the Art. 9(2)(a) basis. |
| **User-facing or infra** | N/A — not in the path. |
| **DPA status** | **TO BE CONFIRMED — recorded in ADR-0013 as OPEN and blocking.** |
| **Subprocessor list** | **TO BE CONFIRMED.** ADR-0013 OQ-2b: no public page; Schedule 3 of the DPA PDF; **lists OpenAI**; 5-day objection window. |
| **Processing locations** | Intended London `eu-west-2`. Not yet real. |
| **Deletion/export** | Not applicable — no data held. |

> **Do not list this as a live processor in the privacy notice.** It is a procurement
> decision, not a data flow.

### 2.7 CDN for the animation library — UNDECIDED

| Field | Value |
|---|---|
| **Provider** | **Undecided.** Bunny.net and Fly.io are discussed as candidates in `ADR-0013`. |
| **Evidence** | `ADR-0013:219` — "Supabase Storage is not recommended for the 206-clip library". `Config/Base.xcconfig` `MEDIA_BASE_URL =` is empty in every configuration. `Packages/MazidiKit/Sources/MazidiContent/MediaLocation.swift:110` — `RemoteMediaOrigin.init?(configuredBaseURL:)` returns `nil` for an empty value, so the remote media tier is **disabled by construction**. The only `https://cdn.example` strings in the repo are in a comment and in test fixtures (RFC 2606 reserved domain). |
| **Purpose** | *Intended* delivery of exercise animation clips. |
| **Data categories** | Would see **IP address, user-agent and which exercise clips a user requests** — a request pattern that is itself an inference about a person's training programme. Not currently anyone's. |
| **In production?** | **No. Not selected, not integrated.** |
| **DPA / subprocessors / locations / deletion** | **ALL TO BE CONFIRMED.** Flagged: `ADR-0013:440` (OQ-6, **OPEN — escalated**) records that **Fly.io lists Anthropic and OpenAI** as its subprocessors and **Bunny.net lists OpenAI**. |

### 2.8 GRDB.swift — local dependency, NOT a processor

| Field | Value |
|---|---|
| **Provider** | `groue/GRDB.swift` (open source, MIT). |
| **Evidence** | `Packages/MazidiKit/Package.swift:25-31` — `.package(url: "https://github.com/groue/GRDB.swift.git", exact: "7.11.1")`. Imported only in `Sources/MazidiPersistenceGRDB/` (ADR-0007). |
| **Purpose** | Local SQLite persistence on the device. |
| **Data categories** | Holds all local workout data **on the device**. **Performs no networking.** |
| **In production?** | Yes, it ships in the binary — but it is **a code library, not a data recipient**. It should appear in an SBOM, **not** in a subprocessor list. The GitHub URL is a build-time source fetch, never contacted at runtime. |
| **DPA status** | **Not applicable** — no controller/processor relationship exists with an OSS library. |

### 2.9 Apple — App Store distribution only

| Field | Value |
|---|---|
| **Provider** | Apple Inc. |
| **Evidence of ABSENCE** | Repo-wide grep of the iOS app for `StoreKit`, `SKPayment`, `Product.purchase`, `ASAuthorization`, `AuthenticationServices`, `CloudKit`, `CKContainer`, `NSUbiquitous`, `UNUserNotificationCenter`, `UserNotifications`, `registerForRemoteNotifications`, `MapKit`, `CoreLocation`, `HealthKit`, `HKHealthStore`, `appStoreReceipt`, `AppTrackingTransparency`, `ATTrackingManager`, `identifierForVendor` → **two hits, both the SF Symbol string `"checkmark.icloud"`**. `App/Info.plist` contains exactly four non-boilerplate keys (`UILaunchScreen`, `CFBundleDisplayName`, `MediaBaseURL`, `SyncBaseURL`). **No `.entitlements` file exists anywhere in the repo.** `project.yml:63-64`: "Health/photo/calendar usage strings are added when those features land — permissions are off by default." |
| **Purpose** | If and when the app is submitted: App Store / TestFlight distribution. |
| **Data categories** | App Store account data, purchase records and Apple's own App Analytics — **all held by Apple as controller under its own terms**, none of it flowing through this code. |
| **In production?** | **No** — the app is not submitted (no `DEVELOPMENT_TEAM` set, `project.yml:24`). **No HealthKit. No Sign in with Apple. No iCloud/CloudKit. No push notifications. No StoreKit/in-app purchase. No ATT/IDFA.** |
| **DPA status** | Apple's DPSLA / DTA — **TO BE CONFIRMED** at submission time. |

> **Notable positive for the DPIA:** credentials are stored in the Keychain with
> `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`
> (`App/Platform/KeychainCredentialStore.swift`), so they **do not migrate to iCloud
> Keychain or another device via backup**.

### 2.10 Planned-but-absent vendors (must NOT be described as live)

All four appear in `DEPLOYMENT.md` Part 8 "hardening backlog" or as commented integration
points. **None is installed. None is in `pnpm-lock.yaml`. None receives data today.**

| Provider | Evidence | Status |
|---|---|---|
| **Resend** (email) | `packages/api/src/services/automations.ts:161-162` — `// Real integration point: wire Resend here` … `return "skipped: email channel not configured (Resend pending)"`. `DEPLOYMENT.md` Part 8.4. **Not in any `package.json` or the lockfile.** | **Not integrated.** BUT see the SMTP caveat below. |
| **Resend SMTP** (auth email relay) | `DEPLOYMENT.md` 1.3.4 — "Custom SMTP (strongly recommended)… host `smtp.resend.com`, user `resend`, password = Resend API key, sender `login@mazidigroup.com`". | **CONFIGURED OUTSIDE THE REPO, IN THE SUPABASE DASHBOARD.** If this was done, **Resend is a live processor of every user's email address and every magic-link token**, and it is invisible to code inspection. **HIGH-PRIORITY CONFIRMATION.** |
| **Sentry** (error monitoring) | `DEPLOYMENT.md` Part 8.2 — "Error monitoring: Sentry (docs/05) — one DSN across the four projects." **No `@sentry/*` package in any `package.json` or the lockfile.** | **Not integrated.** No crash reporting or error-monitoring vendor exists in either estate. |
| **Cloudflare** (WAF/CDN) | `DEPLOYMENT.md` Part 4.3 note and Part 8.3 — "production architecture puts Cloudflare in front for WAF/cache. Do that as a later hardening step, not on first deploy". | **Not integrated.** DNS is on Vercel today. |
| **cron-job.org** (scheduler) | `DEPLOYMENT.md` Part 6.4 — external cron POSTing to `https://admin.mazidigroup.com/api/automations/run` with an `x-cron-secret` header every 5 minutes. | **CONFIGURED OUTSIDE THE REPO.** If used, it holds a **URL and a shared secret** (`CRON_SECRET`) but receives **no personal data** in the request — it only triggers a drain. Still a vendor with a credential. **CONFIRM whether it is in use.** |
| **n8n** (automation) | `DEPLOYMENT.md` Part 8.5; `packages/api/src/services/billing.ts:12` comment "OutboxEvent (n8n automations)". | **Not integrated.** No n8n code or config exists. |

> **Next.js build telemetry:** `next@15.5.20` collects anonymous **build-time** telemetry by
> default. No `NEXT_TELEMETRY_DISABLED` or `telemetry: false` is set in any `next.config.mjs`,
> `.env.example` or `turbo.json`. This concerns **build machines, not end users**, and carries
> no personal data of service users — but note it if the register aims to be exhaustive.

### 2.11 Data categories that determine Article 9 exposure

Recorded here because the answer in §3.3 depends on it.

**Platform database (`packages/db/prisma/schema.prisma`)** — contains **no** health, fitness,
workout, body-metric, nutrition or wellness model. Verified by reading the full model list
(30 models, none health-related). Health data can only enter via **unbounded free text**:
`Message.body`, `Ticket.subject`, `Notification.body`, `KnowledgeDoc.content`,
`Document` (uploaded files), and **`AIConversation.messages`**.

**iOS app (`Packages/MazidiKit/Sources/MazidiDomain/`)** — **does** hold data the owner has
already classified as Article 9:

- `WorkoutSession.swift`, `struct SetEntry`: `performedSlug`, `setIndex`,
  `value` (`repsAndLoad(reps:loadKg:)` / `reps` / `time` / `distance`), **`rpe: Double?`**
  (rate of perceived exertion), `recordedAt`.
- `Programming.swift:64`: **`public var coachNotes: String?`** — an unbounded free-text field
  a coach fills in via `App/Coach/Views/WorkoutEditorView.swift:608`. The test fixture at
  `Tests/MazidiPersistenceGRDBTests/SyncAuditPrivacyTests.swift:32` literally uses
  `"SECRET client medical note do-not-leak"` — **the team already understands this field will
  carry medical content.**
- `ADR-0013:21`: "**YES — treat the workout, discomfort and check-in data as special category
  data.** Lawful basis assumed to be **explicit consent, Art. 9(2)(a)** … The owner is
  confirming this with a solicitor."

**None of this leaves the device today.** There is no `URLSession`, `URLRequest`,
`URLProtocol`, `dataTask` or `NWConnection` anywhere in `App/`, `Sources/` or `UITests/`.
The only sync transports are `FakeSyncBackend` (`#if DEBUG`-wrapped) and the inert in-memory
`FixtureSyncTransport`. Release mode hardcodes `isOnline == false` and `drainSync() == nil`.

---

## 3. Notice-versus-code gap analysis

Section numbers below are as **published** (`apps/web/app/(group)/privacy/page.tsx`). Because
the Apple Health section (source §6) was removed, the published §6 = source §7 (sharing) and
published §7 = source §8 (transfers). See `PRIVACY_WORDING_DIFF.md` §1.3.

### 3.1 Where the notice is NARROWER than reality (under-disclosure)

| # | Notice wording | Reality in code | Severity |
|---|---|---|---|
| **N1** | **§6** lists recipient categories: "hosting, database, authentication, communications, analytics, crash-reporting, security, support and payment providers". | **No category covers an AI/LLM provider.** OpenAI receives production customer data (`packages/api/src/services/ai.ts:26`) and fits none of those nine words. A reader cannot infer from §6 that their words and account data go to a third-party model API. | **CRITICAL** — Art. 13(1)(e) recipients. This alone makes §6 materially incomplete under the broad scope reading. |
| **N2** | **§12** para 2: "Production-user information **must not** be sent to an AI model … **unless** the data flow, provider contract, retention, training settings, international transfers, user notice and appropriate consent have been reviewed and documented." | The conditions are **not met by any evidence in either repository**: no OpenAI DPA, no retention/ZDR record, no training-settings record, no transfer assessment, no data-flow map, no user notice naming AI, no consent mechanism. Yet the flow is fully implemented and the production runbook requires the key. | **CRITICAL** |
| **N3** | **§12** para 2, final sentence: "If an AI-powered user feature is added, **this notice must be updated before release**." | **Two AI-powered user features already exist** — portal `/advisor` (client-facing) and team `/assistant`. The notice has not been updated: it names no AI provider and describes no AI feature anywhere. | **CRITICAL** |
| **N4** | **§4** lawful-basis table has five rows (contracted service, security, payments, optional analytics, marketing). | **No row covers AI/LLM processing.** No Art. 6 basis and no Art. 9 condition is stated for sending account data and free-text messages to OpenAI. | **HIGH** |
| **N5** | **§3** app/device bullet: "**IP-derived region**". | `schema.prisma:648-656`, `model AuditLog`: **`ip String?`** — the **raw IP address** is stored, not a derived region. | **MEDIUM** — factually wrong, and easy to fix in wording or in code. |
| **N6** | **§7** transfers: generic list "United Kingdom, European Economic Area, United States, Canada or other disclosed locations", naming no provider and linking no subprocessor list. **§6** defers: "The final provider list and subprocessor links **must be completed in MazidiGroup's internal vendor register**." | The notice defers the entire vendor disclosure to a register that, on the evidence available, **does not yet contain the real vendors** — `README_FIRST.md` line 22 records that the "backend, authentication, payments, analytics, crash reporting, email, support and AI vendors are **not yet known**". They are now known (§2 above). | **HIGH** — the deferral is only acceptable if the register is actually completed. |
| **N7** | **§1**: "Mazidi Homes Limited is the controller of the personal information described in this Privacy Notice." | The notice is served from `apps/web`, sharing a Vercel project, domain, Supabase project and database with the MazidiGroup **portal/CRM/admin** estate and its OpenAI integration. See §1.2. **The scope boundary is undefined in the notice.** | **HIGH** — scoping, for counsel. |
| **N8** | **§11** Security: "multi-factor authentication for administrative accounts". | `schema.prisma:152` has `twoFactorEnabled Boolean @default(false)` as a **column only**. No MFA enforcement, challenge or enrolment code exists in the repo. Supabase MFA may be enabled in the dashboard — **TO BE CONFIRMED**. | **MEDIUM** — a security claim the code does not evidence. |
| **N9** | **§10**: "Users should also be able to request or download an **export** … profile data, coaching plans, progress, messages, health/wellness entries and consent history." | **No export code exists in either repository.** Zero. Deletion was already downgraded to email-only (`PRIVACY_WORDING_DIFF.md` S6); export was **not**. | **MEDIUM** — a rights commitment with no implementation. |
| **N10** | **§8** retention: "Account, coaching plans, progress, messages and health/wellness data — … then deletion or de-identification within 30 days". | **`AIConversation` has no `onDelete: Cascade` and no relation** (`schema.prisma:627-636`). Deleting a `User` would leave AI transcripts — including the user's free text — orphaned but intact. Same for `Notification`, `Ticket`, `Document`, `AuditLog`. | **HIGH** — an erasure commitment the schema does not deliver. |
| **N11** | Not in the notice at all. | **Resend SMTP** may be configured in the Supabase dashboard (`DEPLOYMENT.md` 1.3.4), making it a live processor of every email address and magic link — invisible to code review. | **HIGH if configured** — confirm first. |

### 3.2 Where the notice is BROADER than reality (over-disclosure / unsupported claims)

Over-disclosure is less legally dangerous than under-disclosure, but it misdescribes the
service and undermines the notice's credibility.

| # | Notice wording | Reality in code |
|---|---|---|
| **B1** | **§3**: collects "**crash reports and performance logs**". **§6**: "**crash-reporting**" providers. **§8**: "Crash and diagnostic data — 90 days". | **No crash-reporting vendor exists in either estate.** No Sentry, Crashlytics, Bugsnag or equivalent in any `package.json`, in `pnpm-lock.yaml`, or in the iOS app. Sentry is `DEPLOYMENT.md` Part 8.2 backlog only. |
| **B2** | **§6**: "**analytics**" providers. **§4**: an "Optional analytics" lawful-basis row. **§8**: "Product analytics — 14 months". **§9 (US)**: opt-outs for "sale, sharing, targeted advertising or profiling". | **No analytics vendor exists.** Verified across all 144 lockfile packages and the whole iOS import inventory: no PostHog, Plausible, GA/gtag, Segment, Amplitude, Mixpanel, Hotjar, `@vercel/analytics` or `@vercel/speed-insights`. iOS logging is `print()` via `PrintLogSink`. |
| **B3** | **§3**: "Payment-card details should be handled by **Apple** or the appointed payment processor". | **There is no StoreKit, in-app purchase or Apple payment integration in the iOS app** — grep returns zero. The only payment processor anywhere is Stripe, and it serves the **platform portal**, not MazidiPerformance. |
| **B4** | **§3** biometric clarification: "Face ID or Touch ID used to unlock the app…". | **No biometric unlock exists.** The complete iOS import inventory is Foundation, SwiftUI, Observation, UIKit, AVKit, Security, CryptoKit, XCTest, GRDB — **no `LocalAuthentication` / `LAContext`**. The paragraph describes a feature that does not exist. |
| **B5** | **§3**: collects "user ID, device and app version, operating system, language, IP-derived region, security events, product interactions". | The iOS app collects a device-installation `UUID` in `UserDefaults` (`App/Sync/BackendSyncDriver.swift:18`) and **sends nothing anywhere**. There is no telemetry pipeline in the app at all. |
| **B6** | **§6**: information disclosed to "**authorised coaches**"; §5: "Access to health information must be restricted to authorised personnel and coaches". | The iOS Coach role exists in-app, but **no data is transmitted between coach and client** — there is no transport. Coach/client sharing is currently local-only. |
| **B7** | **§9**: extensive **United States** (incl. Washington consumer health data) and **Canada** rights sections. | No evidence of US or Canadian operations, users or infrastructure in either repo. `.env.example` uses GBP and `eu-west-2`. Not a code defect — a legal-scope choice — but it should be deliberate. |

### 3.3 Direct answers to the two questions asked

**Q1 — Does any provider in the production path plausibly process health / Article 9 data?**

**Yes — with an important qualification about which estate.**

- In the **MazidiPerformance iOS app**: Article 9 data (workout load, RPE, and the free-text
  `coachNotes` field that the team's own test fixture calls a "client medical note") **exists
  on-device**, and the owner has already classified it as special category data in
  `ADR-0013:21`. **But no provider processes it, because no network transport exists.**
  `SYNC_BASE_URL` and `MEDIA_BASE_URL` are empty in every build configuration and the only
  sync implementations are a DEBUG fake and an inert in-memory fixture. **Today: zero
  Article 9 exposure to any third party from the app.**
- In the **platform estate**: the database has **no health models**, so no structured health
  data exists. **However**, Article 9 data can plausibly reach three providers through
  **unbounded free text**:
  1. **Supabase** — stores `Message.body`, `Ticket.subject`, `Document`, and
     `AIConversation.messages`. Anything a user types is stored there.
  2. **OpenAI** — receives the user's free-text message verbatim on every advisor request.
     Nothing filters, redacts or warns.
  3. **Vercel** — sits on the request path and in `console.error` runtime logs.

  This is **plausible, not proven**. Whether users type health content into a business-advisor
  chat is a behavioural question. But the surface is client-facing, the field is unbounded,
  and there is no technical control preventing it. For a company whose sister product is a
  fitness coaching app, this should be treated as a live risk, not a theoretical one.

**Q2 — Is any AI / model API in the production path? Does it contradict the notice?**

**Yes, and yes.**

`packages/api/src/services/ai.ts:26` calls `https://api.openai.com/v1/chat/completions` with
production database records and user free text, via two live user-facing routes.
`DEPLOYMENT.md` requires a production `OPENAI_API_KEY` in all four Vercel projects (Part 2)
and smoke-tests the AI pages in production (Part 6, test #7).

The contradiction has two parts:

1. **Against the published notice.** §12 permits AI processing only once the data flow,
   contract, retention, training settings, transfers, notice and consent are "reviewed and
   documented", and requires the notice to be updated before an AI feature is released.
   **None of those artefacts exists in either repository, and the notice has not been
   updated.** §6 lists no AI recipient category. §4 states no lawful basis for it.

2. **Against the compliance pack's own foundational assumption.** `README_FIRST.md` line 21
   states as a **critical assumption**: "**No production-user data is sent to Claude Code or
   other AI tools.**" Line 22 records the AI vendors as "not yet known". Both statements are
   false as against the production platform code. `PRIVACY_WORDING_DIFF.md` D3 shows the
   equivalent internal editorial note ("no production-user data sent to AI tools unless the
   user is clearly informed and the processing is documented") was **removed from the public
   page** — but it remains the standing assumption of the pack the notice is derived from.

   The narrow reading (that this assumption refers to MazidiPerformance only, and that OpenAI
   sits in a different product) is **available and may well be correct** — but it must be
   stated deliberately by counsel, not left as an implicit rescue. As written, the notice is
   published from the very application that makes the OpenAI calls.

### 3.4 Vendors whose subprocessor lists are known to include AI vendors

From `ADR-0013` (iOS repo), which the owner has already escalated:

| Vendor | AI subprocessors named | In production path? |
|---|---|---|
| **Supabase** | `ADR-0013:439` (OQ-2b, **OPEN**) — no public subprocessor page; the list is **Schedule 3 of the DPA PDF**, which **lists OpenAI**; the objection window is only **5 days**. | **YES — Supabase is the live platform database and auth provider.** |
| **Fly.io** | `ADR-0013:440` (OQ-6, **OPEN — escalated**) — lists **Anthropic and OpenAI**. | No — CDN candidate only, not selected. |
| **Bunny.net** | `ADR-0013:440` — lists **OpenAI**. | No — CDN candidate only, not selected. |

`ADR-0013:440` states the requirement plainly: "If any is in the final stack, exactly what
customer data can reach those subprocessors must be established." **Supabase is already in
the stack.** `ADR-0013:27` also requires "a data-flow map covering any AI/model API calls
that touch client health data" — that map does not exist and is now overdue, because a
direct AI/model API call already exists in production.

---

## 4. Must be confirmed before the privacy notice may be merged

Ordered by blocking severity. Items 1–6 are, in my assessment, genuine merge blockers.

**Scope and AI (blocking)**

- [ ] **1.** **Counsel decides the scope boundary** (§1.2): does this notice speak only for
      MazidiPerformance, or for Mazidi Homes Limited's processing across the platform it is
      published from? Every item below depends on this answer.
- [ ] **2.** **Confirm whether `OPENAI_API_KEY` is set in the production Vercel projects.**
      Check all four (web, portal, team, admin). If set, the OpenAI flow is live.
- [ ] **3.** **Resolve the §12 contradiction.** Either (a) disable the AI routes until the
      §12 conditions are documented, or (b) complete the §12 conditions — OpenAI DPA,
      retention/no-training terms, transfer assessment, data-flow map, consent — and update
      §4, §6 and §12 to disclose the AI feature and the AI recipient category.
- [ ] **4.** **Add an AI/model-API recipient category to §6** (gap N1), or state explicitly
      why no AI provider is in the notice's scope.
- [ ] **5.** **Obtain Supabase's DPA Schedule 3 and read the subprocessor list in the document
      body.** Confirm whether OpenAI appears and what data can reach it. Note the **5-day
      objection window** — diary it.
- [ ] **6.** **Confirm whether custom SMTP (Resend) is configured in the Supabase dashboard**
      (`DEPLOYMENT.md` 1.3.4). If yes, Resend is a live processor of every user's email
      address and must be added to the register and to §6/§7.

**Contracts and transfers**

- [ ] **7.** Execute and file a **DPA with UK International Data Transfer Addendum** for each
      live vendor: **Vercel, Supabase, OpenAI, Stripe** (and Resend, cron-job.org and GitHub
      as applicable). None exists in either repo today.
- [ ] **8.** Obtain and record the **subprocessor list URL** for each, plus the
      change-notification period.
- [ ] **9.** **Confirm the actual Supabase project region** in the dashboard (`eu-west-2` is a
      runbook instruction, not a verified fact), and confirm backup and read-replica regions.
- [ ] **10.** **Pin or confirm the Vercel function region.** No region is configured anywhere;
      there is no `vercel.json`. Decide, set it, and align §7.
- [ ] **11.** Confirm **OpenAI processing region and retention/training settings** for the
      account tier in use.
- [ ] **12.** Do **not** publish any "UK-only" or "EU-only" hosting claim — §7 already warns
      against this and the evidence does not support it.

**Code changes that must land before the notice's promises are true**

- [ ] **13.** **`AIConversation` has no deletion cascade** (`schema.prisma:627-636`). Add a
      relation with `onDelete: Cascade`, or a documented deletion routine, before §8 and §10
      can be honoured. Check `Notification`, `Ticket`, `Document`, `AuditLog` the same way.
- [ ] **14.** **`AuditLog.ip` stores raw IP addresses** while §3 says "IP-derived region".
      Either truncate/derive at write time, or correct §3 (gap N5).
- [ ] **15.** **No export capability exists** anywhere. Either build it or soften §10 the way
      §10's deletion sentence was already softened (gap N9).
- [ ] **16.** Consider a **redaction, warning or health-content control** on the AI chat input,
      or an explicit in-product notice that messages are sent to a third-party AI provider.

**Notice wording corrections (over-disclosure)**

- [ ] **17.** Remove or qualify **crash-reporting** (§3, §6, §8) — no such vendor exists (B1).
- [ ] **18.** Remove or qualify **analytics** (§3, §4, §6, §8, §9) — no such vendor exists (B2).
- [ ] **19.** Correct the **Apple payment** sentence in §3 — there is no StoreKit/IAP (B3).
- [ ] **20.** Remove or qualify the **Face ID / Touch ID** paragraph in §3 — no
      `LocalAuthentication` usage exists (B4).
- [ ] **21.** Reconcile **§11's MFA claim** with reality (N8).

**Process**

- [ ] **22.** **Complete the internal vendor register** that §6 defers to, using §2 above.
      §6's deferral is only defensible if the register is real.
- [ ] **23.** **`pnpm check:privacy` must exit 0.** It currently exits **non-zero by design**
      because `[EFFECTIVE DATE — SET ON PUBLICATION]` is still on `/privacy/complaints`.
      There is **no CI** (`.github/workflows/` does not exist), so this guard is
      **manual only** — add it to the release sequence, and add CI.
      **Note:** the guard greps for the literal string `TO BE CONFIRMED`. This inventory file
      lives at the repo root, **outside** the guard's target directory
      (`apps/web/app/(group)/privacy/`), so it does not trip the check — verified.
- [ ] **24.** Confirm **`privacy@mazidigroup.com` deliverability** end-to-end (already tracked
      in `PRIVACY_WORDING_DIFF.md` §8).
- [ ] **25.** Confirm whether **cron-job.org** is actually in use (`DEPLOYMENT.md` Part 6.4).
      It holds a credential, though no personal data.

---

## 5. Highest-risk unknowns

Ranked. These are the things most likely to make the published notice wrong.

1. **Whether the OpenAI integration is live in production right now.** Everything in §3.3 Q2
   turns on one environment variable that cannot be read from the repo. If `OPENAI_API_KEY`
   is set, a client-facing feature is sending production customer data and unbounded user
   free text to a US AI provider with no DPA on file and no disclosure in the notice. If it
   is unset, the routes 503 and the exposure is latent. **Check this first.**

2. **Whether the notice's scope includes the platform estate.** An unstated scope boundary is
   the single largest structural weakness. Under the broad reading, §6 is materially
   incomplete. Under the narrow reading, the notice describes analytics, crash reporting and
   payment processors that do not exist for the service it covers — and it is still published
   from the application that runs the AI integration.

3. **Supabase's Schedule 3 subprocessor list.** It is not public, it is inside a PDF, it
   reportedly names OpenAI, and the objection window is five days. Supabase holds the entire
   production database. This is an unknown with a short clock attached.

4. **Whether Resend SMTP is configured in the Supabase dashboard.** A live processor of every
   user's email address and every magic-link token that is **completely invisible to code
   review**. The runbook "strongly recommends" it, which makes it likely.

5. **Actual processing regions for Vercel, Stripe and OpenAI.** None is pinned in code. The
   notice's §7 is generic enough to survive, but a transfer risk assessment cannot be written
   against inferences.

6. **Whether free-text fields already contain Article 9 data.** The controls that would tell
   you do not exist, and the fields are unbounded. The iOS test fixture
   `"SECRET client medical note do-not-leak"` shows the team expects it. Nobody can answer
   this from code — it needs a look at production data under appropriate access controls.

7. **The absence of any contract for any vendor.** Not one DPA, SCC or UK Addendum exists in
   either repository. This is expected — contracts do not live in git — but it means **every
   single contractual assertion in this document is unverified**, and §6's promise that
   "Service providers are required by contract to process information only for the agreed
   purposes" is, on the available evidence, **unevidenced**.

8. **Erasure completeness.** `AIConversation`, `Notification`, `Ticket`, `Document` and
   `AuditLog` have no deletion cascade. An erasure request handled by deleting the `User` row
   would leave personal data — including AI chat transcripts and IP addresses — behind, in
   contradiction of §8 and §10.

---

## 6. Limits of this document

This inventory was produced **entirely from source code and repository documentation**. It is
a hypothesis about data flows, not a verified record of them.

A repository shows what a system is *built* to do. It does **not** show:

- what is actually deployed, or which environment variables are set;
- what contracts exist, or what they say;
- what a vendor actually does with data once it arrives;
- what is configured in a vendor's own dashboard (Supabase SMTP and MFA being the clearest
  examples here — both invisible to this method, both material);
- what data real users have actually entered.

Every field marked **TO BE CONFIRMED** must be confirmed against the vendor, the contract or
the running system. Nothing in this document should be copied into a published privacy notice
without that confirmation. Fields marked **INFERRED** are my reasoning from code, not fact.

**Nothing in this document was verified against a contract, a dashboard, or a running system.**
