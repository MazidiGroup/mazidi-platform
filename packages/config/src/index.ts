/// <reference path="./env.d.ts" />
/**
 * @mazidi/config — tenant registry + static group content.
 * Single source of truth for pillar metadata, the list of tenant slugs the
 * edge middleware may rewrite (middleware cannot query the DB cheaply), and
 * the per-company public profile (contact details, external sites, App Store
 * listings) that the marketing site renders next to the DB-managed content.
 */

export type PillarKey = "build" | "run" | "grow";

export interface PillarMeta {
  key: PillarKey;
  /** Public URL segment, e.g. /property */
  slug: string;
  name: string;
  /** Short label for chips / nav */
  short: string;
  /** CSS color token name from the Meridian design system */
  token: string;
  blurb: string;
  desc: string;
}

/**
 * The Postgres enum `Pillar` (BUILD | RUN | GROW) is the stable internal key
 * for Company.pillar. What each key MEANS on the website is defined here:
 *   build → Property & Construction   (Mazidi Homes, Mazidi Construction)
 *   run   → Apps                      (Muscle Map, Fitness Muscle Coach, Football Academy, RERA Exam Prep)
 *   grow  → IT Services               (Mazidi IT Services — business backup & recovery)
 */
export const PILLARS: Record<PillarKey, PillarMeta> = {
  build: {
    key: "build", slug: "property", name: "Property & Construction", short: "Property", token: "build",
    blurb: "Dubai off-plan brokerage and West London renovations.",
    desc: "A RERA-registered brokerage in Dubai and a Checkatrade-rated renovation contractor in West London — two businesses, one family, real work you can see.",
  },
  run: {
    key: "run", slug: "apps", name: "Apps", short: "Apps", token: "run",
    blurb: "iOS apps for training, coaching and exam prep.",
    desc: "Built in-house and shipped on the App Store: a gym app with Apple Watch logging, coaching apps for personal trainers and football academies, and a RERA broker exam trainer for Dubai.",
  },
  grow: {
    key: "grow", slug: "it", name: "IT Services", short: "IT", token: "grow",
    blurb: "Business backup and recovery for small offices.",
    desc: "A backup box installed in your office, every computer copied to it, and restores tested with you — for offices of 3 to 15 people across West London.",
  },
};

export const PILLAR_KEYS = ["build", "run", "grow"] as const satisfies readonly PillarKey[];

/** Resolve a public URL segment (/property, /apps, /it) to its pillar. */
export function pillarBySlug(slug: string): PillarMeta | null {
  return PILLAR_KEYS.map((k) => PILLARS[k]).find((p) => p.slug === slug) ?? null;
}

/** Registered tenant slugs — MUST match Company.slug rows in the DB. */
export const TENANT_SLUGS = [
  "mazidihomes", "construction", "it",
  "musclemap", "fitnessmusclecoach", "footballacademy", "reraprep",
] as const;
export type TenantSlug = (typeof TENANT_SLUGS)[number];
export const isTenantSlug = (s: string): s is TenantSlug =>
  (TENANT_SLUGS as readonly string[]).includes(s);

/**
 * Subdomains reserved for platform apps or separately deployed sites — never
 * treated as tenants. `backup` is backup.mazidigroup.com (Mazidi IT Services).
 */
export const RESERVED_SUBDOMAINS = ["www", "portal", "team", "admin", "api", "backup"] as const;

// ── Company public profiles ─────────────────────────────
export type AppStoreStatus = "live" | "pending";

export interface CompanyProfile {
  slug: TenantSlug;
  /** Registered legal entity behind the trading name */
  legalName: string;
  /** Registration / licence line shown in the footer of the tenant site */
  registration?: string;
  /** External website — when set, "Visit website" links here instead of /sites/{slug} */
  website?: string;
  /** E.164 phone number */
  phone?: string;
  /** Human-formatted phone number */
  phoneDisplay?: string;
  /** Digits only, for wa.me links */
  whatsapp?: string;
  email?: string;
  location: string;
  /** App Store listing (apps only) */
  app?: {
    status: AppStoreStatus;
    url?: string;
    platforms: string[];
    /** e.g. "Free · In-App Purchases", "£24.99 one-time" */
    pricing: string;
  };
  /** Three short proof points for cards and hero strips */
  highlights: string[];
}

