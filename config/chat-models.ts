import type { AgentModel, ModelsResponse } from "@/lib/types";

// Which models a customer is offered in the chat composer.
//
// Agent37's managed gateway exposes hundreds of models (376 on David's instance, Oct 5 2026),
// and until now we handed all of them to the switcher. A business owner opening that menu got
// a scrolling wall of vendor slugs — research previews, deprecated snapshots, models from
// providers we have no relationship with — and no basis whatsoever for choosing between them.
//
// David's call: Anthropic, OpenAI, Google and xAI, Claude Sonnet 5.5 as the default (Oct 5,
// 2026; Anthropic and OpenAI only before that, Sonnet 5 the default before Sept 30). Everything
// else is filtered out.
//
// THE IDS ARE THE INSTANCE'S OWN. The managed gateway is an OpenClaw provider named "agent37",
// so every model it lists is spelled "agent37/<vendor>/<model>": "agent37/anthropic/
// claude-sonnet-5.5", "agent37/openai/gpt-6.1-sol". Read off David's instance on Oct 5, 2026
// (/api/admin/agents/{id}/models). Before that the catalog carried the bare vendor spellings,
// nothing matched, and the menu he saw was the synthesized fallback at the bottom of this file.
// The bare spellings stay as later entries in each id list for a bring-your-own-key provider
// that exposes native ids.
//
// Curation happens on the SERVER (app/api/agents/[id]/chat/models/route.ts), not in the
// component. A filter that only exists in the UI is a suggestion — the ids are still on the
// wire and any other caller sees the unfiltered list.

/** The model a new conversation uses unless the customer picks otherwise. */
export const DEFAULT_CHAT_MODEL_ID = "agent37/anthropic/claude-sonnet-5.5";

/** Where a turn goes if the instance refuses DEFAULT_CHAT_MODEL_ID: the previous default. Off
 *  the menu since Oct 5, 2026; a retry, not a choice. */
export const FALLBACK_CHAT_MODEL_ID = "agent37/anthropic/claude-sonnet-5";

// Every spelling of Sonnet 5.5, and the Sonnet 5 id in the same form to fall back to - see
// modelFallbackFor.
const SONNET_55_FALLBACKS: Record<string, string> = {
  "agent37/anthropic/claude-sonnet-5.5": FALLBACK_CHAT_MODEL_ID,
  "anthropic/claude-sonnet-5.5": "anthropic/claude-sonnet-5",
  "anthropic/claude-sonnet-5-5": "anthropic/claude-sonnet-5",
  "claude-sonnet-5-5": "claude-sonnet-5",
};

/** The model to retry on when an instance refuses this one, or null if there is none. */
export function modelFallbackFor(id: string | null | undefined): string | null {
  return (id && SONNET_55_FALLBACKS[id]) || null;
}

/** Does this upstream body say the named model was refused? Looser than the metered gateway's
 *  own "Invalid model. Use openclaw" check in lib/channels/turn.ts, because a gateway that does
 *  route vendor models words an unknown id its own way. Both words must appear, so ordinary
 *  reply text is very unlikely to trip it on an error response. */
export function looksLikeModelRejection(text: string): boolean {
  return /model/i.test(text) && /(invalid|unknown|not found|unsupported|not available|does not exist|no such|not allowed)/i.test(text);
}

interface ApprovedModel {
  /** Every id form this model is known by, in preference order: the managed gateway's
   *  "agent37/<vendor>/<model>" first, then the bare vendor spelling, then a bring-your-own-key
   *  provider's native id. The same product catalog has to work in every mode. */
  ids: string[];
  /** What the customer reads. Stable regardless of how the gateway spells the id. */
  label: string;
  /** Vendor grouping in the menu. */
  displayProvider: DisplayProvider;
  /** One line under the name, so a business owner knows what the model is for. */
  hint: string;
  /** Spends the included monthly usage noticeably faster than the default. Shown as a tag. */
  heavy?: boolean;
}

