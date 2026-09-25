import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OnboardingForm from "@/components/onboard/OnboardingForm";
import { getAgentType } from "@/config/agent-types";
import { inlineAgentLabel } from "@/lib/buildFunnel";

// The build funnel for the flagship Apollo Agent itself: /agent-build/apollo.
//
// Same machine as /build/<slug> (see lib/buildFunnel.ts) - gate -> paywall -> Stripe -> confirm
// -> questionnaire -> build - just pinned to the "apollo" type directly rather than through
// BUILD_SLUGS, since apollo is the generic license build (what plain /onboard already
// provisions) and not one of the sellable role agents that map keys.
//
// noindex, matching every other funnel entry point: this is a checkout target handed out from
// elsewhere, not a page to rank on its own.

const TYPE = getAgentType("apollo");

export function generateMetadata(): Metadata {
  if (!TYPE) return { title: "Not found", robots: { index: false, follow: false } };
  return {
    title: `Build your ${inlineAgentLabel(TYPE.label)} | ApolloClaw`,
    robots: { index: false, follow: false },
  };
}

type Props = {
  searchParams: Promise<{ paid?: string; session_id?: string }>;
};

export default async function AgentBuildApolloPage({ searchParams }: Props) {
  if (!TYPE) notFound();

  const { paid, session_id } = await searchParams;
  return (
    <OnboardingForm
      mode="lead"
      agentTypeId={TYPE.id}
      agentLabel={TYPE.label}
      justPaid={paid === "1"}
      sessionId={session_id}
    />
  );
}
