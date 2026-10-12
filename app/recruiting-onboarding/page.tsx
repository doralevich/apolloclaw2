"use client";
import { useEffect, useState } from "react";
import OnboardingForm from "@/components/onboard/OnboardingForm";

// The Recruiting Agent's intake, on an unlisted link. Same white-glove model as /cfo-onboarding
// and /legal-onboarding (no paywall, no login, files a lead) but pinned to the `recruiting` agent
// type, so the questionnaire adds the recruiting deep-dive (lib/recruitingIntake.ts) on top of the
// standard business questions.
//
// The deep-dive's first question asks what kind of recruiting this is. A staffing firm or an
// in-house team gets the hiring questions; a sports agency gets the sports-recruiting questions
// (which sports, who they sign, where prospects come from, who is in the room when a prospect
// decides). Same route, same link, the answer on page one picks the path. Added Oct 12, 2026 for
// WIN Sports Group's intake, David's call.
//
// David hands this URL out directly to a prospect; it is not linked from anywhere on the site and
// is noindex/nofollow via the layout, so the only way in is the URL itself. The intake is filed as a
// lead (CRM email + PDF, with a "Recruiting Deep-Dive" section), and David provisions the
// Recruiting agent from it. Configuring a LIVE agent from the answers is the signed-in
// /onboard/recruiting?ws=<workspace> path, which writes them into the box.
//
// CLOSING THE DEAL. Append ?pay=<Stripe Payment Link> and the finish screen ends on a payment
// hand-off, so a prospect fills the recruiting intake and then pays whatever was agreed - the same
// custom, per-engagement pricing the /ai-agents/recruiting page sells on.

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

export default function RecruitingOnboardingPage() {
  // Read from window rather than useSearchParams to avoid a Suspense boundary; the value is only
  // needed on the finish screen, long after mount, so arriving a tick late is fine.
  const [payUrl, setPayUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the query param once on mount; it's only needed on the finish screen, long after this runs
    setPayUrl(safeStripePayUrl(new URLSearchParams(window.location.search).get("pay")));
  }, []);

  return <OnboardingForm mode="whiteglove" agentTypeId="recruiting" payUrl={payUrl} />;
}
