/**
 * Seed — registers the real Mazidi Group businesses with their services.
 * Idempotent (upserts by slug). Companies that used to exist as placeholders
 * are archived, never deleted, so historic rows keep their foreign keys.
 * Public profile data (phones, websites, App Store links) lives in
 * @mazidi/config COMPANY_PROFILES, not here.
 * Run: pnpm db:seed
 */
import { PrismaClient, type Pillar } from "@prisma/client";

const prisma = new PrismaClient();

type SeedService = { slug: string; name: string; summary: string; priceFrom?: number };
type SeedCompany = {
  slug: string; name: string; pillar: Pillar; mono: string; accent: string;
  tagline: string; desc: string; domains: string[]; svcs: SeedService[];
};

/** Pillar meaning (see @mazidi/config): BUILD = Property & Construction, RUN = Apps, GROW = IT Services. */
const COMPANIES: SeedCompany[] = [
  {
    slug: "mazidihomes", name: "Mazidi Homes", pillar: "BUILD", mono: "MH", accent: "build",
    tagline: "Dubai off-plan, without the guesswork.",
    desc: "A RERA-registered Dubai brokerage (ORN 47322) with research-grade pages for 670+ off-plan projects — real payment plans, true purchase costs and a licensed broker on WhatsApp.",
    domains: ["mazidihomes.com", "www.mazidihomes.com"],
    svcs: [
      { slug: "off-plan-brokerage", name: "Off-Plan Brokerage", summary: "Buy direct from Dubai developers through a RERA-registered brokerage — launches, resales and allocations." },
      { slug: "payment-plan-mapping", name: "Payment Plan Mapping", summary: "Every milestone mapped to an amount and a date before you commit." },
      { slug: "true-cost-calculators", name: "True-Cost Calculators", summary: "DLD fees, Oqood, admin and service charges — the full number, not the headline price." },
      { slug: "area-developer-guides", name: "Area & Developer Guides", summary: "85 areas and 300+ developers researched from the developer's own documents." },
    ],
  },
  {
    slug: "construction", name: "Mazidi Construction", pillar: "BUILD", mono: "MC", accent: "build",
    tagline: "Bathrooms, kitchens and full renovations across West London.",
    desc: "Bathroom and kitchen refits, Venetian plastering, carpentry and decorating — 28+ completed projects, every one photographed and rated 10/10 on Checkatrade.",
    domains: ["construction.mazidigroup.com"],
    svcs: [
      { slug: "bathrooms-shower-rooms", name: "Bathrooms & Shower Rooms", summary: "Full bathroom and shower-room refits — strip-out, plumbing, tiling, fitting and finish — our most photographed work." },
      { slug: "kitchens", name: "Kitchens", summary: "Kitchen installations, splashbacks and tiling, fitted to the millimetre." },
      { slug: "venetian-plastering", name: "Venetian Plastering", summary: "Polished Venetian plaster walls and bathrooms — a specialist finish, done in-house." },
      { slug: "carpentry", name: "Carpentry", summary: "Bespoke carpentry and joinery: built-ins, panelling, doors and finish work." },
      { slug: "painting-decorating", name: "Painting & Decorating", summary: "Clean, tidy decorating that finishes every project properly." },
      { slug: "tiling-exterior", name: "Tiling & Exterior", summary: "Wall and floor tiling, epoxy grout, and exterior works." },
    ],
  },
  {
    slug: "it", name: "Mazidi IT Services", pillar: "GROW", mono: "IT", accent: "grow",
    tagline: "Could your business restore its computers tomorrow?",
    desc: "Business backup and recovery for small offices: a backup box installed on your network, every computer copied to it, an optional offsite copy, and restores tested with you.",
    domains: ["backup.mazidigroup.com"],
    svcs: [
      { slug: "business-backup-box", name: "Business Backup Box", summary: "Appliance, storage, every computer set up, version history and a restore test before we leave.", priceFrom: 1495 },
      { slug: "backup-monitoring", name: "Backup Monitoring", summary: "We check backups are completing, follow up when they are not, and re-test restores periodically.", priceFrom: 39 },
      { slug: "offsite-copy", name: "Offsite Copy", summary: "An optional second copy held elsewhere — what stands between you and starting again after theft, fire or ransomware." },
      { slug: "free-backup-check", name: "Free Backup Check", summary: "Fifteen minutes, by phone or in person: what you have now, what would happen if a machine failed, and whether a restore has ever been tested." },
    ],
  },
  {
    slug: "musclemap", name: "Muscle Map", pillar: "RUN", mono: "MM", accent: "run",
    tagline: "Train smarter. Understand every movement.",
    desc: "Interactive muscle anatomy, AI coaching and workout tracking for iPhone, iPad and Apple Watch — see which muscles every exercise works and log your sets from your wrist.",
    domains: ["musclemap.mazidigroup.com"],
    svcs: [
      { slug: "interactive-anatomy", name: "Interactive Anatomy", summary: "See which muscles each exercise activates on a detailed human body model." },
      { slug: "apple-watch-logging", name: "Apple Watch Logging", summary: "Record sets and reps from your wrist without touching your phone." },
      { slug: "ai-coaching", name: "AI Coaching", summary: "Personalised guidance that adapts to your goals and progress." },
      { slug: "progress-tracking", name: "Progress Tracking", summary: "Log workouts, follow a weekly plan and watch strength and consistency grow." },
    ],
  },
  {
    slug: "fitnessmusclecoach", name: "Fitness Muscle Coach", pillar: "RUN", mono: "FC", accent: "run",
    tagline: "Personal coaching, in your client's pocket.",
    desc: "A personal coaching app with separate coach and client logins — programmes, check-ins, messaging and progress in one place. Submitted to the App Store and awaiting approval.",
    domains: ["fitnessmusclecoach.mazidigroup.com"],
    svcs: [
      { slug: "coach-dashboard", name: "Coach Login", summary: "Manage every client, programme and check-in from one place." },
      { slug: "client-app", name: "Client Login", summary: "Clients see their programme, log sessions and message their coach." },
      { slug: "programme-builder", name: "Programme Builder", summary: "Build and assign training programmes in minutes." },
      { slug: "check-ins-progress", name: "Check-Ins & Progress", summary: "Weekly check-ins, photos and metrics, tracked over time." },
    ],
  },
  {
    slug: "footballacademy", name: "Football Academy", pillar: "RUN", mono: "FA", accent: "run",
    tagline: "Run your academy from one app.",
    desc: "A football coaching app with coach and player logins — session plans, squads, attendance and player development tracking. Submitted to the App Store and awaiting approval.",
    domains: ["footballacademy.mazidigroup.com"],
    svcs: [
      { slug: "coach-login", name: "Coach Login", summary: "Plan sessions, manage squads and record attendance." },
      { slug: "player-login", name: "Player & Parent Login", summary: "Players and parents see sessions, feedback and development goals." },
      { slug: "session-planning", name: "Session Planning", summary: "Drills, session plans and match-day squads in one place." },
      { slug: "development-tracking", name: "Development Tracking", summary: "Track each player's progress across the season." },
    ],
  },
  {
    slug: "reraprep", name: "RERA Exam Prep Dubai", pillar: "RUN", mono: "RE", accent: "run",
    tagline: "Pass the Dubai broker exam with the law beside every answer.",
    desc: "120 original practice questions for the Dubai RERA broker licence, each explained and cited to the article of law it comes from, with timed mock exams that match the real paper. Works offline, no account needed.",
    domains: ["reraprep.mazidigroup.com"],
    svcs: [
      { slug: "cited-questions", name: "Questions Cited to the Law", summary: "120 original questions, each explained with a source card naming the exact law and article." },
      { slug: "timed-mock-exams", name: "Timed Mock Exams", summary: "30 questions in 30 minutes against a 75% pass mark — timed like the real paper." },
      { slug: "review-mistakes", name: "Review Only What You Got Wrong", summary: "Wrong answers kept with what you said, what the law says, and the citation." },
      { slug: "offline-no-account", name: "Offline, No Account", summary: "Study anywhere; progress stays on your device. No sign-up, no tracking." },
    ],
  },
];

