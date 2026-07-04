import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import { AIError, advisorChat, aiChatSchema, ensureCustomer } from "@mazidi/api";

/** POST { message } → { messages } — persisted, account-grounded advisor chat. */
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });

  const parsed = aiChatSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: parsed.error.issues[0]?.message ?? "Validation failed" }, { status: 422 });

  try {
    const customer = await ensureCustomer(user);
    const messages = await advisorChat(user.id, customer.id, parsed.data.message);
    return NextResponse.json({ data: { messages }, error: null });
  } catch (e) {
    if (e instanceof AIError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("advisor chat failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
