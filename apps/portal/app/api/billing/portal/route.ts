import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import { BillingError, createBillingPortalSession, ensureCustomer } from "@mazidi/api";

/** POST → { url } — Stripe customer billing portal (payment methods, cancellations, receipts). */
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });

  try {
    const customer = await ensureCustomer(user);
    const data = await createBillingPortalSession(customer.id, req.nextUrl.origin);
    return NextResponse.json({ data, error: null });
  } catch (e) {
    if (e instanceof BillingError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("billing portal failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
