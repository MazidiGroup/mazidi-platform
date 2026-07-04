import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import { BillingError, createSubscriptionCheckout, ensureCustomer, subscribeSchema } from "@mazidi/api";

/** POST { serviceId } → { url } — Stripe Checkout (subscription mode) for a plan. */
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });

  const parsed = subscribeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: "Validation failed", meta: parsed.error.flatten().fieldErrors }, { status: 422 });

  try {
    const customer = await ensureCustomer(user);
    const data = await createSubscriptionCheckout(customer.id, parsed.data.serviceId, req.nextUrl.origin);
    return NextResponse.json({ data, error: null });
  } catch (e) {
    if (e instanceof BillingError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("subscribe failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
