-- Row-Level Security for direct (anon/authenticated) Supabase access.
-- The Next.js server uses the service role via Prisma and enforces the same
-- policy in @mazidi/api services; RLS is the second line of defense.
-- Run in the Supabase SQL editor AFTER `prisma migrate deploy`.
--
-- ─────────────────────────────────────────────────────────────────────────
-- v2 (2026-08-14) — SECURITY FIX
--
-- The previous version enabled RLS on 12 tables and assumed the remaining 26
-- were "deny-by-default". That assumption was WRONG. Postgres does not
-- restrict tables where RLS was never enabled — those tables stayed fully
-- readable AND writable by the `anon` role via PostgREST, using the public
-- NEXT_PUBLIC_SUPABASE_ANON_KEY that ships in the browser bundle.
--
-- Worst case that was live: "Membership" was anon-writable, so any signed-up
-- user could run the DEPLOYMENT.md Part 1.4 grant against PostgREST and make
-- themselves SUPER_ADMIN of the whole group platform — then erase the trail,
-- because "AuditLog" was anon-writable too.
--
-- A table with RLS enabled and NO policy denies all anon/authenticated access.
-- That is the intended behaviour for every internal table. The app is
-- unaffected: Prisma connects as the table owner, which bypasses RLS.
-- Verified before shipping: the codebase contains zero supabase `.from()`
-- calls — no data path other than Prisma exists.
-- ─────────────────────────────────────────────────────────────────────────

-- Helper: current customer id from JWT
create or replace function public.customer_id() returns text language sql stable as $$
  select c.id from public."Customer" c where c."userId" = auth.uid()
$$;

-- ── Public marketing content: world-readable ─────────────
alter table public."Company"     enable row level security;
alter table public."Service"     enable row level security;
alter table public."Post"        enable row level security;
alter table public."Testimonial" enable row level security;
create policy company_public_read on public."Company"     for select using (status = 'LIVE');
create policy service_public_read on public."Service"     for select using (true);
create policy post_public_read    on public."Post"        for select using ("publishedAt" is not null);
create policy testi_public_read   on public."Testimonial" for select using (true);

-- ── Client-owned rows: customer sees only their own ──────
alter table public."Invoice"  enable row level security;
alter table public."Project"  enable row level security;
alter table public."Document" enable row level security;
alter table public."Ticket"   enable row level security;
create policy invoice_own  on public."Invoice"  for select using ("customerId" = public.customer_id());
create policy project_own  on public."Project"  for select using ("customerId" = public.customer_id());
create policy document_own on public."Document" for select using ("customerId" = public.customer_id());
create policy ticket_own   on public."Ticket"   for select using ("customerId" = public.customer_id());

-- ── CRM: internal only, no anon access ───────────────────
alter table public."Lead"     enable row level security;
alter table public."Deal"     enable row level security;
alter table public."Activity" enable row level security;
alter table public."Customer" enable row level security;
create policy customer_self on public."Customer" for select using ("userId" = auth.uid());

-- ═════════════════════════════════════════════════════════
-- v2 ADDITION — the 26 tables the old file left exposed.
-- RLS enabled, no policies == deny-by-default for anon and
-- authenticated. Prisma (table owner) is unaffected.
-- ═════════════════════════════════════════════════════════

-- Identity & access control  (Membership was the privilege-escalation vector)
alter table public."User"       enable row level security;
alter table public."Membership" enable row level security;
alter table public."Employee"   enable row level security;

-- Audit, approvals & automation  (integrity-critical: these back every guardrail)
alter table public."AuditLog"       enable row level security;
alter table public."Approval"       enable row level security;
alter table public."AutomationRule" enable row level security;
alter table public."AutomationRun"  enable row level security;
alter table public."OutboxEvent"    enable row level security;

-- Customer & business relations
alter table public."CustomerCompany" enable row level security;
alter table public."ClientBusiness"  enable row level security;
alter table public."Contact"         enable row level security;

-- Delivery
alter table public."Milestone" enable row level security;
alter table public."Task"      enable row level security;
alter table public."Meeting"   enable row level security;

-- Finance  (payroll and salary data)
alter table public."Payment"      enable row level security;
alter table public."Subscription" enable row level security;
alter table public."Contract"     enable row level security;
alter table public."Timesheet"    enable row level security;
alter table public."PayrollRun"   enable row level security;

-- Communications
alter table public."MessageThread" enable row level security;
alter table public."Message"       enable row level security;
alter table public."Notification"  enable row level security;

-- Content & knowledge
alter table public."Page"         enable row level security;
alter table public."KnowledgeDoc" enable row level security;

-- AI
alter table public."AIConversation" enable row level security;

-- Migration bookkeeping
alter table public."_prisma_migrations" enable row level security;

-- ── Verification ─────────────────────────────────────────
-- Expect zero rows. Any row returned is a table still exposed to anon.
--
--   select tablename
--   from pg_tables
--   where schemaname = 'public' and rowsecurity = false;
--
-- And confirm the app still works: Prisma bypasses RLS as table owner, so
-- all four apps (web/portal/team/admin) should be unaffected. Smoke-test
-- login, portal invoices, team CRM, and admin automations before closing out.
