"use client";
import OnboardingForm from "@/components/onboard/OnboardingForm";

// Free, no-login lead-qualification form. Anyone with the link can fill it out; answers
// land as a sales lead in the CRM (see /api/intake). The identical questionnaire also
// powers the paid, post-checkout flow at /onboard/[agent] — see components/onboard/OnboardingForm.tsx.
export default function OnboardPage() {
  return <OnboardingForm mode="lead" />;
}
