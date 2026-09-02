import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@mazidi/ui";
import type { GalleryImage } from "@/lib/gallery";

/**
 * Auto-scrolling strip of real Mazidi Construction photos. Every image is
 * our own work on a real client project — no stock, no renders.
 */
export function PhotoStrip({ images }: { images: GalleryImage[] }) {
  const row = [...images, ...images];
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent max-sm:w-6" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent max-sm:w-6" aria-hidden />
      <div className="marquee items-end gap-4" style={{ animationDuration: "70s" }}>
        {row.map((img, n) => (
          <Link
            key={`${img.src}-${n}`}
            href="/sites/construction#portfolio"
            className="group relative block h-[300px] flex-none overflow-hidden rounded-md border border-line bg-bg2 max-sm:h-[220px]"
            style={{ width: Math.round((300 * img.tw) / img.th) }}
            aria-hidden={n >= images.length}
            tabIndex={n >= images.length ? -1 : undefined}
          >
            <Image
              src={`/gallery/construction/thumb/${img.src}`}
              alt={`${img.project} — ${img.cat}`}
              width={img.tw}
              height={img.th}
              sizes="(max-width: 640px) 60vw, 300px"
              className="h-full w-full object-cover transition-transform duration-700 ease-meridian group-hover:scale-[1.06]"
            />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-[#0B0D12]/85 to-transparent p-3.5 text-[.74rem] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="font-semibold">{img.project}</span>
              <span className="opacity-80">{img.cat}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Link href="/sites/construction#portfolio" className="inline-flex items-center gap-2 text-[.9rem] font-semibold text-t2 transition-colors hover:text-gold">
          See all {images.length > 0 ? "191" : ""} photos from 28+ projects <Arrow />
        </Link>
      </div>
    </div>
  );
}
