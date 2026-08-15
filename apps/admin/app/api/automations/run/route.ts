import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getUser } from "@mazidi/auth/server";
import { requireAdmin, runAutomations } from "@mazidi/api";

/**
 * Drain the outbox through the rule engine.
 *
 * Auth: admin session (the "Run engine now" button) OR the shared cron secret.
 * Scheduled every 5 minutes by apps/admin/vercel.json; before that the engine
 * only ever ran when a human clicked the button.
 */
function viaSharedSecret(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>; n8n / external cron
  // sends x-cron-secret. Accept either, both compared in constant time so the
  // endpoint does not leak the secret one byte at a time under timing analysis.
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const header = req.headers.get("x-cron-secret");

  return [bearer, header].some((provided) => {
    if (!provided) return false;
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false; // timingSafeEqual throws on length mismatch
    return timingSafeEqual(a, b);
  });
}

async function drain(req: NextRequest) {
  const viaCron = viaSharedSecret(req);

  if (!viaCron) {
    const user = await getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });
    const ctx = await requireAdmin(user);
    if (!ctx) return NextResponse.json({ data: null, error: "Admin access only" }, { status: 403 });
  }

  try {
    const summary = await runAutomations();
    return NextResponse.json({ data: summary, error: null });
  } catch (e) {
    console.error("automation run failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return drain(req);
}

/** Vercel Cron issues GET, not POST. Same handler, same auth. */
export async function GET(req: NextRequest) {
  return drain(req);
}
