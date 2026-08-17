#!/usr/bin/env node
/**
 * ONE-OFF migration runner. Delete this file and apps/web/vercel.json once the
 * migrations are applied — see Autopilot/07_MIGRATION_APPROVAL.md.
 *
 * Why this exists
 * ---------------
 * apps/web prerenders /sites/[site] against the production database at build
 * time, so an additive Prisma schema change breaks every build until the
 * migration is applied. There is no preview database, and the production DB
 * credentials live only in Vercel as sensitive environment variables — they
 * cannot be read out locally and must not be copied anywhere.
 *
 * The build environment is therefore the one place that already holds valid
 * credentials. This runs `prisma migrate deploy` there, which applies only
 * pending migrations and records them in _prisma_migrations exactly as a local
 * run would. No hand-written SQL, no hand-computed checksums, no drift.
 *
 * Three gates, so this cannot fire anywhere it should not
 * ------------------------------------------------------
 *  1. refuses to run when VERCEL_ENV === "production"
 *  2. runs only on the exact branch named in ALLOWED_REF — merging this file to
 *     master by accident makes it a no-op rather than a live migration
 *  3. `migrate deploy` only ever applies pending migrations; it cannot reset,
 *     drop or re-run anything, unlike `migrate dev`
 *
 * Fails the build on migration error rather than continuing, so a partially
 * migrated database can never be built against.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ALLOWED_REF = "feat/autopilot-backbone";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const env = process.env.VERCEL_ENV ?? "(unset)";
const ref = process.env.VERCEL_GIT_COMMIT_REF ?? "(unset)";

if (env === "production") {
  console.log(`[ci-migrate] refusing to run: VERCEL_ENV=production`);
  process.exit(0);
}
if (ref !== ALLOWED_REF) {
  console.log(`[ci-migrate] skipping: ref="${ref}" is not "${ALLOWED_REF}"`);
  process.exit(0);
}
if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
  console.error("[ci-migrate] neither DIRECT_URL nor DATABASE_URL is set — aborting");
  process.exit(1);
}

console.log(`[ci-migrate] env=${env} ref=${ref} — applying pending migrations`);

const r = spawnSync("pnpm", ["--filter", "@mazidi/db", "run", "deploy"], {
  cwd: ROOT,
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

if (r.status !== 0) {
  console.error(`[ci-migrate] prisma migrate deploy failed (exit ${r.status})`);
  process.exit(r.status ?? 1);
}
console.log("[ci-migrate] done — remove this script and apps/web/vercel.json");
