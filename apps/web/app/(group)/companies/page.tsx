import type { Metadata } from "next";
import { listLiveCompanies } from "@mazidi/api";
import { PILLAR_KEYS, PILLARS } from "@mazidi/config";
import { Arrow, ButtonLink, CompanyCard, Container, CTABand, Kicker, Lead, Section, SectionHead } from "@mazidi/ui";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "All businesses",
  description: "Every Mazidi Group business — Dubai property, London construction, IT services and iOS apps — with real contact details.",
};

export default async function CompaniesPage() {
  const companies = await listLiveCompanies();
  return (
    <>
      <section className="hero-grad pb-16 pt-[150px]">
        <Container>
          <Kicker>The directory</Kicker>
          <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[1.05] tracking-[-.02em]">
            {companies.length} businesses.{" "}
            <span className="bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-transparent">One family.</span>
          </h1>
          <Lead className="mt-6">
            Property and construction, iOS apps and IT services — each with the people, phone numbers and
            registrations behind it.
          </Lead>
        </Container>
      </section>
      <Section className="pt-10">
        <Container>
          {PILLAR_KEYS.map((p) => {
            const list = companies.filter((c) => c.pillar.toLowerCase() === p);
            if (list.length === 0) return null;
            return (
              <div key={p} className="mt-11 first:mt-0">
                <SectionHead
                  kicker={PILLARS[p].name}
                  title={PILLARS[p].blurb}
                  aside={<ButtonLink href={`/${PILLARS[p].slug}`} variant="outline" size="sm">About {PILLARS[p].short} <Arrow /></ButtonLink>}
                />
                <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                  {list.map((c) => <CompanyCard key={c.slug} company={c} />)}
                </div>
              </div>
            );
          })}
        </Container>
      </Section>
      <CTABand
        title="Not sure who to ask?"
        sub="Send one message and we'll route it to the right business — Dubai, London or the apps studio."
        actions={<ButtonLink href="/contact">Speak to an Expert <Arrow /></ButtonLink>}
      />
    </>
  );
}
