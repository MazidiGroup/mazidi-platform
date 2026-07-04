import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { adminListCompanies, adminListUsers, requireAdmin } from "@mazidi/api";
import { MembershipGrantForm, MembershipRevokeButton } from "@/components/AdminControls";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const ctx = await requireAdmin(user);
  if (!ctx) redirect("/");
  const [users, companies] = await Promise.all([adminListUsers(ctx), adminListCompanies(ctx)]);
  const companyOptions = companies.map((c) => ({ id: c.id, name: c.name }));

  return (
    <>
      <div className="mb-7">
        <h2 className="mb-1 font-display text-[1.7rem] font-medium">Users &amp; Roles</h2>
        <p className="text-[.9rem] text-t2">
          RBAC per docs/01 §7. Granting a staff role auto-creates the Employee profile for team-app access.
          {ctx.isSuper ? "" : " Company admins manage non-admin roles within their companies only."}
        </p>
      </div>

      <div className="mb-6 rounded-md border border-line bg-bg2 p-6">
        <h5 className="mb-4 text-[.95rem] font-semibold">Grant a role</h5>
        <MembershipGrantForm
          users={users.map((u) => ({ id: u.id, label: `${u.fullName} <${u.email}>` }))}
          companies={companyOptions}
          isSuper={ctx.isSuper}
        />
      </div>

      <div className="rounded-md border border-line bg-bg2 p-6">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-[.87rem]">
          <thead>
            <tr>
              {["User", "Profiles", "Memberships"].map((h) => (
                <th key={h} className="border-b border-line px-3.5 py-2.5 text-left text-[.7rem] font-bold uppercase tracking-[.08em] text-t3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="align-top hover:bg-bg3">
                <td className="border-b border-line px-3.5 py-3.5">
                  <b>{u.fullName}</b><span className="block text-[.76rem] text-t3">{u.email}</span>
                </td>
                <td className="border-b border-line px-3.5 py-3.5 text-[.78rem] text-t2">
                  {u.customer && <span className="mr-2 rounded-full border border-line px-2 py-0.5">client</span>}
                  {u.employee && <span className="rounded-full border border-line px-2 py-0.5">staff · {u.employee.title}</span>}
                  {!u.customer && !u.employee && <span className="text-t3">—</span>}
                </td>
                <td className="border-b border-line px-3.5 py-3.5">
                  {u.memberships.length === 0 && <span className="text-[.78rem] text-t3">none</span>}
                  <div className="flex flex-wrap gap-1.5">
                    {u.memberships.map((m) => (
                      <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-bg3 px-2.5 py-1 text-[.72rem]">
                        <b>{m.role}</b><span className="text-t3">· {m.company?.name.replace("Mazidi ", "") ?? "Group"}</span>
                        <MembershipRevokeButton targetUserId={u.id} companyId={m.companyId} role={m.role} />
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}
