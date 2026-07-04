import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { ensureCustomer, getDashboard } from "@mazidi/api";
import { KPICard, Pill, pillarBg, pillarKey } from "@mazidi/ui";

export const dynamic = "force-dynamic";

const gbp = (n: number | string | { toString(): string }) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n));

const invoiceTone = (s: string) =>
  s === "PAID" ? ("ok" as const) : s === "OVERDUE" ? ("bad" as const) : ("wait" as const);

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const customer = await ensureCustomer(user);
  const { projects, invoices, activities, recommendations, outstanding } = await getDashboard(customer.id);
  const firstName = ((user.user_metadata?.full_name as string | undefined) ?? user.email ?? "there").split(" ")[0];

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
        <div>
          <h2 className="font-display text-[1.7rem] font-medium">Good day, {firstName}</h2>
          <p className="text-[.9rem] text-t2">One account · every Mazidi company working for you</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4 max-lg:grid-cols-2">
        <KPICard label="Active projects" value={String(projects.length)} />
        <KPICard label="Outstanding" value={gbp(outstanding)} delta={outstanding > 0 ? "due soon" : undefined} up={outstanding === 0} />
        <KPICard label="Invoices on file" value={String(invoices.length)} />
        <KPICard label="Recent activity" value={String(activities.length)} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        {/* Active projects */}
        <div className="rounded-md border border-line bg-bg2 p-6">
          <h5 className="mb-[18px] text-[.95rem] font-semibold">Active projects</h5>
          {projects.length === 0 && <Empty>No active projects yet.</Empty>}
          {projects.map((p) => (
            <div key={p.id} className="border-b border-line py-3 last:border-0">
              <div className="mb-1 flex items-center justify-between gap-3">
                <b className="text-[.9rem]">{p.name}</b>
                <span className={`rounded-full px-2 py-0.5 text-[.62rem] font-bold uppercase ${pillarBg[pillarKey(p.company.pillar)]}`}>
                  {p.company.name.replace("Mazidi ", "")}
                </span>
              </div>
              <div className="h-[5px] rounded-full bg-bg3">
                <div className="h-full rounded-full bg-gold" style={{ width: `${p.progress}%` }} />
              </div>
              <span className="mt-1 block text-[.76rem] text-t3">{p.progress}% complete</span>
            </div>
          ))}
        </div>

        {/* Activity feed — everything is CRM data */}
        <div className="rounded-md border border-line bg-bg2 p-6">
          <h5 className="mb-[18px] text-[.95rem] font-semibold">Activity</h5>
          {activities.length === 0 && <Empty>Activity from all your Mazidi companies appears here.</Empty>}
          <ul>
            {activities.map((a) => (
              <li key={a.id} className="flex gap-3 border-b border-line py-[11px] text-[.85rem] last:border-0">
                <div className="grid h-8 w-8 flex-none place-items-center rounded-[10px] bg-bg3">✦</div>
                <div>
                  <b className="font-semibold">{a.title}</b>
                  <span className="block text-[.76rem] text-t3">{a.at.toLocaleDateString("en-GB")}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="mb-6 rounded-md border border-line bg-bg2 p-6">
        <h5 className="mb-[18px] text-[.95rem] font-semibold">Recent invoices</h5>
        {invoices.length === 0 && <Empty>Invoices from every Mazidi company appear here — one billing view.</Empty>}
        {invoices.length > 0 && (
          <table className="w-full border-collapse text-[.87rem]">
            <thead>
              <tr>
                {["Invoice", "Company", "Amount", "Status"].map((h) => (
                  <th key={h} className="border-b border-line px-3.5 py-2.5 text-left text-[.7rem] font-bold uppercase tracking-[.08em] text-t3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-bg3">
                  <td className="border-b border-line px-3.5 py-3.5 font-semibold">{inv.number}</td>
                  <td className="border-b border-line px-3.5 py-3.5 text-t2">{inv.company.name}</td>
                  <td className="border-b border-line px-3.5 py-3.5 tabular-nums">{gbp(Number(inv.amount) + Number(inv.tax))}</td>
                  <td className="border-b border-line px-3.5 py-3.5"><Pill tone={invoiceTone(inv.status)}>{inv.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Cross-sell recommendations (docs/01 Journey C — automation-driven) */}
      {recommendations.length > 0 && (
        <div className="rounded-md border border-gold bg-bg2 p-6">
          <h5 className="mb-[18px] text-[.95rem] font-semibold">
            ✦ Recommended for you{" "}
            <small className="font-normal text-t3">companies in the ecosystem you&apos;re not using yet</small>
          </h5>
          <div className="grid grid-cols-3 gap-3.5 max-lg:grid-cols-1">
            {recommendations.map((c) => (
              <div key={c.slug} className="flex items-center gap-3.5 rounded-[14px] bg-bg3 p-3.5">
                <div className={`grid h-10 w-10 flex-none place-items-center rounded-[12px] text-[.8rem] font-bold ${pillarBg[pillarKey(c.pillar)]}`}>
                  {(c.brand as { mono?: string } | null)?.mono ?? c.name.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <b className="block truncate text-[.86rem]">{c.name}</b>
                  <span className="text-[.75rem] text-t3">One-click intro · shared documents</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-4 text-[.88rem] text-t3">{children}</p>;
}
