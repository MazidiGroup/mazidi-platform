import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getCompanyBySlug } from "@mazidi/api";
import { getCompanyProfile, PILLARS, SITE_URL } from "@mazidi/config";
import { AppleMark, CompanyLogo, Container, pillarBg, pillarKey } from "@mazidi/ui";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSiteGallery, REVIEW_PROFILES } from "@/lib/gallery";

export const revalidate = 300;

/**
 * Tenant shell: every business page shares this template. Brand accent is
 * injected as a CSS variable from Company.pillar; contact details and
 * external links come from COMPANY_PROFILES (@mazidi/config).
 */
export default async function SiteLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ site: string }> }) {
  const { site } = await params;
  // Slugs are lowercase; /sites/FitnessMuscleCoach → /sites/fitnessmusclecoach
  if (site !== site.toLowerCase()) permanentRedirect(`/sites/${site.toLowerCase()}`);
  const company = await getCompanyBySlug(site);
  if (!company) notFound();

  const key = pillarKey(company.pillar);
  const pillar = PILLARS[key];
  const profile = getCompanyProfile(company.slug);
  const accentVar = `var(--${key})`;
  const isApp = !!profile?.app;

  const nav: [string, string][] = [
    ["", "Overview"],
    ["#services", isApp ? "Features" : "Services"],
    ...(getSiteGallery(company.slug) ? [["#portfolio", "Portfolio"] as [string, string]] : []),
    ...(REVIEW_PROFILES[company.slug] ? [["#reviews", "Reviews"] as [string, string]] : []),
    ...(!isApp ? [["#pricing", "Pricing"] as [string, string]] : []),
    ["#faq", "FAQ"],
    ["/contact", "Contact"],
  ];

  return (
    <div style={{ "--accent": accentVar } as React.CSSProperties}>
      {/* Group bar — persistent path back to the group */}
      <div className="border-b border-line bg-bg3 py-[9px] text-[.78rem] text-t2">
        <Container className="flex items-center justify-between gap-3">
          <span>
            A <a href={SITE_URL} className="font-semibold text-gold">Mazidi Group</a> business · {pillar.name}
          </span>
          <span className="flex gap-4">
            <a href={`${SITE_URL}/companies`} className="font-semibold text-gold">All businesses</a>
            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold max-sm:hidden">
                {new URL(profile.website).host.replace(/^www\./, "")} ↗
              </a>
            )}
          </span>
        </Container>
      </div>

      {/* Tenant header */}
      <header className="border-b border-line">
        <Container className="flex items-center justify-between gap-6 py-4">
          <Link href={`/sites/${company.slug}`} className="flex items-center gap-3">
            <CompanyLogo company={company} size={40} />
            <div>
              <b className="font-display text-[1.05rem]">{company.name}</b>
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[.62rem] font-bold uppercase tracking-[.1em] ${pillarBg[key]}`}>
                {isApp ? "iOS app" : pillar.short}
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1 max-md:hidden" aria-label={`${company.name} navigation`}>
            {nav.map(([suffix, label]) => (
              <Link
                key={label}
                href={`/sites/${company.slug}${suffix}`}
                className="rounded-full px-3.5 py-2 text-[.88rem] font-medium text-t2 transition-colors hover:bg-bg3 hover:text-t1"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {profile?.app?.status === "live" && profile.app.url ? (
              <a
                href={profile.app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-[18px] py-[9px] text-[.85rem] font-semibold text-[#14100A] hover:bg-gold-soft"
              >
                <AppleMark className="h-4 w-4" /> App Store
              </a>
            ) : profile?.whatsapp ? (
              <a
                href={`https://wa.me/${profile.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gold px-[18px] py-[9px] text-[.85rem] font-semibold text-[#14100A] hover:bg-gold-soft"
              >
                WhatsApp
              </a>
            ) : (
              <Link
                href={`/sites/${company.slug}/contact`}
                className="rounded-full bg-gold px-[18px] py-[9px] text-[.85rem] font-semibold text-[#14100A] hover:bg-gold-soft"
              >
                Book Consultation
              </Link>
            )}
          </div>
        </Container>
      </header>

      <main>{children}</main>

      <footer className="border-t border-line py-10 text-center text-[.8rem] text-t3">
        <Container>
          <p>
            © {new Date().getFullYear()} {company.name} · {profile?.legalName ?? "Mazidi Group"}
            {profile?.legalName && profile.legalName !== company.name ? ` trading as ${company.name}` : ""} ·{" "}
            <a href={SITE_URL} className="text-gold">mazidigroup.com</a>
          </p>
          {profile?.registration && <p className="mt-1.5">{profile.registration}</p>}
          {company.slug === "reraprep" && (
            <p className="mt-1.5">
              Independent study aid — not affiliated with the Dubai Land Department, RERA or the Dubai Real Estate Institute.{" "}
              <Link href="/rera-privacy" className="text-gold">Privacy policy</Link>
            </p>
          )}
        </Container>
      </footer>
    </div>
  );
}
