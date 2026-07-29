import type { MetadataRoute } from "next";
import { APP_PRIVACY_PREFIX, SITE_URL } from "@mazidi/config";

export default function robots(): MetadataRoute.Robots {
  return {
    // APP_PRIVACY_PREFIX is the internal segment behind the MazidiPerformance
    // privacy centre; the public URL is /privacy*. Keep the internal path out of
    // search results so it never surfaces as a second, group-looking URL.
    rules: { userAgent: "*", allow: "/", disallow: APP_PRIVACY_PREFIX },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
