"use client";
import { useState } from "react";

/** Accessible FAQ accordion (schema-ready, docs/05 §SEO). */
export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="max-w-[780px]">
      {items.map((item, i) => (
        <div key={item.q} className="border-b border-line">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 px-1 py-[22px] text-left text-base font-semibold"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.q}
            <span className={`text-t3 transition-transform duration-300 ${open === i ? "rotate-45" : ""}`} aria-hidden>+</span>
          </button>
          {open === i && <p className="max-w-[720px] px-1 pb-[22px] text-[.92rem] text-t2">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
