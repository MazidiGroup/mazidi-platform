import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { getAdminOverview, requireAdmin } from "@mazidi/api";
import { KPICard, Pill, pillarBg, pillarKey } from "@mazidi/ui";

export const dynamic = "force-dynamic";
const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

export default async function OverviewPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const ctx = await requireAdmin(user);
  if (!ctx) redirect("/");
  const o = await getAdminOverview(ctx);
  const maxRev = Math.max(1, ...o.revenueByCompany.map((r) => r.amount));

  return (
    <>
      <div className="mb-7">
        <h2 className="mb-1 font-display text-[1.7rem] font-medium">Group overview</h2>
        <p className="text-[.9rem] text-t2">{ctx.isSuper ? "All companies" : "Your companies"} · live system analytics</p>
      </div>
      <div className="mb-6 grid grid-cols-4 gap-4 max-lg:grid-cols-2">
        <KPICard label="Revenue (paid invoices)" value={gbp(o.totalRevenue)} />
        <KPICard label="Open pipeline" value={gbp(o.openPipeline)} />
        <KPICard label="Customers" value={String(o.customers)} />
        <KPICard label="New leads" value={String(o.newLeads)} />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className="rounded-md border border-line bg-bg2 p-6">
          <h5 className="mb-[18px] text-[.95rem] font-semibold">Revenue by company</h5>
          {o.revenueByCompany.length === 0 && <p className="py-3 text-[.88rem] text-t3">No paid invoices yet.</p>}
          {o.revenueByCompany.map((r) => (
            <div key={r.company} className="mb-3">
              <div className="mb-1 flex justify-between text-[.82rem]"><span>{r.company}</span><b className="tabular-nums">{gbp(r.amount)}</b></div>
              <div className="h-[6px] rounded-full bg-bg3"><div className="h-full rounded-full bg-gold" style={{ width: `${(r.amount / maxRev) * 100}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-line bg-bg2 p-6">
          <h5 className="mb-[18px] text-[.95rem] font-semibold">Automation events <small className="font-normal text-t3">outbox → n8n</small></h5>
          <ul>
            {o.outbox.length === 0 && <p className="py-3 text-[.88rem] text-t3">Domain events appear here as they fire.</p>}
            {o.outbox.map((e) => (
              <li key={e.id} className="flex items-center gap-3 border-b border-line py-2.5 text-[.85rem] last:border-0">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-[9px] bg-bg3">⚡</span>
                <b className="flex-1 truncate font-semibold">{e.event}</b>
                <Pill tone={e.processedAt ? "ok" : "wait"}>{e.processedAt ? "processed" : "pending"}</Pill>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rounded-md border border-line bg-bg2 p-6">
        <h5 className="mb-[18px] text-[.95rem] font-semibold">Audit trail <small className="font-normal text-t3">admin mutations</small></h5>
        {o.auditTrail.length === 0 ? <p className="py-3 text-[.88rem] text-t3">Admin actions are recorded here.</p> : (
          <ul>
            {o.auditTrail.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-b border-line py-2.5 text-[.85rem] last:border-0">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-[9px] bg-bg3">≡</span>
                <div className="min-w-0 flex-1"><b className="font-semibold">{a.action}</b> <span className="text-t3">· {a.entity}</span></div>
                <span className="text-[.76rem] text-t3">{a.at.toLocaleString("en-GB")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