/** Former placeholder tenants — archived so their rows (and any FKs) survive. */
const ARCHIVED = [
  "realestate", "formation", "architecture", "development", "tech", "accounting", "payroll", "hr", "legal",
  "operations", "gymapp", "software", "marketing", "branding", "sales", "consulting", "investment", "education",
  "venture", "coachapp", "coachgrowth",
];

async function main() {
  console.log("Seeding businesses…");
  for (const c of COMPANIES) {
    const company = await prisma.company.upsert({
      where: { slug: c.slug },
      update: { name: c.name, pillar: c.pillar, tagline: c.tagline, description: c.desc, status: "LIVE", brand: { accent: c.accent, mono: c.mono }, domains: c.domains },
      create: {
        slug: c.slug, name: c.name, pillar: c.pillar, tagline: c.tagline, description: c.desc,
        status: "LIVE", brand: { accent: c.accent, mono: c.mono }, domains: c.domains,
      },
    });
    for (const [i, s] of c.svcs.entries()) {
      await prisma.service.upsert({
        where: { companyId_slug: { companyId: company.id, slug: s.slug } },
        update: { name: s.name, summary: s.summary, sortOrder: i, priceFrom: s.priceFrom ?? null },
        create: { companyId: company.id, slug: s.slug, name: s.name, summary: s.summary, sortOrder: i, priceFrom: s.priceFrom ?? null },
      });
    }
  }

  console.log("Archiving retired placeholder tenants…");
  await prisma.company.updateMany({ where: { slug: { in: ARCHIVED } }, data: { status: "ARCHIVED" } });

  console.log(`Done. ${COMPANIES.length} businesses live.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
