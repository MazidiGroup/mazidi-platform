import Link from "next/link";
import { GROUP_CONTACT, PILLAR_KEYS, PILLARS } from "@mazidi/config";
import { Container } from "@mazidi/ui";
import { Logo } from "./Logo";

type NavCompany = { slug: string; name: string; pillar: string };

export function Footer({ companies }: { companies: NavCompany[] }) {
  const col = (pillar: string) => companies.filter((c) => c.pillar.toLowerCase() === pillar);

  return (
    <footer className="mt-10 border-t border-line pb-9 pt-[72px]">
      <Container>
        <div className="mb-14 grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <div>
            <Logo />
            <p className="mt-3.5 max-w-[300px] text-[.86rem] text-t2">
              Property, construction, IT services and iOS apps — a family of businesses run from London and Dubai.
            </p>
            <div className="mt-5 space-y-1 text-[.86rem]">
              <a href={`mailto:${GROUP_CONTACT.email}`} className="block text-t2 transition-colors hover:text-gold">{GROUP_CONTACT.email}</a>
              <a href={`tel:${GROUP_CONTACT.phone}`} className="block text-t2 transition-colors hover:text-gold">{GROUP_CONTACT.phoneDisplay}</a>
            </div>
          </div>
          {PILLAR_KEYS.map((p) => (
            <div key={p}>
              <h5 className="mb-4 text-[.78rem] font-bold uppercase tracking-[.1em] text-t3">{PILLARS[p].name}</h5>
              {col(p).map((c) => (
                <Link key={c.slug} href={`/sites/${c.slug}`} className="block py-[5px] text-[.88rem] text-t2 transition-colors hover:text-gold">
                  {c.name}
                </Link>
              ))}
            </div>
          ))}
          <div>
            <h5 className="mb-4 text-[.78rem] font-bold uppercase tracking-[.1em] text-t3">Group</h5>
            {[["/about", "About"], ["/companies", "All businesses"], ["/contact", "Contact"], ["/rera-privacy", "RERA app privacy"]].map(([href, label]) => (
              <Link key={href} href={href!} className="block py-[5px] text-[.88rem] text-t2 transition-colors hover:text-gold">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-line pt-7 text-[.8rem] text-t3">
          <span>© {new Date().getFullYear()} Mazidi Group. Mazidi Homes Limited (England & Wales, no. 15350516) · Aimal Mazidi Real Estate L.L.C (Dubai, RERA ORN 47322).</span>
          <span>London · Dubai</span>
        </div>
      </Container>
    </footer>
  );
}
