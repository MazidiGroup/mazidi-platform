import type { CookieOptions } from "@supabase/ssr";

/**
 * Cross-subdomain SSO: one session cookie valid on mazidigroup.com,
 * portal.mazidigroup.com, team.*, admin.* and every tenant subdomain.
 * AUTH_COOKIE_DOMAIN=".mazidigroup.com" in production; unset on localhost.
 */
export function ssoCookieOptions(): CookieOptions {
  const domain = process.env.AUTH_COOKIE_DOMAIN;
  return {
    ...(domain ? { domain } : {}),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}
