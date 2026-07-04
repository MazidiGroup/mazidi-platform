import type { Metadata } from "next";
import { listPosts } from "@mazidi/api";
import { Arrow, ButtonLink, Container, CTABand, Kicker, Lead, Section } from "@mazidi/ui";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Insights",
  description: "Blogs, videos, case studies and market reports from across the Mazidi ecosystem.",
};

const KIND_LABEL: Record<string, string> = {
  BLOG: "Blog", VIDEO: "Video", CASE_STUDY: "Case Study", REPORT: "Market Report",
};

export default async function InsightsPage() {
  const posts = await listPosts(24);
  return (
    <>
      <section className="hero-grad pb-16 pt-[150px]">
        <Container>
          <Kicker>Insights</Kicker>
          <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[1.05] tracking-[-.02em]">
            Intelligence for<br />
            <span className="bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-transparent">operators.</span>
          </h1>
          <Lead className="mt-6">Blogs, videos, case studies and market reports from across the ecosystem.</Lead>
        </Container>
      </section>
      <Section className="pt-12">
        <Container>
          <div className="grid grid-cols-4 gap-[18px] max-lg:grid-cols-2 max-sm:grid-cols-1">
            {posts.map((p) => (
              <article key={p.slug} id={p.slug} className="overflow-hidden rounded-md border border-line bg-bg2 transition-all duration-300 ease-meridian hover:-translate-y-1 hover:shadow-lift">
                <div className="flex h-[150px] items-end bg-gradient-to-br from-[#1A2233] to-[#2A2118] p-3.5">
                  <span className="rounded-full bg-[#0B0D12]/55 px-[11px] py-[5px] text-[.68rem] font-bold uppercase tracking-[.1em] text-white backdrop-blur">
                    {KIND_LABEL[p.kind] ?? p.kind}
                  </span>
                </div>
                <div className="p-5">
                  <b className="mb-2 block text-[.95rem] font-semibold leading-[1.4]">{p.title}</b>
                  <p className="mb-2 text-[.82rem] text-t2">{p.excerpt}</p>
                  <span className="text-[.78rem] text-t3">{p.readMinutes} min {p.kind === "VIDEO" ? "watch" : "read"}</span>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>
      <CTABand
        title="Get the monthly briefing."
        sub="One email a month — market intelligence, tax deadlines and growth plays from all 21 companies."
        actions={<ButtonLink href="/contact">Subscribe via Contact <Arrow /></ButtonLink>}
      />
    </>
  );
}
