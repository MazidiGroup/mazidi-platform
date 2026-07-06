import { NextRequest, NextResponse } from "next/server";

/**
 * EDGE entry — import as "@mazidi/auth/middleware".
 *
 * Deliberately imports NOTHING beyond next/server. Constructing a Supabase
 * client here (the previous implementation) pulled @supabase/supabase-js into
 * the Edge bundle, and upstream releases have repeatedly touched Node APIs at
 * module scope — crashing every request with MIDDLEWARE_INVOCATION_FAILED
 * before a try/catch could even run.
 *
 * Security model (unchanged): middleware is a UX gate, not the boundary.
 * Every layout, page and API route verifies the session server-side via
 * getUser() (@mazidi/auth/server) in the Node runtime, where token refresh
 * also happens (login + auth/callback route handlers set cookies).
 * Here we only check cookie PRESENCE and route accordingly.
 */

/** True if a Supabase auth-token cookie exists (incl. chunked `.0`, `.1`, …). */
export function hasSupabaseSession(req: NextRequest): boolean {
  return req.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token") && c.value.length > 0);
}

export interface EdgeAuthConfig {
  /** Where an already-authenticated user lands when visiting /login. */
  homePath: string;
  /** Paths reachable without a session. Default: /login, /auth. */
  publicPaths?: string[];
}

/** Shared auth gate for portal / team / admin middleware. */
export function edgeAuthGuard(req: NextRequest, cfg: EdgeAuthConfig): NextResponse {
  const publicPaths = cfg.publicPaths ?? ["/login", "/auth"];
  const { pathname } = req.nextUrl;
  const authed = hasSupabaseSession(req);
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!authed && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (authed && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = cfg.homePath;
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
