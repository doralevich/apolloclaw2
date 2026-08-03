"use client";
import OnboardingForm from "@/components/onboard/OnboardingForm";

// The white-glove entry point. Same questionnaire as /onboard, deliberately with no paywall
// and no login: David hands this link out directly to clients he is building a self-hosted
// (Mac Mini) agent for, or doing custom work for, where the money was settled offline. There
// is nothing to charge here, so there is nothing to gate.
//
// It is not linked from anywhere on the site and is noindex/nofollow via the layout, so the
// only way in is the URL itself. That is the whole security model, and it is the right one:
// the form collects no credentials and grants no access, it just files a lead. The technical
// setup that DOES take credentials is the separate form at /setup, which this hands off to on
// completion.
export default function WhiteGloveOnboardingPage() {
  return <OnboardingForm mode="whiteglove" />;
}
