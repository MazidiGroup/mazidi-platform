import { z } from "zod";
import { TENANT_SLUGS } from "@mazidi/config";

/** Shared by the public lead form (client) and /api/leads (server). */
export const leadInputSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(120),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().max(40).optional(),
  companySlug: z.enum(TENANT_SLUGS).optional(),
  interest: z.enum(["build", "run", "grow", "unsure"]).default("unsure"),
  message: z.string().max(4000).optional(),
  /** honeypot — must stay empty */
  website: z.string().max(0).optional(),
});
export type LeadInput = z.infer<typeof leadInputSchema>;

/** POST /api/billing/checkout — pay a single invoice via Stripe Checkout. */
export const invoiceCheckoutSchema = z.object({
  invoiceId: z.string().uuid(),
});
export type InvoiceCheckoutInput = z.infer<typeof invoiceCheckoutSchema>;

/** POST /api/billing/subscribe — start a subscription to a priced service (plan). */
export const subscribeSchema = z.object({
  serviceId: z.string().uuid(),
});
export type SubscribeInput = z.infer<typeof subscribeSchema>;
