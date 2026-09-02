import Link from "next/link";
import { clsx } from "clsx";
import type { CompanyProfile } from "@mazidi/config";
import { AppStoreBadge, Arrow, type CompanyCardData } from "@mazidi/ui";

const screens: Record<string, { from: string; to: string; label: string }> = {
  musclemap: { from: "#1B2A4A", to: "#0E1424", label: "Anatomy · Watch · AI" },
  fitnessmusclecoach: { from: "#2A1F4A", to: "#120E24", label: "Coach · Client" },
  footballacademy: { from: "#123A2C", to: "#0B1A14", label: "Coach · Player" },
  reraprep: { from: "#2D3A8C", to: "#141A3A", label: "120 questions · cited" },
};

/** iOS apps, each in a CSS phone frame with its App Store state. */
export function AppsShowcase({ apps }: { apps: { company: CompanyCardData; profile: CompanyProfile }[] }) {
  return (
    <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {apps.map(({ company, profile }) => {
        const s = screens[company.slug] ?? screens.musclemap!;
        const live = profile.app?.status === "live";
        const mono = (company.brand as { mono?: string } | null)?.mono ?? company.name.slice(0, 2).toUpperCase();
        return (
          <div key={company.slug} className="group flex flex-col rounded-lg border border-line bg-bg2 p-6 transition-all duration-300 ease-meridian hover:-translate-y-1 hover:border-line2 hover:shadow-lift">
            {/* phone */}
            <Link href={`/sites/${company.slug}`} className="mx-auto mb-6 block w-[150px]" aria-label={`${company.name} overview`}>
              <div className="relative aspect-[9/18] overflow-hidden rounded-[26px] border-[5px] border-[#1A1E29] bg-[#0B0D12] shadow-[0_20px_50px_rgba(0,0,0,.45)] transition-transform duration-500 ease-meridian group-hover:-rotate-2 group-hover:scale-[1.03]">
                <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${s.from}, ${s.to})` }} />
                <div className="absolute left-1/2 top-2 h-[14px] w-[46px] -translate-x-1/2 rounded-full bg-[#1A1E29]" aria-hidden />
                <div className="absolute inset-x-0 top-10 flex flex-col items-center gap-2 px-3 text-center text-white">
                  <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-white/10 text-[.95rem] font-bold backdrop-blur">{mono}</div>
                  <div className="text-[.72rem] font-semibold leading-tight">{company.name}</div>
                  <div className="text-[.58rem] uppercase tracking-[.12em] text-white/60">{s.label}</div>
                </div>
                <div className="absolute inset-x-3 bottom-4 space-y-1.5" aria-hidden>
                  <div className="h-2 w-3/4 rounded bg-white/15" />
                  <div className="h-2 w-1/2 rounded bg-white/10" />
                  <div className="mt-3 h-7 rounded-lg bg-white/20" />
                </div>
                {!live && (
                  <div className="absolute inset-x-0 bottom-0 bg-gold py-1 text-center text-[.55rem] font-bold uppercase tracking-[.12em] text-[#14100A]">
                    In review
                  </div>
                )}
              </div>
            </Link>
            <h4 className="mb-1 text-[1.05rem] font-semibold">{company.name}</h4>
            <p className="mb-3 flex-1 text-[.86rem] text-t2">{company.tagline ?? company.description}</p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {(profile.app?.platforms ?? []).map((p) => (
                <span key={p} className={clsx("rounded-full border border-line px-2.5 py-1 text-[.7rem]", p === "Apple Watch" ? "text-gold" : "text-t3")}>{p}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <AppStoreBadge status={profile.app?.status ?? "pending"} url={profile.app?.url} size="sm" />
              <Link href={`/sites/${company.slug}`} className="inline-flex items-center gap-1.5 text-[.82rem] font-semibold text-t2 hover:text-gold">
                Details <Arrow />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
