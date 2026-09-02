import Link from "next/link";
import { clsx } from "clsx";
import type { PillarMeta } from "@mazidi/config";
import { Arrow } from "./Button";

const topBar: Record<string, string> = {
  build: "before:bg-build", run: "before:bg-run", grow: "before:bg-grow",
};
const glow: Record<string, string> = {
  build: "rgba(192,138,78,.18)", run: "rgba(78,126,192,.18)", grow: "rgba(63,163,114,.18)",
};

/** Large interactive pillar card — Home "What we do". */
export function PillarCard({
  pillar, index, companies,
}: { pillar: PillarMeta; index: number; companies: { slug: string; name: string; note?: string }[] }) {
  return (
    <Link
      href={`/${pillar.slug}`}
      className={clsx(
        "group relative overflow-hidden rounded-lg border border-line bg-bg2 px-[34px] py-10 transition-all duration-300 ease-meridian",
        "hover:-translate-y-1.5 hover:border-line2 hover:shadow-lift",
        "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:transition-all group-hover:before:h-1.5",
        topBar[pillar.key],
      )}
    >
      <span
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: glow[pillar.key] }}
        aria-hidden
      />
      <span className="mb-[26px] block font-display text-[.95rem] text-t3">0{index + 1}</span>
      <h3 className="mb-3 font-display text-[clamp(1.3rem,2vw,1.55rem)] font-medium">{pillar.name}</h3>
      <p className="mb-6 text-[.95rem] text-t2">{pillar.blurb}</p>
      <ul className="mb-7">
        {companies.map((c) => (
          <li key={c.slug} className="flex items-center justify-between gap-3 border-b border-line py-[9px] text-[.9rem]">
            <span className="flex items-center gap-[9px] text-t1">
              <span className={clsx("h-1 w-1 rounded-full", { build: "bg-build", run: "bg-run", grow: "bg-grow" }[pillar.key])} />
              {c.name}
            </span>
            {c.note && <span className="text-[.74rem] text-t3">{c.note}</span>}
          </li>
        ))}
      </ul>
      <span className="inline-flex items-center gap-2 text-[.9rem] font-semibold group-hover:text-gold">
        Explore {pillar.short} <Arrow />
      </span>
    </Link>
  );
}
