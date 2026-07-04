import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { adminListCompanies, requireAdmin } from "@mazidi/api";
import { Pill, pillarBg, pillarKey } from "@mazidi/ui";
import { CompanyCreateForm, CompanyStatusSelect, ServiceAddForm } from "@/components/AdminControls";

export const dynamic = "force-dynamic";
const statusTone = (s: string) => (s === "LIVE" ? ("ok" as const) : s === "DRAFT" ? ("wait" as const) : ("bad" as const));

export default async function CompaniesPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const ctx = await requireAdmin(user);
  if (!ctx) redirect("/");
  const companies = await adminListCompanies(ctx);

  return (
    <>
      <div className="mb-7">
        <h2 className="mb-1 font-display text-[1.7rem] font-medium">Companies</h2>
        <p className="text-[.9rem] text-t2">
          Adding a company is configuration, not code (docs/01 §6). New tenants are DRAFT until published.
          Subdomain routing additionally needs the slug in <code className="rounded bg-bg3 px-1.5 py-0.5">TENANT_SLUGS</code> (deploy);
          the path route <code className="rounded bg-bg3 px-1.5 py-0.5">/sites/&#123;slug&#125;</code> works immediately.
        </p>
      </div>

      {ctx.isSuper && (
        <div className="mb-6 rounded-md border border-line bg-bg2 p-6">
          <h5 className="mb-4 text-[.95rem] font-semibold">Create company</h5>
          <CompanyCreateForm />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        {companies.map((c) => (
          <div key={c.id} className="rounded-md border border-line bg-bg2 p-6">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <b className="text-[1rem]">{c.name}</b>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[.62rem] font-bold uppercase ${pillarBg[pillarKey(c.pillar)]}`}>{c.pillar}</span>
                <span className="block text-[.78rem] text-t3">{c.slug}.mazidigroup.com · {c._count.customers} customers · {c._count.leads} leads · {c._count.invoices} invoices</span>
              </div>
              {ctx.isSuper ? <CompanyStatusSelect companyId={c.id} status={c.status} /> : <Pill tone={statusTone(c.status)}>{c.status}</Pill>}
            </div>
            <p className="mb-3 text-[.85rem] text-t2">{c.description}</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {c.services.map((s) => (
                <span key={s.id} className="rounded-full border border-line px-2.5 py-1 text-[.72rem] text-t3">
                  {s.name}{s.priceFrom ? ` · £${Number(s.priceFrom)}/mo` : ""}
                </span>
              ))}
              {c.services.length === 0 && <span className="text-[.78rem] text-t3">No services yet</span>}
            </div>
            <ServiceAddForm companyId={c.id} />
          </div>
        ))}
      </div>
    </>
  );
}
