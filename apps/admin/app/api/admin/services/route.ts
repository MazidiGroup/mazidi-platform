import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import { AdminError, adminAddService, requireAdmin, serviceAddSchema } from "@mazidi/api";

/** POST — add a service to a tenant in scope. */
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });
  const ctx = await requireAdmin(user);
  if (!ctx) return NextResponse.json({ data: null, error: "Admin access only" }, { status: 403 });

  const parsed = serviceAddSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: parsed.error.issues[0]?.message ?? "Validation failed" }, { status: 422 });
  try {
    const service = await adminAddService(ctx, user.id, parsed.data);
    return NextResponse.json({ data: { id: service.id }, error: null }, { status: 201 });
  } catch (e) {
    if (e instanceof AdminError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("service add failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
