import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import { TeamAccessError, ensureEmployee, leadStatusSchema, updateLeadStatus } from "@mazidi/api";

/** PATCH { leadId, status } — membership-scoped; writes Activity (+ outbox on CONVERTED). */
export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });
  const ctx = await ensureEmployee(user);
  if (!ctx) return NextResponse.json({ data: null, error: "Employee access only" }, { status: 403 });

  const parsed = leadStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: "Validation failed", meta: parsed.error.flatten().fieldErrors }, { status: 422 });

  try {
    await updateLeadStatus(ctx, user.id, parsed.data.leadId, parsed.data.status);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (e) {
    if (e instanceof TeamAccessError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("lead update failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
