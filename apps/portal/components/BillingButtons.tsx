"use client";
import { useState, useTransition } from "react";
import { Button } from "@mazidi/ui";

/**
 * Client actions for billing. Each POSTs to a portal API route and follows
 * the returned Stripe URL. Imports @mazidi/ui only (boundary rule).
 */
function useBillingAction() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (path: string, body?: unknown) =>
    start(async () => {
      setError(null);
      const res = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const json = (await res.json().catch(() => null)) as { data?: { url?: string }; error?: string } | null;
      if (res.ok && json?.data?.url) window.location.assign(json.data.url);
      else setError(json?.error ?? "Something went wrong");
    });
  return { pending, error, run };
}

const ErrorNote = ({ error }: { error: string | null }) =>
  error ? <span className="mt-1 block text-[.75rem] text-danger" role="alert">{error}</span> : null;

export function PayInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const { pending, error, run } = useBillingAction();
  return (
    <span>
      <Button size="sm" disabled={pending} onClick={() => run("/api/billing/checkout", { invoiceId })}>
        {pending ? "Opening…" : "Pay now"}
      </Button>
      <ErrorNote error={error} />
    </span>
  );
}

export function SubscribeButton({ serviceId }: { serviceId: string }) {
  const { pending, error, run } = useBillingAction();
  return (
    <span>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run("/api/billing/subscribe", { serviceId })}>
        {pending ? "Opening…" : "Subscribe"}
      </Button>
      <ErrorNote error={error} />
    </span>
  );
}

export function ManageBillingButton() {
  const { pending, error, run } = useBillingAction();
  return (
    <span>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run("/api/billing/portal")}>
        {pending ? "Opening…" : "Manage billing"}
      </Button>
      <ErrorNote error={error} />
    </span>
  );
}
