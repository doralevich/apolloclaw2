import { PLAN_SKUS, type PlanSkuId } from "@/lib/pricing/catalog";

// The plans: what each one includes, and how many agents a workspace on it may run.
//
// Approved by David, Oct 4 2026: Solo $49, Team $99, Executive $199 a month, plus Enterprise as
// "Contact us". Prices come from lib/pricing/catalog.ts (PLAN_SKUS, what Stripe sells), so each
// number lives in one place; everything a plan INCLUDES lives here.
//
// Every agent counts: Timmy Turner and the SEO agent living on his instance are two agents,
// whether they share one instance or sit on two. That is how a customer counts them ("2 of 3").
//
// "Team" is 3 agents for ONE owner login, not several users. Multiple users and roles are an
// Enterprise build. Do not use the old working names (Starter, Pro, Business, Basic, Medium,
// Large) anywhere a customer can see.
//
// EXISTING CUSTOMERS ARE GRANDFATHERED. A workspace with no plan recorded is on the "legacy"
// tier: it keeps the price it pays today ($249, or $189 for the four on the retired line), its
// agents, and the seat flow it already has. Only checkout records a plan, so nothing here can
// reprice anyone by accident (workspace_agent_plans, migration 0033).

export type PlanId = "solo" | "team" | "executive";

export interface AgentTier {
  /** Stored against the workspace. Never rename an id that is in use; change the label. */
  id: PlanId | "legacy";
  label: string;
  /** One line under the name on the pricing card. */
  tagline: string;
  /** Agents included, the main one counted. */
  agents: number;
  /** How the card says it: "1 agent", "3 agents, 1 owner". */
  agentsText: string;
  /** Monthly price in cents; null for the legacy tier, whose price is whatever they pay now. */
  monthlyCents: number | null;
  /** Usage credit included each month, pooled across the plan's agents, in cents. */
  includedCreditCents: number;
  /** Extra agents past the included ones, billed monthly as a quantity; null when not offered. */
  addOn: { sku: PlanSkuId; monthlyCents: number; creditCents: number } | null;
  /** The most agents the plan can hold, add-ons included; null for no hard cap. */
  maxAgents: number | null;
  /** At this many agents, suggest the next plan up (it is cheaper by then). */
  upgradeAt: number | null;
  /** Chat channels the plan can connect (config/channels.ts ids). */
  channels: readonly string[];
  channelsText: string;
  supportText: string;
  /** The one plain phrase about usage the public page may carry. */
  usageText: string;
  /** Short plain-English feature list for the card. */
  features: readonly string[];
  /** The Stripe subscription this plan sells; null for legacy. */
  sku: PlanSkuId | null;
  /** On the pricing page and in checkout. */
  onSale: boolean;
  /** The card the page highlights. */
  featured?: boolean;
}

export const PLANS: readonly AgentTier[] = [
  {
    id: "solo",
    label: "Solo",
    tagline: "One agent working for you, built around your business.",
    agents: 1,
    agentsText: "1 agent",
    monthlyCents: PLAN_SKUS.solo.amountCents,
    // $10 of usage a month, managed like the other plans (David, Oct 4 2026: "remove key support
    // for solo, keep it like the others"). The brief had Solo on the customer's own AI key with no
    // credit; it now runs on managed usage instead.
    includedCreditCents: 1000,
    // Extra agents share the plan's $10. By the third agent ($97) Team is the better buy.
    addOn: { sku: "solo_addon", monthlyCents: PLAN_SKUS.solo_addon.amountCents, creditCents: 0 },
    maxAgents: null,
    upgradeAt: 3,
    channels: ["telegram"],
    channelsText: "Telegram",
    supportText: "Email support",
    usageText: "AI usage included",
    features: ["An agent built around your business", "Hosting and updates included", "Connects to your apps"],
    sku: "solo",
    onSale: true,
  },
  {
    id: "team",
    label: "Team",
    tagline: "A small team of agents, each with its own job.",
    agents: 3,
    agentsText: "3 agents, 1 owner",
    monthlyCents: PLAN_SKUS.team.amountCents,
    includedCreditCents: 2500,
    addOn: { sku: "team_addon", monthlyCents: PLAN_SKUS.team_addon.amountCents, creditCents: 500 },
    maxAgents: null,
    upgradeAt: 6,
    channels: ["telegram", "slack"],
    channelsText: "Telegram and Slack",
    supportText: "Email support",
    usageText: "AI usage included",
    features: [
      "Three agents built around your business",
      "Agents that hand work to each other",
      "Hosting and updates included",
      "Connects to your apps",
    ],
    sku: "team",
    onSale: true,
    featured: true,
  },
  {
    id: "executive",
    label: "Executive",
    tagline: "A full bench of agents running your operation.",
    agents: 10,
    agentsText: "10 agents",
    monthlyCents: PLAN_SKUS.executive.amountCents,
    includedCreditCents: 6000,
    addOn: null,
    maxAgents: 10,
    upgradeAt: null,
    channels: ["telegram", "slack", "whatsapp"],
    channelsText: "Telegram, Slack and WhatsApp",
    supportText: "Priority email support",
    usageText: "AI usage included",
    features: [
      "Ten agents built around your business",
      "Agents that hand work to each other",
      "Hosting and updates included",
      "Connects to your apps",
    ],
    sku: "executive",
    onSale: true,
  },
];

