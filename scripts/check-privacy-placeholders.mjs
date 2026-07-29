#!/usr/bin/env node
/**
 * Release guard for the MazidiPerformance privacy centre.
 * Run with `pnpm check:privacy` (locally, in CI, and from the apps/web build).
 *
 * The privacy pages are a legal document. This guard makes it impossible to
 * ship them while they still carry pre-publication markers, claims about
 * capabilities the app does not have, or an unapproved contact address — and it
 * makes it impossible to ship them to PRODUCTION at all until the named humans
 * have recorded their approval as build-time environment variables.
 *
 * ── Environments ────────────────────────────────────────────────────────────
 * The guard branches on VERCEL_ENV:
 *
 *   VERCEL_ENV=production   full gate: content checks + the four human
 *                           approvals + a resolved effective date.
 *   VERCEL_ENV=preview      content checks only. The effective-date marker is
 *   (or unset / local)      permitted so the pages can be reviewed before a
 *                           publication date exists; a notice is printed.
 *
 * ── The four approval variables (production only) ───────────────────────────
 *   PRIVACY_EFFECTIVE_DATE        the real publication date, "D MMMM YYYY"
 *   PRIVACY_MAILBOX_VERIFIED      "true" once privacy@mazidigroup.com is proven
 *                                 to be monitored by a named owner
 *   PRIVACY_VENDOR_REVIEW_APPROVED "true" once the vendor/subprocessor
 *                                 inventory has been reviewed and signed off
 *   PRIVACY_WORDING_APPROVED      "true" once the wording has had legal review
 *
 * These are SERVER-SIDE BUILD-TIME flags. They are deliberately not prefixed
 * NEXT_PUBLIC_ and must never be read from a client component. They are set by
 * a human in the Vercel project's Production environment — never in this repo.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ── Environment ────────────────────────────────────────────────────────── */

/**
 * Vercel sets VERCEL_ENV to "production", "preview" or "development". Anything
 * else (including unset, i.e. a local run) is treated as preview: the same
 * content rules, but the effective-date marker is tolerated.
 */
const VERCEL_ENV = process.env.VERCEL_ENV ?? "";
const IS_PRODUCTION = VERCEL_ENV === "production";
const ENV_LABEL = IS_PRODUCTION
  ? "production"
  : VERCEL_ENV === "preview"
    ? "preview"
    : `local / preview semantics (VERCEL_ENV${VERCEL_ENV ? `="${VERCEL_ENV}"` : " unset"})`;

/* ── What is scanned ────────────────────────────────────────────────────── */

const PRIVACY_DIR = "apps/web/app/app-privacy";

/**
 * The three routes the privacy centre must publish. They live under the
 * internal /app-privacy segment and are served at /privacy* on
 * mazidiperformance.mazidigroup.com by apps/web/middleware.ts.
 */
const REQUIRED_ROUTES = [
  { file: `${PRIVACY_DIR}/privacy/page.tsx`, route: "/privacy" },
  { file: `${PRIVACY_DIR}/privacy/request/page.tsx`, route: "/privacy/request" },
  { file: `${PRIVACY_DIR}/privacy/complaints/page.tsx`, route: "/privacy/complaints" },
];

/** The privacy notice itself — the document that must define the controller. */
const NOTICE_FILE = REQUIRED_ROUTES[0].file;

/**
 * Additional files whose text is rendered on the privacy pages, so their
 * wording is in scope for the content checks.
 */
const EXTRA_CONTENT_FILES = [`${PRIVACY_DIR}/layout.tsx`, "apps/web/components/Legal.tsx"];

/* ── Rules ──────────────────────────────────────────────────────────────── */

const EFFECTIVE_DATE_MARKER = "[EFFECTIVE DATE — SET ON PUBLICATION]";

/** The only address that may be given as the privacy contact. */
const PRIVACY_CONTACT = "privacy@mazidigroup.com";

/**
 * Every address permitted to appear anywhere in the privacy centre. Anything
 * else — a typo, an old address, hello@… — fails. security@ and support@ are
 * the separate incident and support routes named in the approved notice; they
 * are not privacy contacts and never substitute for PRIVACY_CONTACT.
 */
const APPROVED_EMAILS = new Set([PRIVACY_CONTACT, "security@mazidigroup.com", "support@mazidigroup.com"]);

/** The legal entity the notice must name as controller. */
const LEGAL_ENTITY = "Mazidi Homes Limited";

