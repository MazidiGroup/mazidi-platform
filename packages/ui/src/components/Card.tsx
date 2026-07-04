import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-md border border-line bg-bg2 p-6", className)}>{children}</div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-lg border border-line bg-bg2 p-[38px] max-sm:p-6", className)}>
      {children}
    </div>
  );
}

export function Pill({
  tone = "info", children,
}: { tone?: "ok" | "wait" | "bad" | "info"; children: ReactNode }) {
  const tones = {
    ok: "bg-success/15 text-success",
    wait: "bg-warning/15 text-warning",
    bad: "bg-danger/15 text-danger",
    info: "bg-run/15 text-run",
  };
  return (
    <span className={clsx("inline-block rounded-full px-[11px] py-1 text-[.7rem] font-bold", tones[tone])}>
      {children}
    </span>
  );
}
