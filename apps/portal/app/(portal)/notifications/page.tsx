import { redirect } from "next/navigation";
import { getUser } from "@mazidi/auth/server";
import { listNotifications, markAllNotificationsRead } from "@mazidi/api";
import { SITE_URL } from "@mazidi/config";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const notifications = await listNotifications(user.id);
  const unread = notifications.filter((n) => !n.readAt).length;

  async function markRead() {
    "use server";
    const u = await getUser();
    if (u) await markAllNotificationsRead(u.id);
  }

  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="mb-1 font-display text-[1.7rem] font-medium">Notifications</h2>
          <p className="text-[.9rem] text-t2">Recommendations and updates from across the ecosystem.</p>
        </div>
        {unread > 0 && (
          <form action={markRead}>
            <button type="submit" className="rounded-full border border-line2 px-4 py-2 text-[.82rem] font-semibold hover:border-gold hover:text-gold">
              Mark all read ({unread})
            </button>
          </form>
        )}
      </div>
      <div className="rounded-md border border-line bg-bg2 p-6">
        {notifications.length === 0 ? (
          <p className="py-4 text-[.88rem] text-t3">
            Nothing yet — when the automation engine spots your next step (a completed project,
            a paid invoice), the recommendation lands here.
          </p>
        ) : (
          <ul>
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3.5 border-b border-line py-3.5 last:border-0">
                <span className={`mt-1 grid h-9 w-9 flex-none place-items-center rounded-[10px] ${n.readAt ? "bg-bg3" : "bg-gold/15 text-gold"}`}>✦</span>
                <div className="min-w-0 flex-1">
                  <b className="text-[.9rem]">{n.title}</b>
                  {n.body && <p className="text-[.82rem] text-t2">{n.body}</p>}
                  <span className="text-[.74rem] text-t3">{n.at.toLocaleString("en-GB")}</span>
                </div>
                {n.href && (
                  <a href={`${SITE_URL}${n.href}`} className="flex-none rounded-full border border-line2 px-3.5 py-1.5 text-[.76rem] font-semibold hover:border-gold hover:text-gold">
                    View
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
