import { clsx } from "clsx";
import type { ReactNode } from "react";

/** Portal layout shell: sticky sidebar + main pane (docs/02 §Layout). */
export function SidebarShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[256px_1fr] max-lg:grid-cols-1">
      <aside className="sticky top-0 h-screen overflow-y-auto border-r border-line bg-bg2 px-4 py-7 max-lg:static max-lg:h-auto max-lg:border-b max-lg:border-r-0">
        {sidebar}
      </aside>
      <main className="min-w-0 px-10 py-9 max-sm:px-4">{children}</main>
    </div>
  );
}

export function SideGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h6 className="px-3 pb-2 pt-4 text-[.68rem] font-bold uppercase tracking-[.12em] text-t3">{title}</h6>
      {children}
    </>
  );
}

export function SideItem({
  active = false, icon, children, count,
}: { active?: boolean; icon?: string; children: ReactNode; count?: number }) {
  return (
    <span
      className={clsx(
        "flex items-center gap-[11px] rounded-[11px] px-3 py-2.5 text-[.89rem] font-medium transition-colors",
        active ? "bg-bg3 text-t1 shadow-[inset_2px_0_0_var(--gold)]" : "text-t2 hover:bg-bg3 hover:text-t1",
      )}
    >
      {icon && <span className="w-[17px] text-center opacity-85" aria-hidden>{icon}</span>}
      {children}
      {count !== undefined && (
        <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[.68rem] font-bold text-[#14100A]">{count}</span>
      )}
    </span>
  );
}
