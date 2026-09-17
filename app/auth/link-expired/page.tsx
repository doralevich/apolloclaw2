"use client";

import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { branding } from "@/config/branding";

// Where a dead sign-in link lands, instead of the login form.
//
// WHY THIS PAGE EXISTS. /auth/callback used to bounce every failure to /login?error=auth, which
// raised a toast and then showed a pristine login form. Three people in a row read that as the
// link doing nothing: Ira Stahlberger on Sep 17, David reproducing it in Chrome the same
// afternoon, and Graham before both. A toast is the wrong carrier for this - it is gone in four
// seconds, it does not survive the reload somebody does when they think nothing happened, and
// the screen it floats over is one the person has already decided is a dead end.
//
// The other half of the problem is that "invalid or expired" is not what usually happened. A
// recovery link is SINGLE USE and every new one invalidates the last, so the ordinary way to get
// here is having clicked a link twice, or clicked an older email after requesting again. That is
// worth saying out loud, because somebody who knows it stops re-requesting and starts clicking
// the newest one.
//
// So: a real page, with the actual reasons, and the one control that helps - request a new link,
// right here, without going back to the login form to find it.

const REASONS = [
  "You already used it. These links work once, so a second click always fails - including the one your browser makes if you reload the page.",
  "You requested another one. Each new link cancels the one before it, so only the newest email works.",
  "It expired. Links are good for one hour.",
  "Something fetched it before you did. Some corporate mail systems open links to scan them, which spends the link.",
];

/** Never changes after load, so nothing to subscribe to. */
const subscribeNever = () => () => {};

/** Which flow died, from ?type. Read through useSyncExternalStore rather than setState in an
 *  effect: the server has no location, so an effect would be a second render AND trip
 *  react-hooks/set-state-in-effect. Server snapshot is the same default the copy falls back to,
 *  so the first client render matches. */
function readFlow(): string {
  try {
    return new URLSearchParams(window.location.search).get("type") || "recovery";
  } catch {
    return "recovery";
  }
}

export default function LinkExpiredPage() {
  const flow = useSyncExternalStore(subscribeNever, readFlow, () => "recovery");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isRecovery = flow === "recovery";

  async function requestNew(e: React.FormEvent) {
    e.preventDefault();
    const mail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      return toast.error("Enter the email address on your account.");
    }
    setSending(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message || "Could not send the email. Please try again.");
      }
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{branding.appName}</h1>
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">
              {isRecovery ? "That password link no longer works" : "That link no longer works"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Nothing is wrong with your account, and your password has not changed.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Usually one of these:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {REASONS.map((r) => (
                <li key={r} className="flex gap-2">
                  <span aria-hidden="true" className="select-none">·</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {isRecovery &&
            (sent ? (
              <div className="rounded-md border bg-muted/40 p-4 text-sm">
                <p className="font-medium">Check your email</p>
                <p className="mt-1 text-muted-foreground">
                  A new link is on its way. Open the newest email and click it once - any earlier
                  one is now dead.
                </p>
              </div>
            ) : (
              <form onSubmit={requestNew} className="space-y-3 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Send me a new link</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? "Sending..." : "Send a new link"}
                </Button>
              </form>
            ))}
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={() => (window.location.href = "/login")}>
            Back to sign in
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Still stuck? Reply to the email you received and we will set it for you directly.
        </p>
      </div>
    </main>
  );
}
