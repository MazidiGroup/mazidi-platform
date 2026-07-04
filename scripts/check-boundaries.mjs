#!/usr/bin/env node
/**
 * Static server/client boundary checker (see README §Server/client boundary rule).
 *
 * Walks the real import graph and fails if:
 *  1. a "use client" graph reaches `next/headers` or `@prisma/client`/@mazidi/db
 *  2. a middleware (edge) graph reaches `next/headers`
 *  3. any file imports the @mazidi/auth barrel instead of a runtime entry
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    if (["node_modules", ".next", ".turbo", "dist"].includes(e.name)) return [];
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const files = [...walk(path.join(ROOT, "apps")), ...walk(path.join(ROOT, "packages"))]
  .filter((f) => /\.(ts|tsx)$/.test(f) && !f.endsWith(".d.ts"));

// Resolve package exports maps for @mazidi/*
const pkgs = {};
for (const dir of fs.readdirSync(path.join(ROOT, "packages"))) {
  const pj = path.join(ROOT, "packages", dir, "package.json");
  if (!fs.existsSync(pj)) continue;
  const meta = JSON.parse(fs.readFileSync(pj, "utf8"));
  pkgs[meta.name] = { dir: path.join(ROOT, "packages", dir), exports: meta.exports ?? { ".": meta.main } };
}

function resolveImport(fromFile, spec) {
  if (spec.startsWith("@mazidi/")) {
    const [, scope, pkgName, ...rest] = spec.match(/^(@mazidi)\/([^/]+)(?:\/(.*))?$/) ?? [];
    const name = `@mazidi/${pkgName}`;
    const pkg = pkgs[name];
    if (!pkg) return null;
    const key = rest?.[0] ? `./${rest[0]}` : ".";
    const target = pkg.exports[key];
    if (typeof target !== "string") return "MISSING_EXPORT:" + spec;
    return path.join(pkg.dir, target);
  }
  if (spec.startsWith("@/")) {
    const appRoot = fromFile.includes(`${path.sep}apps${path.sep}web${path.sep}`)
      ? path.join(ROOT, "apps/web")
      : fromFile.includes(`${path.sep}apps${path.sep}portal${path.sep}`)
        ? path.join(ROOT, "apps/portal")
        : null;
    if (!appRoot) return null;
    spec = path.join(appRoot, spec.slice(2));
  } else if (spec.startsWith(".")) {
    spec = path.join(path.dirname(fromFile), spec);
  } else {
    return null; // external package
  }
  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    if (fs.existsSync(spec + ext) && fs.statSync(spec + ext).isFile()) return spec + ext;
  }
  return null;
}

const importsOf = (f) =>
  [...fs.readFileSync(f, "utf8").matchAll(/(?:import|export)[^"'`]*?from\s+["']([^"']+)["']/g)].map((m) => m[1]);

function reach(entry, banned, label) {
  const seen = new Set();
  const stack = [[entry, [path.relative(ROOT, entry)]]];
  while (stack.length) {
    const [f, trail] = stack.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    for (const spec of importsOf(f)) {
      if (banned.some((b) => spec === b || spec.startsWith(b + "/"))) {
        errors.push(`${label}: banned import "${spec}"\n    via ${trail.join(" → ")} → ${spec}`);
        continue;
      }
      const resolved = resolveImport(f, spec);
      if (typeof resolved === "string" && resolved.startsWith("MISSING_EXPORT:")) {
        errors.push(`${label}: ${resolved} (no exports entry)`);
      } else if (resolved) {
        stack.push([resolved, [...trail, path.relative(ROOT, resolved)]]);
      }
    }
  }
}

// 1. every "use client" file must not reach server-only modules
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  if (/^\s*["']use client["']/m.test(src)) {
    reach(f, ["next/headers", "@prisma/client", "@mazidi/db", "server-only"], `client graph (${path.relative(ROOT, f)})`);
  }
}
// 2. middleware graphs must not reach next/headers
for (const f of files.filter((f) => f.endsWith(`middleware.ts`) && f.includes("apps"))) {
  reach(f, ["next/headers"], `edge graph (${path.relative(ROOT, f)})`);
}
// 3. nobody imports the @mazidi/auth barrel
for (const f of files) {
  if (f.includes(`${path.sep}packages${path.sep}auth${path.sep}`)) continue;
  if (importsOf(f).includes("@mazidi/auth"))
    errors.push(`${path.relative(ROOT, f)}: import "@mazidi/auth" barrel — use /server, /client or /middleware`);
}

if (errors.length) {
  console.error("BOUNDARY VIOLATIONS:\n" + errors.join("\n"));
  process.exit(1);
}
console.log(`Boundary check passed — ${files.length} files, 3 rules, 0 violations.`);