/**
 * Bracketed text permitted in the rendered copy. Everything else in [square
 * brackets] is treated as an unresolved placeholder and fails in every
 * environment. Adding an entry here is a wording decision — it needs the same
 * owner approval as the copy itself.
 */
const APPROVED_BRACKET_TEXT = new Set([
  // Permitted in preview only; the production rules below still reject it.
  EFFECTIVE_DATE_MARKER,
  // Approved copy, not a placeholder: the square brackets are part of the
  // suggested email subject line the reader is asked to fill in.
  // See PRIVACY_WORDING_DIFF.md — "the square brackets there are part of" the
  // approved instruction to the user.
  "[type of request]",
]);

const ALWAYS_FORBIDDEN = [
  {
    pattern: /(?<![\d.])0\.9(?![\d])/g,
    what: 'draft version label "0.9"',
    why: "the published pages must not carry a pre-release version number",
  },
  {
    pattern: /review\s+draft/gi,
    what: '"review draft" label',
    why: "published pages must not describe themselves as a draft",
  },
  {
    pattern: /apple\s*health|healthkit/gi,
    what: "an Apple Health / HealthKit claim",
    why: "the app has no HealthKit integration — describing one is a false capability claim",
  },
  {
    pattern: /settings\s*(?:→|->|›|»)/gi,
    what: "an in-app navigation path (Settings → …)",
    why: "there is no in-app account-deletion path; deletion is handled through the privacy-request process",
  },
  {
    pattern: /delete\s+(?:your\s+|my\s+|the\s+)?account\b/gi,
    what: 'a "delete account" in-app instruction',
    why: "there is no in-app account-deletion control; the pages must direct users to the privacy-request process",
  },
  {
    pattern: /\[APPROVAL DATE\]/g,
    what: "the [APPROVAL DATE] marker",
    why: "the approval date must be resolved before the pages are published",
  },
  {
    pattern: /TO BE CONFIRMED/g,
    what: '"TO BE CONFIRMED"',
    why: "unconfirmed content must not be published",
  },
  {
    pattern: /hello@mazidigroup\.com/gi,
    what: "hello@mazidigroup.com",
    why: `it is not a privacy contact — the only permitted privacy address is ${PRIVACY_CONTACT}`,
  },
];

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const BRACKET_RE = /\[[^\]\n]{0,200}\]/g;

/**
 * The sanctioned server-side fallback. An occurrence of the marker is only
 * "guarded" when this expression appears immediately before it, i.e. the marker
 * renders solely because PRIVACY_EFFECTIVE_DATE is unset.
 */
const EFFECTIVE_DATE_ENV_REF = "process.env.PRIVACY_EFFECTIVE_DATE";
const GUARD_WINDOW = 200;

const APPROVALS = [
  {
    name: "PRIVACY_MAILBOX_VERIFIED",
    missing: `nobody has confirmed that ${PRIVACY_CONTACT} is a real, monitored mailbox with a named owner.`,
    who: "Privacy Lead — send and receive a test message, then set the flag.",
  },
  {
    name: "PRIVACY_VENDOR_REVIEW_APPROVED",
    missing: "the vendor / subprocessor inventory published on these pages has not been reviewed and signed off.",
    who: "Privacy Lead and owner — review VENDOR_INVENTORY.md, then set the flag.",
  },
  {
    name: "PRIVACY_WORDING_APPROVED",
    missing: "the privacy wording has not been through legal approval.",
    who: "Legal reviewer — approve PRIVACY_WORDING_DIFF.md (including the owner-directed scope insertion), then set the flag.",
  },
];

/* ── Helpers ────────────────────────────────────────────────────────────── */

const failures = [];
const notices = [];

const fail = (headline, details = []) => failures.push({ headline, details });

/** Blank out a match while preserving newlines, so line numbers stay true. */
const blank = (m) => m.replace(/[^\n]/g, " ");

/**
 * Presentation-only text is removed before the content checks run: Tailwind
 * arbitrary values (`text-[.97rem]`, `pt-[150px]`) are square-bracketed and
 * would otherwise look like unresolved placeholders.
 */
const stripPresentation = (src) =>
  src.replace(/className=\{[^{}]*\}/g, blank).replace(/className="[^"]*"/g, blank);

const lineOf = (src, index) => src.slice(0, index).split("\n").length;

const read = (relPath) => {
  const abs = join(ROOT, relPath);
  const raw = readFileSync(abs, "utf8");
  return { relPath, raw, text: stripPresentation(raw) };
};

/* ── 1. Required routes ─────────────────────────────────────────────────── */

