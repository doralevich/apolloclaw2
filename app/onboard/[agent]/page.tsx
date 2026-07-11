import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAgentType } from "@/config/agent-types";
import { getSession } from "@/lib/auth";
import { AgentSetupForm } from "@/components/AgentSetupForm";

// Post-purchase setup: Stripe's success URL lands here (/onboard/cfo?ws=...&paid=1) while
// the webhook provisions the agent in the background — the questionnaire is what the buyer
// does while their agent boots. The deep sales questionnaire at plain /onboard is a
// different, untouched flow.

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
    <AgentSetupForm
      agentTypeId={type.id}
      agentLabel={type.label}
      workspaceId={ws}
      justPaid={paid === "1"}
    />
  );
}