/** A customer from before the plans: their own price, their own agents, untouched. */
export const LEGACY_TIER: AgentTier = {
  id: "legacy",
  label: "Your current plan",
  tagline: "",
  agents: 1,
  agentsText: "",
  monthlyCents: null,
  includedCreditCents: 0,
  addOn: null,
  maxAgents: null,
  upgradeAt: null,
  channels: ["telegram", "slack", "whatsapp"],
  channelsText: "",
  supportText: "",
  usageText: "",
  features: [],
  sku: null,
  onSale: false,
};

/** The plans a customer can buy today, in page order. */
export const PLANS_ON_SALE: readonly AgentTier[] = PLANS.filter((p) => p.onSale);

/** The entry plan on sale, for "plans start at" lines across the site. */
const ENTRY_PLAN = PLANS_ON_SALE.reduce((a, b) => ((b.monthlyCents ?? Infinity) < (a.monthlyCents ?? Infinity) ? b : a));

/** "$49": the lowest monthly price on sale. */
export const STARTING_PRICE = `$${((ENTRY_PLAN.monthlyCents ?? 0) / 100).toLocaleString("en-US")}`;

/** The one answer to "how much does it cost" anywhere outside /pricing: the FAQs, and the
 *  industry and agent pages. Built from the plans so it can never quote a retired price. */
export const PRICING_FAQ_ANSWER = `Plans start at ${STARTING_PRICE} a month for ${agentsLabel(ENTRY_PLAN.agents)}, with no setup fee and no minimum term, and every agent is set up around your business. Every plan is on our pricing page. For a custom build, book a call.`;

/** Every tier Super Admin can put a workspace on: the plans, and back to legacy. */
export const AGENT_TIERS: readonly AgentTier[] = [LEGACY_TIER, ...PLANS];

/** Enterprise: never a published price, except the one "starting at". */
export const ENTERPRISE = {
  label: "Enterprise",
  headline: "Custom corporate builds. Contact us.",
  privateServersFrom: "$6,500",
} as const;

/** Where "Upgrade for more agents" goes. */
export const AGENT_UPGRADE_HREF = "/dashboard/settings/plan";

export function agentTier(id: string | null | undefined): AgentTier {
  return AGENT_TIERS.find((t) => t.id === id) ?? LEGACY_TIER;
}

export function isPlanId(id: unknown): id is PlanId {
  return PLANS.some((p) => p.id === id);
}

/** "$99". Whole dollars, as the plans are priced. */
export function dollars(cents: number): string {
  return cents % 100 === 0 ? `$${(cents / 100).toLocaleString("en-US")}` : `$${(cents / 100).toFixed(2)}`;
}

/** "1 agent", "3 agents". */
export function agentsLabel(n: number): string {
  return `${n} agent${n === 1 ? "" : "s"}`;
}

/** What the client gets from /api/workspaces/{id}/agent-plan. */
export interface AgentPlanUsage {
  tier: AgentTier;
  /** The agents the workspace may run: the plan's, plus add-ons, or its own custom number. */
  limit: number;
  /** True when the limit is a per-workspace number rather than the tier's. */
  custom: boolean;
  /** Every agent across the workspace's instances, the main ones included. */
  used: number;
  /** Room on the plan as it stands: adding an agent costs nothing more. */
  canAdd: boolean;
  /** Full, but the plan sells one more agent at this monthly price (cents); null when it does not. */
  addOnCents: number | null;
  /** The plan suggests moving up at this size (Team at 6 agents). */
  suggestUpgrade: boolean;
}
