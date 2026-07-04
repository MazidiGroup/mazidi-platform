"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { PILLARS, PORTAL_URL, type PillarKey } from "@mazidi/config";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

type NavCompany = { slug: string; name: string; pillar: string };

/** Sticky glass header + pillar mega-menu (docs/01 §4). Companies come from the DB via the layout. */
export function Header({ companies }: { companies: NavCompany[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState<PillarKey | null>(null);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links: { href: string; label: string; pillar?: PillarKey }[] = [
    { href: "/build", label: "Build It", pillar: "build" },
    { href: "/run", label: "Run It", pillar: "run" },
    { href: "/grow", label: "Grow It", pillar: "grow" },
    { href: "/companies", label: "Companies" },
    { href: "/insights", label: "Insights" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled && "border-b border-line bg-bg/75 backdrop-blur-2xl",
      )}
      onMouseLeave={() => setMega(null)}
    >
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-6 px-8 py-[18px] max-sm:px-5">
        <Logo />
        <nav className="flex items-center gap-1 max-lg:hidden" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onMouseEnter={() => setMega(l.pillar ?? null)}
              className="rounded-full px-3.5 py-[9px] text-[.9rem] font-medium text-t2 transition-colors hover:bg-bg3 hover:text-t1"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <a href={PORTAL_URL} className="rounded-full border border-line2 px-[18px] py-[9px] text-[.85rem] font-semibold transition-colors hover:border-gold hover:text-gold max-sm:hidden">
            Client Portal
          </a>
          <Link href="/contact" className="rounded-full bg-gold px-[18px] py-[9px] text-[.85rem] font-semibold text-[#14100A] transition-colors hover:bg-gold-soft">
            Book Consultation
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            className="hidden h-10 w-10 rounded-full border border-line2 max-lg:block"
            onClick={() => setDrawer((d) => !d)}
          >
            ☰
          </button>
        </div>
      </div>

      {mega && (
        <div className="absolute left-1/2 top-full grid w-[min(920px,94vw)] -translate-x-1/2 translate-y-2 grid-cols-[220px_1fr] gap-7 rounded-lg border border-line bg-bg/85 p-7 shadow-lift backdrop-blur-2xl max-sm:grid-cols-1">
          <div>
            <h4 className="mb-2 font-display text-[1.35rem]">{PILLARS[mega].name}</h4>
            <p className="text-[.88rem] text-t2">{PILLARS[mega].desc}</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-sm:grid-cols-1">
            {companies
              .filter((c) => c.pillar.toLowerCase() === mega)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/sites/${c.slug}`}
                  className="rounded-xl px-3.5 py-[11px] text-[.9rem] font-medium text-t2 transition-colors hover:bg-bg3 hover:text-t1"
                  onClick={() => setMega(null)}
                >
                  {c.name.replace("Mazidi ", "")}
                </Link>
              ))}
          </div>
        </div>
      )}

      {drawer && (
        <nav className="border-t border-line bg-bg px-8 py-4 lg:hidden" aria-label="Mobile">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setDrawer(false)} className="block border-b border-line py-3 font-display text-xl">
              {l.label}
            </Link>
          ))}
          <a href={PORTAL_URL} className="block py-3 font-display text-xl text-gold">Client Portal</a>
        </nav>
      )}
    </header>
  );
}
