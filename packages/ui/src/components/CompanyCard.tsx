import Link from "next/link";
import { clsx } from "clsx";
import { PILLARS } from "@mazidi/config";
import { pillarBg, pillarKey } from "../pillar";
import { Arrow } from "./Button";

export interface CompanyCardData {
  slug: string;
  name: string;
  pillar: string; // DB enum: BUILD | RUN | GROW
  description: string | null;
  brand: unknown; // { mono?: string }
  services?: { slug: string; name: string }[];
}

export function CompanyLogo({ company, size = 46 }: { company: CompanyCardData; size?: number }) {
  const key = pillarKey(company.pillar);
  const mono =
    (company.brand as { mono?: string } | null)?.mono ??
    company.name.replace("Mazidi ", "").slice(0, 2).toUpperCase();
  return (
    <div
      className={clsx("grid place-items-center font-bold", pillarBg[key])}
      style={{ width: size, height: size, borderRadius: size / 3.4, fontSize: size / 3 }}
      aria-hidden
    >
      {mono}
    </div>
  );
}

/** Interactive company card — grid item (docs/01 §Home Section 2). */
export function CompanyCard({ company }: { company: CompanyCardData }) {
  const key = pillarKey(company.pillar);
  const pillar = PILLARS[key];
  return (
    <Link
      href={`/sites/${company.slug}`}
      className="group flex flex-col rounded-md border border-line bg-bg2 p-7 transition-all duration-300 ease-meridian hover:-translate-y-1 hover:border-line2 hover:shadow-lift"
    >
      <div className="mb-[18px] flex items-start justify-between">
        <CompanyLogo company={company} />
        <span className={clsx("rounded-full px-[11px] py-[5px] text-[.68rem] font-bold uppercase tracking-[.1em]", pillarBg[key])}>
          {pillar.name}
        </span>
      </div>
      <h4 className="mb-[7px] text-[1.08rem] font-semibold">{company.name}</h4>
      <p className="mb-4 flex-1 text-[.87rem] text-t2">{company.description}</p>
      {company.services && company.services.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {company.services.slice(0, 4).map((s) => (
            <span key={s.slug} className="rounded-full border border-line px-2.5 py-1 text-[.72rem] text-t3">
              {s.name}
            </span>
          ))}
        </div>
      )}
      <span className="inline-flex items-center gap-2 text-[.9rem] font-semibold text-t1 group-hover:text-gold">
        Visit website <Arrow />
      </span>
    </Link>
  );
}