export type DisplayProvider = "anthropic" | "openai" | "google" | "xai";

// Order matters: this is the order of the menu, and the first entry is the default.
//
// One current model per line, no previews, no "lite"/"mini"/"nano" tiers, no ":batch"
// variants (those are offline pricing, not a chat choice), no dated snapshots. The gateway
// also lists "agent37/~<vendor>/<line>-latest" aliases; the exact versions are pinned instead
// so the menu says which model a customer is on and a vendor's silent upgrade is a decision
// made here, not on their side.
const APPROVED_MODELS: ApprovedModel[] = [
  {
    ids: [DEFAULT_CHAT_MODEL_ID, "anthropic/claude-sonnet-5.5", "anthropic/claude-sonnet-5-5", "claude-sonnet-5-5"],
    label: "Claude Sonnet 5.5",
    displayProvider: "anthropic",
    hint: "Recommended. The best balance of quality, speed and usage for everyday work.",
  },
  {
    ids: ["agent37/anthropic/claude-opus-5.5", "anthropic/claude-opus-5.5", "anthropic/claude-opus-5-5", "claude-opus-5-5"],
    label: "Claude Opus 5.5",
    displayProvider: "anthropic",
    hint: "The strongest Claude, for the hardest analysis and long, careful drafts.",
    heavy: true,
  },
  // Haiku 5.5 replaced 4.5 the day it shipped (David, Oct 9 2026). Only ids the instance reports
  // are offered, so the Haiku line is absent from the menu until the managed gateway lists the
  // 5.5 id; 4.5 is deliberately not kept as a stand-in under the 5.5 label.
  {
    ids: ["agent37/anthropic/claude-haiku-5.5", "anthropic/claude-haiku-5.5", "anthropic/claude-haiku-5-5", "claude-haiku-5-5"],
    label: "Claude Haiku 5.5",
    displayProvider: "anthropic",
    hint: "Fast and economical. Good for quick, routine turns.",
  },
  // OpenAI ships four lines (the gateway's own aliases: sol, luna, terra, astra). The newest of
  // each line that is current as of Oct 5, 2026; Terra's newest is a generation behind and is
  // left off. The line descriptions are our reading of OpenAI's naming, not their words.
  {
    ids: ["agent37/openai/gpt-6.1-sol", "openai/gpt-6.1-sol", "gpt-6.1-sol"],
    label: "GPT-6.1 Sol",
    displayProvider: "openai",
    hint: "OpenAI's flagship line. Strong all-rounder.",
    heavy: true,
  },
  {
    ids: ["agent37/openai/gpt-6-astra", "openai/gpt-6-astra", "gpt-6-astra"],
    label: "GPT-6 Astra",
    displayProvider: "openai",
    hint: "OpenAI's Astra line, the newest of the GPT-6 generation.",
  },
  {
    ids: ["agent37/openai/gpt-6-luna", "openai/gpt-6-luna", "gpt-6-luna"],
    label: "GPT-6 Luna",
    displayProvider: "openai",
    hint: "OpenAI's lighter line. Fast and economical.",
  },
  // Google: the newest Flash, and the one Pro that is not a preview.
  {
    ids: ["agent37/google/gemini-3.8-flash", "google/gemini-3.8-flash", "gemini-3.8-flash"],
    label: "Gemini 3.8 Flash",
    displayProvider: "google",
    hint: "Google's fast model. Quick and economical.",
  },
  {
    ids: ["agent37/google/gemini-2.5-pro", "google/gemini-2.5-pro", "gemini-2.5-pro"],
    label: "Gemini 2.5 Pro",
    displayProvider: "google",
    hint: "Google's strongest. Excellent with very long documents and spreadsheets.",
    heavy: true,
  },
  // xAI: the newest Grok.
  {
    ids: ["agent37/x-ai/grok-4.7", "x-ai/grok-4.7", "xai/grok-4.7", "grok-4.7"],
    label: "Grok 4.7",
    displayProvider: "xai",
    hint: "xAI's flagship. Strong reasoning and up-to-the-minute knowledge.",
    heavy: true,
  },
];

