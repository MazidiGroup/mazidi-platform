/** Infinite proof-point ticker under the hero — only verifiable facts. */
export function ProofTicker({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line bg-bg2/60 py-4" aria-label="Facts about Mazidi Group">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" aria-hidden />
      <div className="marquee gap-10 px-5">
        {row.map((t, n) => (
          <span key={n} className="flex items-center gap-10 whitespace-nowrap text-[.82rem] font-semibold uppercase tracking-[.12em] text-t2" aria-hidden={n >= items.length}>
            {t}
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}
