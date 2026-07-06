import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth"];

export function middleware(req: NextRequest) {
  const isPublic = PUBLIC_PATHS.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );

  const hasAuthCookie = req.cookies.get("sb-access-token")?.value;

  if (!hasAuthCookie && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (hasAuthCookie && req.nextUrl.pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
};