"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { AppleMark, Arrow } from "@mazidi/ui";

export type ShowcaseItem = {
  slug: string;
  name: string;
  mono: string;
  pillar: "build" | "run" | "grow";
  pillarLabel: string;
  tagline: string;
  location: string;
  highlights: string[];
  href: string;
  external: boolean;
  cta: string;
  appStatus?: "live" | "pending";
  appUrl?: string;
};

const DUR = 5500;

const accent: Record<ShowcaseItem["pillar"], { chip: string; dot: string; glow: string; bar: string }> = {
  build: { chip: "bg-build/15 text-build", dot: "bg-build", glow: "rgba(192,138,78,.28)", bar: "bg-build" },
  run: { chip: "bg-run/15 text-run", dot: "bg-run", glow: "rgba(78,126,192,.28)", bar: "bg-run" },
  grow: { chip: "bg-grow/15 text-grow", dot: "bg-grow", glow: "rgba(63,163,114,.28)", bar: "bg-grow" },
};

/**
 * Hero spotlight: auto-rotates through every business with its real proof
 * points. Hovering pauses it; clicking a tab jumps. Purely presentational —
 * the data arrives serialised from the server component.
 */
export function HeroShowcase({ items }: { items: ShowcaseItem[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0); // restarts the progress animation on manual change

  useEffect(() => {
    if (paused || items.length < 2) return;
    const t = setTimeout(() => { setI((v) => (v + 1) % items.length); setTick((t) => t + 1); }, DUR);
    return () => clearTimeout(t);
  }, [i, paused, items.length, tick]);

  if (items.length === 0) return null;
  const it = items[i]!;
  const a = accent[it.pillar];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute -inset-10 rounded-[40px] opacity-70 blur-3xl transition-all duration-700"
        style={{ background: `radial-gradient(60% 60% at 50% 40%, ${a.glow}, transparent 70%)` }}
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-xl border border-line bg-bg2/80 shadow-lift backdrop-blur-xl">
        {/* tabs */}
        <div className="flex gap-1 border-b border-line p-2" role="tablist" aria-label="Businesses">
          {items.map((x, n) => (
            <button
              key={x.slug}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={x.name}
              title={x.name}
              onClick={() => { setI(n); setTick((t) => t + 1); }}
              className={clsx(
                "grid h-9 flex-1 place-items-center rounded-md text-[.72rem] font-bold transition-all duration-300",
                n === i ? accent[x.pillar].chip : "text-t3 hover:bg-bg3 hover:text-t2",
              )}
            >
              {x.mono}
            </button>
          ))}
        </div>

        {/* body */}
        <div key={it.slug} className="rise p-7 max-sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className={clsx("rounded-full px-[11px] py-[5px] text-[.68rem] font-bold uppercase tracking-[.1em]", a.chip)}>
              {it.pillarLabel}
            </span>
            <span className="text-[.76rem] text-t3">{it.location}</span>
          </div>
          <h3 className="mb-2 font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium leading-[1.1]">{it.name}</h3>
          <p className="mb-6 text-[.98rem] text-t2">{it.tagline}</p>
          <ul className="mb-7 space-y-2.5">
            {it.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-[.9rem]">
                <span className={clsx("mt-[8px] h-1.5 w-1.5 flex-none rounded-full", a.dot)} aria-hidden />
                {h}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {it.external ? (
              <a href={it.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[.88rem] font-semibold text-[#14100A] transition-colors hover:bg-gold-soft">
                {it.cta} <Arrow />
              </a>
            ) : (
              <Link href={it.href} className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[.88rem] font-semibold text-[#14100A] transition-colors hover:bg-gold-soft">
                {it.cta} <Arrow />
              </Link>
            )}
            {it.appStatus === "live" && it.appUrl && (
              <a href={it.appUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[.85rem] font-semibold text-t2 hover:text-t1">
                <AppleMark className="h-4 w-4" /> App Store
              </a>
            )}
            {it.appStatus === "pending" && (
              <span className="inline-flex items-center gap-1.5 text-[.82rem] font-semibold text-gold">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" aria-hidden /> Awaiting App Store approval
              </span>
            )}
          </div>
        </div>

        {/* progress */}
        <div className="h-[3px] w-full bg-line" aria-hidden>
          <div
            key={`${i}-${tick}`}
            className={clsx("h-full", a.bar, paused ? "" : "fill")}
            style={{ ["--dur" as string]: `${DUR}ms`, width: paused ? "100%" : undefined }}
          />
        </div>
      </div>
    </div>
  );
}
