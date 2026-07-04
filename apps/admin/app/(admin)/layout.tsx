import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { requireAdmin } from "@mazidi/api";
import { SidebarShell, SideGroup, SideItem } from "@mazidi/ui";

export const dynamic = "force-dynamic";

const NAV: [string, string, string][] = [
  ["/overview", "Overview", "▦"],
  ["/companies", "Companies", "🏢"],
  ["/users", "Users & Roles", "👥"],
  ["/automations", "Automations", "⚡"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");
  const ctx = await requireAdmin(user);

  if (!ctx) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="max-w-[420px] rounded-lg border border-line bg-bg2 p-10 text-center">
          <h1 className="mb-2 font-display text-[1.4rem]">Admin access only</h1>
          <p className="mb-6 text-[.9rem] text-t2">
            Your account has no admin membership. A group admin can grant one in Users &amp; Roles.
          </p>
          <form action="/auth/signout" method="post">
            <button type="submit" className="rounded-full border border-line2 px-5 py-2 text-[.85rem] font-semibold hover:border-gold hover:text-gold">
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Admin";
  return (
    <SidebarShell
      sidebar={
        <>
          <div className="mb-[22px] flex items-center gap-3 rounded-[14px] bg-bg3 px-3 py-2.5">
            <div className="grid h-[38px] w-[38px] flex-none place-items-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-[.85rem] font-bold text-[#14100A]">
              {name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <b className="block truncate text-[.88rem] leading-tight">{name}</b>
              <span className="text-[.74rem] text-t3">{ctx.isSuper ? "Super Admin · Group" : `Company Admin · ${ctx.companyIds.length}`}</span>
            </div>
          </div>
          <SideGroup title="Control plane">
            {NAV.map(([href, label, icon]) => (
              <Link key={href} href={href}><SideItem icon={icon}>{label}</SideItem></Link>
            ))}
          </SideGroup>
          <SideGroup title="Account">
            <form action="/auth/signout" method="post">
              <button type="submit" className="w-full text-left"><SideItem icon="⏻">Sign out</SideItem></button>
            </form>
          </SideGroup>
        </>
      }
    >
      {children}
    </SidebarShell>
  );
}
