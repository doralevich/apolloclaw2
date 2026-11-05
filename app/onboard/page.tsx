import AgentPicker from "@/components/onboard/AgentPicker";
import OnboardingForm from "@/components/onboard/OnboardingForm";
import { LICENSE_AGENT_TYPE_ID } from "@/config/agent-types";
import { agentFromParam } from "@/lib/buildFunnel";

// The one paid door: "Start Here" (lead capture) -> paywall -> Stripe -> the business
// questionnaire -> build. No login anywhere in it; the account is created from the completed
// Stripe checkout by the webhook, not before.
//
// WHICH AGENT it builds is `?agent=`: a role slug ("law", "real-estate", lib/buildFunnel.ts) pins
// the role, with that role's deep-dive in the questionnaire and its brand on the first screen;
// "apollo" or nothing named is the generic Apollo Agent. With no agent named the page opens on
// the picker, and picking one comes back here with the slug in the URL.
//
// This used to be three doors doing the same thing: plain /onboard for the Apollo Agent,
// /build/<slug> for each role and /agent-build/apollo, with /agent-invite/<type> beside them as
// a passcode-gated way to build a role agent for free. All of them now land here (redirects in
// next.config.ts); a free build is a promotion code at the paywall (David, Nov 5 2026).
//
// The identical questionnaire also powers /white-glove-onboarding (same thing with no paywall)
// and the post-checkout setup at /onboard/[agent]. See components/onboard/OnboardingForm.tsx.
//
// A server component purely so `?paid=1` is read here rather than from `window` in the
// client. Stripe's success URL comes back to this page, and reading the flag on the server
// means the first client render already knows to resume at the questionnaire, with no flash of
// "Start Here" before it corrects itself. The checkout route puts `agent` back on that URL
// too, so the resumed questionnaire is the right one.
type Props = {
  searchParams: Promise<{ agent?: string; paid?: string; session_id?: string; [key: string]: string | string[] | undefined }>;
};

export default async function OnboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const { agent, paid, session_id } = params;
  const type = agentFromParam(agent);
  const justPaid = paid === "1";

  if (!type && !justPaid) {
    // Keep whatever else the link carried (a ?plan= from the mailer, a ?checkout=cancelled),
    // so picking an agent loses nothing the visitor arrived with.
    const rest = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "agent" || typeof value !== "string") continue;
      rest.set(key, value);
    }
    return (
      <AgentPicker
        eyebrow="Build Your Agent"
        title="Which Agent Are We Building?"
        intro="Pick the role and we will walk you through the setup. Every agent runs on the same platform, so you can add another from your dashboard later."
        hrefFor={(slug) => {
          const q = new URLSearchParams(rest);
          q.set("agent", slug);
          return `/onboard?${q.toString()}`;
        }}
      />
    );
  }

  // The generic Apollo Agent runs the questionnaire with no role pinned, exactly as plain
  // /onboard always has; a role carries its id and label so the form adds that role's deep-dive.
  const role = type && type.id !== LICENSE_AGENT_TYPE_ID ? type : undefined;
  return (
    <OnboardingForm
      mode="lead"
      agentTypeId={role?.id}
      agentLabel={role?.label}
      justPaid={justPaid}
      sessionId={session_id}
    />
  );
}
