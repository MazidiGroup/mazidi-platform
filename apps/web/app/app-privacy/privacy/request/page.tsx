import type { Metadata } from "next";
import { Container, Kicker, Section } from "@mazidi/ui";
import { LI, LegalBody, LegalNav, Mail, P, UL } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Privacy Requests",
  description: "How to access, correct, export or delete MazidiPerformance personal information.",
};

export default function PrivacyRequestPage() {
  return (
    <>
      <section className="hero-grad pb-12 pt-[150px]">
        <Container>
          <Kicker>Privacy centre</Kicker>
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-medium leading-[1.08] tracking-[-.02em]">
            Privacy Requests
          </h1>
          <p className="mt-4 text-[1.05rem] text-t2">MazidiPerformance · part of MazidiGroup</p>
          <LegalNav current="request" />
        </Container>
      </section>

      <Section className="pt-14">
        <Container>
          <LegalBody>
            <P>
              MazidiPerformance users may ask to access, correct, export or delete personal information,
              withdraw consent, object to certain processing, or raise a complaint.
            </P>
            <P>
              Email{" "}
              <strong>
                <Mail address="privacy@mazidigroup.com" />
              </strong>{" "}
              from the email address associated with your account and include:
            </P>
            <UL>
              <LI>your full name;</LI>
              <LI>account email address;</LI>
              <LI>country or state/province of residence;</LI>
              <LI>the request you are making;</LI>
              <LI>enough detail to locate the relevant information;</LI>
              <LI>whether you are acting for someone else.</LI>
            </UL>
            <P>
              Do not email passwords, full payment-card details, passport copies or medical records. MazidiGroup
              will ask for additional verification only when reasonably necessary.
            </P>
            <P>
              Suggested subject: <strong>MazidiPerformance privacy request – [type of request]</strong>
            </P>
          </LegalBody>
        </Container>
      </Section>
    </>
  );
}