const missingRoutes = REQUIRED_ROUTES.filter(({ file }) => !existsSync(join(ROOT, file)));
if (missingRoutes.length > 0) {
  fail(
    "Required privacy routes are missing.",
    missingRoutes.map(({ file, route }) => `${route} → expected page file ${file}`),
  );
  // Nothing else can be checked meaningfully.
  report();
}

const contentFiles = [...REQUIRED_ROUTES.map((r) => r.file), ...EXTRA_CONTENT_FILES]
  .filter((f) => existsSync(join(ROOT, f)))
  .map(read);

/** Bracket scanning skips shared component code, which contains array literals. */
const bracketFiles = contentFiles.filter((f) => REQUIRED_ROUTES.some((r) => r.file === f.relPath) || f.relPath === `${PRIVACY_DIR}/layout.tsx`);

/* ── 2. Content that is forbidden in every environment ──────────────────── */

for (const rule of ALWAYS_FORBIDDEN) {
  const hits = [];
  for (const file of contentFiles) {
    for (const m of file.text.matchAll(rule.pattern)) {
      hits.push(`${file.relPath}:${lineOf(file.text, m.index)}  …${m[0]}…`);
    }
  }
  if (hits.length > 0) fail(`The privacy pages contain ${rule.what} — ${rule.why}`, hits);
}

/* ── 3. Contact addresses ───────────────────────────────────────────────── */

const unknownAddresses = [];
for (const file of contentFiles) {
  for (const m of file.text.matchAll(EMAIL_RE)) {
    if (!APPROVED_EMAILS.has(m[0])) {
      unknownAddresses.push(`${file.relPath}:${lineOf(file.text, m.index)}  ${m[0]}`);
    }
  }
}
if (unknownAddresses.length > 0) {
  fail(
    `The privacy pages give an unknown contact address. The privacy contact must be ${PRIVACY_CONTACT}.`,
    unknownAddresses,
  );
}

const pagesWithoutContact = REQUIRED_ROUTES.filter(({ file }) => {
  const f = contentFiles.find((c) => c.relPath === file);
  return f && !f.text.includes(PRIVACY_CONTACT);
});
if (pagesWithoutContact.length > 0) {
  fail(
    `Every privacy page must give the privacy contact ${PRIVACY_CONTACT}.`,
    pagesWithoutContact.map(({ route, file }) => `${route} (${file}) does not mention it`),
  );
}

/* ── 4. Legal entity ────────────────────────────────────────────────────── */

/**
 * The controller is defined once, in the notice itself ("Who we are"); the
 * request and complaints pages are procedures that hang off it. Enforcing the
 * entity name on the notice is what makes "undefined legal entity" impossible.
 */
const notice = contentFiles.find((f) => f.relPath === NOTICE_FILE);
if (notice && !notice.text.includes(LEGAL_ENTITY)) {
  fail(`The privacy notice does not name the legal entity "${LEGAL_ENTITY}" as controller.`, [
    `${NOTICE_FILE} must identify the controller by its registered name.`,
  ]);
}

/* ── 5. Bracketed placeholders ──────────────────────────────────────────── */

const unapprovedBrackets = [];
const markerOccurrences = [];

for (const file of bracketFiles) {
  for (const m of file.text.matchAll(BRACKET_RE)) {
    if (m[0] === EFFECTIVE_DATE_MARKER) {
      const before = file.text.slice(Math.max(0, m.index - GUARD_WINDOW), m.index);
      markerOccurrences.push({
        where: `${file.relPath}:${lineOf(file.text, m.index)}`,
        guarded: before.includes(EFFECTIVE_DATE_ENV_REF),
      });
      continue;
    }
    if (!APPROVED_BRACKET_TEXT.has(m[0])) {
      unapprovedBrackets.push(`${file.relPath}:${lineOf(file.text, m.index)}  ${m[0]}`);
    }
  }
}

if (unapprovedBrackets.length > 0) {
  fail("The privacy pages contain unapproved bracketed placeholders.", [
    ...unapprovedBrackets,
    "Resolve the text, or add it to APPROVED_BRACKET_TEXT in this script once the wording is approved.",
  ]);
}

