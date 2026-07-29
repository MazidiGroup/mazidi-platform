import { listLiveCompanies } from "@mazidi/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/**
 * Shell for the MazidiPerformance privacy centre.
 *
 * Mirrors `app/(group)/layout.tsx` so the pages keep the site Header/Footer
 * chrome. It is a separate segment (not part of the `(group)` route group)
 * because these pages are served only on `mazidiperformance.mazidigroup.com`
 * via the middleware rewrite `/privacy* → /app-privacy/privacy*` — they are
 * app-scoped and must not be reachable on the apex group site.
 *
 * Unlike the group shell, this one renders the privacy links in the footer:
 * on this host the app notice IS the applicable notice.
 */
export const revalidate = 300; // marketing shell — ISR

export default async function AppPrivacyLayout({ children }: { children: React.ReactNode }) {
  const companies = await listLiveCompanies();
  const nav = companies.map((c) => ({ slug: c.slug, name: c.name, pillar: c.pillar }));
  return (
    <>
      <Header companies={nav} />
      <main>{children}</main>
      <Footer companies={nav} privacyLinks="app" />
    </>
  );
}
