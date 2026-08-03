import OnboardingForm from "@/components/onboard/OnboardingForm";

// The public onboarding journey: "Start Here" (lead capture) -> paywall -> the business
// questionnaire. No login anywhere in it — the account is created from the completed Stripe
// checkout by the webhook, not before. Answers land as a lead via /api/intake.
//
// The identical questionnaire also powers /white-glove-onboarding (same thing without the
// paywall) and the paid post-checkout flow at /onboard/[agent]. See
// components/onboard/OnboardingForm.tsx.
//
// A server component purely so `?paid=1` is read here rather than from `window` in the
// client. Stripe's success URL comes back to this page, and reading the flag on the server
// means the first client render already knows to resume at the questionnaire — no flash of
// "Start Here" before it corrects itself.
type Props = { searchParams: Promise<{ paid?: string }> };

export default async function OnboardPage({ searchParams }: Props) {
  const { paid } = await searchParams;
  return <OnboardingForm mode="lead" justPaid={paid === "1"} />;
}
