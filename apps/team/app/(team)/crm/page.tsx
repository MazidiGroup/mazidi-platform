import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { ensureEmployee, listDealsBoard, listLeadIdsWithDeals, listLeads, listScopeCompanies, type LeadViewFilter } from "@mazidi/api";
import { DEAL_STAGES } from "@mazidi/api/schemas";
import { Pill, pillarBg, pillarKey } from "@mazidi/ui";
import { DealAdvanceButton, DealCreateForm, DealFromLeadButton, LeadStatusSelect } from "@/components/TeamControls";

export const dynamic = "force-dynamic";

const gbp = (n: unknown) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(Number(n));
const BOARD = DEAL_STAGES.filter((s) => s !== "LOST");

const LEAD_VIEWS: { key: LeadViewFilter; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
];

export default async function CrmPage({
  searchParams,
}: { searchParams: Promise<{ leads?: string }> }) {
  const user = await getUser();
  if (!user) redirect("/login");
  const ctx = await ensureEmployee(user);
  if (!ctx) redirect("/");
  const params = await searchParams;
  const view: LeadViewFilter = params.leads === "closed" || params.leads === "all" ? params.leads : "active";
  const [leads, deals, leadIdsWithDeals, companies] = await Promise.all([
    listLeads(ctx, view), listDealsBoard(ctx), listLeadIdsWithDeals(ctx), listScopeCompanies(ctx),
  ]);

  return (
    <>
      <div className="mb-7">
        <h2 className="mb-1 font-display text-[1.7rem] font-medium">CRM</h2>
        <p className="text-[.9rem] text-t2">Leads and pipeline for your companies. Every change writes Activity; wins fire the cross-sell engine.</p>
      </div>

      <div className="mb-6 rounded-md border border-line bg-bg2 p-6">
        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
          <h5 className="text-[.95rem] font-semibold">Leads <small className="font-normal text-t3">website forms land here automatically</small></h5>
          <div className="flex gap-1.5">
            {LEAD_VIEWS.map((v) => (
              <Link
                key={v.key}
                href={v.key === "active" ? "/crm" : `/crm?leads=${v.key}`}
                className={`rounded-full border px-3.5 py-1.5 text-[.78rem] font-semibold transition-colors ${
                  view === v.key ? "border-gold text-gold" : "border-line2 text-t2 hover:text-t1"
                }`}
              >
                {v.label}
              </Link>
            ))}
          </div>
        </div>
        {leads.length === 0 ? (
          <p className="py-4 text-[.88rem] text-t3">
            {view === "active"
              ? "No active leads — new website enquiries land here. Graduated and lost leads are under Closed."
              : view === "closed"
                ? "No closed leads yet — CONVERTED and LOST leads are archived here with their linked deals."
                : "No leads in scope yet — submit the contact form on the group site to see one arrive."}
          </p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[.87rem]">
            <thead>
              <tr>
                {["Contact", "Company", "Source", "Captured", "Status", "Deal"].map((h) => (
                  <th key={h} className="border-b border-line px-3.5 py-2.5 text-left text-[.7rem] font-bold uppercase tracking-[.08em] text-t3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-bg3">
                  <td className="border-b border-line px-3.5 py-3">
                    <b>{lead.contact.name}</b>
                    <span className="block text-[.76rem] text-t3">{lead.contact.email}</span>
                  </td>
                  <td className="border-b border-line px-3.5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[.62rem] font-bold uppercase ${pillarBg[pillarKey(lead.company.pillar)]}`}>
                      {lead.company.name.replace("Mazidi ", "")}
                    </span>
                  </td>
                  <td className="border-b border-line px-3.5 py-3 text-t2">{lead.source.replace("_", " ").toLowerCase()}</td>
                  <td className="border-b border-line px-3.5 py-3 text-t2">{lead.createdAt.toLocaleDateString("en-GB")}</td>
                  <td className="border-b border-line px-3.5 py-3"><LeadStatusSelect leadId={lead.id} status={lead.status} /></td>
                  <td className="border-b border-line px-3.5 py-3">
                    {leadIdsWithDeals.has(lead.id) ? (
                      <Pill tone="ok">linked</Pill>
                    ) : lead.status === "CONVERTED" ? (
                      <DealFromLeadButton leadId={lead.id} contactName={lead.contact.name} />
                    ) : (
                      <span className="text-[.76rem] text-t3">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <div className="rounded-md border border-line bg-bg2 p-6">
        <h5 className="mb-[18px] text-[.95rem] font-semibold">Deal pipeline</h5>
        <div className="mb-5 rounded-[14px] bg-bg3 p-4">
          <DealCreateForm companies={companies} />
        </div>
        <div className="grid grid-cols-5 gap-3.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {BOARD.map((stage) => {
            const col = deals.filter((d) => d.stage === stage);
            return (
              <div key={stage} className="rounded-[14px] bg-bg3 p-3.5">
                <h6 className="mb-3 flex justify-between text-[.72rem] font-bold uppercase tracking-[.08em] text-t3">
                  {stage}<span>{col.length}</span>
                </h6>
                {col.map((deal) => (
                  <div key={deal.id} className="mb-2.5 rounded-xl border border-line bg-bg2 p-3.5">
                    <b className="block text-[.84rem]">{deal.title}</b>
                    <span className="text-[.74rem] text-t3">{gbp(deal.value)} · {deal.probability}%</span>
                    {deal.lead && (
                      <span className="mt-0.5 block truncate text-[.72rem] text-t3">
                        ↳ from lead: <span className="text-t2">{deal.lead.contact.name}</span>
                      </span>
                    )}
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[.6rem] font-bold uppercase ${pillarBg[pillarKey(deal.company.pillar)]}`}>
                        {deal.company.name.replace("Mazidi ", "")}
                      </span>
                      {stage === "WON" ? <Pill tone="ok">won</Pill> : <DealAdvanceButton dealId={deal.id} stage={deal.stage} />}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
