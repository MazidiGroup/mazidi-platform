import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("mx-auto max-w-content px-8 max-sm:px-5", className)}>{children}</div>;
}

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={clsx("py-[110px] max-sm:py-[70px]", className)}>{children}</section>;
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <div className="mb-[18px] flex items-center gap-2.5 text-[.76rem] font-semibold uppercase tracking-[.14em] text-gold">
      <span className="h-px w-7 bg-gold" aria-hidden />
      {children}
    </div>
  );
}

export function SectionHead({
  kicker, title, aside,
}: { kicker: string; title: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
      <div>
        <Kicker>{kicker}</Kicker>
        <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.7rem)] font-medium leading-[1.08] tracking-[-.02em]">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("max-w-[640px] text-[1.15rem] leading-relaxed text-t2", className)}>{children}</p>;
}
