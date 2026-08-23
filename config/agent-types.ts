// The agent-type registry — the single source of truth for what kinds of agents this
// whitelabel can provision. The create modal renders one card per entry; the create route
// validates the requested type against this list (template and budget cap come from here,
// never from the client).
//
// MACHINE SIZE IS NOT HERE. Every instance is built at INSTANCE_RESOURCES (config/agents.ts)
// regardless of type or runtime — the types used to carry a `resources` block each, which is
// how the two live entries ended up asking for different disks for the same $189/mo hosting.

export interface AgentType {
  id: string;
  label: string;
  description: string;
  // Agent37 template name passed to POST /v1/instances.
  template: string;
  // Former names for the SAME template, tried in order when `template` isn't in the Agent37
  // registry. Renaming a template is two systems moving at different times — this repo and
  // the Agent37 account — and a customer who pays during that gap must still get an agent.
  // Once every environment is on the new name, deleting the alias is a one-line cleanup.
  templateAliases?: string[];
  // Monthly managed-spend cap in USD (converted to micros at create time).
  monthlyCapUsd: number;
  // Only available types can be provisioned; the rest render as disabled cards.
  available: boolean;
  comingSoon?: boolean;
  // Lucide icon name (resolved by the UI); omit for a generic fallback.
  icon?: string;
  // Stripe catalog key (lib/pricing/catalog.ts). Present -> the type is PAID: creating it
  // goes through Checkout ($4,500 build + $189/mo hosting) and is provisioned by the
  // Stripe webhook. Absent -> the original entitlement-gated direct create (College Agent).
  planKey?: string;
  // Sold on ANOTHER site: every CTA links here instead of ApolloClaw checkout/create.
  // Payment, intake, and provisioning all happen there (The College Agent).
  externalUrl?: string;
  // Price line shown on storefront cards for external types (paid types use the shared
  // BUNDLE_PRICE_LABEL from lib/pricing/catalog.ts).
  priceLabel?: string;
  // Provisioned by the platform, never chosen from a card. The create-agent modal filters
  // these out entirely rather than showing them disabled, because "you cannot pick this"
  // and "this is not a thing you pick" are different messages.
  internal?: boolean;
  // No onboarding questionnaire. The create flow provisions the box and STOPS there instead
  // of routing into /onboard, and the dashboard never nags it to "finish setup". This is the
  // deliberately-blank, hand-authored build: there is no /onboard/{id} config for it (that URL
  // would 404), so the flag both suppresses that route and the setup nag that links to it.
  noSetup?: boolean;
}

// Shared spend cap for the paid Apollo agents — one cap across the line. The machine they
// run on is INSTANCE_RESOURCES (config/agents.ts), same as every other instance.
//
// The cap MUST match what hosting is sold as including (HOSTING_INCLUDED_TOKENS_LABEL in
// lib/pricing/catalog.ts, "$25/mo of token usage"). It sat at $5 while the paywall promised
// $25, so a customer using their agent normally hit a wall at a fifth of what they had paid
// for, with credit packs the only way past it. Change one of these two and change the other.
const PAID_AGENT = { monthlyCapUsd: 25 };

