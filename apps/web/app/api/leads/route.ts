import { NextRequest, NextResponse } from "next/server";
import { captureLead, leadInputSchema } from "@mazidi/api";

/**
 * POST /v1-style lead capture (docs/04 §/v1/leads).
 * Zod-validated, honeypot-guarded. Writes Contact + Lead + Activity and
 * emits form.submitted to the outbox for n8n follow-up sequences.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = leadInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: "Validation failed", meta: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  // Honeypot filled → pretend success, store nothing.
  if (parsed.data.website) return NextResponse.json({ data: { ok: true }, error: null });

  try {
    const result = await captureLead(parsed.data, {
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      path: req.headers.get("referer") ?? undefined,
    });
    return NextResponse.json({ data: result, error: null }, { status: 201 });
  } catch (e) {
    console.error("lead capture failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
