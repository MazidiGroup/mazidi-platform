import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { listAutomationRules, requireAdmin } from "@mazidi/api";
import { Pill } from "@mazidi/ui";
import { RuleToggle, RunAutomationsButton } from "@/components/AdminControls";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const ctx = await requireAdmin(user);
  if (!ctx) redirect("/");
  const { rules, pending } = await listAutomationRules();

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="mb-1 font-display text-[1.7rem] font-medium">Automations</h2>
          <p className="text-[.9rem] text-t2">
            The cross-sell engine (docs/04 §4). Events queue in the outbox; the engine matches rules and acts.
            In production, n8n or cron drains it via <code className="rounded bg-bg3 px-1.5 py-0.5">POST /api/automations/run</code> with the <code className="rounded bg-bg3 px-1.5 py-0.5">x-cron-secret</code> header.
          </p>
        </div>
        <RunAutomationsButton pending={pending} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule) => {
          const trigger = rule.trigger as { event?: string; companySlug?: string };
          return (
            <div key={rule.id} className="rounded-md border border-line bg-bg2 p-6">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <b className="text-[.95rem]">{rule.name}</b>
                  <span className="block text-[.78rem] text-t3">
                    on <code className="rounded bg-bg3 px-1.5 py-0.5">{trigger.event}</code>
                    {trigger.companySlug && <> from <code className="rounded bg-bg3 px-1.5 py-0.5">{trigger.companySlug}</code></>}
                  </span>
                </div>
                {ctx.isSuper ? <RuleToggle ruleId={rule.id} enabled={rule.enabled} /> : (
                  <Pill tone={rule.enabled ? "ok" : "bad"}>{rule.enabled ? "enabled" : "disabled"}</Pill>
                )}
              </div>
              {rule.runs.length > 0 ? (
                <ul className="mt-3">
                  {rule.runs.map((run) => (
                    <li key={run.id} className="flex items-center gap-3 border-b border-line py-2 text-[.8rem] last:border-0">
                      <span className="grid h-6 w-6 flex-none place-items-center rounded-[8px] bg-bg3 text-[.7rem]">⚡</span>
                      <span className="min-w-0 flex-1 truncate text-t2">
                        {Object.entries(run.result as Record<string, string>).map(([k, v]) => `${k} → ${v}`).join(" · ") || "no actions"}
                      </span>
                      <span className="text-[.72rem] text-t3">{run.at.toLocaleString("en-GB")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[.8rem] text-t3">Never fired yet.</p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
