import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { ensureCustomer, listProjects } from "@mazidi/api";
import { Pill, pillarBg, pillarKey } from "@mazidi/ui";

export const dynamic = "force-dynamic";

const tone = (s: string) =>
  s === "COMPLETED" ? ("ok" as const) : s === "ON_HOLD" || s === "CANCELLED" ? ("bad" as const) : ("info" as const);

export default async function ProjectsPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const customer = await ensureCustomer(user);
  const projects = await listProjects(customer.id);

  return (
    <>
      <h2 className="mb-1 font-display text-[1.7rem] font-medium">Projects</h2>
      <p className="mb-7 text-[.9rem] text-t2">Cross-company projects with milestones and live progress.</p>
      {projects.length === 0 && (
        <div className="rounded-md border border-line bg-bg2 p-6">
          <p className="py-4 text-[.88rem] text-t3">No projects yet — they appear here as soon as an engagement begins.</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        {projects.map((p) => (
          <div key={p.id} className="rounded-md border border-line bg-bg2 p-6">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <b className="text-[1rem]">{p.name}</b>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[.62rem] font-bold uppercase ${pillarBg[pillarKey(p.company.pillar)]}`}>
                  {p.company.name.replace("Mazidi ", "")}
                </span>
              </div>
              <Pill tone={tone(p.status)}>{p.status}</Pill>
            </div>
            <div className="mb-1 h-[6px] rounded-full bg-bg3">
              <div className="h-full rounded-full bg-gold" style={{ width: `${p.progress}%` }} />
            </div>
            <span className="text-[.78rem] text-t3">
              {p.progress}% · {p.dueAt ? `due ${p.dueAt.toLocaleDateString("en-GB")}` : "no due date"}
            </span>
            {p.milestones.length > 0 && (
              <ul className="mt-4">
                {p.milestones.map((m) => (
                  <li key={m.id} className="flex items-center gap-2.5 border-b border-line py-2 text-[.85rem] last:border-0">
                    <span className={m.done ? "text-success" : "text-t3"}>{m.done ? "✓" : "○"}</span>
                    <span className={m.done ? "text-t2 line-through" : ""}>{m.name}</span>
                    {m.dueAt && <span className="ml-auto text-[.75rem] text-t3">{m.dueAt.toLocaleDateString("en-GB")}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
