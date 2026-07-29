/**
 * Capture desktop + mobile screenshots of the three privacy-centre pages.
 *
 * These pages are host-scoped by `apps/web/middleware.ts`: they live at the
 * internal `/app-privacy/privacy*` segment and are rewritten from `/privacy*`
 * on the app subdomain and on *review hosts* — which includes `localhost`.
 * So capturing against a plain local dev server exercises the real route.
 *
 * Usage — start the dev server yourself first, then run the script:
 *
 *   pnpm --filter @mazidi/web dev            # terminal 1 (http://localhost:3000)
 *   pnpm --filter @mazidi/web screenshots    # terminal 2
 *
 * The script deliberately does NOT start or stop the server: orchestrating a
 * Next dev server from inside the capture makes failures ambiguous (build error
 * vs. capture error). Override the target with BASE_URL if needed.
 *
 * Prerequisite: `pnpm exec playwright install chromium` (once per machine).
 *
 * Note on the layout's data dependency: `app/app-privacy/layout.tsx` awaits
 * `listLiveCompanies()` to build the header/footer nav, so the dev server needs
 * DATABASE_URL to point at *some* reachable Postgres or these routes 500. An
 * empty database is fine — the nav simply renders no companies, which is how
 * the committed screenshots were taken. The three privacy pages themselves are
 * static content and carry no database state.
 *
 * PRIVACY_EFFECTIVE_DATE is intentionally left unset when capturing, so the
 * complaints page shows the "[EFFECTIVE DATE — SET ON PUBLICATION]" marker
 * exactly as a preview deployment does (see scripts/check-privacy-placeholders.mjs).
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..", "..");
const OUT_DIR = join(REPO_ROOT, "docs", "screenshots", "privacy");

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

/** Text that must be present on every page — proves the right app rendered. */
const COMMON_TEXT = "Mazidi Homes Limited";

const PAGES = [
  { slug: "privacy", path: "/privacy", heading: "Privacy Notice" },
  { slug: "privacy-request", path: "/privacy/request", heading: "Privacy Requests" },
  { slug: "privacy-complaints", path: "/privacy/complaints", heading: "Data Protection Complaints" },
];

const VIEWPORTS = [
  {
    name: "desktop",
    context: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
  },
  {
    // iPhone 14 class.
    name: "mobile",
    context: {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  },
];

const failures = [];
const results = [];

const browser = await chromium.launch();

try {
  await mkdir(OUT_DIR, { recursive: true });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      ...vp.context,
      // Deterministic captures: no motion, fixed locale/timezone.
      reducedMotion: "reduce",
      locale: "en-GB",
      timezoneId: "Europe/London",
    });
    const page = await context.newPage();

    for (const target of PAGES) {
      const url = `${BASE_URL}${target.path}`;
      const file = join(OUT_DIR, `${target.slug}-${vp.name}.png`);
      const label = `${target.slug} ${vp.name}`;

      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      const status = response?.status() ?? 0;
      if (status !== 200) {
        failures.push(`${label}: HTTP ${status} for ${url}`);
        continue;
      }

      // Stable structure: the page heading and the footer chrome are both in.
      await page.waitForSelector("h1", { state: "visible", timeout: 30_000 });
      await page.waitForSelector("footer", { state: "attached", timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);

      // `next dev` injects its dev-tools indicator into a <nextjs-portal>
      // element. It is not part of the page and must not appear in a
      // screenshot used for review; hide it here rather than turning
      // devIndicators off in next.config.mjs.
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

      // Content assertions — confirm this is genuinely the expected page.
      const text = await page.evaluate(() => document.body.innerText);
      for (const needle of [target.heading, COMMON_TEXT]) {
        if (!text.includes(needle)) failures.push(`${label}: missing text ${JSON.stringify(needle)}`);
      }

      // Horizontal-overflow check. The retention and lawful-basis tables are
      // wrapped in `overflow-x-auto`, so the tables may scroll internally but
      // the document itself must never exceed the viewport width.
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      const overflows = metrics.scrollWidth > metrics.innerWidth;
      if (vp.name === "mobile" && overflows) {
        failures.push(
          `${label}: horizontal overflow — scrollWidth ${metrics.scrollWidth} > innerWidth ${metrics.innerWidth}`,
        );
      }

      await page.screenshot({ path: file, fullPage: true, animations: "disabled" });

      results.push({
        page: target.slug,
        viewport: vp.name,
        status,
        scrollWidth: metrics.scrollWidth,
        innerWidth: metrics.innerWidth,
        overflows,
        file: file.replace(`${REPO_ROOT}/`, ""),
      });
    }

    await context.close();
  }
} finally {
  await browser.close();
}

console.table(results);

if (failures.length > 0) {
  console.error("\nFAILED:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`\nOK — ${results.length} screenshots written to docs/screenshots/privacy/`);
