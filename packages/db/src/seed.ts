/**
 * Seed — registers the 21 tenants with services, testimonials, insights and
 * launch automation rules. Idempotent (upserts by slug/number).
 * Run: pnpm db:seed
 */
import { PrismaClient, Pillar, PostKind } from "@prisma/client";

const prisma = new PrismaClient();

type SeedCompany = {
  slug: string; name: string; pillar: Pillar; mono: string; accent: string;
  desc: string; svcs: string[];
};

const COMPANIES: SeedCompany[] = [
  { slug: "construction", name: "Mazidi Construction", pillar: "BUILD", mono: "MC", accent: "build", desc: "Design-and-build contracting for commercial and residential projects, delivered on time and on budget.", svcs: ["Commercial Build", "Residential", "Fit-Out", "Project Management"] },
  { slug: "realestate", name: "Mazidi Real Estate", pillar: "BUILD", mono: "MR", accent: "build", desc: "Sales, lettings and property management across London and Dubai's prime markets.", svcs: ["Sales", "Lettings", "Property Management", "Advisory"] },
  { slug: "formation", name: "Mazidi Formations", pillar: "BUILD", mono: "MF", accent: "build", desc: "Company formation in the UK and UAE — structure, registration, banking and compliance in days.", svcs: ["UK Ltd", "UAE Free Zone", "Banking", "Compliance"] },
  { slug: "architecture", name: "Mazidi Architecture", pillar: "BUILD", mono: "MA", accent: "build", desc: "Award-calibre architecture and interior design for spaces that work as beautifully as they look.", svcs: ["Architecture", "Interiors", "Planning", "3D Visualisation"] },
  { slug: "development", name: "Mazidi Development", pillar: "BUILD", mono: "MD", accent: "build", desc: "End-to-end property development — land, finance, build and exit.", svcs: ["Land Acquisition", "Development Finance", "New Builds", "Conversions"] },
  { slug: "tech", name: "Mazidi Technology Studio", pillar: "BUILD", mono: "MT", accent: "build", desc: "Custom software, apps and platforms engineered for businesses that want to move fast.", svcs: ["Web Platforms", "Mobile Apps", "AI Solutions", "Integrations"] },
  { slug: "accounting", name: "Mazidi Accounting", pillar: "RUN", mono: "MA", accent: "run", desc: "Accounting, tax and CFO services that keep you compliant and cash-smart.", svcs: ["Bookkeeping", "Tax", "VAT", "Fractional CFO"] },
  { slug: "payroll", name: "Mazidi Payroll", pillar: "RUN", mono: "MP", accent: "run", desc: "Painless payroll for teams of 1 to 1,000 — accurate, on time, every time.", svcs: ["Payroll Runs", "Pensions", "P60s/WPS", "Compliance"] },
  { slug: "hr", name: "Mazidi HR", pillar: "RUN", mono: "MH", accent: "run", desc: "HR services from contracts to culture — hire, manage and retain great people.", svcs: ["Contracts", "Recruitment", "Performance", "Employee Relations"] },
  { slug: "it", name: "Mazidi IT Services", pillar: "RUN", mono: "MI", accent: "run", desc: "Managed IT, cloud and cybersecurity that keeps your business always-on.", svcs: ["Managed IT", "Cloud", "Cybersecurity", "Support Desk"] },
  { slug: "legal", name: "Mazidi Legal", pillar: "RUN", mono: "ML", accent: "run", desc: "Commercial legal services — contracts, disputes and governance without the mystery.", svcs: ["Contracts", "Commercial Law", "Disputes", "Governance"] },
  { slug: "operations", name: "Mazidi Operations", pillar: "RUN", mono: "MO", accent: "run", desc: "Business operations consulting — systems, processes and SOPs that scale.", svcs: ["Process Design", "SOPs", "Automation", "Outsourcing"] },
  { slug: "gymapp", name: "Mazidi Gym App", pillar: "RUN", mono: "GA", accent: "run", desc: "The all-in-one fitness platform — workouts, nutrition, AI coaching and wearables.", svcs: ["Workout Tracking", "Nutrition", "AI Coach", "Wearables"] },
  { slug: "software", name: "Mazidi Software", pillar: "RUN", mono: "MS", accent: "run", desc: "Ready-to-run SaaS products for CRM, invoicing and business management.", svcs: ["CRM", "Invoicing", "Booking", "Analytics"] },
  { slug: "marketing", name: "Mazidi Marketing", pillar: "GROW", mono: "MM", accent: "grow", desc: "Full-service marketing agency — campaigns that compound into pipeline.", svcs: ["Paid Media", "SEO", "Content", "Social"] },
  { slug: "branding", name: "Mazidi Branding", pillar: "GROW", mono: "MB", accent: "grow", desc: "Brand strategy and identity for companies that want to be remembered.", svcs: ["Strategy", "Identity", "Guidelines", "Rebrands"] },
  { slug: "sales", name: "Mazidi Sales Consulting", pillar: "GROW", mono: "SC", accent: "grow", desc: "Sales systems, playbooks and training that turn conversations into contracts.", svcs: ["Sales Systems", "Playbooks", "Training", "CRM Setup"] },
  { slug: "consulting", name: "Mazidi Consulting", pillar: "GROW", mono: "BC", accent: "grow", desc: "Business consulting for strategy, expansion and turnaround.", svcs: ["Strategy", "Expansion", "Turnaround", "M&A Readiness"] },
  { slug: "investment", name: "Mazidi Investment Advisory", pillar: "GROW", mono: "IA", accent: "grow", desc: "Investment advisory and wealth strategy for founders and property investors.", svcs: ["Portfolio Strategy", "Property Investment", "Exit Planning", "Wealth"] },
  { slug: "education", name: "Mazidi Business Education", pillar: "GROW", mono: "BE", accent: "grow", desc: "Courses, masterminds and executive education for ambitious operators.", svcs: ["Courses", "Masterminds", "Workshops", "Certification"] },
  { slug: "venture", name: "Mazidi Venture Studio", pillar: "GROW", mono: "VS", accent: "grow", desc: "We co-found and invest in ventures built inside the Mazidi ecosystem.", svcs: ["Co-Founding", "Seed Capital", "Studio Support", "Exits"] },
];

