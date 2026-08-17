#!/usr/bin/env node
/**
 * Tests for the drain endpoint's secret resolution (apps/admin automations/run).
 *
 * The repo has no unit-test framework, so this follows the check-* convention:
 * it extracts resolveCronSecret from the shipped route file (testing the real
 * code, not a copy), runs behavioural cases, and statically asserts the
 * comparison discipline around it hasn't regressed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(
  path.join(ROOT, "apps/admin/app/api/automations/run/route.ts"), "utf8");
const errors = [];

// ── behavioural: evaluate the actual shipped function ────
const m = src.match(/function resolveCronSecret\([^)]*\)[^{]*\{([\s\S]*?)\n\}/);
if (!m) {
  errors.push("resolveCronSecret not found in route.ts");
} else {
  const fn = new Function("env", m[1].replace(/env: NodeJS\.ProcessEnv/g, "env"));
  const cases = [
    // [env, expected, name]
    [{ VERCEL_ENV: "preview", CRON_SECRET_PREVIEW: "p", CRON_SECRET: "s" }, "p",
      "preview uses CRON_SECRET_PREVIEW"],
    [{ VERCEL_ENV: "preview", CRON_SECRET: "s" }, null,
      "preview WITHOUT its own secret fails closed — never borrows production's"],
    [{ VERCEL_ENV: "production", CRON_SECRET: "s", CRON_SECRET_PREVIEW: "p" }, "s",
      "production uses CRON_SECRET and ignores the preview variable"],
    [{ CRON_SECRET: "s", CRON_SECRET_PREVIEW: "p" }, "s",
      "unset VERCEL_ENV (local/external cron) uses CRON_SECRET"],
    [{ VERCEL_ENV: "production" }, null, "production without CRON_SECRET fails closed"],
    [{}, null, "nothing set fails closed"],
    [{ VERCEL_ENV: "preview", CRON_SECRET_PREVIEW: "" }, null,
      "empty string is not a secret"],
  ];
  for (const [env, want, name] of cases) {
    const got = fn(env);
    if (got !== want) errors.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }
}

// ── static: the comparison discipline around it ──────────
if (!src.includes("timingSafeEqual")) errors.push("timingSafeEqual missing from route");
if (!/if \(a\.length !== b\.length\) return false/.test(src))
  errors.push("length guard before timingSafeEqual missing");
if (/expected\s*===|===\s*expected/.test(src))
  errors.push("secret compared with === — timing-unsafe");
if (!/const expected = resolveCronSecret\(process\.env\)/.test(src))
  errors.push("viaSharedSecret does not use resolveCronSecret");

if (errors.length) {
  console.error("CRON AUTH CHECK FAILED:\n" + errors.map((e) => `  ${e}`).join("\n"));
  process.exit(1);
}
console.log("Cron auth check passed — 7 behavioural cases, 4 static assertions.");
