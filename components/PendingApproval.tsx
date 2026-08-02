"use client";

import { signOut } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { branding } from "@/config/branding";

const SUPPORT_EMAIL = "david@apolloclaw.ai";

// Shown to a signed-in user with no active entitlement. They have a valid session but no
// workspace is created for them.
//
// In practice almost nobody should land here: new sign-ups are entitled by the
// on-signup trigger (supabase/migrations/0003), and buyers are entitled by the Stripe
// webhook before they ever reach the dashboard (checkout's success_url routes them
// through /onboard/[agent] first). So this screen is a fallback for the cases that DO
// slip through — a lapsed or cancelled subscription, or an account that predates the
// trigger — and the copy has to hold up for someone who has already paid us money.
//
// The old copy ("You're on the list, we'll email you when your access is switched on")
// was written for the v1 invite-only allowlist. It promised an email nobody sends and
// read like a waitlist, which is alarming if you just completed a checkout.
export function PendingApproval({
  email,
  status,
}: {
  email: string;
  /** The entitlement row's status, or undefined when there's no row at all. */
  status?: string;
}) {
  const lapsed = status === "canceled" || status === "past_due";
  const heading = lapsed ? "Your agent access is paused" : "No agent access on this account";
  const body = lapsed
    ? status === "past_due"
      ? "Your hosting subscription has a payment that didn't go through, so the dashboard is locked until it's settled. Your agent and its data are untouched."
      : "Your hosting subscription was cancelled, so the dashboard is locked. Your agent and its data are untouched."
    : "This email isn't attached to an agent yet. If you just bought one and it isn't showing up, we can sort it out right away.";

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{branding.appName}</h1>
        <div className="space-y-3 rounded-2xl border bg-card p-8">
          <p className="text-lg font-medium">{heading}</p>
          <p className="text-sm text-muted-foreground">{body}</p>
          {email && (
            <p className="text-sm text-muted-foreground">
              You&apos;re signed in as <span className="font-medium text-foreground">{email}</span>.
              If you bought under a different email, sign out and sign back in with that one.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Email{" "}
            <a className="font-medium text-foreground underline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>{" "}
            and we&apos;ll get you in.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!lapsed && (
            <Button asChild>
              <a href="/agents">Browse agents</a>
            </Button>
          )}
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    </main>
  );
}
