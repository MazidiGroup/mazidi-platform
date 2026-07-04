import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import { BillingError, createInvoiceCheckout, ensureCustomer, invoiceCheckoutSchema } from "@mazidi/api";

/** POST { invoiceId } → { url } — Stripe Checkout for a single invoice (docs/04 §/v1/finance). */
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });

  const parsed = invoiceCheckoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: "Validation failed", meta: parsed.error.flatten().fieldErrors }, { status: 422 });

  try {
    const customer = await ensureCustomer(user);
    const data = await createInvoiceCheckout(customer.id, parsed.data.invoiceId, req.nextUrl.origin);
    return NextResponse.json({ data, error: null });
  } catch (e) {
    if (e instanceof BillingError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("checkout failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
