import type { Metadata } from "next";
import { listLiveCompanies } from "@mazidi/api";
import { PILLARS } from "@mazidi/config";
import { Arrow, ButtonLink, CompanyCard, Container, CTABand, Kicker, Lead, Section, SectionHead } from "@mazidi/ui";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Companies",
  description: "21 specialist businesses across Build It, Run It and Grow It — one login, one CRM, one client portal.",
};

export default async function CompaniesPage() {
  const companies = await listLiveCompanies();
  return (
    <>
      <section className="hero-grad pb-16 pt-[150px]">
        <Container>
          <Kicker>The ecosystem</Kicker>
          <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[1.05] tracking-[-.02em]">
            Every company you&apos;ll<br />ever need.{" "}
            <span className="bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-transparent">Connected.</span>
          </h1>
          <Lead className="mt-6">
            {companies.length} specialist businesses across Build It, Run It and Grow It — sharing one
            login, one CRM and one client portal.
          </Lead>
        </Container>
      </section>
      <Section className="pt-10">
        <Container>
          {(["build", "run", "grow"] as const).map((p) => (
            <div key={p} className="mt-11 first:mt-0">
              <SectionHead kicker={PILLARS[p].name} title={PILLARS[p].blurb} />
              <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {companies.filter((c) => c.pillar.toLowerCase() === p).map((c) => (
                  <CompanyCard key={c.slug} company={c} />
                ))}
              </div>
            </div>
          ))}
        </Container>
      </Section>
      <CTABand
        title="Not sure where to start?"
        sub="Tell us where your business is today and an advisor will map the right entry point into the ecosystem."
        actions={<ButtonLink href="/contact">Speak to an Expert <Arrow /></ButtonLink>}
      />
    </>
  );
}
