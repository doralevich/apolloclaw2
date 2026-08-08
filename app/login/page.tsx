"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import ApolloClawLogo from "@/components/ApolloClawLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicSiteOrigin } from "@/lib/site-url";
import { POST_AUTH_LANDING } from "@/lib/routes";
import { toast } from "sonner";

// Only allow internal redirects — mirrors the open-redirect guard in /auth/callback.
function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : POST_AUTH_LANDING;
}

// /auth/callback exchanges the email link for a session, then redirects to `next`.
function callbackUrl(next: string): string {
  const url = new URL("/auth/callback", publicSiteOrigin(window.location.origin));
  url.searchParams.set("next", next);
  return url.toString();
}

export default function LoginPage() {
  const [showReset, setShowReset] = useState(false);

  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinLoading, setSigninLoading] = useState(false);


  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // /auth/callback bounces here with ?error=auth when a confirmation/recovery link
  // fails (expired, already used, or opened in a different browser). Surface it —
  // otherwise the user lands on a pristine form with no clue the link broke.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") !== "auth") return;
    toast.error("That link is invalid or has expired. Log in, or request a new one.");
    params.delete("error");
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }, []);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    const mail = signinEmail.trim();
    if (!mail || !signinPassword) return;

    const supabase = createClient();
    const next = safeNext(new URLSearchParams(window.location.search).get("next"));

    setSigninLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: mail, password: signinPassword });
    setSigninLoading(false);
    if (error) return toast.error(error.message);
    // Hard navigation so the freshly written auth cookies ride along on the next request.
    window.location.href = next;
  }


  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    const mail = resetEmail.trim();
    if (!mail) return;

    const supabase = createClient();
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(mail, {
      redirectTo: callbackUrl("/reset-password"),
    });
    setResetLoading(false);
    if (error) return toast.error(error.message);
    setResetSent(true);
  }

  if (showReset) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-3 text-center">
            <ApolloClawLogo className="mx-auto" height={36} />
            <p className="text-sm text-muted-foreground">
              {resetSent ? "We'll email you a link to set a new password." : "Reset your password."}
            </p>
          </div>

          {resetSent ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-6 text-center text-sm">
                <p className="font-medium">Check your email</p>
                <p className="mt-1 text-muted-foreground">
                  We sent a password reset link to{" "}
                  <span className="font-medium text-foreground">{resetEmail.trim()}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setResetSent(false);
                }}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Back to log in
              </button>
            </div>
          ) : (
            <form onSubmit={onReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? "Sending..." : "Send reset link"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <button type="button" onClick={() => setShowReset(false)} className="hover:text-foreground">
                  Back to log in
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      {/* Single column since the Create Account card was removed - a lone card inside a
          two-column grid sat off to one side of an empty half. */}
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <ApolloClawLogo className="mx-auto" height={36} />
          <p className="text-sm text-muted-foreground">Log in to continue.</p>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6">
          <div className="space-y-1">
            <h2 className="font-semibold">Log In</h2>
            <p className="text-sm text-muted-foreground">Welcome back.</p>
          </div>
          <form onSubmit={onSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={signinEmail}
                onChange={(e) => setSigninEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={signinPassword}
                onChange={(e) => setSigninPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={signinLoading}>
              {signinLoading ? "Signing in..." : "Log In"}
            </Button>
          </form>
        </div>

        {/* The Create Account card that used to sit beside this one is deliberately gone.
            Accounts are now created as part of purchasing (David's call): /onboard captures the
            lead, takes payment, and provisions the account from the completed checkout. A
            self-serve signup here would let someone create an unpaid account that lands on the
            no-access screen, which is a dead end rather than a funnel. The link below replaces
            it so someone without an account still has somewhere to go. */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/onboard" className="font-medium text-foreground underline underline-offset-4">
            Get started
          </Link>
        </p>
      </div>
    </main>
  );
}