export const AGENT_TYPES: AgentType[] = [
  {
    // `internal` keeps it out of the create-agent modal. It is a DIFFERENT PRODUCT on a
    // different site, and once the retired per-role types were removed it was the only card
    // left — so an ApolloClaw customer pressing "Create Agent" was offered a college agent
    // and a button off to thecollegeagent.ai. The entry stays because the registry is what
    // resolves `agent_type` on existing rows and what the templates check reads.
    //
    // Sold and provisioned on thecollegeagent.ai; nothing in this app ever creates one. The
    // template name still matters, though: that site
    // provisions from `college-agent` on the SAME Agent37 account we use, so the name has to
    // keep existing there. It does — as its own template alongside `apollo-agent`, both
    // pointing at the same image, after renaming ours broke theirs for exactly as long as it
    // took to notice.
    id: "college",
    label: "The College Agent",
    description:
      "An AI agent that guides a student from sophomore year of high school through college graduation - classes, deadlines, applications, financial aid, and internships.",
    template: "college-agent",
    monthlyCapUsd: 5,
    available: true,
    icon: "GraduationCap",
    internal: true,
    externalUrl: "https://thecollegeagent.ai/build",
    priceLabel: "$599 one-time + hosting",
  },
  // ─── Retired: the eight per-role types ──────────────────────────────────────
  //
  // CEO, CFO, Legal, Medical, Insurance, Real Estate, Sales and Recruiting used to live
  // here, sold at $4,500 each through /agents and the create-agent modal. Both entry points
  // are gone and AGENT_PLANS is empty, so nothing could buy them - but they stayed listed,
  // which meant the modal rendered eight cards that dead-ended at "isn't sold through
  // checkout", and /api/admin/templates reported eight types whose templates don't exist.
  //
  // None of ceo-agent, cfo-agent, legal-agent, medical-agent, insurance-agent,
  // realestate-agent, sales-agent or recruiting-agent was ever registered in Agent37.
  // Restoring one means an entry here, a template there, and a plan in the catalog - three
  // deliberate steps, which is the right number for putting a product back on sale.
  //
  // The license build. Every /onboard purchase provisions this one type; the customization
  // comes from the buyer's onboarding answers (written in as USER.md), not from the SKU.
  //
  // The template is the Apollo Claw build — David's call, so every agent starts from the
  // content and behaviour already proven in production rather than from one of the per-role
  // templates that were never exercised at this volume.
  //
  // It was called `college-agent` (the image it grew out of, still the GHCR path), which the
  // dashboard printed at customers: someone who had bought an Apollo Agent read that they
  // owned a college agent. Renamed to `apollo-agent`; the old name stays as an alias so
  // provisioning works whichever name the Agent37 registry currently carries.
  //
  // No `planKey`: it is not sold per-type through /api/build/checkout. /api/onboard/complete
  // provisions it once the license checkout is confirmed paid. `internal` keeps it out of
  // the create-agent modal, which is for picking a product, and this is not one.
  {
    id: "apollo",
    label: "Apollo Agent",
    description:
      "A private AI agent built around one business - its people, its stack, its bottlenecks - from the answers given at onboarding.",
    // OpenClaw, from the stock image — David's call, and the reason it can be the STOCK one is
    // that nothing about the product lives in the image any more. SOUL.md now comes from
    // config/personas.ts and the other five files are generated from the questionnaire
    // (lib/agent-files.ts), so a plain OpenClaw box plus six files IS the custom agent.
    //
    // What this buys, beyond preference: `apollo-agent` is a Hermes image, and Hermes loads
    // only SOUL/AGENTS/USER/MEMORY — it ignores IDENTITY.md and TOOLS.md entirely. Two of the
    // five files we generate were inert on every agent we have ever shipped, which is why Nova
    // introduces herself as "Hermes, built by Nous Research" rather than by the name her owner
    // chose. Confirmed by reading the running processes on both live instances.
    //
    // It also exposes the Control UI, terminal and file browser (config/agents.ts), which the
    // old template served on remapped ports and so offered none of.
    //
    // The aliases keep the old images provisionable if the registry loses the OpenClaw one — a
    // customer mid-purchase gets a working agent either way, just a Hermes-shaped one.
    template: "agent37-openclaw",
    templateAliases: ["apollo-agent", "college-agent"],
    ...PAID_AGENT,
    available: true,
    internal: true,
    icon: "Bot",
  },
  // The CFO Agent — an off-the-rack finance persona, sold WHITE-GLOVE. Unlike the generic
  // Apollo agent (whatever the questionnaire makes it), this one ships as a role: its
  // persona (config/personas.ts -> `cfo`, applied automatically by personaForAgentType at
  // provision) makes a stock OpenClaw box behave like a fractional CFO out of the box.
  //
  // Sold on /ai-agents/cfo, which is a "Schedule Your Consultation" page — the deal is scoped
  // and priced per engagement, and payment is taken white-glove (a Stripe payment link), so
  // there is deliberately NO `planKey`: it never goes through self-serve checkout. `internal`
  // keeps it out of a customer's create-agent modal; a platform admin still sees it there
  // (CreateAgentModal: `isPlatformAdmin || !internal`), which is how David provisions one for
  // a client after closing. Same stock template and $25 hosting cap as every other agent.
  {
    id: "cfo",
    label: "The CFO Agent",
    description:
      "A fractional CFO agent: budgets and cash-flow forecasts, financial models, board-ready reporting, and fundraising prep - set up for one business, white-glove.",
    template: "agent37-openclaw",
    templateAliases: ["apollo-agent", "college-agent"],
    ...PAID_AGENT,
    available: true,
    internal: true,
    icon: "Wallet",
  },
  // The Law Agent — the CFO Agent's twin for legal work. Same white-glove model: an off-the-rack
  // legal-drafting persona (config/personas.ts -> `legal`, applied by personaForAgentType at
  // provision) on a stock OpenClaw box, plus a legal-specific intake (lib/legalIntake.ts) that the
  // onboarding form adds when the type is `legal`.
  //
  // Sold on /ai-agents/legal (a "Schedule Your Consultation" page) and set up from the unlisted
  // /legal-onboarding link, exactly like the CFO Agent. NO `planKey` (scoped and priced per
  // engagement, paid white-glove), and `internal` so only a platform admin sees the card. Same
  // stock template and $25 hosting cap as every other agent.
  {
    id: "legal",
    label: "The Law Agent",
    description:
      "A legal drafting and review agent: contracts and NDAs, plain-English clause summaries, obligation and renewal tracking, and standard policies - set up for one business, white-glove.",
    template: "agent37-openclaw",
    templateAliases: ["apollo-agent", "college-agent"],
    ...PAID_AGENT,
    available: true,
    internal: true,
    icon: "Scale",
  },
  // The Blank Agent - a stock OpenClaw box and nothing else. No role persona (config/personas.ts
  // has no `blank` key, so provisioning writes no SOUL.md over the image's own) and no
  // questionnaire (`noSetup`). It is the SAME empty box the Apollo Agent starts from, minus the
  // intake that fills it in: personaForAgentType returns undefined and no agent_setup row exists,
  // so injectAfterProvision installs the shared skills and stops, leaving the seven files to be
  // written by hand on the instance. That is the white-glove build David reaches for when the
  // questionnaire is the wrong tool - a client whose setup he types himself.
  //
  // `internal`, so only a platform admin sees the card (CreateAgentModal: isPlatformAdmin ||
  // !internal). Same stock template, $25 cap, and INSTANCE_RESOURCES machine as every other
  // agent - the only thing missing is the customization, which is the whole point.
  {
    id: "blank",
    label: "Blank Agent",
    description:
      "An empty agent with no preset persona and no questionnaire. Provisions a stock box and drops you at the instance to write its files by hand - the white-glove build.",
    template: "agent37-openclaw",
    templateAliases: ["apollo-agent", "college-agent"],
    ...PAID_AGENT,
    available: true,
    internal: true,
    noSetup: true,
    icon: "SquareDashed",
  },
];

export function getAgentType(id: string): AgentType | undefined {
  return AGENT_TYPES.find((t) => t.id === id);
}

// ─── The license build ────────────────────────────────────────────────────────
//
// We sell one thing now: the customization. Every license purchase provisions THIS type,
// and what makes one customer's agent different from another's is their onboarding answers
// (written into the instance as USER.md), not a different SKU.
export const LICENSE_AGENT_TYPE_ID = "apollo";

export function licenseAgentType(): AgentType {
  const type = getAgentType(LICENSE_AGENT_TYPE_ID);
  // Unreachable unless the entry is removed from AGENT_TYPES. Throwing beats provisioning
  // something arbitrary for a customer who has already paid.
  if (!type) throw new Error(`agent type "${LICENSE_AGENT_TYPE_ID}" is missing from AGENT_TYPES`);
  return type;
}
