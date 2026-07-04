import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { ensureEmployee, getTeamDashboard } from "@mazidi/api";
import { KPICard } from "@mazidi/ui";

export const dynamic = "force-dynamic";

const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

export default async function TeamDashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const ctx = await ensureEmployee(user);
  if (!ctx) redirect("/");
  const { newLeads, pipelineValue, myOpenTasks, wonDeals, activities } = await getTeamDashboard(ctx, user.id);

  return (
    <>
      <div className="mb-7">
        <h2 className="mb-1 font-display text-[1.7rem] font-medium">Team dashboard</h2>
        <p className="text-[.9rem] text-t2">Scoped to your companies — every number below respects your memberships.</p>
      </div>
      <div className="mb-6 grid grid-cols-4 gap-4 max-lg:grid-cols-2">
        <KPICard label="Open pipeline" value={gbp(pipelineValue)} />
        <KPICard label="New leads" value={String(newLeads)} delta={newLeads > 0 ? "awaiting triage" : undefined} up={newLeads === 0} />
        <KPICard label="My open tasks" value={String(myOpenTasks)} />
        <KPICard label="Deals won" value={String(wonDeals)} />
      </div>
      <div className="rounded-md border border-line bg-bg2 p-6">
        <h5 className="mb-[18px] text-[.95rem] font-semibold">Activity <small className="font-normal text-t3">all companies in your scope</small></h5>
        {activities.length === 0 ? (
          <p className="py-4 text-[.88rem] text-t3">CRM activity appears here — forms, status changes, payments, task completions.</p>
        ) : (
          <ul>
            {activities.map((a) => (
              <li key={a.id} className="flex gap-3 border-b border-line py-[11px] text-[.85rem] last:border-0">
                <div className="grid h-8 w-8 flex-none place-items-center rounded-[10px] bg-bg3">✦</div>
                <div>
                  <b className="font-semibold">{a.title}</b>
                  <span className="block text-[.76rem] text-t3">{a.kind} · {a.at.toLocaleString("en-GB")}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
