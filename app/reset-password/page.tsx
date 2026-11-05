"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { branding } from "@/config/branding";
import { POST_AUTH_LANDING } from "@/lib/routes";
import { toast } from "sonner";

const MIN_PASSWORD = 8;

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // null = still checking for the recovery session.
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  // ?welcome=1: the first-run stop straight after checkout (app/api/onboard/post-checkout),
  // where the buyer is already signed in and is choosing a password for next time rather than
  // replacing one. Skippable, and it continues to `next` (an internal path) rather than the
  // dashboard, because the questionnaire is what comes next for them.
  const [welcome, setWelcome] = useState(false);
  const [next, setNext] = useState(POST_AUTH_LANDING);

  useEffect(() => {
    // The recovery link routes through /auth/callback, which establishes a session
    // before redirecting here. No user means the link was invalid, already used,
    // expired, or opened in a different browser than the one that requested it.
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const params = new URLSearchParams(window.location.search);
        const rawNext = params.get("next") || "";
        setWelcome(params.get("welcome") === "1");
        setNext(rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : POST_AUTH_LANDING);
        setHasSession(!!data.user);
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) {
      return toast.error(`Password must be at least ${MIN_PASSWORD} characters.`);
    }
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    // First run: no "updated" card to read, straight on to the questionnaire.
    if (welcome) {
      window.location.href = next;
      return;
    }
    setDone(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{branding.appName}</h1>
          {hasSession && !done && (
            <p className="text-sm text-muted-foreground">
              {welcome
                ? "You're in. Choose a password so you can get back in next time."
                : "Choose a new password."}
            </p>
          )}
        </div>

        {hasSession === null ? (
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        ) : done ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-6 text-center text-sm">
              <p className="font-medium">Password updated</p>
              <p className="mt-1 text-muted-foreground">You&apos;re all set.</p>
            </div>
            <Button className="w-full" onClick={() => (window.location.href = next)}>
              Continue to dashboard
            </Button>
          </div>
        ) : !hasSession ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-6 text-center text-sm">
              <p className="font-medium">Reset link invalid or expired</p>
              <p className="mt-1 text-muted-foreground">
                Request a new password reset link to try again.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = "/login")}
            >
              Back to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={MIN_PASSWORD}
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : welcome ? "Save password and continue" : "Update password"}
            </Button>
            {welcome && (
              <p className="text-center text-sm">
                <a href={next} className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
                  Skip for now
                </a>
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
