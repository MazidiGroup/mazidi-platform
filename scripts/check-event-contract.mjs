#!/usr/bin/env node
/**
 * Event-bridge contract check (see Autopilot/02_EVENT_BRIDGE_SPEC.md).
 *
 * The two fitness apps are separate Python repos that POST events to
 * /api/events/ingest. Nothing in the type system spans that boundary, so
 * version skew between the emitters and this schema is silent until events
 * start bouncing with 422s in production.
 *
 * This checks both halves of the contract statically:
 *  1. the event vocabulary in schemas.ts and the company map in
 *     services/events.ts describe the SAME events — a name in one and not the
 *     other is a 500 at runtime, not a compile error
 *  2. representative payloads (the exact shapes backend/events.py emits) still
 *     validate, and known-bad payloads are still rejected
 *
 * Payload fixtures are kept here rather than generated so that changing the
 * schema in a way that breaks a shipped emitter fails the build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const schemasSrc = fs.readFileSync(path.join(ROOT, "packages/api/src/schemas.ts"), "utf8");
const eventsSrc = fs.readFileSync(path.join(ROOT, "packages/api/src/services/events.ts"), "utf8");

const listFrom = (src, name) => {
  const m = src.match(new RegExp(`export const ${name} = \\[(.*?)\\] as const`, "s"));
  if (!m) { errors.push(`${name} not found`); return []; }
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
};

const EVENTS = listFrom(schemasSrc, "INGEST_EVENTS");
const SOURCES = listFrom(schemasSrc, "INGEST_SOURCES");

// 1. vocabulary and company map agree
const mapBlock = eventsSrc.match(/const EVENT_COMPANY[^=]*=\s*\{(.*?)\n\};/s);
const mapped = mapBlock ? [...mapBlock[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map((m) => m[1]) : [];
if (!mapBlock) errors.push("EVENT_COMPANY not found in services/events.ts");

for (const e of EVENTS)
  if (!mapped.includes(e))
    errors.push(`"${e}" is in INGEST_EVENTS but has no EVENT_COMPANY entry — ingest would 500`);
for (const e of mapped)
  if (!EVENTS.includes(e))
    errors.push(`"${e}" is in EVENT_COMPANY but not INGEST_EVENTS — unreachable, Zod rejects it first`);

// 2. fixtures — these mirror backend/events.py in both app repos
const iso = "2026-08-15T10:24:25.360809Z";
const valid = [
  { source: "musclemapai", event: "consumer.premium_started",
    externalId: "musclemapai:premium:user_abc:2026-09-14T00:00:00Z", occurredAt: iso,
    actor: { externalUserId: "user_abc" },
    data: { productId: "mm_monthly", expiresAt: "2026-09-14T00:00:00Z" } },
  { source: "fitness_muscle_coach", event: "coach.signed_up",
    externalId: "fitness_muscle_coach:coach:user_123", occurredAt: iso,
    actor: { email: "Coach@Example.com", name: "Test Coach", externalUserId: "user_123" },
    data: { authProvider: "password" } },
  { source: "fitness_muscle_coach", event: "coach.client_added",
    externalId: "fitness_muscle_coach:client:user_456", occurredAt: iso,
    actor: { externalUserId: "user_123" },
    data: { clientExternalId: "user_456", coachExternalId: "user_123", viaInvite: true } },
];
const invalid = [
  ["unknown event", { ...valid[0], event: "coach.exploded" }],
  ["unknown top-level key", { ...valid[0], customerId: "x" }],
  ["non-ISO occurredAt", { ...valid[0], occurredAt: "yesterday" }],
  ["externalId too short", { ...valid[0], externalId: "ab" }],
  ["unknown source", { ...valid[0], source: "someone_else" }],
];

// schemas.ts is TypeScript and this script runs on bare node, so the Zod object
// cannot be imported directly. Validate structurally against the vocabulary
// parsed out of the same file — this catches vocabulary drift and envelope
// shape drift, which is what actually breaks across the repo boundary.
const ENVELOPE_KEYS = ["source", "event", "externalId", "occurredAt", "actor", "data"];
const check = (p) =>
  SOURCES.includes(p.source) &&
  EVENTS.includes(p.event) &&
  typeof p.externalId === "string" && p.externalId.length >= 3 && p.externalId.length <= 200 &&
  typeof p.occurredAt === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(p.occurredAt) &&
  !Number.isNaN(Date.parse(p.occurredAt)) &&
  Object.keys(p).every((k) => ENVELOPE_KEYS.includes(k));

for (const p of valid)
  if (!check(p)) errors.push(`fixture "${p.event}" no longer validates — a shipped emitter is now broken`);
for (const [name, p] of invalid)
  if (check(p)) errors.push(`invalid payload accepted: ${name}`);

if (errors.length) {
  console.error("EVENT CONTRACT VIOLATIONS:\n" + errors.map((e) => `  ${e}`).join("\n"));
  process.exit(1);
}
console.log(
  `Event contract passed — ${EVENTS.length} events, ${SOURCES.length} sources, ` +
  `${valid.length} fixtures, ${invalid.length} negative controls.`,
);
