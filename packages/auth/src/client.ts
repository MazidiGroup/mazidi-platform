"use client";
import { createBrowserClient } from "@supabase/ssr";
import { ssoCookieOptions } from "./cookies";

/** CLIENT entry. Import as "@mazidi/auth/client" from "use client" components only. */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: ssoCookieOptions() },
  );
}
