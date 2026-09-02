import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@mazidi/api";
import { getCompanyProfile } from "@mazidi/config";
import { Arrow, Container, Kicker, Lead, Section } from "@mazidi/ui";
import { LeadForm } from "@/components/LeadForm";

export const revalidate = 300;

export default async function SiteContactPage({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const company = await getCompanyBySlug(site);
  if (!company) notFound(); // getCompanyBySlug is LIVE-gated — the DB is the registry
  const profile = getCompanyProfile(company.slug);
  const isApp = !!profile?.app;

  return (
    <Section>
      <Container>
        <Kicker>Contact</Kicker>
        <h1 className="mb-4 font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08]">
          Talk to {company.name}.
        </h1>
        <Lead className="mb-10">
          {isApp
            ? "Support, feedback or a feature you'd like — your message goes to the developer, not a helpdesk."
            : "Your message goes straight to the person who does the work."}
        </Lead>
        <div className="grid grid-cols-[1fr_.7fr] gap-8 max-lg:grid-cols-1">
          <LeadForm companySlug={company.slug} title={isApp ? "Message the developer" : "Send a message"} />
          {profile && (
            <div className="rounded-lg border border-line bg-bg2 p-7 self-start">
              <h3 className="mb-4 font-display text-[1.2rem]">Direct</h3>
              <div className="space-y-3 text-[.9rem]">
                {profile.phoneDisplay && <p><span className="block text-[.75rem] uppercase tracking-[.1em] text-t3">Phone</span><a href={`tel:${profile.phone}`} className="hover:text-gold">{profile.phoneDisplay}</a></p>}
                {profile.whatsapp && <p><span className="block text-[.75rem] uppercase tracking-[.1em] text-t3">WhatsApp</span><a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-gold">Open chat <Arrow /></a></p>}
                {profile.email && <p><span className="block text-[.75rem] uppercase tracking-[.1em] text-t3">Email</span><a href={`mailto:${profile.email}`} className="hover:text-gold">{profile.email}</a></p>}
                <p><span className="block text-[.75rem] uppercase tracking-[.1em] text-t3">Where</span>{profile.location}</p>
                <p className="pt-2 text-[.8rem] text-t3">{profile.legalName}{profile.registration ? ` · ${profile.registration}` : ""}</p>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
