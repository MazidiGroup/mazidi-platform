"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Select, Textarea } from "@mazidi/ui";
import { COMPANY_STATUSES, GRANTABLE_ROLES, PILLAR_VALUES } from "@mazidi/api/schemas";

function useMutate() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (path: string, method: string, body: unknown) =>
    start(async () => {
      setError(null);
      const res = await fetch(path, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) router.refresh();
      else setError(((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? "Failed");
    });
  return { pending, error, run };
}
const Err = ({ error }: { error: string | null }) =>
  error ? <span className="col-span-full block text-[.78rem] text-danger" role="alert">{error}</span> : null;

export function CompanyCreateForm() {
  const { pending, error, run } = useMutate();
  return (
    <form
      className="grid grid-cols-2 items-end gap-3 max-lg:grid-cols-1"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        run("/api/admin/companies", "POST", Object.fromEntries(fd.entries()));
      }}
    >
      <Field label="Name"><Input name="name" placeholder="Mazidi Logistics" required minLength={2} /></Field>
      <Field label="Slug (subdomain)"><Input name="slug" placeholder="logistics" required pattern="[a-z][a-z0-9-]{1,30}" /></Field>
      <Field label="Pillar">
        <Select name="pillar">{PILLAR_VALUES.map((p) => <option key={p} value={p}>{p}</option>)}</Select>
      </Field>
      <Field label="Description"><Textarea name="description" rows={2} required minLength={10} placeholder="What this company does, in one or two sentences." /></Field>
      <Button type="submit" disabled={pending} className="mb-4 justify-self-start">{pending ? "Creating…" : "Create as DRAFT"}</Button>
      <Err error={error} />
    </form>
  );
}

export function CompanyStatusSelect({ companyId, status }: { companyId: string; status: string }) {
  const { pending, error, run } = useMutate();
  return (
    <span>
      <Select
        defaultValue={status} disabled={pending}
        className="!w-auto min-w-[110px] !px-2.5 !py-1.5 text-[.8rem]"
        onChange={(e) => run("/api/admin/companies", "PATCH", { companyId, status: e.target.value })}
      >
        {COMPANY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      <Err error={error} />
    </span>
  );
}

export function ServiceAddForm({ companyId }: { companyId: string }) {
  const { pending, error, run } = useMutate();
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const priceFrom = fd.get("priceFrom");
        run("/api/admin/services", "POST", {
          companyId,
          name: fd.get("name"),
          summary: fd.get("summary"),
          ...(priceFrom ? { priceFrom } : {}),
        });
        e.currentTarget.reset();
      }}
    >
      <Input name="name" placeholder="Service name" required minLength={2} className="!w-40 !px-2.5 !py-1.5 text-[.8rem]" />
      <Input name="summary" placeholder="One-line summary (min 10 chars)" required minLength={10} className="!w-64 flex-1 !px-2.5 !py-1.5 text-[.8rem]" />
      <Input name="priceFrom" type="number" min="1" step="0.01" placeholder="£/mo (opt.)" className="!w-24 !px-2.5 !py-1.5 text-[.8rem]" />
      <Button type="submit" size="sm" variant="outline" disabled={pending} className="!px-3 !py-1.5 text-[.72rem]">
        {pending ? "…" : "+ Service"}
      </Button>
      <Err error={error} />
    </form>
  );
}

export function MembershipGrantForm({
  users, companies, isSuper,
}: { users: { id: string; label: string }[]; companies: { id: string; name: string }[]; isSuper: boolean }) {
  const { pending, error, run } = useMutate();
  const roles = isSuper ? GRANTABLE_ROLES : GRANTABLE_ROLES.filter((r) => r !== "SUPER_ADMIN" && r !== "COMPANY_ADMIN");
  return (
    <form
      className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] items-end gap-3 max-lg:grid-cols-1"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const companyId = fd.get("companyId") as string;
        run("/api/admin/memberships", "POST", {
          action: "grant",
          targetUserId: fd.get("targetUserId"),
          companyId: companyId === "group" ? null : companyId,
          role: fd.get("role"),
          ...(fd.get("title") ? { title: fd.get("title") } : {}),
        });
      }}
    >
      <Field label="User">
        <Select name="targetUserId">{users.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}</Select>
      </Field>
      <Field label="Scope">
        <Select name="companyId">
          {isSuper && <option value="group">Group level (all companies)</option>}
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </Field>
      <Field label="Role">
        <Select name="role" defaultValue="EMPLOYEE">{roles.map((r) => <option key={r} value={r}>{r}</option>)}</Select>
      </Field>
      <Field label="Title (staff)"><Input name="title" placeholder="e.g. Accountant" /></Field>
      <Button type="submit" disabled={pending} className="mb-4">{pending ? "Granting…" : "Grant"}</Button>
      <Err error={error} />
    </form>
  );
}

export function MembershipRevokeButton({
  targetUserId, companyId, role,
}: { targetUserId: string; companyId: string | null; role: string }) {
  const { pending, run } = useMutate();
  return (
    <button
      type="button" disabled={pending} aria-label={`Revoke ${role}`}
      className="text-t3 transition-colors hover:text-danger disabled:opacity-40"
      onClick={() => run("/api/admin/memberships", "POST", { action: "revoke", targetUserId, companyId, role })}
    >
      ✕
    </button>
  );
}

export function RuleToggle({ ruleId, enabled }: { ruleId: string; enabled: boolean }) {
  const { pending, error, run } = useMutate();
  return (
    <span className="flex items-center gap-2">
      <button
        type="button" disabled={pending} aria-pressed={enabled}
        aria-label={enabled ? "Disable rule" : "Enable rule"}
        onClick={() => run("/api/admin/automations", "PATCH", { ruleId, enabled: !enabled })}
        className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-gold" : "bg-bg3 border border-line2"} disabled:opacity-50`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${enabled ? "left-[22px]" : "left-0.5"}`} />
      </button>
      <span className="text-[.78rem] text-t3">{enabled ? "enabled" : "disabled"}</span>
      <Err error={error} />
    </span>
  );
}

export function RunAutomationsButton({ pending: queued }: { pending: number }) {
  const { pending, error, run } = useMutate();
  return (
    <span className="text-right">
      <Button disabled={pending} onClick={() => run("/api/automations/run", "POST", {})}>
        {pending ? "Running…" : `Run engine now${queued > 0 ? ` (${queued} queued)` : ""}`}
      </Button>
      <Err error={error} />
    </span>
  );
}
