import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ssoCookieOptions, type CookieToSet } from "./cookies";

/**
 * SERVER-ONLY entry (`next/headers`). Import as "@mazidi/auth/server".
 * Never import from client components or middleware.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: ssoCookieOptions(),
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all: CookieToSet[]) => {
          try {
            all.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component — middleware handles refresh.
          }
        },
      },
    },
  );
}

/** Returns the authenticated Supabase user or null. Verified server-side. */
export async function getUser() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}
