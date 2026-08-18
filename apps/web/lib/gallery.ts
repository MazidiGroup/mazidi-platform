import constructionGallery from "./gallery/construction.json";

export type GalleryImage = {
  /** Display category, e.g. "Shower Rooms" */
  cat: string;
  /** Category slug used in asset paths */
  catSlug: string;
  /** Human project name parsed from the source album, e.g. "Bathroom renovation Neasden" */
  project: string;
  /** Path relative to /gallery/<site>/{full,thumb}/ */
  src: string;
  w: number;
  h: number;
  tw: number;
  th: number;
};

export type SiteGallery = { categories: string[]; images: GalleryImage[] };

/**
 * Static portfolio galleries keyed by tenant slug. Assets live in
 * apps/web/public/gallery/<slug>/{full,thumb}/ — pre-optimized (max 1600px /
 * 640px, mozjpeg) by scripts/optimize-gallery.js so nothing heavy ships.
 * Add a tenant by dropping photos + a manifest; sites without an entry
 * simply don't render the Portfolio section.
 */
const GALLERIES: Record<string, SiteGallery> = {
  construction: constructionGallery as SiteGallery,
};

export function getSiteGallery(slug: string): SiteGallery | null {
  return GALLERIES[slug] ?? null;
}

/**
 * Public review-platform profiles per tenant (rendered as a verified-reviews
 * band linking out — live source of truth stays on the platform).
 */
export const REVIEW_PROFILES: Record<
  string,
  { platform: string; url: string; rating: string; reviewCount: number; memberSince?: string }
> = {
  construction: {
    platform: "Checkatrade",
    url: "https://www.checkatrade.com/trades/HarisBuilders",
    rating: "9.9",
    reviewCount: 15,
  },
};
