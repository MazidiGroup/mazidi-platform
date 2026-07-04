"use client";
import { useState } from "react";

type Item = { quote: string; author: string; role: string };

/** Large testimonial carousel — Home Section 7 (docs/01). */
export function Testimonials({ items }: { items: Item[] }) {
  const [i, setI] = useState(0);
  if (items.length === 0) return null;
  const t = items[i % items.length]!;
  const step = (d: number) => setI((v) => (v + d + items.length) % items.length);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-bg2 p-16 text-center max-sm:p-6">
      <div className="mb-[22px] text-[.9rem] tracking-[3px] text-gold" aria-label="5 star rating">★★★★★</div>
      <blockquote className="mx-auto mb-[30px] block max-w-[820px] font-display text-[clamp(1.3rem,2.4vw,1.8rem)] leading-[1.45]">
        “{t.quote}”
      </blockquote>
      <div>
        <b className="block text-[.95rem]">{t.author}</b>
        <span className="text-[.83rem] text-t3">{t.role}</span>
      </div>
      <div className="mt-[34px] flex justify-center gap-2.5">
        <button type="button" onClick={() => step(-1)} aria-label="Previous testimonial" className="h-[42px] w-[42px] rounded-full border border-line2 transition-colors hover:border-gold hover:text-gold">←</button>
        <button type="button" onClick={() => step(1)} aria-label="Next testimonial" className="h-[42px] w-[42px] rounded-full border border-line2 transition-colors hover:border-gold hover:text-gold">→</button>
      </div>
    </div>
  );
}