const TESTIMONIALS = [
  { author: "Dr. Sarah Ahmed", role: "Founder, Nova Dental Clinics — London", quote: "Mazidi formed our company, built our clinic, runs our books and now manages our marketing. One team, one login, zero friction. It genuinely feels like having a group CFO, COO and CMO on call.", featured: true },
  { author: "James Whitfield", role: "Director, Whitfield Estates", quote: "We came for the construction. We stayed for everything else. Every handover to the next Mazidi company was seamless — they already had our documents, our history, our context.", featured: true },
  { author: "Layla Hassan", role: "CEO, Hassan Retail Group — Dubai", quote: "The portal alone is worth it. Invoices, contracts, project timelines and meetings for four different services — all in one dashboard. This is how business services should work.", featured: true },
  { author: "Tom Okafor", role: "Founder, Okafor Logistics", quote: "They set up the company on Monday, the accounting stack by Friday, and the brand launch within the month. Speed like this is a competitive advantage.", featured: true },
];

const POSTS: { slug: string; kind: PostKind; title: string; excerpt: string; readMinutes: number }[] = [
  { slug: "uk-uae-property-outlook-2026", kind: "REPORT", title: "UK & UAE Property Outlook 2026", excerpt: "Where yields, planning reform and off-plan demand are heading this year.", readMinutes: 12 },
  { slug: "idea-to-2-4m-in-18-months", kind: "CASE_STUDY", title: "From idea to £2.4m revenue in 18 months", excerpt: "How one founder moved through five Mazidi companies from formation to expansion.", readMinutes: 8 },
  { slug: "real-cost-of-inhouse-payroll", kind: "BLOG", title: "The real cost of running payroll in-house", excerpt: "The hidden hours, penalties and risk most SMEs never price in.", readMinutes: 5 },
  { slug: "inside-the-mazidi-ecosystem", kind: "VIDEO", title: "Inside the Mazidi ecosystem: Build → Run → Grow", excerpt: "A 14-minute tour of how 21 companies behave like one.", readMinutes: 14 },
  { slug: "freezone-vs-mainland-uae", kind: "BLOG", title: "Free zone vs mainland: choosing your UAE setup", excerpt: "Ownership, tax and visa trade-offs, explained without the jargon.", readMinutes: 6 },
  { slug: "gym-chain-3-2x-members", kind: "CASE_STUDY", title: "How one gym chain grew members 3.2× with our app", excerpt: "Retention mechanics, AI coaching and the numbers behind the growth.", readMinutes: 7 },
  { slug: "sme-lending-q3-2026", kind: "REPORT", title: "SME lending & finance conditions, Q3 2026", excerpt: "Rates, covenants and where challenger lenders are competing hardest.", readMinutes: 15 },
  { slug: "founder-stories-8-figure-exit", kind: "VIDEO", title: "Founder stories: exiting at 8 figures", excerpt: "Three founders on preparation, valuation and life after the sale.", readMinutes: 22 },
];

