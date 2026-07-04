import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import { automationToggleSchema, requireAdmin, toggleAutomationRule } from "@mazidi/api";

/** PATCH { ruleId, enabled } — super admin only; audited. */
export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });
  const ctx = await requireAdmin(user);
  if (!ctx?.isSuper) return NextResponse.json({ data: null, error: "Group admin only" }, { status: 403 });

  const parsed = automationToggleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: "Validation failed" }, { status: 422 });

  await toggleAutomationRule(user.id, parsed.data.ruleId, parsed.data.enabled);
  return NextResponse.json({ data: { ok: true }, error: null });
}
