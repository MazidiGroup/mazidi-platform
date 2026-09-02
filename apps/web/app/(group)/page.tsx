import Link from "next/link";
import { listLiveCompanies } from "@mazidi/api";
import {
  COMPANY_PROFILES, getCompanyProfile, GROUP_CONTACT, OFFICES, PILLAR_KEYS, PILLARS, type PillarKey,
} from "@mazidi/config";
import {
  Arrow, ButtonLink, CompanyCard, companyHref, Container, CTABand, Kicker, Lead, PillarCard, Section, SectionHead,
} from "@mazidi/ui";
import { LeadForm } from "@/components/LeadForm";
import { AppsShowcase } from "@/components/home/AppsShowcase";
import { HeroShowcase, type ShowcaseItem } from "@/components/home/HeroShowcase";
import { PhotoStrip } from "@/components/home/PhotoStrip";
import { ProofTicker } from "@/components/home/ProofTicker";
import { getSiteGallery, REVIEW_PROFILES } from "@/lib/gallery";

export const revalidate = 300;

/** Hand-picked, finished-work photos for the home strip (indexes into the construction manifest). */
const STRIP_PICKS = [
  "bathrooms/bathrooms-bathroom1-bathroom-ealing-broadway-photo1.jpg",
  "shower-rooms/shower-rooms-shower1-bathrooms-photo4.jpg",
  "kitchens/kitchens-jan2023-photo5.jpg",
  "bathrooms/bathrooms-bathroom2-testalbum-photo1.jpg",
  "venetian-plastering/venetian-plastering-venetian-plaster-bathroom-photo2.jpg",
  "bathrooms/bathrooms-bathroom4-bathroom-remodel-photo14.jpg",
  "shower-rooms/shower-rooms-shower8-bathroom-sw13-photo1.jpg",
  "venetian-plastering/venetian-plastering-venetian-plaster-bathroom-photo6.jpg",
  "bathrooms/bathrooms-bathroom1-bathroom-ealing-broadway-photo5.jpg",
  "shower-rooms/shower-rooms-shower2-bathroom-renovation-4-photo7.jpg",
  "exterior/exterior-tiling-photo2.jpg",
  "bathrooms/bathrooms-bathroom2-bathroom-refit-photo5.jpg",
  "shower-rooms/shower-rooms-shower8-bathrooms-photo7.jpg",
  "bathrooms/bathrooms-bathroom6-bathrooms-photo3.jpg",
  "shower-rooms/shower-rooms-shower2-bathroom-renovation-4-photo3.jpg",
];

