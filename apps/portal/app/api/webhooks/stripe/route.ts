import { NextRequest, NextResponse } from "next/server";
import { getStripe, handleStripeEvent } from "@mazidi/api";

/**
 * Stripe webhook (docs/04 §/v1/finance) — the source of truth for money state.
 * Signature-verified against the RAW body; unauthenticated by design
 * (middleware excludes /api; Stripe's signature IS the auth).
 *
 * Local dev:  stripe listen --forward-to localhost:3001/api/webhooks/stripe
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature)
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });

  let event;
  try {
    const rawBody = await req.text();
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (e) {
    console.error("stripe signature verification failed", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (e) {
    console.error(`stripe event ${event.type} failed`, e);
    return NextResponse.json({ error: "Handler error" }, { status: 500 }); // Stripe retries
  }
  return NextResponse.json({ received: true });
}
