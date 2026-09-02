"use client";
import { useState, useTransition } from "react";
import { leadInputSchema } from "@mazidi/api/schemas";
import { LEAD_INTERESTS } from "@mazidi/config";
import { Button, Field, Input, Select, Textarea } from "@mazidi/ui";

/**
 * Public lead form → POST /api/leads → CRM (Contact + Lead + Activity + outbox).
 * The Zod schema is shared with the route handler (docs/02 §Patterns).
 * On a tenant site `companySlug` pins the pipeline; on the group site the
 * visitor's interest picks it (LEAD_INTERESTS).
 */
export function LeadForm({ companySlug, title = "Send a message" }: { companySlug?: string; title?: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (done) {
    return (
      <div className="rounded-lg border border-line bg-bg2 p-[38px] text-center">
        <p className="mb-2 font-display text-xl">Thank you — we&apos;ve got it.</p>
        <p className="text-[.9rem] text-t2">We reply within one business day.</p>
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
      else setErrors({ form: "Something went wrong — please try again, or email support@mazidigroup.com." });
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-line bg-bg2 p-[38px] max-sm:p-6" noValidate>
      <h3 className="mb-1.5 font-display text-[1.35rem]">{title}</h3>
      <p className="mb-[22px] text-[.88rem] text-t2">Answered by a person, within one business day.</p>
      <Field label="Full name" error={errors.name}><Input name="name" placeholder="Your name" required /></Field>
      <Field label="Email" error={errors.email}><Input name="email" type="email" placeholder="you@company.com" required /></Field>
      <Field label="Phone (optional)" error={errors.phone}><Input name="phone" type="tel" placeholder="+44 or +971…" /></Field>
      {!companySlug && (
        <Field label="I'm interested in">
          <Select name="interest" defaultValue="other">
            {LEAD_INTERESTS.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Message"><Textarea name="message" rows={4} placeholder="Tell us what you need…" /></Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {errors.form && <p className="mb-3 text-[.85rem] text-danger" role="alert">{errors.form}</p>}
      <Button type="submit" className="w-full justify-center" disabled={pending}>
        {pending ? "Sending…" : "Request Proposal"}
      </Button>
    </form>
  );
}
