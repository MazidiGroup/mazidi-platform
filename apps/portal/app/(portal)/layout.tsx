import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { ensureCustomer } from "@mazidi/api";
import { SidebarShell, SideGroup, SideItem } from "@mazidi/ui";

export const dynamic = "force-dynamic"; // per-user data, never cached

const NAV: [string, [string, string, string][]][] = [
  ["Portal", [
    ["/dashboard", "Dashboard", "▦"],
    ["/projects", "Projects", "▤"],
    ["/invoices", "Invoices", "▥"],
    ["/billing", "Billing", "◈"],
    ["/documents", "Documents", "▧"],
    ["/advisor", "AI Advisor", "✦"],
    ["/notifications", "Notifications", "🔔"],
  ]],
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login"); // middleware also guards; belt and braces
  const customer = await ensureCustomer(user);
  const name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Client";

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
              <span className="text-[.74rem] text-t3">{customer.orgName ?? "Client account"}</span>
            </div>
          </div>
          {NAV.map(([group, items]) => (
            <SideGroup key={group} title={group}>
              {items.map(([href, label, icon]) => (
                <Link key={href} href={href}>
                  <SideItem icon={icon}>{label}</SideItem>
                </Link>
              ))}
            </SideGroup>
          ))}
          <SideGroup title="Account">
            <form action="/auth/signout" method="post">
              <button type="submit" className="w-full text-left">
                <SideItem icon="⏻">Sign out</SideItem>
              </button>
            </form>
          </SideGroup>
        </>
      }
    >
      {children}
    </SidebarShell>
  );
}
