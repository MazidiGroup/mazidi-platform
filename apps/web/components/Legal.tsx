import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared typography primitives for the legal / privacy centre pages.
 * Presentation only — these components never alter the wording passed to them.
 */

export function LegalNav({ current }: { current: "notice" | "request" | "complaints" }) {
  const items = [
    ["/privacy", "Privacy Notice", "notice"],
    ["/privacy/request", "Privacy Requests", "request"],
    ["/privacy/complaints", "Complaints", "complaints"],
  ] as const;
  return (
    <nav aria-label="Privacy centre" className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
      {items.map(([href, label, key]) => (
        <Link
          key={href}
          href={href}
          aria-current={key === current ? "page" : undefined}
          className={
            key === current
              ? "text-[.88rem] font-semibold text-gold"
              : "text-[.88rem] text-t2 transition-colors hover:text-gold"
          }
        >
          {label}
        </Link>
      ))}
      <a
        href="mailto:support@mazidigroup.com"
        className="text-[.88rem] text-t2 transition-colors hover:text-gold"
      >
        Support
      </a>
    </nav>
  );
}

export function LegalBody({ children }: { children: ReactNode }) {
  return <div className="max-w-[760px]">{children}</div>;
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 mt-14 font-display text-[1.55rem] font-medium leading-[1.15] tracking-[-.01em] first:mt-0">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 mt-9 text-[1.05rem] font-semibold">{children}</h3>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-[.97rem] leading-relaxed text-t2">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="mb-4 list-disc space-y-2 pl-5 text-[.97rem] leading-relaxed text-t2 marker:text-gold">
      {children}
    </ul>
  );
}

export function LI({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

export function Mail({ address }: { address: string }) {
  return (
    <a href={`mailto:${address}`} className="text-gold underline underline-offset-2 hover:text-gold-soft">
      {address}
    </a>
  );
}

/** Horizontally scrollable wrapper so wide tables never break a 375px viewport. */
export function TableWrap({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className="mb-4 -mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[560px] border-collapse text-left text-[.9rem] text-t2">
        {children}
      </table>
    </div>
  );
}

export function TH({ children }: { children: ReactNode }) {
  return (
    <th scope="col" className="border-b border-line px-3 py-2.5 align-top font-semibold text-t1">
      {children}
    </th>
  );
}

export function TD({ children }: { children: ReactNode }) {
  return <td className="border-b border-line px-3 py-2.5 align-top leading-relaxed">{children}</td>;
}

/** A pending value that must be set before or at publication. */
export function Placeholder({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-t3">{children}</span>;
}
