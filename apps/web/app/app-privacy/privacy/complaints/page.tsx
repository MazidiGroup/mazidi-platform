import type { Metadata } from "next";
import { Container, Kicker, Section } from "@mazidi/ui";
import { H2, LI, LegalBody, LegalNav, Mail, P, Placeholder, UL } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Data Protection Complaints",
  description: "How to make a data protection complaint to MazidiGroup about MazidiPerformance.",
};

const REGISTERED_OFFICE = "Flat 55 Banstead Court, 60 Westway, London, England, W12 0QJ";

export default function PrivacyComplaintsPage() {
  return (
    <>
      <section className="hero-grad pb-12 pt-[150px]">
        <Container>
          <Kicker>Privacy centre</Kicker>
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-medium leading-[1.08] tracking-[-.02em]">
            Data Protection Complaints
          </h1>
          <p className="mt-4 text-[1.05rem] text-t2">MazidiPerformance · part of MazidiGroup</p>
          <LegalNav current="complaints" />
        </Container>
      </section>

      <Section className="pt-14">
        <Container>
          <LegalBody>
            <P>
              <strong>Owner:</strong> MazidiGroup Privacy Lead
            </P>
            <P>
              <strong>Effective date:</strong>{" "}
              <Placeholder>[EFFECTIVE DATE — SET ON PUBLICATION]</Placeholder>
            </P>

            <H2>Purpose</H2>
            <P>
              This procedure provides a clear route for people to complain about how MazidiGroup handles
              personal information in connection with MazidiPerformance. It is designed to meet the UK
              requirement in force from 19 June 2026 and to support complaints from all launch markets.
            </P>

            <H2>How to complain</H2>
            <P>
              For privacy questions, data-protection requests or complaints, contact us at{" "}
              <Mail address="privacy@mazidigroup.com" />.
            </P>
            <P>
              Complaints may be made by email to <Mail address="privacy@mazidigroup.com" />, by post to{" "}
              {REGISTERED_OFFICE}, or through any future secure online form. Staff must recognise complaints
              received through support, social media or coaching channels and route them to the Privacy Lead
              without copying sensitive details into unnecessary systems.
            </P>
            <P>
              A complaint may concern collection, transparency, lawful basis, consent, access, correction,
              deletion, retention, sharing, security, automated processing, an earlier rights request or any
              other handling of personal information.
            </P>

            <H2>Procedure</H2>
            <ol className="mb-4 list-decimal space-y-3 pl-5 text-[.97rem] leading-relaxed text-t2 marker:text-gold">
              <li>
                <strong>Log and protect:</strong> Create a case in the Data Rights and Complaints Log. Restrict
                access and preserve relevant evidence.
              </li>
              <li>
                <strong>Acknowledge:</strong> Acknowledge receipt promptly and no later than 30 days for UK
                complaints. Give a case reference and contact point.
              </li>
              <li>
                <strong>Verify where necessary:</strong> Request only proportionate evidence. Do not request
                copies of identity documents unless required.
              </li>
              <li>
                <strong>Investigate:</strong> Identify the systems, people, vendors and decisions involved;
                obtain logs and contractual information; and assess whether containment or remediation is
                needed.
              </li>
              <li>
                <strong>Keep informed:</strong> If the investigation is not complete, provide proportionate
                progress updates and explain delays.
              </li>
              <li>
                <strong>Outcome:</strong> Communicate findings, action taken, any information that cannot be
                supplied, appeal/escalation options and regulator contact information.
              </li>
              <li>
                <strong>Remediate and learn:</strong> Fix data, permissions, procedures, contracts or product
                behaviour as needed. Record lessons and owners.
              </li>
              <li>
                <strong>Close and retain:</strong> Record closure and keep the case according to the approved
                retention schedule.
              </li>
            </ol>

            <H2>Target service levels</H2>
            <UL>
              <LI>Initial triage: one business day</LI>
              <LI>
                Acknowledgement: five business days internally; never later than the applicable statutory
                requirement
              </LI>
              <LI>Routine outcome target: 30 calendar days</LI>
              <LI>Complex matters: without undue delay, with progress updates</LI>
            </UL>

            <H2>Independence and escalation</H2>
            <P>
              A person materially involved in the disputed decision should not be the sole investigator.
              High-risk, repeated, health-data or security complaints must be escalated to senior management
              and legal counsel. Potential breaches must be handled under the Incident and Breach Response Plan
              in parallel.
            </P>
          </LegalBody>
        </Container>
      </Section>
    </>
  );
}
