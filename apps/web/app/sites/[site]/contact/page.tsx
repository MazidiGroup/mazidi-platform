import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@mazidi/api";
import { Container, Kicker, Lead, Section } from "@mazidi/ui";
import { LeadForm } from "@/components/LeadForm";

export const revalidate = 300;

export default async function SiteContactPage({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const company = await getCompanyBySlug(site);
  if (!company) notFound(); // getCompanyBySlug is LIVE-gated — the DB is the registry

  return (
    <Section>
      <Container>
        <Kicker>Contact</Kicker>
        <h1 className="mb-4 font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08]">
          Talk to {company.name.replace("Mazidi ", "")}.
        </h1>
        <Lead className="mb-10">
          Your enquiry goes directly into the {company.name} pipeline — same CRM, same portal, one account.
        </Lead>
        <div className="max-w-[640px]">
          <LeadForm companySlug={site} />
        </div>
      </Container>
    </Section>
  );
}
