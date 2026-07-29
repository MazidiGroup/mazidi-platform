import { NextRequest, NextResponse } from "next/server";
import {
  APP_PRIVACY_PREFIX,
  isAppSubdomain,
  isTenantSlug,
  RESERVED_SUBDOMAINS,
  ROOT_DOMAIN,
} from "@mazidi/config";

/**
 * Host-scoped routing for apps/web.
 *
 * Tenant engine (docs/01 §2): {slug}.mazidigroup.com → /sites/{slug}/*
 * Local preview:              {slug}.localhost:3000  → /sites/{slug}/*
 *
 * App privacy centre — app-scoped by owner decision, NOT the platform notice:
 *   mazidiperformance.mazidigroup.com/privacy* → /app-privacy/privacy*
 *   mazidigroup.com/privacy and www./privacy   → no route → 404
 *   /app-privacy/* on any non-review host      → 404 (internal segment)
 *
 * Group traffic (apex, www, plain localhost) otherwise passes through untouched.
 */

/** True for `/x` and `/x/…`, false for `/xyz`. */
const isUnder = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * Review hosts: local development and Vercel *preview* deployments.
 *
 * Preview deployments are served from `*.vercel.app`, never from
 * `mazidiperformance.mazidigroup.com`, so without this the privacy centre would
 * be unreachable for screenshots and PR review. On these hosts it is served at
 * `/privacy*` exactly as on the app subdomain, and the internal
 * `/app-privacy/*` segment is additionally reachable directly.
 *
 * This can never match the apex or www — those are literal `mazidigroup.com` /
 * `www.mazidigroup.com` — so the "apex must not serve the app notice" rule holds
 * regardless of environment. The `VERCEL_ENV` gate additionally excludes the
 * production deployment's own `*.vercel.app` alias, so in production only the
 * real app subdomain serves the notice.
 */
const IS_PRODUCTION_DEPLOYMENT = process.env.VERCEL_ENV === "production";
const isReviewHost = (host: string) =>
  !IS_PRODUCTION_DEPLOYMENT &&
  (host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".localhost") ||
    host.endsWith(".vercel.app"));

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0] ?? "";
  const { pathname } = req.nextUrl;
  const review = isReviewHost(host);

  // The internal segment is a public URL only on a review host — in particular
  // mazidigroup.com/app-privacy/* must never serve the app notice.
  if (isUnder(pathname, APP_PRIVACY_PREFIX) && !review) {
    return new NextResponse(null, { status: 404 });
  }

  const suffix = host.endsWith(`.${ROOT_DOMAIN}`)
    ? `.${ROOT_DOMAIN}`
    : host.endsWith(".localhost")
      ? ".localhost"
      : null;
  const sub = suffix ? host.slice(0, -suffix.length) : null;

  // App-scoped privacy centre. Runs BEFORE the tenant branch because
  // `mazidiperformance` is deliberately not a tenant slug. Every other path on
  // that host keeps behaving exactly as it does today.
  if (isUnder(pathname, "/privacy") && (review || (sub !== null && isAppSubdomain(sub)))) {
    const url = req.nextUrl.clone();
    url.pathname = `${APP_PRIVACY_PREFIX}${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (sub === null) return NextResponse.next(); // apex, plain localhost, vercel preview

  if ((RESERVED_SUBDOMAINS as readonly string[]).includes(sub)) return NextResponse.next();

  if (isTenantSlug(sub) && !pathname.startsWith("/sites/")) {
    const url = req.nextUrl.clone();
    url.pathname = `/sites/${sub}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
};
