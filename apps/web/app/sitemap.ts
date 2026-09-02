import type { MetadataRoute } from "next";
import { listLiveCompanies } from "@mazidi/api";
import { PILLAR_KEYS, PILLARS, SITE_URL } from "@mazidi/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const companies = await listLiveCompanies();
  const statics = ["", ...PILLAR_KEYS.map((k) => `/${PILLARS[k].slug}`), "/companies", "/about", "/contact", "/rera-privacy"];
  return [
    ...statics.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const })),
    ...companies.map((c) => ({ url: `${SITE_URL}/sites/${c.slug}`, changeFrequency: "weekly" as const })),
  ];
}
