import AgentPicker from "@/components/onboard/AgentPicker";
import OnboardingForm from "@/components/onboard/OnboardingForm";
import { LICENSE_AGENT_TYPE_ID } from "@/config/agent-types";
import { agentFromParam } from "@/lib/buildFunnel";

// The one done-for-you door. Same questionnaire as /onboard, deliberately with no paywall and
// no login: David hands this link out directly to clients he is building a self-hosted (Mac
// Mini) agent for, or doing custom work for, where the money was settled offline. There is
// nothing to charge here through the standard tiers, so there is nothing to gate.
//
// WHICH AGENT the intake is for is `?agent=`: a role slug ("law", "cfo", "recruiting",
// lib/buildFunnel.ts) adds that role's deep-dive on top of the standard business questions;
// "apollo" or nothing named is the generic intake. With no agent named the page opens on the
// picker, and picking one comes back here with the slug in the URL. This replaced one unlisted
// page per role (/legal-onboarding, /cfo-onboarding, /recruiting-onboarding), which were this
// page three more times with the role hard-coded; those addresses redirect here with the role
// filled in (next.config.ts), so a link already handed out still lands (David, Nov 5 2026).
//
// It is not linked from anywhere on the site and is noindex/nofollow via the layout, so the
// only way in is the URL itself. That is the whole security model, and it is the right one:
// the form collects no credentials and grants no access, it just files a lead.
//
// CLOSING A CUSTOM-PRICED DEAL. Append ?pay=<Stripe Payment Link> to the URL and the finish
// screen ends on "Complete Your Payment" pointing at that link, so a client fills the
// questionnaire and then pays whatever was agreed. Without it, the finish hands off to the
// technical setup form at /setup instead. The picker carries ?pay= through to the form.

// Only a Stripe-hosted payment link is honoured, so a crafted ?pay= can't turn this into an
// open redirect to somewhere hostile.
function safeStripePayUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    const ok = u.protocol === "https:" && (host === "buy.stripe.com" || host === "stripe.com" || host.endsWith(".stripe.com"));
    return ok ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

type Props = { searchParams: Promise<{ agent?: string; pay?: string }> };

export default async function WhiteGloveOnboardingPage({ searchParams }: Props) {
  const { agent, pay } = await searchParams;
  const type = agentFromParam(agent);
  const payUrl = safeStripePayUrl(pay);

  if (!type) {
    return (
      <AgentPicker
        eyebrow="Done-For-You Setup"
        title="Which Agent Are We Setting Up?"
        intro="Pick the role and the intake asks the questions that role needs. We build the agent for you from your answers."
        hrefFor={(slug) => {
          const q = new URLSearchParams({ agent: slug });
          if (payUrl) q.set("pay", payUrl);
          return `/white-glove-onboarding?${q.toString()}`;
        }}
      />
    );
  }

  // The generic intake runs with no role pinned, exactly as this page always has.
  const roleId = type.id === LICENSE_AGENT_TYPE_ID ? undefined : type.id;
  return <OnboardingForm mode="whiteglove" agentTypeId={roleId} payUrl={payUrl} />;
}
