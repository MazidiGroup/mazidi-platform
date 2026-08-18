"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GalleryImage } from "@/lib/gallery";

/**
 * Portfolio gallery — category filter pills, masonry grid of pre-optimized
 * thumbnails, and a keyboard-navigable lightbox serving the 1600px renditions.
 * All assets are static under /gallery/<site>/.
 */
export function PortfolioGallery({ site, categories, images }: {
  site: string;
  categories: string[];
  images: GalleryImage[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const shown = useMemo(
    () => (active ? images.filter((i) => i.cat === active) : images),
    [active, images],
  );

  const step = useCallback(
    (d: number) => setOpen((v) => (v === null ? v : (v + d + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of images) c[i.cat] = (c[i.cat] ?? 0) + 1;
    return c;
  }, [images]);

  const current = open !== null ? shown[open] : null;

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter portfolio by category">
        {[null, ...categories].map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat ?? "all"}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => { setActive(cat); setOpen(null); }}
              className={`rounded-full border px-4 py-2 text-[.84rem] font-medium transition-colors ${
                isActive
                  ? "border-gold bg-gold text-[#14100A]"
                  : "border-line2 text-t2 hover:border-gold hover:text-gold"
              }`}
            >
              {cat ?? "All work"}
              <span className={`ml-1.5 text-[.72rem] ${isActive ? "opacity-70" : "text-t3"}`}>
                {cat ? counts[cat] : images.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Masonry grid — CSS columns keep varied aspect ratios tidy */}
      <div className="columns-3 gap-4 max-lg:columns-2 max-sm:columns-1">
        {shown.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative mb-4 block w-full overflow-hidden rounded-lg border border-line bg-bg2 text-left"
            aria-label={`View ${img.project} photo full size`}
          >
            <img
              src={`/gallery/${site}/thumb/${img.src}`}
              alt={`${img.project} — ${img.cat}`}
              width={img.tw}
              height={img.th}
              loading="lazy"
              className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-[.78rem] font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {img.project}
              <span className="ml-2 text-[.68rem] uppercase tracking-[.08em] text-white/60">{img.cat}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${current.project} — photo ${open! + 1} of ${shown.length}`}
          onClick={() => setOpen(null)}
        >
          <img
            src={`/gallery/${site}/full/${current.src}`}
            alt={`${current.project} — ${current.cat}`}
            width={current.w}
            height={current.h}
            className="max-h-[86vh] w-auto max-w-full rounded-md object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className="absolute inset-x-0 bottom-4 mx-auto flex w-fit items-center gap-4 rounded-full bg-black/60 px-5 py-2.5 text-[.85rem] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="transition-colors hover:text-gold">←</button>
            <span className="whitespace-nowrap">
              {current.project} · {open! + 1} / {shown.length}
            </span>
            <button type="button" onClick={() => step(1)} aria-label="Next photo" className="transition-colors hover:text-gold">→</button>
          </div>
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Close gallery"
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-black/60 text-lg text-white transition-colors hover:text-gold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
