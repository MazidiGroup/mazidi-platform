import type { Metadata } from "next";
import { Container, Kicker, Lead, Section } from "@mazidi/ui";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a consultation with Mazidi Group — London, Dubai, worldwide.",
};

export default function ContactPage() {
  return (
    <>
      <section className="hero-grad pb-16 pt-[150px]">
        <Container>
          <Kicker>Contact</Kicker>
          <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[1.05] tracking-[-.02em]">
            Let&apos;s map your{" "}
            <span className="bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-transparent">journey.</span>
          </h1>
          <Lead className="mt-6">London · Dubai · hello@mazidigroup.com</Lead>
        </Container>
      </section>
      <Section className="pt-12">
        <Container>
          <div className="mx-auto max-w-[640px]">
            <LeadForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
