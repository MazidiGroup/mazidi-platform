import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { ensureCustomer, getBillingOverview, reconcileCheckoutSession } from "@mazidi/api";
import { Pill, pillarBg, pillarKey } from "@mazidi/ui";
import { ManageBillingButton, SubscribeButton } from "@/components/BillingButtons";

export const dynamic = "force-dynamic";

const gbp = (n: unknown) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(n));
const subTone = (s: string) =>
  s === "active" || s === "trialing" ? ("ok" as const) : s === "canceled" ? ("bad" as const) : ("wait" as const);

export default async function BillingPage({
  searchParams,
}: { searchParams: Promise<{ subscribed?: string; canceled?: string; session_id?: string }> }) {
  const user = await getUser();
  if (!user) redirect("/login");
  const [customer, params] = await Promise.all([ensureCustomer(user), searchParams]);
  if (params.subscribed && params.session_id) {
    await reconcileCheckoutSession(customer.id, params.session_id).catch((e) =>
      console.error("checkout reconcile failed (webhook will catch up)", e),
    );
  }
  const { subscriptions, plans } = await getBillingOverview(customer.id);
  const subscribedServiceIds = new Set(subscriptions.filter((s) => s.status !== "canceled").map((s) => s.serviceId));

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
        <div>
          <h2 className="mb-1 font-display text-[1.7rem] font-medium">Billing</h2>
          <p className="text-[.9rem] text-t2">Subscriptions and payment methods — one Stripe account across every Mazidi company.</p>
        </div>
        <ManageBillingButton />
      </div>

      {params.subscribed && (
        <p className="mb-5 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-[.88rem] text-success">
          Subscription active — welcome aboard. Manage it any time via the billing portal.
        </p>
      )}
      {params.canceled && (
        <p className="mb-5 rounded-xl border border-line bg-bg3 px-4 py-3 text-[.88rem] text-t2">
          Checkout cancelled — nothing was charged.
        </p>
      )}

      <div className="mb-6 rounded-md border border-line bg-bg2 p-6">
        <h5 className="mb-[18px] text-[.95rem] font-semibold">Your subscriptions</h5>
        {subscriptions.length === 0 ? (
          <p className="py-4 text-[.88rem] text-t3">No subscriptions yet — pick a plan below.</p>
        ) : (
          <table className="w-full border-collapse text-[.87rem]">
            <thead>
              <tr>
                {["Plan", "Company", "Renews", "Status"].map((h) => (
                  <th key={h} className="border-b border-line px-3.5 py-2.5 text-left text-[.7rem] font-bold uppercase tracking-[.08em] text-t3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-bg3">
                  <td className="border-b border-line px-3.5 py-3.5 font-semibold">{sub.service?.name ?? "Plan"}</td>
                  <td className="border-b border-line px-3.5 py-3.5 text-t2">{sub.service?.company.name ?? "—"}</td>
                  <td className="border-b border-line px-3.5 py-3.5 text-t2">{sub.renewsAt.toLocaleDateString("en-GB")}</td>
                  <td className="border-b border-line px-3.5 py-3.5"><Pill tone={subTone(sub.status)}>{sub.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-md border border-line bg-bg2 p-6">
        <h5 className="mb-[18px] text-[.95rem] font-semibold">
          Available plans <small className="font-normal text-t3">monthly, cancel any time in the billing portal</small>
        </h5>
        {plans.length === 0 ? (
          <p className="py-4 text-[.88rem] text-t3">
            No plans published yet. Run <code className="rounded bg-bg3 px-1.5 py-0.5">pnpm --filter @mazidi/api stripe:sync</code> after
            seeding to create Stripe prices for billable services.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3.5 max-lg:grid-cols-1">
            {plans.map((plan) => (
              <div key={plan.id} className="flex flex-col rounded-[14px] bg-bg3 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <b className="text-[.9rem]">{plan.name}</b>
                  <span className={`rounded-full px-2 py-0.5 text-[.62rem] font-bold uppercase ${pillarBg[pillarKey(plan.company.pillar)]}`}>
                    {plan.company.name.replace("Mazidi ", "")}
                  </span>
                </div>
                <p className="mb-3 flex-1 text-[.8rem] text-t2">{plan.summary}</p>
                <div className="flex items-center justify-between">
                  <b className="font-display text-[1.2rem]">{gbp(plan.priceFrom)}<small className="text-[.7rem] text-t3">/mo</small></b>
                  {subscribedServiceIds.has(plan.id)
                    ? <Pill tone="ok">Active</Pill>
                    : <SubscribeButton serviceId={plan.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
