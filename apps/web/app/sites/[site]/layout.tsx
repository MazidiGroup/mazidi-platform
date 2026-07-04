import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyBySlug } from "@mazidi/api";
import { PILLARS, PORTAL_URL, SITE_URL } from "@mazidi/config";
import { CompanyLogo, Container, pillarBg, pillarKey } from "@mazidi/ui";
import { ThemeToggle } from "@/components/ThemeToggle";

export const revalidate = 300;

/**
 * Tenant shell (docs/01 §2): every company site shares this template.
 * Brand accent is injected as a CSS variable from Company.brand — adding a
 * company requires zero new code.
 */
export default async function SiteLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ site: string }> }) {
  const { site } = await params;
  const company = await getCompanyBySlug(site);
  if (!company) notFound();

  const key = pillarKey(company.pillar);
  const pillar = PILLARS[key];
  const accentVar = `var(--${key})`;

  return (
    <div style={{ "--accent": accentVar } as React.CSSProperties}>
      {/* Ecosystem bar — persistent path back to the group (docs/01 §4) */}
      <div className="border-b border-line bg-bg3 py-[9px] text-[.78rem] text-t2">
        <Container className="flex items-center justify-between gap-3">
          <span>
            Part of the{" "}
            <a href={SITE_URL} className="font-semibold text-gold">Mazidi Group</a>{" "}
            ecosystem — Build it. Run it. Grow it.
          </span>
          <span className="flex gap-4">
            <a href={`${SITE_URL}/companies`} className="font-semibold text-gold">All companies</a>
            <a href={PORTAL_URL} className="font-semibold text-gold">Client Portal</a>
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
                {pillar.name}
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1 max-md:hidden" aria-label={`${company.name} navigation`}>
            {[["", "Overview"], ["#services", "Services"], ["#pricing", "Pricing"], ["#faq", "FAQ"], ["/contact", "Contact"]].map(([suffix, label]) => (
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
            <Link
              href={`/sites/${company.slug}/contact`}
              className="rounded-full bg-gold px-[18px] py-[9px] text-[.85rem] font-semibold text-[#14100A] hover:bg-gold-soft"
            >
              Book Consultation
            </Link>
          </div>
        </Container>
      </header>

      <main>{children}</main>

      <footer className="border-t border-line py-10 text-center text-[.8rem] text-t3">
        © {new Date().getFullYear()} {company.name} · A Mazidi Group company ·{" "}
        <a href={SITE_URL} className="text-gold">mazidigroup.com</a>
      </footer>
    </div>
  );
}
