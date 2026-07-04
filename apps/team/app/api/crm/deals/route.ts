import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import { TeamAccessError, createDeal, dealCreateSchema, dealStageSchema, ensureEmployee, updateDealStage } from "@mazidi/api";

/** PATCH { dealId, stage } — membership-scoped; WON emits OutboxEvent("deal.won"). */
export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });
  const ctx = await ensureEmployee(user);
  if (!ctx) return NextResponse.json({ data: null, error: "Employee access only" }, { status: 403 });

  const parsed = dealStageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: "Validation failed", meta: parsed.error.flatten().fieldErrors }, { status: 422 });

  try {
    await updateDealStage(ctx, user.id, parsed.data.dealId, parsed.data.stage);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (e) {
    if (e instanceof TeamAccessError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("deal update failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}

/** POST { title, value, companyId? | leadId? } — create a deal (from lead or standalone). */
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });
  const ctx = await ensureEmployee(user);
  if (!ctx) return NextResponse.json({ data: null, error: "Employee access only" }, { status: 403 });

  const parsed = dealCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: parsed.error.issues[0]?.message ?? "Validation failed" }, { status: 422 });

  try {
    const deal = await createDeal(ctx, user.id, parsed.data);
    return NextResponse.json({ data: { id: deal.id }, error: null }, { status: 201 });
  } catch (e) {
    if (e instanceof TeamAccessError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("deal create failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
