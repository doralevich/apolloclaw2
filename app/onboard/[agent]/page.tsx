import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAgentType } from "@/config/agent-types";
import { getSession } from "@/lib/auth";
import OnboardingForm from "@/components/onboard/OnboardingForm";

// Post-purchase setup: Stripe's success URL lands here (/onboard/cfo?ws=...&paid=1) while
// the webhook provisions the agent in the background. Renders the SAME questionnaire as the
// free lead form at plain /onboard (components/onboard/OnboardingForm.tsx) — same fields,
// same design — but gated by login + a paid agent type, and submits to /api/agent-setup,
// which is what actually configures and provisions the buyer's live agent.

export const metadata: Metadata = {
  title: "Set up your agent | ApolloClaw",
  robots: { index: false },
};

type Props = {
  params: Promise<{ agent: string }>;
  searchParams: Promise<{ ws?: string; paid?: string }>;
};

export default async function AgentSetupPage({ params, searchParams }: Props) {
  const { agent } = await params;
  const type = getAgentType(agent);
  if (!type || !type.planKey) notFound();

  const { user } = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/onboard/${agent}`)}`);

  const { ws, paid } = await searchParams;

  return (
    <OnboardingForm
      mode="customer"
      agentTypeId={type.id}
      agentLabel={type.label}
      workspaceId={ws}
      justPaid={paid === "1"}
    />
  );
}
