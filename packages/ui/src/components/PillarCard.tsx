import Link from "next/link";
import { clsx } from "clsx";
import type { PillarMeta } from "@mazidi/config";
import { Arrow } from "./Button";

const topBar: Record<string, string> = {
  build: "before:bg-build", run: "before:bg-run", grow: "before:bg-grow",
};

/** Large interactive pillar card — Home Section 1 (docs/01). */
export function PillarCard({
  pillar, index, companies,
}: { pillar: PillarMeta; index: number; companies: string[] }) {
  return (
    <Link
      href={`/${pillar.key}`}
      className={clsx(
        "group relative overflow-hidden rounded-lg border border-line bg-bg2 px-[34px] py-10 transition-all duration-300 ease-meridian",
        "hover:-translate-y-1.5 hover:border-line2 hover:shadow-lift",
        "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:transition-all group-hover:before:h-1.5",
        topBar[pillar.key],
      )}
    >
      <span className="mb-[26px] block font-display text-[.95rem] text-t3">0{index + 1}</span>
      <h3 className="mb-3 font-display text-[clamp(1.3rem,2vw,1.55rem)] font-medium">{pillar.name}</h3>
      <p className="mb-6 text-[.95rem] text-t2">{pillar.blurb}</p>
      <ul className="mb-7">
        {companies.map((name) => (
          <li key={name} className="flex items-center gap-[9px] border-b border-line py-[7px] text-[.88rem] text-t2">
            <span className={clsx("h-1 w-1 rounded-full", { build: "bg-build", run: "bg-run", grow: "bg-grow" }[pillar.key])} />
            {name}
          </li>
        ))}
      </ul>
      <span className="inline-flex items-center gap-2 text-[.9rem] font-semibold group-hover:text-gold">
        Explore {pillar.name} <Arrow />
      </span>
    </Link>
  );
}
