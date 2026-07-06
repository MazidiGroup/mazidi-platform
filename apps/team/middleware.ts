import type { NextRequest } from "next/server";
import { edgeAuthGuard } from "@mazidi/auth/middleware";

/** Edge auth gate — dependency-free; session VERIFICATION happens server-side. */
export function middleware(req: NextRequest) {
  return edgeAuthGuard(req, { homePath: "/dashboard" });
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|.*\\..*).*)"],
};
