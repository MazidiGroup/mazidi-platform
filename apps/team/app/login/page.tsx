"use client";
import { useState, useTransition } from "react";
import { supabaseBrowser } from "@mazidi/auth/client";
import { Button, Field, Input } from "@mazidi/ui";

/**
 * Single Sign-On (docs/04 §3): magic link + Google / Microsoft / Apple.
 * One account across every Mazidi company and portal surface.
 */
export default function LoginPage() {
  const [sent, setSent] = useState(false);
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const nextPath = () =>
    new URLSearchParams(window.location.search).get("next") ?? "/dashboard";

  const callback = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(new URLSearchParams(window.location.search).get("next") ?? "/dashboard")}`;

  function magicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email") as string;
    start(async () => {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callback() },
      });
      if (error) setError(error.message);
      else setSent(true);
    });
  }

  /** Local-dev convenience: email/password via Supabase signInWithPassword. */
  function passwordSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({
        email: fd.get("email") as string,
        password: fd.get("password") as string,
      });
      if (error) setError(error.message);
      // full navigation so the middleware/server sees the fresh session cookie
      else window.location.assign(nextPath());
    });
  }

  function oauth(provider: "google" | "azure" | "apple") {
    start(async () => {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callback() },
      });
      if (error) setError(error.message);
    });
  }

  return (
    <div className="hero-grad flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-[420px] rounded-lg border border-line bg-bg2 p-10 max-sm:p-6">
        <div className="mb-8 flex items-center gap-3 font-display text-[1.28rem] font-semibold">
          <svg viewBox="0 0 40 40" fill="none" className="h-[34px] w-[34px]" aria-hidden>
            <rect x="11" y="11" width="18" height="18" transform="rotate(45 20 20)" stroke="#C9A461" strokeWidth="2" />
            <rect x="16" y="16" width="8" height="8" transform="rotate(45 20 20)" fill="#C9A461" />
          </svg>
          Mazidi Group
        </div>
        <h1 className="mb-1 font-display text-[1.6rem] font-medium">Employee Portal</h1>
        <p className="mb-7 text-[.9rem] text-t2">One login for the whole ecosystem — team edition.</p>

        {sent ? (
          <p className="rounded-xl border border-line bg-bg3 p-4 text-[.9rem] text-t2">
            Check your inbox — we&apos;ve sent you a secure sign-in link.
          </p>
        ) : (
          <>
            {mode === "magic" ? (
              <form onSubmit={magicLink}>
                <Field label="Email address">
                  <Input name="email" type="email" placeholder="you@company.com" required autoComplete="email" />
                </Field>
                <Button type="submit" className="w-full justify-center" disabled={pending}>
                  {pending ? "Sending…" : "Email me a sign-in link"}
                </Button>
              </form>
            ) : (
              <form onSubmit={passwordSignIn}>
                <Field label="Email address">
                  <Input name="email" type="email" placeholder="you@company.com" required autoComplete="email" />
                </Field>
                <Field label="Password">
                  <Input name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
                </Field>
                <Button type="submit" className="w-full justify-center" disabled={pending}>
                  {pending ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            )}
            <button
              type="button"
              className="mt-3 w-full text-center text-[.8rem] text-t3 transition-colors hover:text-gold"
              onClick={() => { setError(null); setMode(mode === "magic" ? "password" : "magic"); }}
            >
              {mode === "magic" ? "Use email & password instead" : "Use a magic link instead"}
            </button>
            <div className="my-6 flex items-center gap-3 text-[.75rem] uppercase tracking-wider text-t3">
              <span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" />
            </div>
            <div className="grid gap-2.5">
              <Button variant="outline" className="w-full justify-center" onClick={() => oauth("google")} disabled={pending}>Continue with Google</Button>
              <Button variant="outline" className="w-full justify-center" onClick={() => oauth("azure")} disabled={pending}>Continue with Microsoft</Button>
              <Button variant="outline" className="w-full justify-center" onClick={() => oauth("apple")} disabled={pending}>Continue with Apple</Button>
            </div>
          </>
        )}
        {error && <p className="mt-4 text-[.85rem] text-danger" role="alert">{error}</p>}
      </div>
    </div>
  );
}
