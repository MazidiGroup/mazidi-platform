import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@mazidi/auth/server";

/**
 * Auth callback (docs/04 §3).
 * - OAuth / PKCE magic link  → ?code=...            → exchangeCodeForSession
 * - Email-template links     → ?token_hash=&type=   → verifyOtp
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const next = searchParams.get("next") ?? "/dashboard";
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await supabaseServer();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
