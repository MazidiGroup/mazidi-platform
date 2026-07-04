import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCompanyBySlug, listLiveCompanies } from "@mazidi/api";
import { PORTAL_URL } from "@mazidi/config";
import {
  Arrow, ButtonLink, CompanyCard, Container, CTABand, Lead,
  pillarBg, pillarKey, Section, SectionHead,
} from "@mazidi/ui";
import { FAQ } from "@/components/FAQ";

export const revalidate = 300;

export async function generateStaticParams() {
  const companies = await listLiveCompanies();
  return companies.map((c) => ({ site: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ site: string }> }): Promise<Metadata> {
  const { site } = await params;
  const company = await getCompanyBySlug(site);
  if (!company) return {};
  return {
    title: { absolute: `${company.name} — A Mazidi Group Company` },
    description: company.description ?? undefined,
  };
}

const GENERIC_FAQ = [
  ["How do we get started?", "Book a free consultation — we scope your needs, quote transparently and onboard you into the client portal within days."],
  ["Does this connect to other Mazidi companies?", "Yes. One account covers the whole ecosystem, and your data flows securely between the services you choose."],
  ["What does it cost?", "Transparent packages start small and scale with you — request a tailored proposal and we'll price it openly."],
  ["Where do you operate?", "London and Dubai headquarters, serving clients globally."],
] as const;

export default async function SitePage({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const company = await getCompanyBySlug(site);
  if (!company) notFound();
  const key = pillarKey(company.pillar);
  const others = (await listLiveCompanies()).filter((c) => c.slug !== company.slug).slice(0, 3);

  // JSON-LD per tenant (docs/05 §SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: company.name,
    description: company.description,
    parentOrganization: { "@type": "Organization", name: "Mazidi Group" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="hero-grad pb-20 pt-24">
        <Container>
          <h1 className="max-w-[820px] font-display text-[clamp(2.6rem,6vw,4.4rem)] font-medium leading-[1.05] tracking-[-.02em]">
            {company.tagline ?? company.description?.split("—")[0]}
          </h1>
          <Lead className="my-6">{company.description}</Lead>
          <div className="flex flex-wrap gap-3.5">
            <ButtonLink href={`/sites/${company.slug}/contact`}>Book Consultation <Arrow /></ButtonLink>
            <ButtonLink href={`/sites/${company.slug}/contact`} variant="outline">Get Quote</ButtonLink>
            <ButtonLink href={PORTAL_URL} variant="ghost">Client Portal Login</ButtonLink>
          </div>
        </Container>
      </section>

      {/* Why us */}
      <Section>
        <Container>
          <SectionHead
            kicker="About"
            title={<>Specialists in {company.name.replace("Mazidi ", "").toLowerCase()},<br />backed by an ecosystem.</>}
          />
          <div className="grid grid-cols-3 gap-[22px] max-lg:grid-cols-1">
            {[
              ["One accountable team", "Senior specialists own your outcome end to end — no handoffs to juniors, no finger-pointing between vendors."],
              ["Connected by design", "Your documents, invoices and history live in one portal shared across every Mazidi company you use."],
              ["Built for what's next", "When this engagement ends, the next stage of your journey is already teed up — automatically."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-lg border border-line bg-bg2 p-[38px] max-sm:p-6">
                <h3 className="mb-2.5 text-[1.1rem] font-semibold">{t}</h3>
                <p className="text-[.9rem] text-t2">{d}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Services — from the DB */}
      <Section className="pt-0">
        <Container>
          <div id="services" className="scroll-mt-24" />
          <SectionHead kicker="Services" title="What we deliver." />
          <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {company.services.map((s, i) => (
              <div key={s.slug} className="flex flex-col rounded-md border border-line bg-bg2 p-7">
                <div className={`mb-[18px] grid h-[46px] w-[46px] place-items-center rounded-[13px] text-[.95rem] font-bold ${pillarBg[key]}`}>
                  0{i + 1}
                </div>
                <h4 className="mb-[7px] text-[1.08rem] font-semibold">{s.name}</h4>
                <p className="mb-4 flex-1 text-[.87rem] text-t2">{s.summary}</p>
                <ButtonLink href={`/sites/${company.slug}/contact`} variant="ghost" size="sm" className="self-start px-0">
                  Request Proposal <Arrow />
                </ButtonLink>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Pricing note + FAQ */}
      <Section className="pt-0">
        <Container>
          <div id="pricing" className="scroll-mt-24" />
          <SectionHead kicker="Pricing" title="Transparent packages." />
          <p className="max-w-[640px] text-t2">
            Package pricing is managed per service in the admin CMS (Service.priceFrom / Page sections —
            docs/03). Request a proposal and we&apos;ll quote openly, in writing, before any engagement.
          </p>
          <div className="mt-16" id="faq">
            <SectionHead kicker="FAQ" title="Questions, answered." />
            <FAQ items={GENERIC_FAQ.map(([q, a]) => ({ q, a }))} />
          </div>
        </Container>
      </Section>

      {/* Cross-sell — ecosystem by design */}
      <Section className="pt-0">
        <Container>
          <SectionHead kicker="Keep going" title={`Clients of ${company.name.replace("Mazidi ", "")} also use…`} />
          <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {others.map((c) => <CompanyCard key={c.slug} company={c} />)}
          </div>
        </Container>
      </Section>

      <CTABand
        title={`Work with ${company.name}.`}
        sub="One consultation. One ecosystem. Every stage of your business covered."
        actions={<ButtonLink href={`/sites/${company.slug}/contact`}>Book Consultation <Arrow /></ButtonLink>}
      />
    </>
  );
}
