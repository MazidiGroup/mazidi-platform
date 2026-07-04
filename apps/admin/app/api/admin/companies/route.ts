import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import {
  AdminError, adminCreateCompany, adminUpdateCompany, companyCreateSchema, companyUpdateSchema, requireAdmin,
} from "@mazidi/api";

async function withAdmin() {
  const user = await getUser();
  if (!user) return { error: NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 }) };
  const ctx = await requireAdmin(user);
  if (!ctx) return { error: NextResponse.json({ data: null, error: "Admin access only" }, { status: 403 }) };
  return { user, ctx };
}
const fail = (e: unknown, what: string) => {
  if (e instanceof AdminError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
  console.error(`${what} failed`, e);
  return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
};

/** POST — create tenant (DRAFT). */
export async function POST(req: NextRequest) {
  const auth = await withAdmin();
  if ("error" in auth) return auth.error;
  const parsed = companyCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: parsed.error.issues[0]?.message ?? "Validation failed" }, { status: 422 });
  try {
    const company = await adminCreateCompany(auth.ctx, auth.user.id, parsed.data);
    return NextResponse.json({ data: { id: company.id, slug: company.slug }, error: null }, { status: 201 });
  } catch (e) { return fail(e, "company create"); }
}

/** PATCH — edit fields / publish status. */
export async function PATCH(req: NextRequest) {
  const auth = await withAdmin();
  if ("error" in auth) return auth.error;
  const parsed = companyUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: parsed.error.issues[0]?.message ?? "Validation failed" }, { status: 422 });
  try {
    await adminUpdateCompany(auth.ctx, auth.user.id, parsed.data);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (e) { return fail(e, "company update"); }
}
