import Link from "next/link";
import { listFeaturedTestimonials, listLiveCompanies, listPosts } from "@mazidi/api";
import { INDUSTRIES, JOURNEY_STAGES, OFFICES, PILLARS } from "@mazidi/config";
import {
  Arrow, ButtonLink, CompanyCard, Container, CTABand, Kicker, Lead, PillarCard, Section, SectionHead,
} from "@mazidi/ui";
import { LeadForm } from "@/components/LeadForm";
import { Testimonials } from "@/components/Testimonials";

export const revalidate = 300;

export default async function HomePage() {
  const [companies, posts, testimonials] = await Promise.all([
    listLiveCompanies(), listPosts(4), listFeaturedTestimonials(),
  ]);
  const byPillar = (p: string) => companies.filter((c) => c.pillar.toLowerCase() === p);

  return (
    <>
      {/* Hero (docs/01 §Home) */}
      <section className="hero-grad flex min-h-screen items-center overflow-hidden pb-[90px] pt-[150px]">
        <Container className="grid grid-cols-[1.15fr_.85fr] items-center gap-16 max-lg:grid-cols-1">
          <div>
            <Kicker>The Business Ecosystem</Kicker>
            <h1 className="font-display text-[clamp(3rem,7.5vw,6.2rem)] font-medium leading-[1.02] tracking-[-.02em]">
              Build <span className="text-build">it.</span><br />
              Run <span className="text-run">it.</span><br />
              Grow <span className="bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-transparent">it.</span>
            </h1>
            <Lead className="my-7">
              Helping businesses create, operate and scale through one connected ecosystem —
              {" "}{companies.length} specialist companies, one account, one journey.
            </Lead>
            <div className="flex flex-wrap gap-3.5">
              <ButtonLink href="/companies">Explore Companies <Arrow /></ButtonLink>
              <ButtonLink href="/contact" variant="outline">Book Consultation</ButtonLink>
            </div>
          </div>
          <EcosystemOrbit />
        </Container>
      </section>

      {/* Section 1 — What we do */}
      <Section>
        <Container>
          <SectionHead
            kicker="What we do"
            title={<>One ecosystem.<br />Every stage of business.</>}
            aside={<Lead className="max-w-[380px]">A customer should never need to leave the ecosystem. Every service leads naturally to the next.</Lead>}
          />
          <div className="grid grid-cols-3 gap-[22px] max-lg:grid-cols-2 max-sm:grid-cols-1">
            {(["build", "run", "grow"] as const).map((key, i) => (
              <PillarCard
                key={key}
                pillar={PILLARS[key]}
                index={i}
                companies={byPillar(key).slice(0, 4).map((c) => c.name.replace("Mazidi ", ""))}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* Section 2 — Our companies */}
      <Section className="pt-0">
        <Container>
          <SectionHead
            kicker="Our companies"
            title={<>{companies.length} specialists.<br />One account.</>}
            aside={<ButtonLink href="/companies" variant="outline" size="sm">View all <Arrow /></ButtonLink>}
          />
          <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {companies.slice(0, 9).map((c) => (
              <CompanyCard key={c.slug} company={{ ...c, services: c.services }} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Section 3 — Business journey */}
      <Section className="pt-0">
        <Container>
          <SectionHead
            kicker="The business journey"
            title={<>From idea to exit,<br />we&apos;re already there.</>}
            aside={<Lead className="max-w-[380px]">Wherever you are in the journey, a Mazidi company is built for that exact moment — and hands you to the next one seamlessly.</Lead>}
          />
          <div className="relative">
            <div className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-build via-run to-grow" aria-hidden />
            {JOURNEY_STAGES.map((j, i) => (
              <div key={j.title} className="relative pb-[42px] pl-[76px]">
                <div className="absolute left-[9px] top-0.5 z-10 grid h-[31px] w-[31px] place-items-center rounded-full border border-line2 bg-bg2 text-[.72rem] font-bold text-t2">
                  {i + 1}
                </div>
                <h4 className="mb-1 text-[1.05rem] font-semibold">{j.title}</h4>
                <p className="max-w-[560px] text-[.88rem] text-t2">{j.desc}</p>
                <span className={`mt-2.5 inline-flex items-center gap-2 rounded-full px-[13px] py-1.5 text-[.78rem] font-semibold ${{ build: "bg-build/15 text-build", run: "bg-run/15 text-run", grow: "bg-grow/15 text-grow" }[j.pillar]}`}>
                  ✦ {j.companies}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Section 4 — Industries */}
      <Section className="pt-0">
        <Container>
          <SectionHead kicker="Industries" title={<>Deep expertise,<br />ten industries.</>} />
          <div className="grid grid-cols-5 gap-3.5 max-lg:grid-cols-3 max-sm:grid-cols-2">
            {INDUSTRIES.map((name) => (
              <div key={name} className="rounded-md border border-line bg-bg2 px-5 py-[26px] text-center transition-all duration-200 ease-meridian hover:-translate-y-0.5 hover:border-gold">
                <b className="text-[.88rem] font-semibold">{name}</b>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Section 5 — Global presence */}
      <Section className="pt-0">
        <Container>
          <div className="grid grid-cols-2 items-center gap-12 overflow-hidden rounded-xl border border-line bg-bg2 p-14 max-lg:grid-cols-1 max-sm:p-6">
            <div>
              <Kicker>Global presence</Kicker>
              <h2 className="mb-3.5 font-display text-[clamp(1.9rem,3.4vw,2.7rem)] font-medium leading-[1.08]">
                London. Dubai.<br />Then the world.
              </h2>
              <p className="mb-2.5 text-[.95rem] text-t2">
                Two headquarters, one platform. Expansion offices opening across the Gulf, Asia-Pacific and North America.
              </p>
              <div>
                {OFFICES.map((o) => (
                  <div key={o.city} className="flex items-center gap-4 border-b border-line py-4 last:border-0">
                    <div className="flex-1">
                      <b className="block text-[.98rem]">{o.city}</b>
                      <span className="text-[.83rem] text-t2">{o.country}</span>
                    </div>
                    <span className={`rounded-full border px-[9px] py-[3px] text-[.66rem] font-bold uppercase tracking-[.1em] ${o.live ? "border-success text-success" : "border-gold text-gold"}`}>
                      {o.live ? "Live" : "Coming"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <GlobeGraphic />
          </div>
        </Container>
      </Section>

      {/* Section 6 — Latest insights */}
      <Section className="pt-0">
        <Container>
          <SectionHead
            kicker="Latest insights"
            title="Intelligence for operators."
            aside={<ButtonLink href="/insights" variant="outline" size="sm">All insights <Arrow /></ButtonLink>}
          />
          <div className="grid grid-cols-4 gap-[18px] max-lg:grid-cols-2 max-sm:grid-cols-1">
            {posts.map((p) => (
              <Link key={p.slug} href={`/insights#${p.slug}`} className="overflow-hidden rounded-md border border-line bg-bg2 transition-all duration-300 ease-meridian hover:-translate-y-1 hover:shadow-lift">
                <div className="flex h-[150px] items-end bg-gradient-to-br from-[#1A2233] to-[#2A2118] p-3.5">
                  <span className="rounded-full bg-[#0B0D12]/55 px-[11px] py-[5px] text-[.68rem] font-bold uppercase tracking-[.1em] text-white backdrop-blur">
                    {p.kind.replace("_", " ")}
                  </span>
                </div>
                <div className="p-5">
                  <b className="mb-2 block text-[.95rem] font-semibold leading-[1.4]">{p.title}</b>
                  <span className="text-[.78rem] text-t3">{p.readMinutes} min {p.kind === "VIDEO" ? "watch" : "read"}</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Section 7 — Testimonials */}
      <Section className="pt-0">
        <Container>
          <Testimonials items={testimonials.map((t) => ({ quote: t.quote, author: t.author, role: t.role }))} />
        </Container>
      </Section>

      {/* Section 8 — Contact */}
      <Section className="pt-0">
        <Container>
          <SectionHead kicker="Contact" title="Start the conversation." />
          <div className="grid grid-cols-2 gap-[22px] max-lg:grid-cols-1">
            <LeadForm />
            <div className="rounded-lg border border-line bg-bg2 p-[38px] max-sm:p-6">
              <h3 className="mb-1.5 font-display text-[1.35rem]">Book a strategy session</h3>
              <p className="mb-[22px] text-[.88rem] text-t2">45 minutes with a senior advisor. Free for new clients.</p>
              <p className="text-[.9rem] text-t2">
                Live availability comes from the bookings service (docs/04 §/v1/bookings) — connect your
                calendar provider in the admin panel to activate it. Until then, use the form and we&apos;ll
                schedule by email.
              </p>
              <ButtonLink href="/contact" variant="outline" className="mt-6">Schedule Meeting <Arrow /></ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      <CTABand
        actions={
          <>
            <ButtonLink href="/contact">Book Consultation <Arrow /></ButtonLink>
            <ButtonLink href="/companies" variant="outline" className="border-[#3A4152] text-[#F2F3F5]">Explore Companies</ButtonLink>
          </>
        }
      />
    </>
  );
}

/** Animated Build → Run → Grow orbit (hero illustration, ported from Phase 2). */
function EcosystemOrbit() {
  return (
    <svg viewBox="0 0 420 420" fill="none" className="w-full max-lg:hidden" aria-hidden>
      <defs>
        <linearGradient id="og" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C08A4E" /><stop offset=".5" stopColor="#4E7EC0" /><stop offset="1" stopColor="#3FA372" />
        </linearGradient>
      </defs>
      <circle cx="210" cy="210" r="170" stroke="url(#og)" strokeOpacity=".35" strokeDasharray="3 7">
        <animateTransform attributeName="transform" type="rotate" from="0 210 210" to="360 210 210" dur="60s" repeatCount="indefinite" />
      </circle>
      <circle cx="210" cy="210" r="118" stroke="url(#og)" strokeOpacity=".2" strokeDasharray="2 6">
        <animateTransform attributeName="transform" type="rotate" from="360 210 210" to="0 210 210" dur="45s" repeatCount="indefinite" />
      </circle>
      <g fontFamily="var(--font-inter)" fontSize="13" fontWeight="600" textAnchor="middle">
        <g>
          <circle cx="210" cy="40" r="34" fill="rgba(192,138,78,.16)" stroke="#C08A4E" /><text x="210" y="45" fill="#C08A4E">BUILD</text>
          <animateTransform attributeName="transform" type="rotate" values="0 210 210;360 210 210" dur="30s" repeatCount="indefinite" />
        </g>
        <g>
          <circle cx="357" cy="295" r="34" fill="rgba(78,126,192,.16)" stroke="#4E7EC0" /><text x="357" y="300" fill="#4E7EC0">RUN</text>
          <animateTransform attributeName="transform" type="rotate" values="0 210 210;360 210 210" dur="30s" repeatCount="indefinite" />
        </g>
        <g>
          <circle cx="63" cy="295" r="34" fill="rgba(63,163,114,.16)" stroke="#3FA372" /><text x="63" y="300" fill="#3FA372">GROW</text>
          <animateTransform attributeName="transform" type="rotate" values="0 210 210;360 210 210" dur="30s" repeatCount="indefinite" />
        </g>
      </g>
      <g transform="translate(210 210)">
        <rect x="-26" y="-26" width="52" height="52" transform="rotate(45)" stroke="#C9A461" strokeWidth="2" fill="rgba(201,164,97,.08)" />
        <rect x="-11" y="-11" width="22" height="22" transform="rotate(45)" fill="#C9A461" />
      </g>
      <text x="210" y="268" textAnchor="middle" fontFamily="var(--font-inter)" fontSize="11" fontWeight="600" fill="#9AA0AD" letterSpacing="2">MAZIDI GROUP</text>
    </svg>
  );
}

/** Globe with HQ markers (Section 5, ported from Phase 2). */
function GlobeGraphic() {
  return (
    <svg viewBox="0 0 400 400" fill="none" className="w-full" aria-hidden>
      <circle cx="200" cy="200" r="160" stroke="var(--line2)" />
      <ellipse cx="200" cy="200" rx="160" ry="60" stroke="var(--line2)" strokeOpacity=".7" />
      <ellipse cx="200" cy="200" rx="160" ry="115" stroke="var(--line2)" strokeOpacity=".5" />
      <ellipse cx="200" cy="200" rx="60" ry="160" stroke="var(--line2)" strokeOpacity=".7" />
      <ellipse cx="200" cy="200" rx="115" ry="160" stroke="var(--line2)" strokeOpacity=".5" />
      <line x1="40" y1="200" x2="360" y2="200" stroke="var(--line2)" strokeOpacity=".6" />
      <path d="M150 130 Q 215 60 268 178" stroke="#C9A461" strokeWidth="1.4" strokeDasharray="4 5">
        <animate attributeName="stroke-dashoffset" from="90" to="0" dur="4s" repeatCount="indefinite" />
      </path>
      <circle cx="150" cy="130" r="6" fill="#C9A461" /><circle cx="150" cy="130" r="11" stroke="#C9A461" strokeOpacity=".4" />
      <text x="150" y="112" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--t1)" fontFamily="var(--font-inter)">London</text>
      <circle cx="268" cy="178" r="6" fill="#C9A461" /><circle cx="268" cy="178" r="11" stroke="#C9A461" strokeOpacity=".4" />
      <text x="268" y="160" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--t1)" fontFamily="var(--font-inter)">Dubai</text>
      <circle cx="255" cy="215" r="4" fill="var(--t3)" /><text x="255" y="236" textAnchor="middle" fontSize="10" fill="var(--t3)" fontFamily="var(--font-inter)">Riyadh</text>
      <circle cx="316" cy="238" r="4" fill="var(--t3)" /><text x="316" y="259" textAnchor="middle" fontSize="10" fill="var(--t3)" fontFamily="var(--font-inter)">Singapore</text>
      <circle cx="95" cy="165" r="4" fill="var(--t3)" /><text x="95" y="152" textAnchor="middle" fontSize="10" fill="var(--t3)" fontFamily="var(--font-inter)">New York</text>
      <circle cx="330" cy="300" r="4" fill="var(--t3)" /><text x="330" y="321" textAnchor="middle" fontSize="10" fill="var(--t3)" fontFamily="var(--font-inter)">Sydney</text>
    </svg>
  );
}
