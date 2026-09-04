import type { Metadata } from "next";
import OnboardingForm from "@/components/onboard/OnboardingForm";

// The Real Estate build funnel on ApolloClaw. This is where the "Build your agent" CTA on the
// separate therealestateagent.ai marketing site sends people: the questionnaire and the checkout
// (billing) run here, so the customer gets a real, provisioned Real Estate agent while ApolloClaw
// handles payment seamlessly.
//
// Same machine as the generic /onboard lead flow (gate -> paywall -> Stripe -> confirm ->
// questionnaire -> build), but pinned to the `realestate` type: the questionnaire adds the Real
// Estate deep-dive, the paywall stamps agent_type=realestate on the Stripe session, and
// /api/onboard/complete provisions a Real Estate agent from the answers.
//
// noindex: the marketing site is the front door; this is its checkout target, not a page to rank.

export const metadata: Metadata = {
  title: "Build your Real Estate Agent | ApolloClaw",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ paid?: string; session_id?: string }> };

export default async function BuildRealEstatePage({ searchParams }: Props) {
  const { paid, session_id } = await searchParams;
  return (
    <OnboardingForm
      mode="lead"
      agentTypeId="realestate"
      agentLabel="The Real Estate Agent"
      justPaid={paid === "1"}
      sessionId={session_id}
    />
  );
}
