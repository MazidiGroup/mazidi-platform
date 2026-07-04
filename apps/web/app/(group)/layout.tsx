import { listLiveCompanies } from "@mazidi/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const revalidate = 300; // marketing shell — ISR

export default async function GroupLayout({ children }: { children: React.ReactNode }) {
  const companies = await listLiveCompanies();
  const nav = companies.map((c) => ({ slug: c.slug, name: c.name, pillar: c.pillar }));
  return (
    <>
      <Header companies={nav} />
      <main>{children}</main>
      <Footer companies={nav} />
    </>
  );
}
