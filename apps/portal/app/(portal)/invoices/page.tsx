import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { ensureCustomer, listInvoices, reconcileCheckoutSession } from "@mazidi/api";
import { Pill } from "@mazidi/ui";
import { PayInvoiceButton } from "@/components/BillingButtons";

export const dynamic = "force-dynamic";

const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const tone = (s: string) => (s === "PAID" ? ("ok" as const) : s === "OVERDUE" ? ("bad" as const) : ("wait" as const));
const PAYABLE = new Set(["SENT", "DUE", "OVERDUE"]);

export default async function InvoicesPage({
  searchParams,
}: { searchParams: Promise<{ paid?: string; canceled?: string; session_id?: string }> }) {
  const user = await getUser();
  if (!user) redirect("/login");
  const [customer, params] = await Promise.all([ensureCustomer(user), searchParams]);
  // Returning from Stripe Checkout: the browser beats the webhook here, so
  // reconcile the session first (idempotent — webhook stays source of truth).
  if (params.paid && params.session_id) {
    await reconcileCheckoutSession(customer.id, params.session_id).catch((e) =>
      console.error("checkout reconcile failed (webhook will catch up)", e),
    );
  }
  const invoices = await listInvoices(customer.id);

  return (
    <>
      <h2 className="mb-1 font-display text-[1.7rem] font-medium">Invoices</h2>
      <p className="mb-7 text-[.9rem] text-t2">All companies, one billing view. Pay securely via Stripe Checkout.</p>
      {params.paid && (
        <p className="mb-5 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-[.88rem] text-success">
          Payment received — thank you. A receipt is available in the billing portal.
        </p>
      )}
      {params.canceled && (
        <p className="mb-5 rounded-xl border border-line bg-bg3 px-4 py-3 text-[.88rem] text-t2">
          Checkout cancelled — nothing was charged.
        </p>
      )}
      <div className="rounded-md border border-line bg-bg2 p-6">
        {invoices.length === 0 ? (
          <p className="py-4 text-[.88rem] text-t3">No invoices yet.</p>
        ) : (
          <table className="w-full border-collapse text-[.87rem]">
            <thead>
              <tr>
                {["Invoice", "Company", "Net", "Tax", "Total", "Due", "Status", ""].map((h) => (
                  <th key={h} className="border-b border-line px-3.5 py-2.5 text-left text-[.7rem] font-bold uppercase tracking-[.08em] text-t3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-bg3">
                  <td className="border-b border-line px-3.5 py-3.5 font-semibold">{inv.number}</td>
                  <td className="border-b border-line px-3.5 py-3.5 text-t2">{inv.company.name}</td>
                  <td className="border-b border-line px-3.5 py-3.5 tabular-nums">{gbp(Number(inv.amount))}</td>
                  <td className="border-b border-line px-3.5 py-3.5 tabular-nums">{gbp(Number(inv.tax))}</td>
                  <td className="border-b border-line px-3.5 py-3.5 font-semibold tabular-nums">{gbp(Number(inv.amount) + Number(inv.tax))}</td>
                  <td className="border-b border-line px-3.5 py-3.5 text-t2">{inv.dueAt.toLocaleDateString("en-GB")}</td>
                  <td className="border-b border-line px-3.5 py-3.5"><Pill tone={tone(inv.status)}>{inv.status}</Pill></td>
                  <td className="border-b border-line px-3.5 py-3.5 text-right">
                    {PAYABLE.has(inv.status) && <PayInvoiceButton invoiceId={inv.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
