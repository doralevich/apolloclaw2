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
  searchParams: Promise<{ ws?: string; paid?: string; agent?: string }>;
};

export default async function AgentSetupPage({ params, searchParams }: Props) {
  const { agent } = await params;
  const type = getAgentType(agent);
  // Any type this app configures, not just the paid ones. /api/agent-setup enforces the real
  // rule — an agent of this type must already exist in the workspace unless it is a paid type
  // still waiting on its Stripe webhook — so reaching this page can never conjure an agent.
  if (!type || type.externalUrl) notFound();

  const { user } = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/onboard/${agent}`)}`);

  const { ws, paid, agent: agent37Id } = await searchParams;

  // The signed-in account, for the form to skip the contact gate with. The gate's email
  // check refuses addresses that already have an account - correct for strangers on the
  // lead form, absurd for a logged-in customer pressing "Finish setup", whose own address
  // is by definition taken. Name comes from auth metadata the same way the dashboard
  // header resolves it; missing pieces stay empty and the questionnaire never asks.
  const meta = (user.user_metadata ?? {}) as {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    name?: string;
  };
  const full = String(meta.full_name || meta.name || "").trim();
  const signedInUser = user.email
    ? {
        first: meta.first_name || full.split(/\s+/)[0] || "",
        last: meta.last_name || full.split(/\s+/).slice(1).join(" ") || "",
        email: user.email,
      }
    : undefined;

  return (
    <OnboardingForm
      mode="customer"
      agentTypeId={type.id}
      agentLabel={type.label}
      workspaceId={ws}
      agent37Id={agent37Id}
      justPaid={paid === "1"}
      signedInUser={signedInUser}
    />
  );
}
