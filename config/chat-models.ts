import type { AgentModel, ModelsResponse } from "@/lib/types";

// Which models a customer is offered in the chat composer.
//
// Agent37's managed gateway exposes hundreds of models, and until now we handed all of them
// to the switcher. A business owner opening that menu got a scrolling wall of vendor slugs —
// research previews, deprecated snapshots, models from providers we have no relationship
// with — and no basis whatsoever for choosing between them. The default was whatever the
// gateway happened to lead with.
//
// David's call: Anthropic and OpenAI only, Claude Sonnet 5 as the default. Everything else
// is filtered out.
//
// Curation happens on the SERVER (app/api/agents/[id]/chat/models/route.ts), not in the
// component. A filter that only exists in the UI is a suggestion — the ids are still on the
// wire and any other caller sees the unfiltered list.

/** The model a new conversation uses unless the customer picks otherwise. */
export const DEFAULT_CHAT_MODEL_ID = "anthropic/claude-sonnet-5";

interface ApprovedModel {
  /** Every id form this model is known by, in preference order. The managed gateway uses
   *  vendor-prefixed ids ("anthropic/claude-sonnet-5") while a bring-your-own-key provider
   *  exposes native ones ("claude-sonnet-5"), and the same product catalog has to work in
   *  both modes. */
  ids: string[];
  /** What the customer reads. Stable regardless of how the gateway spells the id. */
  label: string;
  /** Vendor grouping in the menu. */
  displayProvider: "anthropic" | "openai";
}

// Order matters: this is the order of the menu, and the first entry is the default.
const APPROVED_MODELS: ApprovedModel[] = [
  {
    ids: [DEFAULT_CHAT_MODEL_ID, "claude-sonnet-5"],
    label: "Claude Sonnet 5",
    displayProvider: "anthropic",
  },
  {
    ids: ["anthropic/claude-opus-5", "claude-opus-5"],
    label: "Claude Opus 5",
    displayProvider: "anthropic",
  },
  {
    ids: ["anthropic/claude-haiku-4.5", "claude-haiku-4-5", "claude-haiku-4-5-20251001"],
    label: "Claude Haiku 4.5",
    displayProvider: "anthropic",
  },
  { ids: ["openai/gpt-5.6-sol", "gpt-5.6-sol"], label: "GPT-5.6 Sol", displayProvider: "openai" },
  { ids: ["openai/gpt-5.6-terra", "gpt-5.6-terra"], label: "GPT-5.6 Terra", displayProvider: "openai" },
  { ids: ["openai/gpt-5.6-luna", "gpt-5.6-luna"], label: "GPT-5.6 Luna", displayProvider: "openai" },
];

const APPROVED_IDS = new Set(APPROVED_MODELS.flatMap((m) => m.ids));

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
      },
    ];
  });

  if (data.length === 0) {
    // Router aliases, not models. An instance whose gateway has no vendor models configured
    // reports a single internal alias - "openclaw"/"openclaw/default", or "agent37"/"agent37/
    // default" on the metered gateway - a name for whatever its one configured model happens to
    // be. David saw exactly this: the composer showing "Agent/37" as if it were a model to pick.
    // A menu of internal aliases is not a choice, it is noise wearing a dropdown. Once the
    // gateway exposes the real Anthropic models, the block above matches them and this never runs.
    const aliasOnly = (response.data ?? []).every((m) => /^(openclaw|agent37)([/:].*)?$/i.test(m.id));
    if (aliasOnly) {
      // The instance is on the metered gateway, which reports ONE internal alias rather than the
      // vendor models behind it. David's call: a business owner should still get to pick a model
      // by name - "Claude Sonnet 5", not a hidden menu or a raw "Agent/37". So offer the Anthropic
      // line we sell as a stable product menu, Sonnet 5 first, synthesized rather than read from
      // the instance.
      //
      // The gateway routes the managed models, and the vendor-prefixed id is what it expects on a
      // turn - so enabling the Anthropic models on the gateway is the half that makes a PICK
      // actually RUN. Deploy this only once that is done: a selected model the gateway does not
      // accept would fail the turn. (An unspecified turn still falls to the instance default, so
      // leaving the default selected is no worse than today.)
      console.warn(
        "[chat-models] instance reports only gateway router aliases - offering the Anthropic product menu.",
        "reported:",
        (response.data ?? []).map((m) => m.id).join(", ")
      );
      const synthesized: AgentModel[] = APPROVED_MODELS.filter(
        (m) => m.displayProvider === "anthropic"
      ).map((m, index) => ({
        id: m.ids[0],
        label: m.label,
        owned_by: m.displayProvider,
        display_provider: m.displayProvider,
        is_default: index === 0,
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
