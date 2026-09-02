import Link from "next/link";
import { clsx } from "clsx";
import { getCompanyProfile, PILLARS, type CompanyProfile } from "@mazidi/config";
import { pillarBg, pillarKey } from "../pillar";
import { Arrow } from "./Button";
import { AppleMark } from "./AppStoreBadge";

export interface CompanyCardData {
  slug: string;
  name: string;
  pillar: string; // DB enum: BUILD | RUN | GROW
  description: string | null;
  tagline?: string | null;
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

/** Status chip: App Store state for apps, pillar name otherwise. */
export function CompanyStatusChip({ company, profile }: { company: CompanyCardData; profile: CompanyProfile | null }) {
  const key = pillarKey(company.pillar);
  if (profile?.app) {
    return profile.app.status === "live" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-[11px] py-[5px] text-[.68rem] font-bold uppercase tracking-[.1em] text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden /> Live on iOS
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-[11px] py-[5px] text-[.68rem] font-bold uppercase tracking-[.1em] text-gold">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" aria-hidden /> In review
      </span>
    );
  }
  return (
    <span className={clsx("rounded-full px-[11px] py-[5px] text-[.68rem] font-bold uppercase tracking-[.1em]", pillarBg[key])}>
      {PILLARS[key].short}
    </span>
  );
}

/** Where a card's primary action should go: external site, App Store, or the tenant page. */
export function companyHref(company: { slug: string }, profile: CompanyProfile | null) {
  if (profile?.website) return { href: profile.website, external: true, label: new URL(profile.website).host.replace(/^www\./, "") };
  if (profile?.app?.status === "live" && profile.app.url) return { href: `/sites/${company.slug}`, external: false, label: "See the app" };
  return { href: `/sites/${company.slug}`, external: false, label: profile?.cta ?? "Learn more" };
}

/** Interactive company card — grids on the home, companies and pillar pages. */
export function CompanyCard({ company, className }: { company: CompanyCardData; className?: string }) {
  const key = pillarKey(company.pillar);
  const profile = getCompanyProfile(company.slug);
  const primary = companyHref(company, profile);
  const highlights = profile?.highlights ?? [];

  return (
    <div
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-lg border border-line bg-bg2 p-7 transition-all duration-300 ease-meridian hover:-translate-y-1 hover:border-line2 hover:shadow-lift",
        className,
      )}
    >
      <span
        className={clsx("absolute inset-x-0 top-0 h-[3px] transition-all group-hover:h-1.5", {
          build: "bg-build", run: "bg-run", grow: "bg-grow",
        }[key])}
        aria-hidden
      />
      <div className="mb-[18px] flex items-start justify-between gap-3">
        <CompanyLogo company={company} />
        <CompanyStatusChip company={company} profile={profile} />
      </div>
      <h4 className="mb-1 text-[1.15rem] font-semibold">{company.name}</h4>
      {profile?.location && <p className="mb-3 text-[.78rem] text-t3">{profile.location}</p>}
      <p className="mb-5 flex-1 text-[.9rem] text-t2">{company.tagline ?? company.description}</p>
      {highlights.length > 0 && (
        <ul className="mb-6 space-y-1.5">
          {highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-start gap-2 text-[.82rem] text-t2">
              <span className={clsx("mt-[7px] h-1 w-1 flex-none rounded-full", { build: "bg-build", run: "bg-run", grow: "bg-grow" }[key])} aria-hidden />
              {h}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2">
        {primary.external ? (
          <a
            href={primary.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[.9rem] font-semibold text-t1 transition-colors hover:text-gold"
          >
            {primary.label} <Arrow />
          </a>
        ) : (
          <Link href={primary.href} className="inline-flex items-center gap-2 text-[.9rem] font-semibold text-t1 transition-colors hover:text-gold">
            {primary.label} <Arrow />
          </Link>
        )}
        {profile?.app?.status === "live" && profile.app.url && (
          <a
            href={profile.app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[.82rem] font-semibold text-t2 transition-colors hover:text-t1"
          >
            <AppleMark className="h-3.5 w-3.5" /> App Store
          </a>
        )}
        {profile?.website && (
          <Link href={`/sites/${company.slug}`} className="text-[.82rem] font-semibold text-t3 transition-colors hover:text-t1">
            Overview
          </Link>
        )}
      </div>
    </div>
  );
}
