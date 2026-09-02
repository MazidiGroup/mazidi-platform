import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listLiveCompanies } from "@mazidi/api";
import { PILLAR_KEYS, PILLARS, pillarBySlug } from "@mazidi/config";
import { Arrow, ButtonLink, CompanyCard, Container, CTABand, Kicker, Lead, Section, SectionHead } from "@mazidi/ui";

export const revalidate = 300;
export function generateStaticParams() {
  return PILLAR_KEYS.map((k) => ({ pillar: PILLARS[k].slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ pillar: string }> }): Promise<Metadata> {
  const { pillar } = await params;
  const meta = pillarBySlug(pillar);
  return meta ? { title: meta.name, description: meta.blurb } : {};
}

export default async function PillarPage({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar } = await params;
  const meta = pillarBySlug(pillar);
  if (!meta) notFound();
  const companies = await listLiveCompanies(meta.key.toUpperCase() as "BUILD" | "RUN" | "GROW");

  return (
    <>
      <section className="hero-grad pb-20 pt-[150px]">
        <Container>
          <Kicker>{meta.name}</Kicker>
          <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[1.05] tracking-[-.02em]">
            {meta.blurb}
          </h1>
          <Lead className="my-6">{meta.desc}</Lead>
          <div className="flex flex-wrap gap-3.5">
            <ButtonLink href="/contact">Speak to an Expert <Arrow /></ButtonLink>
            <ButtonLink href="/companies" variant="outline">All businesses</ButtonLink>
          </div>
        </Container>
      </section>
      <Section>
        <Container>
          <SectionHead kicker={meta.name} title={companies.length === 1 ? "One business, one accountable person." : `${companies.length} businesses.`} />
          <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {companies.map((c) => <CompanyCard key={c.slug} company={c} />)}
          </div>
        </Container>
      </Section>
      <CTABand
        title={`Talk to us about ${meta.short.toLowerCase()}.`}
        sub="Tell us what you need and the person responsible will reply — within one business day."
        actions={<ButtonLink href="/contact">Book Consultation <Arrow /></ButtonLink>}
      />
    </>
  );
}
