import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eventIngestSchema } from "@mazidi/api/schemas";
import { ingestEvent, EventIngestError } from "@mazidi/api";

/**
 * POST /api/events/ingest — inbound event bridge from the MongoDB fitness apps.
 *
 * Auth: x-ingest-secret, constant-time compared.
 *
 * Deliberately unauthenticated by session: this is called by servers, not
 * people, so the shared secret IS the auth — the same posture as the Stripe
 * webhook route and /api/automations/run.
 *
 * ⚠️ Callers MUST send this from their FastAPI backend, never from the Expo
 * client — a secret shipped in a React Native bundle is a public secret.
 */
export const runtime = "nodejs";

function authorised(req: NextRequest): boolean {
  const expected = process.env.INGEST_SECRET;
  if (!expected) return false; // unset secret must never mean "allow"
  const provided = req.headers.get("x-ingest-secret");
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false; // timingSafeEqual throws on length mismatch
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ data: null, error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = eventIngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: "Validation failed", meta: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const result = await ingestEvent(parsed.data);
    return NextResponse.json({ data: result, error: null }, { status: 202 });
  } catch (e) {
    if (e instanceof EventIngestError) {
      return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    }
    // Do not leak internals to a machine caller; the emitter will retry.
    console.error("event ingest failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
