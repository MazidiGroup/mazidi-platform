import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCompanyBySlug, listLiveCompanies } from "@mazidi/api";
import { getCompanyProfile, PILLARS } from "@mazidi/config";
import {
  AppStoreBadge, Arrow, ButtonLink, CompanyCard, Container, CTABand, Lead,
  pillarBg, pillarKey, Section, SectionHead,
} from "@mazidi/ui";
import { FAQ } from "@/components/FAQ";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { getSiteGallery, REVIEW_PROFILES } from "@/lib/gallery";

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
    title: { absolute: `${company.name} — A Mazidi Group business` },
    description: company.description ?? undefined,
  };
}

const SERVICE_FAQ = (name: string, contact: { phoneDisplay?: string; email?: string; location: string }) => [
  ["How do we get started?", `Send a message or WhatsApp us${contact.phoneDisplay ? ` on ${contact.phoneDisplay}` : ""}. We'll ask a few questions, arrange a visit or call if it helps, and quote in writing before anything is agreed.`],
  ["Where do you work?", `${name} operates from ${contact.location}.`],
  ["Who will I be dealing with?", "The same person throughout — the one who quotes the job does the job and answers the phone afterwards."],
  ["How is pricing agreed?", "In writing, before work starts. If the scope changes, the price is agreed again before we carry on."],
] as const;

const APP_FAQ = (name: string, status: "live" | "pending", pricing: string) => [
  ["Where can I get it?", status === "live" ? `${name} is on the App Store for iPhone — tap the App Store button above.` : `${name} has been submitted to Apple and is awaiting App Store approval. It will appear here the day it goes live.`],
  ["What does it cost?", pricing],
  ["Is there an Android version?", "Not yet. iOS first; Android depends on demand — tell us if you'd use it."],
  ["Who do I contact for support?", "Email support@mazidigroup.com and the developer replies directly."],
] as const;

