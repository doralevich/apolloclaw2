"use client";
import { useEffect, useState } from "react";
import OnboardingForm from "@/components/onboard/OnboardingForm";

// The white-glove entry point. Same questionnaire as /onboard, deliberately with no paywall
// and no login: David hands this link out directly to clients he is building a self-hosted
// (Mac Mini) agent for, or doing custom work for, where the money was settled offline. There
// is nothing to charge here through the standard tiers, so there is nothing to gate.
//
// It is not linked from anywhere on the site and is noindex/nofollow via the layout, so the
// only way in is the URL itself. That is the whole security model, and it is the right one:
// the form collects no credentials and grants no access, it just files a lead.
//
// CLOSING A CUSTOM-PRICED DEAL. Append ?pay=<Stripe Payment Link> to the URL and the finish
// screen ends on "Complete Your Payment" pointing at that link, so a client fills the
// questionnaire and then pays whatever was agreed. Without it, the finish hands off to the
// technical setup form at /setup instead.

// Only a Stripe-hosted payment link is honoured, so a crafted ?pay= can't turn this into an
// open redirect to somewhere hostile.
function safeStripePayUrl(raw: string | null): string | undefined {
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    const ok = u.protocol === "https:" && (host === "buy.stripe.com" || host === "stripe.com" || host.endsWith(".stripe.com"));
    return ok ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

export default function WhiteGloveOnboardingPage() {
  // Read from window rather than useSearchParams to avoid a Suspense boundary; the value is only
  // needed on the finish screen, long after mount, so arriving a tick late is fine.
  const [payUrl, setPayUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    setPayUrl(safeStripePayUrl(new URLSearchParams(window.location.search).get("pay")));
  }, []);

  return <OnboardingForm mode="whiteglove" payUrl={payUrl} />;
}
