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
  try {
    return req.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token") && c.value.length > 0);
  } catch {
    // Malformed cookie jar (stale/oversized/legacy cookies) must never 500 the
    // site. Treat as unauthenticated; server-side getUser() is the boundary.
    return false;
  }
}

export interface EdgeAuthConfig {
  /** Paths reachable without a session. Default: /login, /auth. */
  publicPaths?: string[];
}

/**
 * Shared auth gate for portal / team / admin middleware.
 * FAIL-OPEN by design: any unexpected per-request error passes the request
 * through to the Node runtime, where every layout/page/route verifies the
 * session anyway. A 500 here takes down every route; failing open costs one
 * server-side redirect. (Cheap in Edge; possible only because this module has
 * zero dependencies — import-time crashes can't be caught.)
 */
export function edgeAuthGuard(req: NextRequest, cfg: EdgeAuthConfig = {}): NextResponse {
  try {
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
    // NOTE: no "authed → leave /login" redirect here. Cookie PRESENCE cannot
    // prove validity, and redirecting on a stale cookie creates an infinite
    // loop with the server-side check (/login → home → getUser() fails →
    // /login → …). A signed-in user visiting /login just sees the form.
    return NextResponse.next();
  } catch (e) {
    console.error("edgeAuthGuard failed open:", e);
    return NextResponse.next();
  }
}
