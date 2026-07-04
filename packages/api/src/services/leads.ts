import { prisma } from "@mazidi/db";
import type { LeadInput } from "../schemas";

/**
 * Every website form becomes CRM data: Contact + Lead + Activity
 * (docs/01 §CRM Philosophy) and emits an OutboxEvent for n8n follow-ups
 * (docs/04 §Automation). Leads without an explicit company route to
 * Mazidi Consulting, the ecosystem's front door.
 */
export async function captureLead(input: LeadInput, meta: { ip?: string; path?: string }) {
  const slug = input.companySlug ?? "consulting";
  const company = await prisma.company.findUniqueOrThrow({ where: { slug } });

  return prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: {
        companyId: company.id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        source: "website",
        tags: [input.interest],
      },
    });

    const lead = await tx.lead.create({
      data: {
        companyId: company.id,
        contactId: contact.id,
        source: "WEBSITE_FORM",
        capturedFrom: { path: meta.path ?? "/", interest: input.interest, message: input.message ?? "" },
      },
    });

    await tx.activity.create({
      data: {
        companyId: company.id,
        kind: "FORM",
        refId: lead.id,
        contactId: contact.id,
        title: `Website enquiry from ${input.name}`,
        body: { message: input.message ?? "", interest: input.interest, ip: meta.ip ?? null },
      },
    });

    await tx.outboxEvent.create({
      data: {
        event: "form.submitted",
        companyId: company.id,
        payload: { leadId: lead.id, contactId: contact.id, interest: input.interest },
      },
    });

    return { leadId: lead.id };
  });
}
