import type { Metadata } from "next";
import { listLiveCompanies } from "@mazidi/api";
import { Arrow, ButtonLink, Container, CTABand, Kicker, Lead, Section, SectionHead } from "@mazidi/ui";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "About",
  description: "Mazidi Group exists so a business owner never has to stitch together vendors again.",
};

export default async function AboutPage() {
  const companies = await listLiveCompanies();
  const stats = [
    [String(companies.length), "Companies in the group"],
    ["2", "Global headquarters"],
    ["10", "Industries served"],
    ["7", "Cities by 2028"],
  ];
  return (
    <>
      <section className="hero-grad pb-16 pt-[150px]">
        <Container>
          <Kicker>The group</Kicker>
          <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[1.05] tracking-[-.02em]">
            The operating system<br />for{" "}
            <span className="bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-transparent">business.</span>
          </h1>
          <Lead className="mt-6">
            Mazidi Group exists so that a business owner never has to stitch together vendors again.
            We build the companies, run the operations and grow the value — as one ecosystem.
          </Lead>
          <div className="mt-[70px] grid grid-cols-4 gap-5 border-y border-line py-11 max-sm:grid-cols-2 max-sm:gap-7">
            {stats.map(([v, l]) => (
              <div key={l}>
                <b className="block font-display text-[2.4rem] font-medium">{v}</b>
                <span className="text-[.84rem] text-t2">{l}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <Section>
        <Container>
          <div id="leadership" />
          <SectionHead kicker="Leadership" title="Operators, not administrators." />
          <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {[
              ["AM", "Aimal Mazidi", "Founder & Group CEO", "Sets the vision: one ecosystem, every stage of business."],
              ["CO", "Chief Operating Officer", "Group Operations", "Runs shared infrastructure across all 21 companies."],
              ["CF", "Chief Financial Officer", "Group Finance", "Owns unified billing, reporting and investor relations."],
              ["CT", "Chief Technology Officer", "Platform & AI", "Leads the portal, CRM and AI assistant platform."],
              ["MB", "Managing Director, Build", "Build It pillar", "Construction, property and formation businesses."],
              ["MG", "Managing Director, Growth", "Grow It pillar", "Marketing, consulting and investment businesses."],
            ].map(([mono, name, role, desc]) => (
              <div key={name} className="rounded-md border border-line bg-bg2 p-7">
                <div className="mb-[18px] grid h-[46px] w-[46px] place-items-center rounded-[13px] bg-gradient-to-br from-gold to-gold-deep text-[.95rem] font-bold text-[#14100A]">
                  {mono}
                </div>
                <h4 className="mb-1 text-[1.08rem] font-semibold">{name}</h4>
                <p className="mb-1.5 text-[.8rem] font-semibold text-gold">{role}</p>
                <p className="text-[.87rem] text-t2">{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Section className="pt-0">
        <Container>
          <div id="careers" />
          <SectionHead
            kicker="Careers"
            title="Build the ecosystem with us."
            aside={<ButtonLink href="/contact" variant="outline" size="sm">Enquire <Arrow /></ButtonLink>}
          />
          <p className="max-w-[640px] text-t2">
            Open roles are published from the HR module (docs/01 §Employee portal). Until the careers
            service is live, send your CV via the contact form and it will be routed to Mazidi HR.
          </p>
        </Container>
      </Section>
      <CTABand
        title="Partner with Mazidi Group."
        sub="Investors and joint-venture partners: request our group deck and current opportunities."
        actions={<ButtonLink href="/contact">Request Proposal <Arrow /></ButtonLink>}
      />
    </>
  );
}