export default async function SitePage({ params }: { params: Promise<{ site: string }> }) {
  const { site } = await params;
  const company = await getCompanyBySlug(site);
  if (!company) notFound();
  const key = pillarKey(company.pillar);
  const profile = getCompanyProfile(company.slug);
  const isApp = !!profile?.app;
  const others = (await listLiveCompanies()).filter((c) => c.slug !== company.slug).slice(0, 3);
  const gallery = getSiteGallery(company.slug);
  const reviews = REVIEW_PROFILES[company.slug];
  const projectCount = gallery ? new Set(gallery.images.map((i) => i.project)).size : 0;
  const priced = company.services.filter((s) => s.priceFrom != null);
  const gbp = (n: unknown) => `£${Number(n).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;

  const jsonLd = isApp
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: company.name,
        description: company.description,
        operatingSystem: "iOS",
        applicationCategory: company.slug === "reraprep" ? "EducationalApplication" : "HealthApplication",
        ...(profile?.app?.url ? { installUrl: profile.app.url } : {}),
        author: { "@type": "Person", name: "Aimal Mazidi" },
        publisher: { "@type": "Organization", name: "Mazidi Group" },
      }
    : {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: company.name,
        description: company.description,
        legalName: profile?.legalName,
        telephone: profile?.phone,
        email: profile?.email,
        url: profile?.website,
        areaServed: profile?.location,
        parentOrganization: { "@type": "Organization", name: "Mazidi Group" },
      };

  const faq = isApp
    ? APP_FAQ(company.name, profile!.app!.status, profile!.app!.pricing)
    : SERVICE_FAQ(company.name, { phoneDisplay: profile?.phoneDisplay, email: profile?.email, location: profile?.location ?? "London and Dubai" });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="hero-grad pb-20 pt-24">
        <Container className="grid grid-cols-[1.2fr_.8fr] items-end gap-12 max-lg:grid-cols-1">
          <div>
            <h1 className="max-w-[820px] font-display text-[clamp(2.6rem,6vw,4.4rem)] font-medium leading-[1.05] tracking-[-.02em]">
              {company.tagline ?? company.description?.split("—")[0]}
            </h1>
            <Lead className="my-6">{company.description}</Lead>
            <div className="flex flex-wrap items-center gap-3.5">
              {isApp ? (
                <>
                  <AppStoreBadge status={profile!.app!.status} url={profile!.app!.url} />
                  <ButtonLink href={`/sites/${company.slug}/contact`} variant="outline">Contact the developer</ButtonLink>
                </>
              ) : (
                <>
                  {profile?.website ? (
                    <ButtonLink href={profile.website} target="_blank" rel="noopener noreferrer">
                      Visit {new URL(profile.website).host.replace(/^www\./, "")} <Arrow />
                    </ButtonLink>
                  ) : (
                    <ButtonLink href={`/sites/${company.slug}/contact`}>Get Quote <Arrow /></ButtonLink>
                  )}
                  {profile?.whatsapp && (
                    <ButtonLink href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noopener noreferrer" variant="outline">
                      WhatsApp {profile.phoneDisplay}
                    </ButtonLink>
                  )}
                  {profile?.website && (
                    <ButtonLink href={`/sites/${company.slug}/contact`} variant="ghost">Send a message</ButtonLink>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Fact card */}
          {profile && (
            <div className="rounded-xl border border-line bg-bg2 p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className={`rounded-full px-[11px] py-[5px] text-[.68rem] font-bold uppercase tracking-[.1em] ${pillarBg[key]}`}>{PILLARS[key].name}</span>
                <span className="text-[.78rem] text-t3">{profile.location}</span>
              </div>
              <ul className="space-y-3">
                {profile.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-[.95rem]">
                    <span className={`mt-[9px] h-1.5 w-1.5 flex-none rounded-full ${{ build: "bg-build", run: "bg-run", grow: "bg-grow" }[key]}`} aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-line pt-5 text-[.85rem] text-t2">
                {isApp ? (
                  <>
                    <p><b className="text-t1">Platforms:</b> {profile.app!.platforms.join(" · ")}</p>
                    <p className="mt-1"><b className="text-t1">Price:</b> {profile.app!.pricing}</p>
                  </>
                ) : (
                  <>
                    {profile.phoneDisplay && <p><a href={`tel:${profile.phone}`} className="hover:text-gold">{profile.phoneDisplay}</a></p>}
                    {profile.email && <p className="mt-1"><a href={`mailto:${profile.email}`} className="hover:text-gold">{profile.email}</a></p>}
                    <p className="mt-1 text-t3">{profile.legalName}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Services / Features — from the DB */}
      <Section>
        <Container>
          <div id="services" className="scroll-mt-24" />
          <SectionHead kicker={isApp ? "Features" : "Services"} title={isApp ? "What's in the app." : "What we do."} />
          <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {company.services.map((s, i) => (
              <div key={s.slug} className="flex flex-col rounded-md border border-line bg-bg2 p-7">
                <div className={`mb-[18px] grid h-[46px] w-[46px] place-items-center rounded-[13px] text-[.95rem] font-bold ${pillarBg[key]}`}>
                  0{i + 1}
                </div>
                <h4 className="mb-[7px] text-[1.08rem] font-semibold">{s.name}</h4>
                <p className="mb-4 flex-1 text-[.87rem] text-t2">{s.summary}</p>
                {s.priceFrom != null && (
                  <p className="text-[.85rem] font-semibold text-gold">
                    from {gbp(s.priceFrom)}{s.slug === "backup-monitoring" ? " / month" : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Portfolio — static per-tenant gallery (only sites with photos) */}
      {gallery && (
        <Section className="pt-0">
          <Container>
            <div id="portfolio" className="scroll-mt-24" />
            <SectionHead kicker="Portfolio" title="Completed projects, photographed honestly." />
            <p className="-mt-8 mb-10 max-w-[680px] text-t2">
              {gallery.images.length} photos from {projectCount}+ completed projects across London —
              full renovations, tiling, plastering and bespoke finish work. Every photo below is our
              own work on a real client project.
            </p>
            <PortfolioGallery site={company.slug} categories={gallery.categories} images={gallery.images} />
          </Container>
        </Section>
      )}

      {/* Verified reviews — links out to the live review platform */}
      {reviews && (
        <Section className="pt-0">
          <Container>
            <div id="reviews" className="scroll-mt-24" />
            <SectionHead kicker="Client satisfaction" title={`Rated ${reviews.rating}/10 on ${reviews.platform}.`} />
            <div className="flex flex-wrap items-center gap-8 rounded-xl border border-line bg-bg2 p-10 max-sm:p-6">
              <div>
                <div className="font-display text-[3.2rem] font-medium leading-none text-gold">{reviews.rating}</div>
                <div className="mt-1 text-[.8rem] uppercase tracking-[.1em] text-t3">out of 10</div>
              </div>
              <div className="min-w-[260px] flex-1">
                <div className="mb-1.5 text-[.95rem] tracking-[2px] text-gold" aria-hidden>★★★★★</div>
                <p className="max-w-[560px] text-[.92rem] text-t2">
                  Every review on {reviews.platform} is from a verified client on a completed job —
                  workmanship, reliability and tidiness, scored independently. Read all{" "}
                  {reviews.reviewCount} reviews on our public profile.
                </p>
              </div>
              <ButtonLink href={reviews.url} target="_blank" rel="noopener noreferrer">
                Read our {reviews.platform} reviews <Arrow />
              </ButtonLink>
            </div>
          </Container>
        </Section>
      )}

      {/* Pricing (services) + FAQ */}
      <Section className="pt-0">
        <Container>
          {!isApp && (
            <>
              <div id="pricing" className="scroll-mt-24" />
              <SectionHead kicker="Pricing" title="Quoted in writing. Before we start." />
              {priced.length > 0 ? (
                <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                  {priced.map((s) => (
                    <div key={s.slug} className="rounded-lg border border-line bg-bg2 p-7">
                      <h4 className="mb-1 text-[1.05rem] font-semibold">{s.name}</h4>
                      <p className="mb-3 font-display text-[2rem] font-medium leading-none">
                        from {gbp(s.priceFrom)}<span className="text-[1rem] text-t3">{s.slug === "backup-monitoring" ? " / month" : " one-off"}</span>
                      </p>
                      <p className="text-[.88rem] text-t2">{s.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="max-w-[640px] text-t2">
                  Every job is different, so we price it properly: a visit or a call, then a written quote with
                  the scope spelled out. No estimate ever turns into a surprise.
                </p>
              )}
              {profile?.website && company.slug === "it" && (
                <p className="mt-6 text-[.88rem] text-t2">
                  Full pricing and what&apos;s included is on{" "}
                  <a href={`${profile.website}/pricing`} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold">backup.mazidigroup.com/pricing</a>.
                </p>
              )}
            </>
          )}
          <div className={isApp ? "" : "mt-16"} id="faq">
            <SectionHead kicker="FAQ" title="Questions, answered." />
            <FAQ items={faq.map(([q, a]) => ({ q, a }))} />
          </div>
        </Container>
      </Section>

      {/* More from the group */}
      <Section className="pt-0">
        <Container>
          <SectionHead kicker="More from Mazidi Group" title="The other businesses." />
          <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {others.map((c) => <CompanyCard key={c.slug} company={c} />)}
          </div>
        </Container>
      </Section>

      <CTABand
        title={isApp ? `Get ${company.name}.` : `Work with ${company.name}.`}
        sub={isApp
          ? (profile!.app!.status === "live" ? "Free to download on the App Store. Questions go straight to the developer." : "Submitted to Apple — leave your email and we'll tell you the day it's approved.")
          : "One person quotes it, does it and answers the phone afterwards."}
        actions={
          isApp && profile!.app!.status === "live" && profile!.app!.url
            ? <AppStoreBadge status="live" url={profile!.app!.url} />
            : <ButtonLink href={`/sites/${company.slug}/contact`}>{isApp ? "Tell me when it's live" : "Book Consultation"} <Arrow /></ButtonLink>
        }
      />
    </>
  );
}