export const COMPANY_PROFILES: Record<TenantSlug, CompanyProfile> = {
  mazidihomes: {
    slug: "mazidihomes",
    legalName: "Aimal Mazidi Real Estate L.L.C",
    registration: "Trade Licence 1445311 · RERA ORN 47322 · Broker BRN 77897",
    website: "https://www.mazidihomes.com",
    phone: "+971509612398",
    phoneDisplay: "+971 50 961 2398",
    whatsapp: "971509612398",
    email: "aimal@mazidihomes.com",
    location: "Dubai, United Arab Emirates",
    highlights: ["RERA-registered brokerage", "670+ off-plan projects researched", "WhatsApp answered by a licensed broker"],
  },
  construction: {
    slug: "construction",
    legalName: "Mazidi Homes Limited",
    registration: "Registered in England & Wales, company no. 15350516",
    phone: "+447985276060",
    phoneDisplay: "+44 7985 276060",
    whatsapp: "447985276060",
    email: "support@mazidigroup.com",
    location: "West London, United Kingdom",
    highlights: ["10/10 on Checkatrade", "26 verified client reviews", "28+ completed projects"],
  },
  it: {
    slug: "it",
    legalName: "Mazidi Homes Limited",
    registration: "Registered in England & Wales, company no. 15350516 · ICO registration C1996539",
    website: "https://backup.mazidigroup.com",
    phone: "+447985276060",
    phoneDisplay: "+44 7985 276060",
    whatsapp: "447985276060",
    email: "support@mazidigroup.com",
    location: "West London, within 30 miles",
    highlights: ["Backup box installed from £1,495", "Monitoring from £39 a month", "Free 15-minute backup check"],
  },
  musclemap: {
    slug: "musclemap",
    legalName: "Aimal Mazidi",
    email: "support@mazidigroup.com",
    location: "App Store · worldwide",
    app: {
      status: "live",
      url: "https://apps.apple.com/gb/app/muscle-map-workout-anatomy/id6786005405",
      platforms: ["iPhone", "iPad", "Apple Watch"],
      pricing: "Free · Pro from £2.99/month",
    },
    highlights: ["Rated 5.0 on the App Store", "Log sets from your Apple Watch", "Interactive muscle anatomy"],
  },
  fitnessmusclecoach: {
    slug: "fitnessmusclecoach",
    legalName: "Aimal Mazidi",
    email: "support@mazidigroup.com",
    location: "App Store · in review",
    app: { status: "pending", platforms: ["iPhone"], pricing: "Coming soon" },
    highlights: ["Separate coach and client logins", "Programmes, check-ins and progress", "Submitted to the App Store"],
  },
  footballacademy: {
    slug: "footballacademy",
    legalName: "Aimal Mazidi",
    email: "support@mazidigroup.com",
    location: "App Store · in review",
    app: { status: "pending", platforms: ["iPhone"], pricing: "Coming soon" },
    highlights: ["Coach and player logins", "Sessions, squads and attendance", "Submitted to the App Store"],
  },
  reraprep: {
    slug: "reraprep",
    legalName: "Aimal Mazidi Real Estate L.L.C",
    email: "aimal@mazidihomes.com",
    location: "App Store · Dubai",
    app: {
      status: "live",
      url: "https://apps.apple.com/gb/app/rera-exam-prep-dubai/id6798309101",
      platforms: ["iPhone"],
      pricing: "Free to try · £24.99 one-time unlock",
    },
    highlights: ["120 questions cited to the law", "Timed mocks like the real paper", "Works offline, no account"],
  },
};

export const getCompanyProfile = (slug: string): CompanyProfile | null =>
  isTenantSlug(slug) ? COMPANY_PROFILES[slug] : null;

/** Group-level contact (the UK entity answers group enquiries). */
export const GROUP_CONTACT = {
  legalName: "Mazidi Homes Limited",
  email: "support@mazidigroup.com",
  phone: "+447985276060",
  phoneDisplay: "+44 7985 276060",
  whatsapp: "447985276060",
  hours: "Monday to Friday, 9:00am to 5:30pm (UK)",
} as const;

export const OFFICES = [
  {
    city: "London", country: "United Kingdom", entity: "Mazidi Homes Limited",
    note: "Construction, IT services and the apps studio",
  },
  {
    city: "Dubai", country: "United Arab Emirates", entity: "Aimal Mazidi Real Estate L.L.C",
    note: "Office 503-A, Buhaleeba Plaza, Al Murqabat",
  },
] as const;

// ── Lead routing ────────────────────────────────────────
/**
 * The public lead form asks what the visitor is interested in and routes the
 * lead to the matching company's CRM pipeline. `companySlug` on a tenant site
 * always wins; these apply to the group-level form.
 */
export const LEAD_INTERESTS = [
  { value: "property", label: "Buying off-plan property in Dubai", company: "mazidihomes" },
  { value: "construction", label: "A renovation or build in London", company: "construction" },
  { value: "backup", label: "Business backup & IT support", company: "it" },
  { value: "apps", label: "One of the apps", company: "musclemap" },
  { value: "other", label: "Something else", company: "construction" },
] as const satisfies readonly { value: string; label: string; company: TenantSlug }[];
export type LeadInterest = (typeof LEAD_INTERESTS)[number]["value"];
export const LEAD_INTEREST_VALUES = LEAD_INTERESTS.map((i) => i.value) as [LeadInterest, ...LeadInterest[]];
/** Group enquiries without a better home land with the UK entity. */
export const DEFAULT_LEAD_COMPANY: TenantSlug = "construction";
export const companyForInterest = (interest: string): TenantSlug =>
  LEAD_INTERESTS.find((i) => i.value === interest)?.company ?? DEFAULT_LEAD_COMPANY;

/** Primary CTA labels — the only ones permitted by the design system. */
export const CTA_LABELS = [
  "Book Consultation", "Get Quote", "Speak to an Expert", "Request Proposal", "Schedule Meeting",
] as const;

export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "mazidigroup.com";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${ROOT_DOMAIN}`;
export const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? `https://portal.${ROOT_DOMAIN}`;
export const TEAM_URL = process.env.NEXT_PUBLIC_TEAM_URL ?? `https://team.${ROOT_DOMAIN}`;
export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? `https://admin.${ROOT_DOMAIN}`;
