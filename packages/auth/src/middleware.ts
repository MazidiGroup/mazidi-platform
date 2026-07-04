import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { ssoCookieOptions } from "./cookies";

/**
 * EDGE entry for Next middleware. Import as "@mazidi/auth/middleware".
 * Deliberately isolated: the edge runtime rejects `next/headers`.
 */
export function supabaseMiddleware(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: ssoCookieOptions(),
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (all) => {
          all.forEach(({ name, value }) => req.cookies.set(name, value));
          all.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );
}