export default async function HomePage() {
  const companies = await listLiveCompanies();
  const byPillar = (p: PillarKey) => companies.filter((c) => c.pillar.toLowerCase() === p);
  const apps = byPillar("run")
    .map((c) => ({ company: c, profile: getCompanyProfile(c.slug) }))
    .filter((x): x is { company: (typeof companies)[number]; profile: NonNullable<ReturnType<typeof getCompanyProfile>> } => !!x.profile?.app);
  const liveApps = apps.filter((a) => a.profile.app?.status === "live").length;

  const gallery = getSiteGallery("construction");
  const strip = STRIP_PICKS.map((src) => gallery?.images.find((i) => i.src === src)).filter((i): i is NonNullable<typeof i> => !!i);
  const reviews = REVIEW_PROFILES.construction;

  const showcase: ShowcaseItem[] = companies.map((c) => {
    const profile = getCompanyProfile(c.slug);
    const key = c.pillar.toLowerCase() as PillarKey;
    const primary = companyHref(c, profile);
    return {
      slug: c.slug,
      name: c.name,
      mono: (c.brand as { mono?: string } | null)?.mono ?? c.name.slice(0, 2).toUpperCase(),
      pillar: key,
      pillarLabel: PILLARS[key].name,
      tagline: c.tagline ?? c.description ?? "",
      location: profile?.location ?? "",
      highlights: profile?.highlights ?? [],
      href: primary.href,
      external: primary.external,
      cta: primary.external ? `Visit ${primary.label}` : primary.label,
      appStatus: profile?.app?.status,
      appUrl: profile?.app?.url,
    };
  });

  const proof = [
    "RERA-registered brokerage · ORN 47322",
    reviews ? `${reviews.rating}/10 on ${reviews.platform}` : "Rated 10/10 on Checkatrade",
    reviews ? `${reviews.reviewCount} verified client reviews` : "26 verified client reviews",
    "670+ Dubai off-plan projects researched",
    `${apps.length} iOS apps · ${liveApps} live on the App Store`,
    "Apple Watch set logging",
    "28+ completed London renovations",
    "Backup box installed from £1,495",
    "London · Dubai",
  ];

  const stats: [string, string][] = [
    [String(companies.length), "businesses"],
    ["2", "countries"],
    [String(apps.length), "iOS apps"],
    [reviews ? `${reviews.rating}/10` : "10/10", "on Checkatrade"],
  ];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center overflow-hidden pb-24 pt-[150px] max-sm:pt-[120px]">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="orb orb-a left-[-10%] top-[-10%] h-[520px] w-[520px]" style={{ background: "rgba(192,138,78,.22)" }} aria-hidden />
        <div className="orb orb-b right-[-5%] top-[20%] h-[460px] w-[460px]" style={{ background: "rgba(78,126,192,.20)" }} aria-hidden />
        <div className="orb orb-a bottom-[-20%] left-[35%] h-[420px] w-[420px]" style={{ background: "rgba(63,163,114,.14)", animationDelay: "-9s" }} aria-hidden />

        <Container className="relative grid grid-cols-[1.05fr_.95fr] items-center gap-16 max-lg:grid-cols-1 max-lg:gap-12">
          <div>
            <div className="rise rise-1"><Kicker>Mazidi Group · London &amp; Dubai</Kicker></div>
            <h1 className="rise rise-2 font-display text-[clamp(2.9rem,6.6vw,5.6rem)] font-medium leading-[1.02] tracking-[-.025em]">
              Buildings you can<br />
              walk into. Apps you<br />
              can download.{" "}
              <span className="bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-transparent">One name on both.</span>
            </h1>
            <Lead className="rise rise-3 my-8 max-w-[560px]">
              A Dubai off-plan brokerage, a West London renovation contractor, a business backup service and
              an apps studio with {apps.length} iOS apps — {companies.length} real businesses, run by one family, with
              the work to show for it.
            </Lead>
            <div className="rise rise-4 flex flex-wrap gap-3.5">
              <ButtonLink href="#businesses">See the businesses <Arrow /></ButtonLink>
              <ButtonLink href="/contact" variant="outline">Book Consultation</ButtonLink>
            </div>
            <dl className="rise rise-4 mt-12 grid max-w-[560px] grid-cols-4 gap-4 border-t border-line pt-7 max-sm:grid-cols-2">
              {stats.map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-[1.7rem] font-medium leading-none">{v}</dd>
                  <dd className="mt-1 text-[.78rem] uppercase tracking-[.08em] text-t3">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroShowcase items={showcase} />
        </Container>
      </section>

      <ProofTicker items={proof} />

      {/* ── What we do ───────────────────────────────────── */}
      <Section>
        <Container>
          <SectionHead
            kicker="What we do"
            title={<>Three lines of work.<br />All of it ours.</>}
            aside={<Lead className="max-w-[400px]">No agencies, no white-labels. Every business here is owned and run by the Mazidi family — you deal with the people doing the work.</Lead>}
          />
          <div className="grid grid-cols-3 gap-[22px] max-lg:grid-cols-2 max-sm:grid-cols-1">
            {PILLAR_KEYS.map((key, i) => (
              <PillarCard
                key={key}
                pillar={PILLARS[key]}
                index={i}
                companies={byPillar(key).map((c) => {
                  const p = getCompanyProfile(c.slug);
                  const note = p?.app ? (p.app.status === "live" ? "Live" : "In review") : p?.location.split(",")[0];
                  return { slug: c.slug, name: c.name, note };
                })}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* ── The businesses ───────────────────────────────── */}
      <Section className="pt-0">
        <Container>
          <div id="businesses" className="scroll-mt-28" />
          <SectionHead
            kicker="The businesses"
            title={<>{companies.length} businesses.<br />Real contact details on every one.</>}
            aside={<ButtonLink href="/companies" variant="outline" size="sm">Open the directory <Arrow /></ButtonLink>}
          />
          <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {[...byPillar("build"), ...byPillar("grow"), ...byPillar("run")].map((c) => (
              <CompanyCard key={c.slug} company={c} />
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Real work ────────────────────────────────────── */}
      {strip.length > 0 && (
        <section className="overflow-hidden pb-[110px] max-sm:pb-[70px]">
          <Container>
            <SectionHead
              kicker="Real work, photographed honestly"
              title={<>Every photo is ours.<br />Every job is a real client.</>}
              aside={
                reviews && (
                  <a href={reviews.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-lg border border-line bg-bg2 px-5 py-3.5 transition-colors hover:border-gold">
                    <span className="font-display text-[2rem] font-medium leading-none text-gold">{reviews.rating}</span>
                    <span className="text-[.82rem] leading-tight text-t2">
                      out of 10 on {reviews.platform}<br />
                      <span className="text-t3">{reviews.reviewCount} verified reviews · {reviews.memberSince}</span>
                    </span>
                  </a>
                )
              }
            />
          </Container>
          <PhotoStrip images={strip} />
        </section>
      )}

      {/* ── Apps ─────────────────────────────────────────── */}
      {apps.length > 0 && (
        <Section className="pt-0">
          <Container>
            <div id="apps" className="scroll-mt-28" />
            <SectionHead
              kicker="Built in-house"
              title={<>{apps.length} iOS apps.<br />{liveApps} live, {apps.length - liveApps} with Apple now.</>}
              aside={
                <Lead className="max-w-[400px]">
                  Designed, built and published by us under the developer name{" "}
                  <a href="https://apps.apple.com/gb/developer/aimal-mazidi/id6786005407" target="_blank" rel="noopener noreferrer" className="font-semibold text-t1 hover:text-gold">Aimal Mazidi</a>.
                  No agencies, no templates.
                </Lead>
              }
            />
            <AppsShowcase apps={apps} />
          </Container>
        </Section>
      )}

      {/* ── Where we are ─────────────────────────────────── */}
      <Section className="pt-0">
        <Container>
          <SectionHead kicker="Where we are" title={<>Two cities.<br />Two registered companies.</>} />
          <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
            {OFFICES.map((o, n) => {
              const key: PillarKey = n === 0 ? "grow" : "build";
              const profile = n === 0 ? COMPANY_PROFILES.construction : COMPANY_PROFILES.mazidihomes;
              return (
                <div key={o.city} className="relative overflow-hidden rounded-xl border border-line bg-bg2 p-10 max-sm:p-6">
                  <span
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
                    style={{ background: key === "build" ? "rgba(192,138,78,.22)" : "rgba(78,126,192,.2)" }}
                    aria-hidden
                  />
                  <div className="relative">
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <h3 className="font-display text-[2.2rem] font-medium leading-none">{o.city}</h3>
                      <span className="rounded-full border border-success px-[9px] py-[3px] text-[.66rem] font-bold uppercase tracking-[.1em] text-success">Open</span>
                    </div>
                    <p className="mb-1 text-[.95rem] font-semibold">{o.entity}</p>
                    <p className="mb-6 text-[.88rem] text-t2">{o.country} · {o.note}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[.88rem]">
                      {profile.phoneDisplay && <a href={`tel:${profile.phone}`} className="text-t2 hover:text-gold">{profile.phoneDisplay}</a>}
                      {profile.whatsapp && <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-t2 hover:text-gold">WhatsApp</a>}
                      {profile.email && <a href={`mailto:${profile.email}`} className="text-t2 hover:text-gold">{profile.email}</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ── Contact ──────────────────────────────────────── */}
      <Section className="pt-0">
        <Container>
          <SectionHead kicker="Contact" title="Talk to the person who does the work." />
          <div className="grid grid-cols-2 gap-[22px] max-lg:grid-cols-1">
            <LeadForm />
            <div className="flex flex-col gap-5">
              <div className="rounded-lg border border-line bg-bg2 p-[38px] max-sm:p-6">
                <h3 className="mb-1.5 font-display text-[1.35rem]">Prefer WhatsApp?</h3>
                <p className="mb-6 text-[.88rem] text-t2">Message the right person directly — no call centre, no ticket numbers.</p>
                <div className="space-y-3">
                  <a href={`https://wa.me/${COMPANY_PROFILES.mazidihomes.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 rounded-md border border-line px-5 py-4 transition-colors hover:border-gold">
                    <span>
                      <b className="block text-[.95rem]">Dubai property</b>
                      <span className="text-[.82rem] text-t2">Mazidi Homes · {COMPANY_PROFILES.mazidihomes.phoneDisplay}</span>
                    </span>
                    <Arrow />
                  </a>
                  <a href={`https://wa.me/${GROUP_CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 rounded-md border border-line px-5 py-4 transition-colors hover:border-gold">
                    <span>
                      <b className="block text-[.95rem]">London renovations, backup &amp; apps</b>
                      <span className="text-[.82rem] text-t2">Mazidi Homes Limited · {GROUP_CONTACT.phoneDisplay}</span>
                    </span>
                    <Arrow />
                  </a>
                </div>
              </div>
              <div className="rounded-lg border border-line bg-bg2 p-[38px] max-sm:p-6">
                <h3 className="mb-1.5 font-display text-[1.35rem]">Email</h3>
                <p className="text-[.9rem] text-t2">
                  <a href={`mailto:${GROUP_CONTACT.email}`} className="font-semibold text-t1 hover:text-gold">{GROUP_CONTACT.email}</a> for the UK businesses and apps ·{" "}
                  <a href={`mailto:${COMPANY_PROFILES.mazidihomes.email}`} className="font-semibold text-t1 hover:text-gold">{COMPANY_PROFILES.mazidihomes.email}</a> for Dubai property.
                </p>
                <p className="mt-3 text-[.82rem] text-t3">{GROUP_CONTACT.hours}</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <CTABand
        title="Start with whichever business you need."
        sub="Property in Dubai, a renovation in London, a backup you can restore from, or an app for your gym or academy — the people who build them answer the phone."
        actions={
          <>
            <ButtonLink href="/contact">Book Consultation <Arrow /></ButtonLink>
            <ButtonLink href="/companies" variant="outline" className="border-[#3A4152] text-[#F2F3F5]">All businesses</ButtonLink>
          </>
        }
      />
    </>
  );
}
