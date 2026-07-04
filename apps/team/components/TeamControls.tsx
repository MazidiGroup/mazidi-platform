"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Select } from "@mazidi/ui";
import { DEAL_STAGES, LEAD_TRANSITIONS, TASK_PRIORITIES, type LeadStatusValue } from "@mazidi/api/schemas";

/** Shared mutation helper: PATCH/POST → refresh server components. */
function useMutate() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (path: string, method: string, body: unknown) =>
    start(async () => {
      setError(null);
      const res = await fetch(path, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
      else setError(((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? "Failed");
    });
  return { pending, error, run };
}

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const { pending, error, run } = useMutate();
  const targets = LEAD_TRANSITIONS[status as LeadStatusValue] ?? [];

  // Terminal states (CONVERTED, LOST) are immutable — render, don't offer.
  if (targets.length === 0) {
    return (
      <span
        className={`inline-block rounded-full px-[11px] py-1 text-[.7rem] font-bold ${
          status === "CONVERTED" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
        }`}
      >
        {status}
      </span>
    );
  }
  return (
    <span>
      <Select
        defaultValue={status}
        disabled={pending}
        className="!w-auto min-w-[110px] max-w-[150px] !px-2.5 !py-1.5 text-[.8rem]"
        onChange={(e) => run("/api/crm/leads", "PATCH", { leadId, status: e.target.value })}
      >
        <option value={status}>{status}</option>
        {targets.map((s) => <option key={s} value={s}>→ {s}</option>)}
      </Select>
      {error && <span className="block text-[.72rem] text-danger">{error}</span>}
    </span>
  );
}

export function DealAdvanceButton({ dealId, stage }: { dealId: string; stage: string }) {
  const { pending, error, run } = useMutate();
  const order = DEAL_STAGES.filter((s) => s !== "LOST");
  const idx = order.indexOf(stage as (typeof order)[number]);
  const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
  if (!next) return null;
  return (
    <span>
      <Button size="sm" variant="outline" disabled={pending} className="!px-3 !py-1 text-[.72rem]"
        onClick={() => run("/api/crm/deals", "PATCH", { dealId, stage: next })}>
        {pending ? "…" : `→ ${next}`}
      </Button>
      {error && <span className="block text-[.72rem] text-danger">{error}</span>}
    </span>
  );
}

export function TaskToggle({ taskId, status }: { taskId: string; status: string }) {
  const { pending, error, run } = useMutate();
  const done = status === "DONE";
  return (
    <span>
      <button
        type="button"
        disabled={pending}
        aria-label={done ? "Reopen task" : "Complete task"}
        className={`grid h-6 w-6 place-items-center rounded-full border text-[.8rem] transition-colors ${done ? "border-success text-success" : "border-line2 text-t3 hover:border-gold hover:text-gold"}`}
        onClick={() => run("/api/tasks", "PATCH", { taskId, status: done ? "TODO" : "DONE" })}
      >
        {done ? "✓" : ""}
      </button>
      {error && <span className="block text-[.72rem] text-danger">{error}</span>}
    </span>
  );
}

export function TaskForm({ companies }: { companies: { id: string; name: string }[] }) {
  const { pending, error, run } = useMutate();
  return (
    <form
      className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-3 max-lg:grid-cols-1"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        run("/api/tasks", "POST", {
          title: fd.get("title"),
          companyId: fd.get("companyId"),
          priority: fd.get("priority"),
        });
        e.currentTarget.reset();
      }}
    >
      <Field label="New task"><Input name="title" placeholder="What needs doing?" required minLength={2} /></Field>
      <Field label="Company">
        <Select name="companyId">{companies.map((c) => <option key={c.id} value={c.id}>{c.name.replace("Mazidi ", "")}</option>)}</Select>
      </Field>
      <Field label="Priority">
        <Select name="priority" defaultValue="MEDIUM">{TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</Select>
      </Field>
      <Button type="submit" disabled={pending} className="mb-4">{pending ? "Adding…" : "Add task"}</Button>
      {error && <span className="col-span-full text-[.78rem] text-danger">{error}</span>}
    </form>
  );
}

/** Standalone deal creation — pipeline header. */
export function DealCreateForm({ companies }: { companies: { id: string; name: string }[] }) {
  const { pending, error, run } = useMutate();
  return (
    <form
      className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-3 max-lg:grid-cols-1"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        run("/api/crm/deals", "POST", {
          title: fd.get("title"),
          companyId: fd.get("companyId"),
          value: fd.get("value"),
        });
        e.currentTarget.reset();
      }}
    >
      <Field label="New deal"><Input name="title" placeholder="e.g. Clinic rebrand — Hassan Group" required minLength={2} /></Field>
      <Field label="Company">
        <Select name="companyId">{companies.map((c) => <option key={c.id} value={c.id}>{c.name.replace("Mazidi ", "")}</option>)}</Select>
      </Field>
      <Field label="Value (£)"><Input name="value" type="number" min="1" step="0.01" placeholder="25000" required className="!w-32" /></Field>
      <Button type="submit" disabled={pending} className="mb-4">{pending ? "Creating…" : "Create deal"}</Button>
      {error && <span className="col-span-full text-[.78rem] text-danger">{error}</span>}
    </form>
  );
}

/** Compact lead → deal action, shown on CONVERTED leads without a linked deal. */
export function DealFromLeadButton({ leadId, contactName }: { leadId: string; contactName: string }) {
  const { pending, error, run } = useMutate();
  const [value, setValue] = useState("");
  return (
    <span className="flex flex-wrap items-center gap-2">
      <Input
        type="number" min="1" step="0.01" placeholder="£ value" value={value}
        onChange={(e) => setValue(e.target.value)}
        className="!w-24 !px-2.5 !py-1.5 text-[.8rem]"
        aria-label="Deal value"
      />
      <Button
        size="sm" variant="outline" className="!px-3 !py-1.5 text-[.72rem]"
        disabled={pending || !value}
        onClick={() => run("/api/crm/deals", "POST", {
          leadId,
          value,
          title: `${contactName} — new engagement`,
        })}
      >
        {pending ? "…" : "→ Deal"}
      </Button>
      {error && <span className="block text-[.72rem] text-danger">{error}</span>}
    </span>
  );
}
