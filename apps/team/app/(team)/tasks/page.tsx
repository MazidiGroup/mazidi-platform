import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { ensureEmployee, listScopeCompanies, listTasks } from "@mazidi/api";
import { Pill } from "@mazidi/ui";
import { TaskForm, TaskToggle } from "@/components/TeamControls";

export const dynamic = "force-dynamic";

const prioTone = (p: string) => (p === "URGENT" || p === "HIGH" ? ("bad" as const) : p === "MEDIUM" ? ("wait" as const) : ("info" as const));

export default async function TasksPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const ctx = await ensureEmployee(user);
  if (!ctx) redirect("/");
  const [tasks, companies] = await Promise.all([listTasks(ctx, user.id), listScopeCompanies(ctx)]);
  const companyName = new Map(companies.map((c) => [c.id, c.name.replace("Mazidi ", "")]));

  return (
    <>
      <div className="mb-7">
        <h2 className="mb-1 font-display text-[1.7rem] font-medium">Tasks</h2>
        <p className="text-[.9rem] text-t2">Yours and unassigned, across your companies.</p>
      </div>
      <div className="mb-6 rounded-md border border-line bg-bg2 p-6">
        <TaskForm companies={companies} />
      </div>
      <div className="rounded-md border border-line bg-bg2 p-6">
        {tasks.length === 0 ? (
          <p className="py-4 text-[.88rem] text-t3">Nothing on the list — add your first task above.</p>
        ) : (
          <ul>
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3.5 border-b border-line py-3.5 last:border-0">
                <TaskToggle taskId={t.id} status={t.status} />
                <div className="min-w-0 flex-1">
                  <b className={`block text-[.9rem] ${t.status === "DONE" ? "text-t3 line-through" : ""}`}>{t.title}</b>
                  <span className="text-[.76rem] text-t3">
                    {companyName.get(t.companyId) ?? "—"}
                    {t.dueAt ? ` · due ${t.dueAt.toLocaleDateString("en-GB")}` : ""}
                  </span>
                </div>
                <Pill tone={prioTone(t.priority)}>{t.priority}</Pill>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
