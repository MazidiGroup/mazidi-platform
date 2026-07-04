import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@mazidi/auth/server";
import {
  TeamAccessError, createTask, ensureEmployee, setTaskStatus, taskCreateSchema, taskStatusSchema,
} from "@mazidi/api";

async function withEmployee(req: NextRequest) {
  const user = await getUser();
  if (!user) return { error: NextResponse.json({ data: null, error: "Unauthenticated" }, { status: 401 }) };
  const ctx = await ensureEmployee(user);
  if (!ctx) return { error: NextResponse.json({ data: null, error: "Employee access only" }, { status: 403 }) };
  return { user, ctx };
}

/** POST { companyId, title, priority, dueAt? } — create task in scope. */
export async function POST(req: NextRequest) {
  const auth = await withEmployee(req);
  if ("error" in auth) return auth.error;

  const parsed = taskCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: "Validation failed", meta: parsed.error.flatten().fieldErrors }, { status: 422 });

  try {
    const task = await createTask(auth.ctx, auth.user.id, parsed.data);
    return NextResponse.json({ data: { id: task.id }, error: null }, { status: 201 });
  } catch (e) {
    if (e instanceof TeamAccessError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("task create failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}

/** PATCH { taskId, status } — toggle/progress a task in scope. */
export async function PATCH(req: NextRequest) {
  const auth = await withEmployee(req);
  if ("error" in auth) return auth.error;

  const parsed = taskStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ data: null, error: "Validation failed", meta: parsed.error.flatten().fieldErrors }, { status: 422 });

  try {
    await setTaskStatus(auth.ctx, auth.user.id, parsed.data.taskId, parsed.data.status);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (e) {
    if (e instanceof TeamAccessError) return NextResponse.json({ data: null, error: e.message }, { status: e.status });
    console.error("task update failed", e);
    return NextResponse.json({ data: null, error: "Internal error" }, { status: 500 });
  }
}
