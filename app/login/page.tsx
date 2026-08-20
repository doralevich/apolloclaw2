"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import ApolloClawLogo from "@/components/ApolloClawLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { POST_AUTH_LANDING } from "@/lib/routes";
import { toast } from "sonner";

// Only allow internal redirects — mirrors the open-redirect guard in /auth/callback.
function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : POST_AUTH_LANDING;
}

// /auth/callback exchanges the email link for a session, then redirects to `next`.
// ?reset=1 opens the reset panel directly, and ?email= fills the address in.
//
// Onboarding sends people here when the address they typed already has an account: the useful
// instruction is "reset your password and log in", and landing them on a sign-in form where
// they still have to spot "Forgot password?" and retype the address they just typed is most of
// that instruction left undone.
//
// Read through useSyncExternalStore rather than a useState initializer, because the server has
// no window.location. An initializer would render the sign-in form on the server and the reset
// form on the client, which is a hydration error.
const subscribeNever = () => () => {};
const readSearch = () => window.location.search;
const readNoSearch = () => "";

export default function LoginPage() {
  const search = useSyncExternalStore(subscribeNever, readSearch, readNoSearch);
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const prefill = params.get("email") ?? "";

  // Derived rather than seeded, so the URL's answer can arrive on the render after hydration
  // without a setState in an effect. Any explicit toggle from here on takes over.
  const [resetChosen, setShowReset] = useState<boolean | null>(null);
  const showReset = resetChosen ?? params.get("reset") === "1";

  const [signinEmailTyped, setSigninEmail] = useState<string | null>(null);
  const signinEmail = signinEmailTyped ?? prefill;
  const [signinPassword, setSigninPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signinLoading, setSigninLoading] = useState(false);


  const [resetEmailTyped, setResetEmail] = useState<string | null>(null);
  const resetEmail = resetEmailTyped ?? prefill;
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

    // Our own route, not supabase.auth.resetPasswordForEmail - the difference is whose name is
    // on the email. Supabase's mailer sends as Supabase; /api/auth/reset-password mints the
    // same recovery link and Mandrill delivers it as Apollo Claw, from a domain whose DKIM and
    // SPF we control. Same link, same /reset-password landing, our envelope.
    setResetLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || "Could not send the reset email. Please try again.");
      }
    } catch (err) {
      setResetLoading(false);
      return toast.error(err instanceof Error ? err.message : "Could not send the reset email.");
    }
    setResetLoading(false);
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
              <div className="relative">
                <Input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={signinPassword}
                  onChange={(e) => setSigninPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
