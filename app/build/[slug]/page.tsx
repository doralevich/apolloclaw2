import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OnboardingForm from "@/components/onboard/OnboardingForm";
import { buildFunnelType, inlineAgentLabel } from "@/lib/buildFunnel";

// The self-serve build funnel for one role agent: /build/real-estate, /build/cfo, /build/law...
//
// This is where each agent's own marketing site (therealestateagent.ai, the CFO site, ...) sends
// its "Build your agent" CTA. The sites stay separate and independently editable; the
// questionnaire and the payment run here, on ApolloClaw, so the customer gets a real provisioned
// agent and David gets one place that handles billing.
//
// Same machine as the generic /onboard lead flow (gate -> paywall -> Stripe -> confirm ->
// questionnaire -> build), pinned to this slug's type: the questionnaire adds that role's
// deep-dive, the paywall stamps agent_type on the Stripe session, and /api/onboard/complete
// provisions that agent from the answers.
//
// noindex: each agent's marketing site is the front door; this is its checkout target, not a page
// to rank against it.

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ paid?: string; session_id?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const type = buildFunnelType(slug);
  if (!type) return { title: "Not found", robots: { index: false, follow: false } };
  return {
    title: `Build your ${inlineAgentLabel(type.label)} | ApolloClaw`,
    robots: { index: false, follow: false },
  };
}

export default async function BuildFunnelPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const type = buildFunnelType(slug);
  if (!type) notFound();

  const { paid, session_id } = await searchParams;
  return (
    <OnboardingForm
      mode="lead"
      agentTypeId={type.id}
      agentLabel={type.label}
      justPaid={paid === "1"}
      sessionId={session_id}
    />
  );
}
