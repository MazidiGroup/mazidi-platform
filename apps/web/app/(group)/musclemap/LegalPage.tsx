import { Container, Kicker } from "@mazidi/ui";
import legal from "./legal.json";

/**
 * Muscle Map's Privacy Policy and Terms of Use, linked from the App Store
 * listing and the app. The text is exported from the app's own backend
 * (backend/legal_pages.py in MazidiGroup/MuscleMapAi) so the two never drift.
 */
export function LegalPage({ kind, title }: { kind: "privacy" | "terms"; title: string }) {
  const doc = legal[kind];
  return (
    <section className="hero-grad pb-24 pt-[150px]">
      <Container>
        <div className="mx-auto max-w-[760px]">
          <Kicker>Muscle Map</Kicker>
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-medium leading-[1.08] tracking-[-.02em]">{title}</h1>
          <p className="mt-3 text-[.84rem] text-t2">Last updated: {doc.updated}</p>
          <div
            className="mt-10 text-[.98rem] leading-[1.7] text-t2 [&_a]:font-semibold [&_a]:text-gold [&_h2]:mb-2 [&_h2]:mt-9 [&_h2]:text-[1.2rem] [&_h2]:font-semibold [&_h2]:text-t1 [&_li]:mb-1 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
            // Static text from our own repository, not user input.
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
          <p className="mt-12 border-t border-line pt-6 text-[.84rem] text-t2">
            Questions: <a className="font-semibold text-gold" href={`mailto:${legal.email}`}>{legal.email}</a>
          </p>
        </div>
      </Container>
    </section>
  );
}
