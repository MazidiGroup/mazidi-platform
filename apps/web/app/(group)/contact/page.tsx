import type { Metadata } from "next";
import { COMPANY_PROFILES, GROUP_CONTACT } from "@mazidi/config";
import { Arrow, Container, Kicker, Lead, Section } from "@mazidi/ui";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Mazidi Group — London and Dubai. Phone, WhatsApp and email for every business.",
};

export default function ContactPage() {
  const channels = [
    { title: "Dubai property", who: "Mazidi Homes", phone: COMPANY_PROFILES.mazidihomes.phone!, display: COMPANY_PROFILES.mazidihomes.phoneDisplay!, wa: COMPANY_PROFILES.mazidihomes.whatsapp!, email: COMPANY_PROFILES.mazidihomes.email! },
    { title: "London renovations", who: "Mazidi Construction", phone: GROUP_CONTACT.phone, display: GROUP_CONTACT.phoneDisplay, wa: GROUP_CONTACT.whatsapp, email: GROUP_CONTACT.email },
    { title: "Backup & IT", who: "Mazidi IT Services", phone: GROUP_CONTACT.phone, display: GROUP_CONTACT.phoneDisplay, wa: GROUP_CONTACT.whatsapp, email: GROUP_CONTACT.email },
    { title: "The apps", who: "Muscle Map · Fitness Muscle Coach · Football Academy · RERA Exam Prep", email: GROUP_CONTACT.email },
  ];
  return (
    <>
      <section className="hero-grad pb-16 pt-[150px]">
        <Container>
          <Kicker>Contact</Kicker>
          <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[1.05] tracking-[-.02em]">
            Talk to the person who{" "}
            <span className="bg-gradient-to-r from-gold to-gold-soft bg-clip-text text-transparent">does the work.</span>
          </h1>
          <Lead className="mt-6">London · Dubai · {GROUP_CONTACT.hours}</Lead>
        </Container>
      </section>
      <Section className="pt-12">
        <Container>
          <div className="grid grid-cols-2 gap-[22px] max-lg:grid-cols-1">
            <LeadForm />
            <div className="grid gap-4">
              {channels.map((c) => (
                <div key={c.title} className="rounded-lg border border-line bg-bg2 p-6">
                  <b className="block text-[1rem]">{c.title}</b>
                  <span className="text-[.82rem] text-t3">{c.who}</span>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[.88rem]">
                    {"phone" in c && c.phone && <a href={`tel:${c.phone}`} className="text-t2 hover:text-gold">{c.display}</a>}
                    {"wa" in c && c.wa && <a href={`https://wa.me/${c.wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-t2 hover:text-gold">WhatsApp <Arrow /></a>}
                    <a href={`mailto:${c.email}`} className="text-t2 hover:text-gold">{c.email}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
