import { NextRequest, NextResponse } from "next/server";
import { isTenantSlug, RESERVED_SUBDOMAINS, ROOT_DOMAIN } from "@mazidi/config";

/**
 * Tenant engine (docs/01 §2): {slug}.mazidigroup.com → /sites/{slug}/*
 * Local preview:            {slug}.localhost:3000  → /sites/{slug}/*
 * Group traffic (apex, www, plain localhost) passes through untouched.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0] ?? "";
  const { pathname } = req.nextUrl;

  const suffix = host.endsWith(`.${ROOT_DOMAIN}`)
    ? `.${ROOT_DOMAIN}`
    : host.endsWith(".localhost")
      ? ".localhost"
      : null;
  if (!suffix) return NextResponse.next(); // apex, plain localhost, vercel preview

  const sub = host.slice(0, -suffix.length);
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
