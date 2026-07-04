import type { MetadataRoute } from "next";
import { listLiveCompanies, listPosts } from "@mazidi/api";
import { SITE_URL } from "@mazidi/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [companies, posts] = await Promise.all([listLiveCompanies(), listPosts(100)]);
  const statics = ["", "/build", "/run", "/grow", "/companies", "/insights", "/about", "/contact"];
  return [
    ...statics.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const })),
    ...companies.map((c) => ({ url: `${SITE_URL}/sites/${c.slug}`, changeFrequency: "weekly" as const })),
    ...posts.map((p) => ({ url: `${SITE_URL}/insights#${p.slug}`, changeFrequency: "monthly" as const })),
  ];
}
