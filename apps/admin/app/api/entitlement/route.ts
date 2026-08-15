import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getEntitlement } from "@mazidi/api";

/**
 * GET /api/entitlement?email=…&plan=coach-seat
 *
 * Asked by fitness_muscle_coach, which bills through this platform instead of
 * running its own Stripe integration. Read-only and deliberately narrow: one
 * boolean plus a date, never customer records.
 *
 * Auth: x-entitlement-secret, constant-time compared. Separate from
 * INGEST_SECRET so a read credential given to an app cannot also write events.
 */
export const runtime = "nodejs";

function authorised(req: NextRequest): boolean {
  const expected = process.env.ENTITLEMENT_SECRET;
  if (!expected) return false; // unset must never mean "allow"
  const provided = req.headers.get("x-entitlement-secret");
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ data: null, error: "Unauthorised" }, { status: 401 });
  }

  const email = req.nextUrl.searchParams.get("email");
  const plan = req.nextUrl.searchParams.get("plan");
  if (!email || !plan) {
    return NextResponse.json(
      { data: null, error: "email and plan are required" },
      { status: 422 },
    );
  }

  try {
    const data = await getEntitlement(email, plan);
    return NextResponse.json({ data, error: null });
  } catch (e) {
    console.error("entitlement lookup failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
