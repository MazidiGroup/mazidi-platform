"use client";
import { useState, useTransition } from "react";
import { leadInputSchema } from "@mazidi/api/schemas";
import { Button, Field, Input, Select, Textarea } from "@mazidi/ui";
import type { TenantSlug } from "@mazidi/config";

/**
 * Public lead form → POST /api/leads → CRM (Contact + Lead + Activity + outbox).
 * The Zod schema is shared with the route handler (docs/02 §Patterns).
 */
export function LeadForm({ companySlug }: { companySlug?: TenantSlug }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (done) {
    return (
      <div className="rounded-lg border border-line bg-bg2 p-[38px] text-center">
        <p className="mb-2 font-display text-xl">Thank you — we&apos;ve got it.</p>
        <p className="text-[.9rem] text-t2">
          Your enquiry is in our CRM and an advisor will reply within one business day.
        </p>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const parsed = leadInputSchema.safeParse({ ...raw, companySlug });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    start(async () => {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) setDone(true);
      else setErrors({ form: "Something went wrong — please try again." });
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-line bg-bg2 p-[38px] max-sm:p-6" noValidate>
      <h3 className="mb-1.5 font-display text-[1.35rem]">Send a message</h3>
      <p className="mb-[22px] text-[.88rem] text-t2">
        Every enquiry goes straight into our CRM and is answered within one business day.
      </p>
      <Field label="Full name" error={errors.name}><Input name="name" placeholder="Your name" required /></Field>
      <Field label="Email" error={errors.email}><Input name="email" type="email" placeholder="you@company.com" required /></Field>
      <Field label="I'm interested in">
        <Select name="interest" defaultValue="unsure">
          <option value="build">Building something new</option>
          <option value="run">Running my business better</option>
          <option value="grow">Growing revenue &amp; wealth</option>
          <option value="unsure">Not sure yet — advise me</option>
        </Select>
      </Field>
      <Field label="Message"><Textarea name="message" rows={4} placeholder="Tell us about your business…" /></Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {errors.form && <p className="mb-3 text-[.85rem] text-danger" role="alert">{errors.form}</p>}
      <Button type="submit" className="w-full justify-center" disabled={pending}>
        {pending ? "Sending…" : "Request Proposal"}
      </Button>
    </form>
  );
}
