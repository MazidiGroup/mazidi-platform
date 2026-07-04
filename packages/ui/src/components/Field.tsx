import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";

const inputCls =
  "w-full rounded-xl border border-line bg-bg3 px-4 py-[13px] text-[.92rem] text-t1 outline-none transition-colors focus:border-gold";

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="mb-4 block">
      <span className="mb-[7px] block text-[.8rem] font-semibold text-t2">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[.78rem] text-danger" role="alert">{error}</span>}
    </label>
  );
}

export const Input = ({ className, ...p }: ComponentProps<"input">) => (
  <input className={clsx(inputCls, className)} {...p} />
);
export const Select = ({ className, ...p }: ComponentProps<"select">) => (
  <select className={clsx(inputCls, className)} {...p} />
);
export const Textarea = ({ className, ...p }: ComponentProps<"textarea">) => (
  <textarea className={clsx(inputCls, className)} {...p} />
);