/** Launch cross-sell rules — evaluated by n8n via the OutboxEvent table (docs/04 §4). */
const AUTOMATION_RULES = [
  { name: "Construction complete → Property Management", trigger: { event: "project.completed", companySlug: "construction" }, actions: [{ type: "recommend", companySlug: "realestate", service: "property-management" }, { type: "email", template: "recommend-property-mgmt" }] },
  { name: "2nd invoice paid → Payroll", trigger: { event: "invoice.paid", companySlug: "accounting", occurrence: 2 }, actions: [{ type: "recommend", companySlug: "payroll" }] },
  { name: "Payroll active → HR Services", trigger: { event: "customer.active", companySlug: "payroll" }, actions: [{ type: "recommend", companySlug: "hr" }] },
  { name: "Marketing deal won → Sales Consulting", trigger: { event: "deal.won", companySlug: "marketing" }, actions: [{ type: "recommend", companySlug: "sales" }] },
  { name: "Revenue threshold → Investment Advisory", trigger: { event: "customer.revenue_threshold", amountGte: 250000 }, actions: [{ type: "recommend", companySlug: "investment" }, { type: "crm.createLead", companySlug: "investment" }] },
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  console.log("Seeding tenants…");
  for (const c of COMPANIES) {
    const company = await prisma.company.upsert({
      where: { slug: c.slug },
      update: { name: c.name, pillar: c.pillar, description: c.desc, status: "LIVE" },
      create: {
        slug: c.slug, name: c.name, pillar: c.pillar, description: c.desc,
        status: "LIVE",
        brand: { accent: c.accent, mono: c.mono },
        domains: [`${c.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "mazidigroup.com"}`],
      },
    });
    for (const [i, s] of c.svcs.entries()) {
      await prisma.service.upsert({
        where: { companyId_slug: { companyId: company.id, slug: slugify(s) } },
        update: { name: s, sortOrder: i },
        create: {
          companyId: company.id, slug: slugify(s), name: s, sortOrder: i,
          summary: `${s} delivered by dedicated ${c.name.replace("Mazidi ", "")} specialists with transparent pricing and portal-tracked progress.`,
        },
      });
    }
  }

  console.log("Setting plan prices (Stripe-billable services)…");
  const PLAN_PRICES: [string, string, number][] = [
    ["accounting", "bookkeeping", 149],
    ["payroll", "payroll-runs", 99],
    ["hr", "contracts", 129],
    ["it", "managed-it", 299],
    ["marketing", "seo", 950],
    ["software", "crm", 49],
    ["gymapp", "workout-tracking", 9.99],
  ];
  for (const [companySlug, serviceSlug, price] of PLAN_PRICES) {
    const company = await prisma.company.findUnique({ where: { slug: companySlug } });
    if (!company) continue;
    await prisma.service.update({
      where: { companyId_slug: { companyId: company.id, slug: serviceSlug } },
      data: { priceFrom: price },
    }).catch(() => console.warn(`  (skipped ${companySlug}/${serviceSlug})`));
  }

  console.log("Seeding testimonials…");
  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({ data: TESTIMONIALS.map((t) => ({ ...t, rating: 5 })) });
  }

  console.log("Seeding insights…");
  for (const p of POSTS) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, publishedAt: new Date(), tags: [p.kind.toLowerCase()] },
    });
  }

  console.log("Seeding automation rules…");
  for (const r of AUTOMATION_RULES) {
    const existing = await prisma.automationRule.findFirst({ where: { name: r.name } });
    if (!existing) await prisma.automationRule.create({ data: r });
  }

  console.log(`Done. ${COMPANIES.length} tenants live.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
