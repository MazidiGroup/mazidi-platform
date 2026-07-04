-- Row-Level Security for direct (anon/authenticated) Supabase access.
-- The Next.js server uses the service role via Prisma and enforces the same
-- policy in @mazidi/api services; RLS is the second line of defense.
-- Run in the Supabase SQL editor AFTER `prisma migrate deploy`.

-- Helper: current customer id from JWT
create or replace function public.customer_id() returns text language sql stable as $$
  select c.id from public."Customer" c where c."userId" = auth.uid()
$$;

-- Public marketing content: world-readable
alter table public."Company"     enable row level security;
alter table public."Service"     enable row level security;
alter table public."Post"        enable row level security;
alter table public."Testimonial" enable row level security;
create policy company_public_read on public."Company"     for select using (status = 'LIVE');
create policy service_public_read on public."Service"     for select using (true);
create policy post_public_read    on public."Post"        for select using ("publishedAt" is not null);
create policy testi_public_read   on public."Testimonial" for select using (true);

-- Client-owned rows: customer sees only their own
alter table public."Invoice"  enable row level security;
alter table public."Project"  enable row level security;
alter table public."Document" enable row level security;
alter table public."Ticket"   enable row level security;
create policy invoice_own  on public."Invoice"  for select using ("customerId" = public.customer_id());
create policy project_own  on public."Project"  for select using ("customerId" = public.customer_id());
create policy document_own on public."Document" for select using ("customerId" = public.customer_id());
create policy ticket_own   on public."Ticket"   for select using ("customerId" = public.customer_id());

-- Everything else: no anon access (deny-by-default once RLS is enabled)
alter table public."Lead"     enable row level security;
alter table public."Deal"     enable row level security;
alter table public."Activity" enable row level security;
alter table public."Customer" enable row level security;
create policy customer_self on public."Customer" for select using ("userId" = auth.uid());
