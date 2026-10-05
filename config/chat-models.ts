import type { AgentModel, ModelsResponse } from "@/lib/types";

// Which models a customer is offered in the chat composer.
//
// Agent37's managed gateway exposes hundreds of models, and until now we handed all of them
// to the switcher. A business owner opening that menu got a scrolling wall of vendor slugs —
// research previews, deprecated snapshots, models from providers we have no relationship
// with — and no basis whatsoever for choosing between them. The default was whatever the
// gateway happened to lead with.
//
// David's call: Anthropic and OpenAI only, Claude Sonnet 5.5 as the default (Sept 30, 2026,
// the day it shipped; Sonnet 5 before that). Everything else is filtered out.
//
// Curation happens on the SERVER (app/api/agents/[id]/chat/models/route.ts), not in the
// component. A filter that only exists in the UI is a suggestion — the ids are still on the
// wire and any other caller sees the unfiltered list.

/** The model a new conversation uses unless the customer picks otherwise. The gateway spells
 *  versioned ids with a dot ("anthropic/claude-haiku-4.5"), so this follows suit; the other
 *  spellings are in APPROVED_MODELS below. */
export const DEFAULT_CHAT_MODEL_ID = "anthropic/claude-sonnet-5.5";

/** Where a turn goes if the instance refuses DEFAULT_CHAT_MODEL_ID: the previous default. */
export const FALLBACK_CHAT_MODEL_ID = "anthropic/claude-sonnet-5";

