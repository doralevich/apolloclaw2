"use client";
import { useEffect, useState } from "react";
import OnboardingForm from "@/components/onboard/OnboardingForm";

// The Law Agent's intake, on an unlisted link. Same white-glove model as /cfo-onboarding (no
// paywall, no login, files a lead) but pinned to the `legal` agent type, so the questionnaire adds
// the legal deep-dive (lib/legalIntake.ts) on top of the standard business questions.
//
// David hands this URL out directly to a legal prospect; it is not linked from anywhere on the site
// and is noindex/nofollow via the layout, so the only way in is the URL itself. The intake is filed
// as a lead (CRM email + PDF, with a "Legal Deep-Dive" section), and David provisions the Law agent
// from it.
//
// CLOSING THE DEAL. Append ?pay=<Stripe Payment Link> and the finish screen ends on a payment
// hand-off, so a prospect fills the legal intake and then pays whatever was agreed - the same
// custom, per-engagement pricing the /ai-agents/legal page sells on.

// Only a Stripe-hosted payment link is honoured, so a crafted ?pay= can't turn this into an open
// redirect to somewhere hostile.
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

export default function LegalOnboardingPage() {
  // Read from window rather than useSearchParams to avoid a Suspense boundary; the value is only
  // needed on the finish screen, long after mount, so arriving a tick late is fine.
  const [payUrl, setPayUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the query param once on mount; it's only needed on the finish screen, long after this runs
    setPayUrl(safeStripePayUrl(new URLSearchParams(window.location.search).get("pay")));
  }, []);

  return <OnboardingForm mode="whiteglove" agentTypeId="legal" payUrl={payUrl} />;
}
