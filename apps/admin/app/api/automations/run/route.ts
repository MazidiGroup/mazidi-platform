import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import { requireAdmin, runAutomations } from "@mazidi/api";

/**
 * POST — drain the outbox through the rule engine.
 * Auth: admin session OR x-cron-secret header (n8n / Vercel cron in production).
 */
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const viaCron = !!cronSecret && req.headers.get("x-cron-secret") === cronSecret;

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
