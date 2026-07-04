import type { ReactNode } from "react";
import { Container } from "./Section";

/** Contextual CTA band — required at the end of every page (docs/01 §4). */
export function CTABand({
  title = "Ready to build what's next?",
  sub = "Speak to an expert and we'll map your journey across the ecosystem — from formation to exit.",
  actions,
}: { title?: string; sub?: string; actions: ReactNode }) {
  return (
    <section className="pb-[110px] pt-10 max-sm:pb-[70px]">
      <Container>
        <div className="relative overflow-hidden rounded-xl border border-line bg-gradient-to-r from-[#141824] to-[#1C1710] px-14 py-[72px] text-center text-[#F2F3F5] max-sm:px-6 max-sm:py-12">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(500px 250px at 50% 0, rgba(201,164,97,.16), transparent)" }}
          />
          <h2 className="relative mb-3.5 font-display text-[clamp(1.9rem,3.4vw,2.7rem)] font-medium">{title}</h2>
          <p className="relative mx-auto mb-8 max-w-[520px] text-[#9AA0AD]">{sub}</p>
          <div className="relative flex flex-wrap justify-center gap-3.5">{actions}</div>
        </div>
      </Container>
    </section>
  );
}
