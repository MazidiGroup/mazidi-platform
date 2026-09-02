import type { Metadata } from "next";
import { listLiveCompanies } from "@mazidi/api";
import { COMPANY_PROFILES, getCompanyProfile, OFFICES } from "@mazidi/config";
import { Arrow, ButtonLink, Container, CTABand, Kicker, Lead, Section, SectionHead } from "@mazidi/ui";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "About",
  description: "Mazidi Group is a family of businesses in property, construction, IT services and iOS apps, run from London and Dubai.",
};

export default async function AboutPage() {
  const companies = await listLiveCompanies();
  const apps = companies.filter((c) => getCompanyProfile(c.slug)?.app);
  const stats: [string, string][] = [
    [String(companies.length), "Businesses"],
    ["2", "Registered companies"],
    [String(apps.length), "iOS apps"],
    ["2", "Cities — London & Dubai"],
  ];
  return (
    <>
      <section className="hero-grad pb-16 pt-[150px]">
        <Container>
          <Kicker>The group</Kicker>
          <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[1.05] tracking-[-.02em]">
            Small group.<br />
            <span className="bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-transparent">Real work.</span>
          </h1>
          <Lead className="mt-6">
            Mazidi Group is the family name over a handful of businesses we own and run ourselves: a
            RERA-registered brokerage in Dubai, a renovation contractor and a business backup service in
            West London, and an apps studio that ships to the App Store. No holding-company theatre — each
            one is a working business with a phone number that gets answered.
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
          <SectionHead kicker="Who runs it" title="One founder, hands on every business." />
          <div className="grid grid-cols-[1fr_1.4fr] gap-8 max-lg:grid-cols-1">
            <div className="rounded-lg border border-line bg-bg2 p-8">
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-[16px] bg-gradient-to-br from-gold to-gold-deep text-[1.1rem] font-bold text-[#14100A]">AM</div>
              <h3 className="mb-1 text-[1.2rem] font-semibold">Aimal Mazidi</h3>
              <p className="mb-4 text-[.82rem] font-semibold text-gold">Founder · RERA-licensed broker (BRN 77897) · iOS developer</p>
              <p className="text-[.9rem] text-t2">
                Runs the Dubai brokerage, directs the London construction and IT businesses, and designs and
                builds the apps — published on the App Store under his own name.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
              {OFFICES.map((o) => (
                <div key={o.city} className="rounded-lg border border-line bg-bg2 p-7">
                  <h4 className="mb-1 font-display text-[1.5rem]">{o.city}</h4>
                  <p className="mb-3 text-[.85rem] text-t3">{o.country}</p>
                  <p className="text-[.95rem] font-semibold">{o.entity}</p>
                  <p className="mt-1 text-[.85rem] text-t2">{o.note}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <SectionHead kicker="Registrations" title="The paperwork behind the names." />
          <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
            <div className="rounded-lg border border-line bg-bg2 p-7">
              <h4 className="mb-2 text-[1.05rem] font-semibold">{COMPANY_PROFILES.construction.legalName}</h4>
              <p className="mb-3 text-[.88rem] text-t2">
                {COMPANY_PROFILES.construction.registration}. Trades as Mazidi Construction and Mazidi IT Services; publishes the group&apos;s apps.
              </p>
              <p className="text-[.85rem] text-t3">{COMPANY_PROFILES.it.registration}</p>
            </div>
            <div className="rounded-lg border border-line bg-bg2 p-7">
              <h4 className="mb-2 text-[1.05rem] font-semibold">{COMPANY_PROFILES.mazidihomes.legalName}</h4>
              <p className="mb-3 text-[.88rem] text-t2">
                Trades as Mazidi Homes. Licensed by the Dubai Land Department for real estate buying &amp; selling brokerage.
              </p>
              <p className="text-[.85rem] text-t3">{COMPANY_PROFILES.mazidihomes.registration}</p>
            </div>
          </div>
        </Container>
      </Section>

      <CTABand
        title="Work with us."
        sub="Buying in Dubai, renovating in London, protecting your office data, or building a coaching business on our apps — start a conversation."
        actions={<><ButtonLink href="/contact">Book Consultation <Arrow /></ButtonLink><ButtonLink href="/companies" variant="outline" className="border-[#3A4152] text-[#F2F3F5]">All businesses</ButtonLink></>}
      />
    </>
  );
}
