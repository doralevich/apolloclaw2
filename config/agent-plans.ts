// How many agents a workspace may run, by plan.
//
// Every agent counts: Timmy Turner and the SEO agent living on his instance are two agents,
// whether they share one instance or sit on two. That is how a customer counts them, so the
// limit reads the way they think ("I have 2 of 3").
//
// FLUID ON PURPOSE (David, Oct 4 2026: "it needs to be fluid"). The tiers are this list and
// nothing else: rename one, change a count, or add a fourth here, and every surface that shows
// or enforces the limit follows. A single workspace can also be given its own number from Super
// Admin, for the deal that does not fit a tier.
//
// Set by an admin for now. Self-serve upgrades through Stripe come once every tier is priced;
// until then "Upgrade" is a conversation, and the button says how to start it.
//
// PRICES. These tiers replace today's hosting line ($249/mo per instance, lib/pricing/catalog.ts)
// once they are all priced. Set by David, Oct 4 2026: Basic is $49.99 a month with $10 of AI
// credits included, Medium $99.99 with $20. Large is not priced yet, so it carries null and
// nothing shows a price for it. Recorded here so the number lives beside the count it pays for;
// nothing bills from it until the Stripe products exist.

export interface AgentTier {
  /** Stored against the workspace. Never rename an id that is in use; change the label. */
  id: string;
  label: string;
  /** Agents included, the main one counted. */
  agents: number;
  /** Monthly price in cents, or null while the tier is unpriced. */
  monthlyCents: number | null;
  /** AI credits included each month, in cents, or null while unpriced. */
  includedCreditCents: number | null;
}

export const AGENT_TIERS: readonly AgentTier[] = [
  { id: "basic", label: "Basic", agents: 1, monthlyCents: 4999, includedCreditCents: 1000 },
  { id: "medium", label: "Medium", agents: 3, monthlyCents: 9999, includedCreditCents: 2000 },
  { id: "large", label: "Large", agents: 7, monthlyCents: null, includedCreditCents: null },
];

/** "$49.99/mo with $10 in AI credits", or null for an unpriced tier. */
export function tierPriceLabel(tier: AgentTier): string | null {
  if (tier.monthlyCents === null) return null;
  const dollars = (c: number) => (c % 100 === 0 ? `$${c / 100}` : `$${(c / 100).toFixed(2)}`);
  const credit = tier.includedCreditCents ? ` with ${dollars(tier.includedCreditCents)} in AI credits` : "";
  return `${dollars(tier.monthlyCents)}/mo${credit}`;
}

/** A workspace nobody has set a plan for. */
export const DEFAULT_AGENT_TIER = "basic";

/** Where "Upgrade for more agents" goes until upgrades are self-serve. */
export const AGENT_UPGRADE_HREF = "/dashboard/settings/plan";

export function agentTier(id: string | null | undefined): AgentTier {
  return (
    AGENT_TIERS.find((t) => t.id === id) ??
    AGENT_TIERS.find((t) => t.id === DEFAULT_AGENT_TIER) ??
    AGENT_TIERS[0]
  );
}

/** "1 agent", "3 agents". */
export function agentsLabel(n: number): string {
  return `${n} agent${n === 1 ? "" : "s"}`;
}

/** What the client gets from /api/workspaces/{id}/agent-plan. */
export interface AgentPlanUsage {
  tier: AgentTier;
  /** The tier's count, or the workspace's own number when one was set. */
  limit: number;
  /** True when the limit is a per-workspace number rather than the tier's. */
  custom: boolean;
  /** Every agent across the workspace's instances, the main ones included. */
  used: number;
  canAdd: boolean;
}
