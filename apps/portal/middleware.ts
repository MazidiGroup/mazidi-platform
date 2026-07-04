import { NextRequest, NextResponse } from "next/server";
import { supabaseMiddleware } from "@mazidi/auth/middleware";

const PUBLIC_PATHS = ["/login", "/auth"];

/** Session refresh + auth guard: everything except /login and /auth/* requires a user. */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const supabase = supabaseMiddleware(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!user && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (user && req.nextUrl.pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
};
