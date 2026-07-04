import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import { AdminError, adminSetMembership, membershipSchema, requireAdmin } from "@mazidi/api";

/** POST — grant/revoke a role (RBAC matrix enforced in the service). */
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });
  const ctx = await requireAdmin(user);
  if (!ctx) return NextResponse.json({ data: null, error: "Admin access only" }, { status: 403 });

  const parsed = membershipSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: parsed.error.issues[0]?.message ?? "Validation failed" }, { status: 422 });
  try {
    await adminSetMembership(ctx, user.id, parsed.data);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("membership change failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
