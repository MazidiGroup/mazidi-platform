import Link from "next/link";
import { PILLARS, PORTAL_URL } from "@mazidi/config";
import { Container } from "@mazidi/ui";
import { Logo } from "./Logo";

type NavCompany = { slug: string; name: string; pillar: string };

export function Footer({ companies }: { companies: NavCompany[] }) {
  const col = (pillar: string) =>
    companies.filter((c) => c.pillar.toLowerCase() === pillar).slice(0, 6);

  return (
    <footer className="mt-10 border-t border-line pb-9 pt-[72px]">
      <Container>
        <div className="mb-14 grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <div>
            <Logo />
            <p className="mt-3.5 max-w-[280px] text-[.86rem] text-t2">
              One connected ecosystem to build, run and grow world-class businesses. London · Dubai · Worldwide.
            </p>
          </div>
          {(["build", "run", "grow"] as const).map((p) => (
            <div key={p}>
              <h5 className="mb-4 text-[.78rem] font-bold uppercase tracking-[.1em] text-t3">{PILLARS[p].name}</h5>
              {col(p).map((c) => (
                <Link key={c.slug} href={`/sites/${c.slug}`} className="block py-[5px] text-[.88rem] text-t2 transition-colors hover:text-gold">
                  {c.name.replace("Mazidi ", "")}
                </Link>
              ))}
            </div>
          ))}
          <div>
            <h5 className="mb-4 text-[.78rem] font-bold uppercase tracking-[.1em] text-t3">Group</h5>
            {[["/about", "About"], ["/about#leadership", "Leadership"], ["/about#careers", "Careers"], ["/insights", "News"], ["/contact", "Contact"]].map(([href, label]) => (
              <Link key={href} href={href!} className="block py-[5px] text-[.88rem] text-t2 transition-colors hover:text-gold">
                {label}
              </Link>
            ))}
            <a href={PORTAL_URL} className="block py-[5px] text-[.88rem] text-t2 transition-colors hover:text-gold">Client Portal</a>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-line pt-7 text-[.8rem] text-t3">
          <span>
            © {new Date().getFullYear()} Mazidi Homes Limited. MazidiGroup is a brand of Mazidi Homes Limited.
          </span>
          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <Link href="/privacy" className="text-[.88rem] text-t2 transition-colors hover:text-gold">Privacy</Link>
            <span aria-hidden>·</span>
            <Link href="/privacy/request" className="text-[.88rem] text-t2 transition-colors hover:text-gold">Privacy Requests</Link>
            <span aria-hidden>·</span>
            <Link href="/privacy/complaints" className="text-[.88rem] text-t2 transition-colors hover:text-gold">Complaints</Link>
            <span aria-hidden>·</span>
            <span>Terms · Cookies · GDPR &amp; UAE PDPL compliant</span>
          </span>
        </div>
        <p className="mt-4 max-w-[640px] text-[.8rem] leading-relaxed text-t3">
          Mazidi Homes Limited is registered in England and Wales under company number 15350516. Registered
          office: Flat 55 Banstead Court, 60 Westway, London, England, W12 0QJ.
        </p>
      </Container>
    </footer>
  );
}