const APPROVED_IDS = new Set(APPROVED_MODELS.flatMap((m) => m.ids));

/** What the customer reads for the product default: the first approved model's label. The
 *  composer shows this when an instance's model list cannot be loaded, so the pill always names
 *  a model rather than vanishing or reading "Default". */
export const DEFAULT_CHAT_MODEL_LABEL = APPROVED_MODELS[0].label;

/** Is this an id we're willing to run? Used to reject a model id posted by a client that
 *  didn't get it from the curated list. */
export function isApprovedChatModelId(id: string): boolean {
  return APPROVED_IDS.has(id);
}

/**
 * Cut the gateway's list down to the product's list.
 *
 * Only models the live instance ACTUALLY reports survive — this catalog says what we're
 * willing to offer, the instance says what it can run, and offering a customer a model that
 * then fails on send is worse than not offering it.
 *
 * If the intersection is empty the raw response is returned untouched. That is the important
 * escape hatch: an instance on a build whose ids we don't recognise would otherwise show a
 * switcher with nothing in it, which reads as broken. A too-long menu is a worse experience
 * than a short one; an empty menu is a bug.
 */
export function curateModelsResponse(response: ModelsResponse): ModelsResponse {
  const available = new Map((response.data ?? []).map((m) => [m.id, m]));

  const data: AgentModel[] = APPROVED_MODELS.flatMap((approved, index) => {
    const upstream = approved.ids.map((id) => available.get(id)).find(Boolean);
    if (!upstream) return [];
    return [
      {
        ...upstream,
        label: approved.label,
        display_provider: approved.displayProvider,
        is_default: index === 0,
        hint: approved.hint,
        heavy: approved.heavy ?? false,
      },
    ];
  });

  if (data.length === 0) {
    // Router aliases, not models. An instance whose gateway has no vendor models configured
    // reports a single internal alias - "openclaw"/"openclaw/default", or "agent37"/"agent37/
    // default" on the metered gateway - a name for whatever its one configured model happens to
    // be. David saw exactly this: the composer showing "Agent/37" as if it were a model to pick.
    // A menu of internal aliases is not a choice, it is noise wearing a dropdown.
    //
    // The same branch also catches a managed-gateway list whose spellings have moved on from the
    // ids pinned above (every id there starts with "agent37/"): the Anthropic line is offered
    // under the ids we know, and a pick the gateway refuses is reported on the turn.
    const aliasOnly = (response.data ?? []).every((m) => /^(openclaw|agent37)([/:].*)?$/i.test(m.id));
    if (aliasOnly) {
      console.warn(
        "[chat-models] no pinned id matched this instance - offering the Anthropic product menu.",
        "reported:",
        (response.data ?? []).slice(0, 10).map((m) => m.id).join(", ")
      );
      const synthesized: AgentModel[] = APPROVED_MODELS.filter(
        (m) => m.displayProvider === "anthropic"
      ).map((m, index) => ({
        id: m.ids[0],
        label: m.label,
        owned_by: m.displayProvider,
        display_provider: m.displayProvider,
        is_default: index === 0,
        hint: m.hint,
        heavy: m.heavy ?? false,
      }));
      return {
        default_model: synthesized[0]?.id ?? response.default_model,
        default_provider: "anthropic",
        data: synthesized,
      };
    }
    // Real ids we simply do not recognise (an instance on a newer build): the raw list is
    // still a genuine choice, so offering it beats an empty menu that reads as broken.
    console.warn(
      "[chat-models] no approved model matched this instance - falling back to the full list.",
      "reported:",
      (response.data ?? []).slice(0, 10).map((m) => m.id).join(", ")
    );
    return response;
  }

  const defaultModel = data[0].id;
  const selected = data[0];
  return {
    default_model: defaultModel,
    default_provider: selected.owned_by ?? selected.provider ?? response.default_provider,
    data,
  };
}
