/**
 * @mazidi/config — tenant registry + static group content.
 * Single source of truth for pillar metadata and the list of tenant slugs
 * the edge middleware may rewrite (middleware cannot query the DB cheaply).
 * Company CONTENT lives in the database; this file only registers identity.
 */

export type PillarKey = "build" | "run" | "grow";

export interface PillarMeta {
  key: PillarKey;
  name: string;
  /** CSS color token name from the Meridian design system */
  token: string;
  blurb: string;
  desc: string;
}

export const PILLARS: Record<PillarKey, PillarMeta> = {
  build: {
    key: "build", name: "Build It", token: "build",
    blurb: "We create businesses, buildings, technology and investments.",
    desc: "From first idea to finished asset — company formation, construction, architecture, property and technology, delivered under one roof.",
  },
  run: {
    key: "run", name: "Run It", token: "run",
    blurb: "We manage finance, operations, software and business infrastructure.",
    desc: "The engine room of your business — accounting, payroll, HR, IT, legal and operations, run by specialists so you can focus on the work.",
  },
  grow: {
    key: "grow", name: "Grow It", token: "grow",
    blurb: "We help businesses generate more revenue, customers and long-term value.",
    desc: "Marketing, branding, sales, consulting, education and investment — everything a business needs to scale and create lasting wealth.",
  },
};

/** Registered tenant slugs — MUST match Company.slug rows seeded in @mazidi/db. */
export const TENANT_SLUGS = [
  "construction", "realestate", "formation", "architecture", "development", "tech",
  "accounting", "payroll", "hr", "it", "legal", "operations", "gymapp", "software",
  "marketing", "branding", "sales", "consulting", "investment", "education", "venture",
] as const;
export type TenantSlug = (typeof TENANT_SLUGS)[number];
export const isTenantSlug = (s: string): s is TenantSlug =>
  (TENANT_SLUGS as readonly string[]).includes(s);

/** Subdomains reserved for platform apps — never treated as tenants. */
export const RESERVED_SUBDOMAINS = ["www", "portal", "team", "admin", "api"] as const;

export const OFFICES = [
  { city: "London", country: "United Kingdom · HQ", live: true },
  { city: "Dubai", country: "United Arab Emirates · HQ", live: true },
  { city: "Riyadh", country: "Saudi Arabia", live: false },
  { city: "Doha", country: "Qatar", live: false },
  { city: "Singapore", country: "Singapore", live: false },
  { city: "New York", country: "United States", live: false },
  { city: "Sydney", country: "Australia", live: false },
] as const;

export const INDUSTRIES = [
  "Construction", "Property", "Healthcare", "Fitness", "Technology",
  "Finance", "Hospitality", "Retail", "Manufacturing", "Professional Services",
] as const;

export const JOURNEY_STAGES: { title: string; pillar: PillarKey; desc: string; companies: string }[] = [
  { title: "Idea", pillar: "build", desc: "Validate the concept, model the numbers and shape the plan.", companies: "Mazidi Consulting · Business Education" },
  { title: "Company Setup", pillar: "build", desc: "Incorporate in the UK or UAE with banking and compliance handled.", companies: "Mazidi Formations · Mazidi Legal" },
  { title: "Construction", pillar: "build", desc: "Design and build your premises, office or development.", companies: "Mazidi Architecture · Mazidi Construction" },
  { title: "Accounting", pillar: "run", desc: "Books, tax and cashflow set up right from day one.", companies: "Mazidi Accounting · Mazidi Payroll" },
  { title: "Marketing", pillar: "grow", desc: "Brand, website and campaigns that bring customers to the door.", companies: "Mazidi Branding · Mazidi Marketing" },
  { title: "Sales", pillar: "grow", desc: "Playbooks, CRM and training to convert demand into revenue.", companies: "Mazidi Sales Consulting · Mazidi Software" },
  { title: "Expansion", pillar: "grow", desc: "New locations, new markets, new products — with a plan.", companies: "Mazidi Consulting · Mazidi Operations" },
  { title: "Investment", pillar: "grow", desc: "Turn profits into property and portfolio wealth.", companies: "Mazidi Investment Advisory · Mazidi Real Estate" },
  { title: "Exit", pillar: "grow", desc: "Prepare, value and sell — or scale through the Venture Studio.", companies: "Mazidi Venture Studio · Mazidi Legal" },
];

/** Primary CTA labels — the only ones permitted by the design system. */
export const CTA_LABELS = [
  "Book Consultation", "Get Quote", "Speak to an Expert", "Request Proposal", "Schedule Meeting",
] as const;

export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "mazidigroup.com";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${ROOT_DOMAIN}`;
export const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? `https://portal.${ROOT_DOMAIN}`;
export const TEAM_URL = process.env.NEXT_PUBLIC_TEAM_URL ?? `https://team.${ROOT_DOMAIN}`;
export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? `https://admin.${ROOT_DOMAIN}`;
