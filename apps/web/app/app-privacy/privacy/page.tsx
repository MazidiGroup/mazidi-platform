import type { Metadata } from "next";
import { Container, Kicker, Section } from "@mazidi/ui";
import { H2, H3, LI, LegalBody, LegalNav, Mail, P, TableWrap, TD, TH, UL } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How MazidiPerformance collects, uses, protects and shares personal information.",
};

const REGISTERED_OFFICE = "Flat 55 Banstead Court, 60 Westway, London, England, W12 0QJ";

export default function PrivacyNoticePage() {
  return (
    <>
      <section className="hero-grad pb-12 pt-[150px]">
        <Container>
          <Kicker>Privacy centre</Kicker>
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-medium leading-[1.08] tracking-[-.02em]">
            Privacy Notice
          </h1>
          <p className="mt-4 text-[1.05rem] text-t2">MazidiPerformance · part of MazidiGroup</p>
          <LegalNav current="notice" />
        </Container>
      </section>

      <Section className="pt-14">
        <Container>
          <LegalBody>
            <P>
              <strong>Last updated:</strong> 29 July 2026
            </P>

            {/*
              Owner-directed scope insertion (29 July 2026) — see PRIVACY_WORDING_DIFF.md §9.
              An ADDITION to the approved legal source; pending legal approval. Do not reword.
            */}
            <P>
              This Privacy Notice applies to the MazidiPerformance coaching application and related
              MazidiPerformance services. It does not apply to other MazidiGroup websites, portals or
              services where a separate privacy notice is provided.
            </P>

            <H2>1. Who we are</H2>
            <P>
              MazidiPerformance is a service operated by Mazidi Homes Limited under the MazidiGroup brand.
              Mazidi Homes Limited is the controller of the personal information described in this Privacy
              Notice. In this Privacy Notice, references to ‘MazidiGroup’, ‘MazidiPerformance’, ‘we’, ‘us’ and
              ‘our’ mean Mazidi Homes Limited, unless the context states otherwise.
            </P>
            <UL>
              <LI>Registered address: {REGISTERED_OFFICE}</LI>
              <LI>Company registration number: 15350516</LI>
              <LI>
                Privacy contact: <Mail address="privacy@mazidigroup.com" />
              </LI>
              <LI>
                Security contact: <Mail address="security@mazidigroup.com" />
              </LI>
              <LI>
                General support: <Mail address="support@mazidigroup.com" />
              </LI>
            </UL>
            <P>
              Some coaches or corporate customers may have a different role. Any such arrangement must be
              explained at the point of collection and documented contractually.
            </P>

            <H2>2. Scope and age</H2>
            <P>
              This notice covers the MazidiPerformance iOS app, related web pages, coaching services, customer
              support and connected integrations. The service is intended for people aged{" "}
              <strong>18 or over</strong>. Do not create an account if you are under 18. If MazidiPerformance
              later supports minors, this notice, consent flow and product design must be revised before launch
              of that feature.
            </P>

            <H2>3. Information we collect</H2>
            <P>We may collect:</P>
            <UL>
              <LI>
                <strong>Account and contact information:</strong> name, email address, telephone number, login
                identifiers, profile information, country, language and time zone.
              </LI>
              <LI>
                <strong>Coaching information:</strong> goals, plans, assignments, habits, check-ins, progress,
                notes, messages, files and communications with coaches.
              </LI>
              <LI>
                <strong>Health, fitness, nutrition and wellness information:</strong> information you choose to
                provide about exercise, activity, sleep, nutrition, body measurements, injuries, symptoms,
                limitations, wellbeing and performance.
              </LI>
              <LI>
                <strong>Payment and subscription information:</strong> subscription status, transaction
                references, purchase history, billing country and limited payment metadata. Payment-card
                details should be handled by Apple or the appointed payment processor and not stored by
                MazidiPerformance unless specifically documented.
              </LI>
              <LI>
                <strong>App, device and diagnostic information:</strong> user ID, device and app version,
                operating system, language, IP-derived region, security events, product interactions, crash
                reports and performance logs.
              </LI>
              <LI>
                <strong>Support and privacy-request information:</strong> support messages, complaint details,
                identity-verification information and records of how requests were handled.
              </LI>
            </UL>
            <P>
              <strong>Biometric clarification:</strong> Face ID or Touch ID used to unlock the app normally
              returns an authentication result from the device; MazidiPerformance should not receive the
              underlying fingerprint or face template. Any separate biometric-identification feature must
              receive a specific legal and technical review before launch.
            </P>

            <H2>4. Why we use information</H2>
            <P>We use personal information to:</P>
            <UL>
              <LI>create and secure accounts;</LI>
              <LI>provide coaching, personalisation, progress tracking and communications;</LI>
              <LI>process subscriptions and maintain financial records;</LI>
              <LI>operate, troubleshoot and improve the app;</LI>
              <LI>prevent fraud, abuse and security incidents;</LI>
              <LI>respond to support, privacy and legal requests;</LI>
              <LI>send service communications and, only with the required permission, marketing;</LI>
              <LI>comply with legal and regulatory obligations.</LI>
            </UL>
            <P>For UK/EEA users, the proposed lawful bases are:</P>
            <TableWrap label="Proposed lawful bases">
              <thead>
                <tr>
                  <TH>Purpose</TH>
                  <TH>Proposed Article 6 basis</TH>
                  <TH>Additional condition for health data</TH>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <TD>Account and contracted coaching service</TD>
                  <TD>Contract</TD>
                  <TD>
                    Explicit consent should be obtained for optional health and wellness information; lawyer to
                    confirm the final Article 9 condition
                  </TD>
                </tr>
                <tr>
                  <TD>Security, fraud prevention and service reliability</TD>
                  <TD>Legitimate interests and/or legal obligation</TD>
                  <TD>Limit health-data exposure; do not place health data in routine logs</TD>
                </tr>
                <tr>
                  <TD>Payments, tax and accounting</TD>
                  <TD>Contract and legal obligation</TD>
                  <TD>Not normally applicable</TD>
                </tr>
                <tr>
                  <TD>Optional analytics</TD>
                  <TD>Consent where required, otherwise carefully assessed legitimate interests</TD>
                  <TD>
                    Do not use health data for analytics unless strictly necessary and clearly disclosed
                  </TD>
                </tr>
                <tr>
                  <TD>Marketing</TD>
                  <TD>Consent or a legally permitted existing-customer route</TD>
                  <TD>Never use health information to target marketing</TD>
                </tr>
              </tbody>
            </TableWrap>
            <P>
              Consent can be withdrawn through app settings or by contacting{" "}
              <Mail address="privacy@mazidigroup.com" />. Withdrawal does not affect processing already carried
              out lawfully, but it may prevent features that require the relevant information from working.
            </P>

            <H2>5. Health and sensitive information</H2>
            <P>
              Health-related information is sensitive. MazidiPerformance will use it only to provide the
              user-facing coaching and performance features described when the information is collected. We do
              not sell health information, disclose it to data brokers, or use it for advertising or unrelated
              profiling.
            </P>
            <P>
              The app should provide a separate, clear health-data consent screen before health information is
              entered, imported or shared. Access to health information must be restricted to authorised
              personnel and coaches who need it to provide the service.
            </P>
            <P>
              MazidiPerformance provides coaching and educational support, not emergency or medical services.
              It is not a substitute for diagnosis, treatment or professional medical advice. Users should
              contact local emergency services in an emergency.
            </P>

            <H2>6. Sharing and service providers</H2>
            <P>We may disclose information to:</P>
            <UL>
              <LI>authorised coaches and staff who need access to provide the service;</LI>
              <LI>
                hosting, database, authentication, communications, analytics, crash-reporting, security,
                support and payment providers;
              </LI>
              <LI>professional advisers, insurers, auditors and regulators;</LI>
              <LI>
                a purchaser or successor in a genuine corporate transaction, subject to appropriate
                protections;
              </LI>
              <LI>
                law-enforcement or other authorities where disclosure is legally required or necessary to
                protect rights and safety.
              </LI>
            </UL>
            <P>
              Service providers are required by contract to process information only for the agreed purposes,
              maintain appropriate security, assist with individual rights and delete or return information as
              required. The final provider list and subprocessor links must be completed in MazidiGroup’s
              internal vendor register.
            </P>
            <P>
              Independent coaches must not receive app access until their controller/processor role,
              confidentiality obligations, permitted use and offboarding process have been documented.
            </P>

            <H2>7. International transfers and residency</H2>
            <P>
              MazidiGroup may use providers that store or access information in the United Kingdom, European
              Economic Area, United States, Canada or other disclosed locations. Where data-protection law
              requires safeguards for an international transfer, MazidiGroup will use an applicable mechanism,
              such as an adequacy decision, approved contractual clauses, the UK transfer addendum or another
              lawful safeguard, and will carry out any required risk assessment.
            </P>
            <P>
              Do not publish a claim of “UK-only” or “EU-only” hosting unless it is contractually guaranteed
              for primary storage, backups, support access and subprocessors.
            </P>

            <H2>8. Retention</H2>
            <P>
              We keep information only for as long as reasonably required for the purpose collected, legal
              obligations and the establishment or defence of claims. The proposed starting schedule is:
            </P>
            <TableWrap label="Proposed retention schedule">
              <thead>
                <tr>
                  <TH>Information</TH>
                  <TH>Proposed period</TH>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <TD>Account, coaching plans, progress, messages and health/wellness data</TD>
                  <TD>
                    While the account is active, then deletion or de-identification within 30 days unless
                    retention is legally required
                  </TD>
                </tr>
                <tr>
                  <TD>Backups</TD>
                  <TD>
                    Removed through the normal backup cycle, targeted at no more than 35 additional days
                  </TD>
                </tr>
                <tr>
                  <TD>Crash and diagnostic data</TD>
                  <TD>
                    90 days unless needed to investigate a continuing security or reliability problem
                  </TD>
                </tr>
                <tr>
                  <TD>Product analytics</TD>
                  <TD>14 months, preferably using minimised or pseudonymous identifiers</TD>
                </tr>
                <tr>
                  <TD>Support tickets</TD>
                  <TD>24 months after closure</TD>
                </tr>
                <tr>
                  <TD>Security logs</TD>
                  <TD>12 months, longer only for an active investigation</TD>
                </tr>
                <tr>
                  <TD>Payment and accounting records</TD>
                  <TD>
                    The legally required accounting/tax period in the relevant jurisdiction; legal adviser to
                    confirm
                  </TD>
                </tr>
                <tr>
                  <TD>Consent and privacy-request records</TD>
                  <TD>Six years after account closure or final resolution, subject to legal review</TD>
                </tr>
              </tbody>
            </TableWrap>
            <P>
              The internal retention schedule overrides this summary where a shorter period is technically and
              legally appropriate.
            </P>

            <H2>9. Your choices and rights</H2>
            <P>
              Depending on location and applicable law, users may have rights to request access, correction,
              deletion, restriction, objection, portability, withdrawal of consent, review of certain automated
              decisions, and information about disclosures or recipients. Users may also complain about how
              their information has been handled.
            </P>
            <P>
              Requests can be sent to <Mail address="privacy@mazidigroup.com" />. We may need proportionate
              information to verify identity. We will respond within the period required by applicable law. UK
              and EEA requests are generally handled within one month, subject to lawful extensions.
            </P>
            <H3>United Kingdom complaints</H3>
            <P>
              UK users may submit a data-protection complaint by email to{" "}
              <Mail address="privacy@mazidigroup.com" /> or through the process at{" "}
              <code className="rounded bg-bg2 px-1.5 py-0.5 text-[.88em]">/privacy/complaints</code>. We will
              acknowledge the complaint within 30 days, investigate it without undue delay, keep the
              complainant informed where appropriate, and communicate the outcome. Users may also raise
              concerns with the UK Information Commissioner’s Office.
            </P>
            <H3>United States</H3>
            <P>
              Where an applicable US state privacy law applies, users may have rights to know, access, correct,
              delete, obtain a portable copy, and opt out of certain sale, sharing, targeted advertising or
              profiling. MazidiGroup’s operating assumption is that it does <strong>not</strong> sell personal
              information, share it for cross-context behavioural advertising, or use health information for
              advertising. This must be confirmed against every SDK and vendor before publication.
            </P>
            <P>
              Washington residents may have additional rights relating to consumer health data, including
              consent requirements and deletion from relevant systems. A dedicated consumer health data notice
              should be added if Washington users are accepted at launch.
            </P>
            <H3>Canada</H3>
            <P>
              Canadian users may request access to and correction of their information, withdraw consent
              subject to legal or contractual restrictions, and challenge compliance through MazidiGroup’s
              privacy contact. MazidiGroup will use clear, meaningful consent for sensitive information and
              maintain records of reportable and non-reportable privacy incidents as required.
            </P>

            <H2>10. Account deletion and data export</H2>
            <P>
              Users may request deletion of their account and associated personal information through the
              privacy-request process or by emailing <Mail address="privacy@mazidigroup.com" />.
            </P>
            <P>
              Users should also be able to request or download an export in a commonly used format, such as
              JSON and CSV, with uploaded files in their original format. The export should include profile
              data, coaching plans, progress, messages, health/wellness entries and consent history where
              appropriate.
            </P>

            <H2>11. Security</H2>
            <P>
              MazidiGroup uses administrative, technical and organisational safeguards appropriate to the
              sensitivity of the information. The minimum launch standard should include encryption in transit
              and at rest, least-privilege access, multi-factor authentication for administrative accounts,
              secure secret management, environment separation, tested backups, vulnerability management, audit
              logging, staff confidentiality and an incident-response process.
            </P>
            <P>
              No method is completely secure. Users should use a strong, unique password and protect access to
              their devices.
            </P>

            <H2>12. Automated recommendations and AI</H2>
            <P>
              The initial compliance assumption is that MazidiPerformance does not make decisions with legal or
              similarly significant effects solely by automated means. Personalised suggestions should remain
              coaching support and should allow meaningful human review.
            </P>
            <P>
              Production-user information must not be sent to an AI model, coding assistant or model-training
              programme unless the data flow, provider contract, retention, training settings, international
              transfers, user notice and appropriate consent have been reviewed and documented. If an
              AI-powered user feature is added, this notice must be updated before release.
            </P>

            <H2>13. Changes to this notice</H2>
            <P>
              We may update this notice when the service, vendors or law changes. We will post the updated
              version at this URL and change the “Last updated” date. Material changes may also be communicated
              in the app or by email where appropriate.
            </P>

            <H2>14. Contact</H2>
            <P>
              For privacy questions, data-protection requests or complaints, contact us at{" "}
              <Mail address="privacy@mazidigroup.com" />.
            </P>
            <P>
              <strong>Privacy Team – MazidiGroup</strong>
            </P>
            <P>
              Email: <Mail address="privacy@mazidigroup.com" />
            </P>
            <P>Address: {REGISTERED_OFFICE}</P>
            <P>
              Security incidents: <Mail address="security@mazidigroup.com" />
            </P>
            <P>
              General support: <Mail address="support@mazidigroup.com" />
            </P>
          </LegalBody>
        </Container>
      </Section>
    </>
  );
}