/* ── 6. Environment-specific rules ──────────────────────────────────────── */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Strict "D MMMM YYYY" — e.g. "29 July 2026". No leading zeros, real calendar date. */
function invalidDateReason(value) {
  const m = /^([1-9]|[12][0-9]|3[01]) ([A-Za-z]+) (\d{4})$/.exec(value);
  if (!m) return 'it is not in "D MMMM YYYY" form (example: 29 July 2026)';
  const day = Number(m[1]);
  const monthIndex = MONTHS.indexOf(m[2]);
  const year = Number(m[3]);
  if (monthIndex < 0) return `"${m[2]}" is not a full English month name`;
  if (year < 2000 || year > 2100) return `"${m[3]}" is not a plausible year`;
  const d = new Date(Date.UTC(year, monthIndex, day));
  if (d.getUTCDate() !== day || d.getUTCMonth() !== monthIndex) return "it is not a real calendar date";
  return null;
}

const rawMarkers = markerOccurrences.filter((o) => !o.guarded);

if (rawMarkers.length > 0 && !IS_PRODUCTION) {
  // A hardcoded marker is legitimate in preview, but flag where it is.
  notices.push(
    `The effective-date marker is hardcoded (not behind ${EFFECTIVE_DATE_ENV_REF}) at: ${rawMarkers
      .map((o) => o.where)
      .join(", ")}`,
  );
}

if (IS_PRODUCTION) {
  if (rawMarkers.length > 0) {
    fail(
      `The effective-date marker "${EFFECTIVE_DATE_MARKER}" is hardcoded into the page and would be published as-is.`,
      [
        ...rawMarkers.map((o) => o.where),
        `Render it from ${EFFECTIVE_DATE_ENV_REF} with the marker as the fallback, so the date can be set at build time.`,
      ],
    );
  }

  const effectiveDate = process.env.PRIVACY_EFFECTIVE_DATE;
  if (!effectiveDate) {
    fail("MISSING HUMAN APPROVAL — the publication date has not been set.", [
      "PRIVACY_EFFECTIVE_DATE is not set, so the pages would publish with the placeholder",
      `  "${EFFECTIVE_DATE_MARKER}"`,
      "instead of a real effective date.",
      'Who: the Privacy Lead decides the date the notice takes effect, then sets PRIVACY_EFFECTIVE_DATE (format: "29 July 2026") in the Vercel Production environment.',
    ]);
  } else {
    const reason = invalidDateReason(effectiveDate);
    if (reason) {
      fail(`PRIVACY_EFFECTIVE_DATE is set to "${effectiveDate}", which is not a valid effective date.`, [
        `Rejected because ${reason}.`,
        'Use the exact form "D MMMM YYYY" — for example "29 July 2026" or "1 August 2026".',
      ]);
    }
  }

  for (const approval of APPROVALS) {
    if (process.env[approval.name] !== "true") {
      const actual = process.env[approval.name];
      fail(`MISSING HUMAN APPROVAL — ${approval.missing}`, [
        `${approval.name} is ${actual === undefined ? "not set" : `"${actual}"`}; it must be exactly "true".`,
        `Who: ${approval.who}`,
        "Set it in the Vercel Production environment. It must never be committed to this repo.",
      ]);
    }
  }
} else if (markerOccurrences.length > 0) {
  notices.push(
    `The effective-date marker "${EFFECTIVE_DATE_MARKER}" is still present. That is allowed in preview so the pages can be reviewed, but it MUST be resolved before production: set PRIVACY_EFFECTIVE_DATE (e.g. "29 July 2026") in the Vercel Production environment. A production build will fail until it is.`,
  );
}

/* ── Report ─────────────────────────────────────────────────────────────── */

report();

function report() {
  const rule = "-".repeat(78);
  console.log(`check:privacy — environment: ${ENV_LABEL}`);

  if (failures.length === 0) {
    for (const n of notices) console.log(`\nNOTICE: ${n}`);
    console.log(
      `\nOK — the privacy centre passes the ${IS_PRODUCTION ? "production" : "preview"} release guard.`,
    );
    process.exit(0);
  }

  console.error(`\n${rule}`);
  console.error(`check:privacy FAILED — ${failures.length} problem${failures.length === 1 ? "" : "s"}`);
  console.error(rule);
  for (const [i, f] of failures.entries()) {
    console.error(`\n${i + 1}. ${f.headline}`);
    for (const d of f.details) console.error(`     ${d}`);
  }
  console.error(`\n${rule}`);
  console.error(
    IS_PRODUCTION
      ? "The privacy centre is NOT releasable to production until every item above is resolved\nby the named human. Do not set the approval variables on someone else's behalf."
      : "The privacy centre is NOT releasable while the problems above are present.",
  );
  console.error(rule);
  process.exit(1);
}