// Every spelling of Sonnet 5.5, and the Sonnet 5 id in the same form to fall back to. The
// gateway's exact id for a model this new is unconfirmed (no instance could be queried when it
// was added), so a turn that names Sonnet 5.5 and is refused retries on Sonnet 5 rather than
// failing - see modelFallbackFor.
const SONNET_55_FALLBACKS: Record<string, string> = {
  "anthropic/claude-sonnet-5.5": FALLBACK_CHAT_MODEL_ID,
  "anthropic/claude-sonnet-5-5": FALLBACK_CHAT_MODEL_ID,
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
  /** Every id form this model is known by, in preference order. The managed gateway uses
   *  vendor-prefixed ids ("anthropic/claude-sonnet-5") while a bring-your-own-key provider
   *  exposes native ones ("claude-sonnet-5"), and the same product catalog has to work in
   *  both modes. */
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
const APPROVED_MODELS: ApprovedModel[] = [
  {
    ids: [DEFAULT_CHAT_MODEL_ID, "anthropic/claude-sonnet-5-5", "claude-sonnet-5-5"],
    label: "Claude Sonnet 5.5",
    displayProvider: "anthropic",
    hint: "Recommended. The best balance of quality, speed and usage for everyday work.",
  },
  // Sonnet 5 is off the menu (David, Oct 5 2026): it stays FALLBACK_CHAT_MODEL_ID for a turn an
  // instance refuses Sonnet 5.5 on, which is a retry, not a choice. Opus 5 is replaced by 5.5
  // the same day; the id spellings follow Sonnet 5.5's, and the gateway's exact one is
  // unconfirmed until a live list has been read.
  {
    ids: ["anthropic/claude-opus-5.5", "anthropic/claude-opus-5-5", "claude-opus-5-5"],
    label: "Claude Opus 5.5",
    displayProvider: "anthropic",
    hint: "The strongest Claude, for the hardest analysis and long, careful drafts.",
    heavy: true,
  },
  {
    ids: ["anthropic/claude-haiku-4.5", "claude-haiku-4-5", "claude-haiku-4-5-20251001"],
    label: "Claude Haiku 4.5",
    displayProvider: "anthropic",
    hint: "Fast and economical. Good for quick, routine turns.",
  },
  { ids: ["openai/gpt-5.6-sol", "gpt-5.6-sol"], label: "GPT-5.6 Sol", displayProvider: "openai", hint: "OpenAI's flagship. Strong all-rounder.", heavy: true },
  { ids: ["openai/gpt-5.6-terra", "gpt-5.6-terra"], label: "GPT-5.6 Terra", displayProvider: "openai", hint: "OpenAI's mid-size model. Quick and capable." },
  { ids: ["openai/gpt-5.6-luna", "gpt-5.6-luna"], label: "GPT-5.6 Luna", displayProvider: "openai", hint: "OpenAI's small model. Fastest and lightest." },
];

// VENDOR FAMILIES, matched by pattern rather than by exact id.
//
// David's call (Oct 5, 2026): offer Google Gemini and xAI Grok alongside Anthropic and OpenAI.
// Those two vendors rename their models often, and no instance could be queried from the
// sandbox the day this shipped, so their ids are not pinned here. Instead, any id the instance
// reports that looks like a Gemini or Grok chat model is offered, labelled from its id
// ("google/gemini-2.5-pro" reads "Gemini 2.5 Pro"). The `exclude` pattern drops the variants
// that are not a chat model or not worth a business owner's menu: previews and experiments,
// image, audio, video and embedding models, and the "lite"/"nano" tiers. Once a real list has
// been seen, pin the good ones as APPROVED_MODELS entries above and this becomes the safety net.
//
// Why the two are still exact-list-first: Anthropic and OpenAI ids are known and the menu
// order and the default depend on them. Families are appended after, in this order.
interface ApprovedFamily {
  match: RegExp;
  exclude: RegExp;
  displayProvider: DisplayProvider;
  hint: (id: string) => string;
  heavy: (id: string) => boolean;
}

const APPROVED_FAMILIES: ApprovedFamily[] = [
  {
    // OpenAI too (Oct 5, 2026): David's instance lists Anthropic and no OpenAI at all, so the
    // three GPT-5.6 ids pinned above are not how its gateway spells them. Until the live list has
    // been read, any OpenAI chat model the gateway reports is offered, minus the variants a
    // business owner's menu is better without: previews, mini/nano tiers, the realtime, audio,
    // image, search, transcription and embedding models, codex, and dated snapshots.
    // GPT-5 and later only: a gateway that still lists the 4-series would otherwise double the
    // menu with models nobody should be picking in late 2026.
    match: /^(openai\/)?gpt-([5-9]|\d{2})/i,
    exclude: /preview|mini|nano|realtime|audio|tts|transcribe|image|embed|search|codex|computer-use|chat-latest|instruct|-\d{4}-\d{2}-\d{2}$|-\d{4}$/i,
    displayProvider: "openai",
    hint: (id) => (/pro/i.test(id) ? "OpenAI's heaviest model, for the hardest problems." : "OpenAI's flagship. Strong all-rounder."),
    heavy: (id) => /pro/i.test(id),
  },
  {
    match: /^(google\/|gemini\/)?gemini-/i,
    exclude: /preview|exp\b|experimental|image|imagen|audio|tts|video|veo|embed|live|lite|nano|robotics|computer-use|-\d{3,}$/i,
    displayProvider: "google",
    hint: (id) => (/pro/i.test(id) ? "Google's strongest. Excellent with very long documents and spreadsheets." : "Google's fast model. Quick and economical."),
    heavy: (id) => /pro|ultra/i.test(id),
  },
  {
    match: /^(xai\/|x-ai\/)?grok-/i,
    exclude: /preview|beta|image|imagen|vision|audio|tts|video|embed|mini|nano|-\d{3,}$/i,
    displayProvider: "xai",
    hint: (id) => (/fast/i.test(id) ? "xAI's fast model. Quick answers with live web knowledge." : "xAI's flagship. Strong reasoning and up-to-the-minute knowledge."),
    heavy: (id) => !/fast/i.test(id),
  },
];

/** "google/gemini-2.5-pro" -> "Gemini 2.5 Pro"; "grok-4-fast-reasoning" -> "Grok 4 Fast Reasoning". */
function labelFromId(id: string): string {
  const bare = id.replace(/^[^/]+\//, "");
  return bare
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => (/^\d/.test(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

function familyFor(id: string): ApprovedFamily | undefined {
  return APPROVED_FAMILIES.find((f) => f.match.test(id) && !f.exclude.test(id));
}

const APPROVED_IDS = new Set(APPROVED_MODELS.flatMap((m) => m.ids));

/** What the customer reads for the product default: the first approved model's label. The
 *  composer shows this when an instance's model list cannot be loaded, so the pill always names
 *  a model rather than vanishing or reading "Default". */
export const DEFAULT_CHAT_MODEL_LABEL = APPROVED_MODELS[0].label;

/** Is this an id we're willing to run? Used to reject a model id posted by a client that
 *  didn't get it from the curated list. */
export function isApprovedChatModelId(id: string): boolean {
  return APPROVED_IDS.has(id) || familyFor(id) !== undefined;
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

  // Then the pattern-matched vendor families, in family order, each vendor's models in the order
  // the instance listed them. An id already placed by the exact list above is not repeated.
  const placed = new Set(data.map((m) => m.id));
  for (const family of APPROVED_FAMILIES) {
    for (const upstream of response.data ?? []) {
      if (placed.has(upstream.id) || familyFor(upstream.id) !== family) continue;
      placed.add(upstream.id);
      data.push({
        ...upstream,
        label: labelFromId(upstream.id),
        display_provider: family.displayProvider,
        is_default: false,
        hint: family.hint(upstream.id),
        heavy: family.heavy(upstream.id),
      });
    }
  }

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
      // by name - "Claude Sonnet 5.5", not a hidden menu or a raw "Agent/37". So offer the
      // Anthropic line we sell as a stable product menu, Sonnet 5.5 first, synthesized rather than
      // read from the instance. A Sonnet 5.5 turn the gateway refuses retries on Sonnet 5
      // (modelFallbackFor, in the chat responses route).
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
