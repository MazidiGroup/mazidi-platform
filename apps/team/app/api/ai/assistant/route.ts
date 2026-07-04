import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import { AIError, aiChatSchema, ensureEmployee, teamAssistantChat } from "@mazidi/api";

/** POST { message } → { messages } — pipeline-grounded CRM assistant. */
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 });
  const ctx = await ensureEmployee(user);
  if (!ctx) return NextResponse.json({ data: null, error: "Employee access only" }, { status: 403 });

  const parsed = aiChatSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: parsed.error.issues[0]?.message ?? "Validation failed" }, { status: 422 });

  try {
    const messages = await teamAssistantChat(user.id, ctx, parsed.data.message);
    return NextResponse.json({ data: { messages }, error: null });
  } catch (e) {
    if (e instanceof AIError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("team assistant failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
