import { VENDOR_LIST } from "@/config/connect-flow";
import { SHORTCUTS_BY_ID, type ChatChip, type ShortcutNeeds } from "@/config/shortcuts";

// What the agent says first, and what it offers, built from the customer's own questionnaire.
//
// WHY THIS EXISTS. Home greets a new owner in the agent's voice with "I already know your business
// from the questionnaire we went through, so let's start a conversation and get right to work."
// One click later, chat showed a random greeting and four chips that were hardcoded identical for
// every customer on the platform: Summarize my emails, What's on my calendar, Summarize a
// document, Draft a response. A CFO, a law firm and a monument retailer all got the same four.
//
// So the product claimed knowledge on one screen and demonstrated none on the next, which is the
// whole distance between a text box and a colleague. The answers were already there: the checklist
// has been built from them for months (config/checklist.ts). Chat simply never read them.
//
// TWO THINGS COME OUT OF HERE, and they are deliberately from one source so they cannot disagree:
//
//   buildOpener  - the line the agent opens with, quoting the customer back to themselves.
//   buildChips   - the row under the composer, picked from what they said is broken.
//
// NOTHING HERE PROMISES A CAPABILITY. That rule belongs to config/greetings.ts and it holds just
// as hard here: an opener that says "I can go through your invoices" is falsifiable by a workspace
// with nothing connected, while "you told me chasing invoices is the worst of it" is a quote and
// is true whatever is connected. The chips handle the capability question separately, by hiding
// the asks that genuinely cannot run yet.

/** An ask needs a capability, not an app. These are the slugs that satisfy each one, taken from
 *  the connect flow's own vendor tables so the two can never drift: if /dashboard/connect starts
 *  offering a third mail provider, this follows without an edit. */
export const CAPABILITY_SLUGS: Record<ShortcutNeeds, string[]> = {
  mail: capabilitySlugs("mail"),
  calendar: capabilitySlugs("calendar"),
};

function capabilitySlugs(key: "mail" | "calendar"): string[] {
  return Array.from(
    new Set(
      VENDOR_LIST.flatMap((v) =>
        v.steps.filter((s) => s.key === key).map((s) => s.slug.toLowerCase())
      )
    )
  );
}

/** True when `connected` (lowercased toolkit slugs) covers what this chip needs. A chip with no
 *  `needs` always passes. */
export function chipIsUsable(chip: ChatChip, connected: Set<string>): boolean {
  if (!chip.needs) return true;
  return CAPABILITY_SLUGS[chip.needs].some((slug) => connected.has(slug));
}

// ── The chip row ────────────────────────────────────────────────────────────────────────────────

/**
 * A short label and an icon for each ask that can appear as a chip.
 *
 * The catalogue in config/shortcuts.ts carries the PROMPT, which is a full careful sentence. A
 * chip is read at a glance while hovering over a text box, so it needs three or four words. That
 * is the only thing stored here: the prompt itself is always looked up by id, so improving the
 * wording of an ask improves it everywhere at once.
 */
const CHIP_FACE: Record<string, { label: string; icon: ChatChip["icon"] }> = {
  triage: { label: "Sort my inbox", icon: "mail" },
  "week-ahead": { label: "What's on this week?", icon: "calendar" },
  "whats-important": { label: "What matters today?", icon: "calendar" },
  "one-thing": { label: "Just one thing today", icon: "calendar" },
  "who-owes": { label: "Who owes me money?", icon: "money" },
  chase: { label: "Chase late invoices", icon: "money" },
  quote: { label: "Write a quote", icon: "money" },
  "proposal-followup": { label: "Proposals with no reply", icon: "money" },
  "gone-quiet": { label: "Who's gone quiet?", icon: "people" },
  followup: { label: "Draft follow-ups", icon: "people" },
  "brief-me": { label: "Brief me before a call", icon: "people" },
  reply: { label: "Reply in my voice", icon: "pen" },
  "say-no": { label: "Turn something down", icon: "pen" },
  post: { label: "Turn work into a post", icon: "pen" },
  "read-contract": { label: "Check a contract", icon: "file" },
  summarise: { label: "Summarize a document", icon: "file" },
  extract: { label: "Pull out the deadlines", icon: "file" },
  supplier: { label: "Compare suppliers", icon: "search" },
  compare: { label: "Compare two quotes", icon: "file" },
  competitor: { label: "What do rivals charge?", icon: "search" },
  weekly: { label: "Send me a weekly summary", icon: "calendar" },
  "how-did-we-do": { label: "How did this month go?", icon: "calendar" },
  remind: { label: "Set a standing reminder", icon: "pen" },
  watch: { label: "Watch for late invoices", icon: "money" },
};

/**
 * What to offer someone who said this part of their business is broken.
 *
 * Same key set as AREA_ITEMS in config/checklist.ts, and for the same reason: these are the exact
 * strings the questionnaire stores in `brokenAreas`. An area with no entry contributes nothing
 * rather than guessing, which is why the generic tail below exists.
 */
const AREA_ASKS: Record<string, string[]> = {
  "Sales / Lead Generation": ["gone-quiet", "followup"],
  "Customer Support / Service": ["reply", "triage"],
  "Operations / Admin": ["whats-important", "remind"],
  "Marketing & Content": ["post"],
  "Invoicing & Finance": ["who-owes", "chase"],
  "Scheduling & Calendar": ["week-ahead", "brief-me"],
  "Hiring & HR": ["reply", "summarise"],
  "Reporting & Analytics": ["weekly", "how-did-we-do"],
  "Order Fulfillment / Shipping": ["watch", "remind"],
  "Email & Inbox": ["triage", "reply"],
  "Team Communication": ["reply", "remind"],
  "Vendor / Supplier Management": ["supplier", "compare"],
  "Project Management": ["remind", "whats-important"],
  "Customer Onboarding": ["remind", "followup"],
  "Contracts & Proposals": ["read-contract", "extract"],
};

/**
 * ASSERTED AT IMPORT, because the failure mode here is silent.
 *
 * An id in the tables above that has no face or no catalogue entry does not throw and does not
 * log: buildChips skips it, the row fills from the generic tail, and the customer gets a slightly
 * worse screen that looks entirely normal. "Vendor / Supplier Management" shipped that way in the
 * first draft of this file - it named `compare`, which is a real shortcut with no chip face, so
 * that area quietly contributed one ask instead of two.
 *
 * The same reasoning as the slug check in config/integration-rail.ts: a table that can only be
 * wrong in a way nobody sees has to be checked by the build instead.
 */
for (const [area, asks] of Object.entries(AREA_ASKS)) {
  for (const id of asks) {
    if (!SHORTCUTS_BY_ID.has(id)) {
      throw new Error(
        `chat-opening: AREA_ASKS["${area}"] names "${id}", which is not in the catalogue in ` +
          `config/shortcuts.ts. Fix the id, or add the ask.`
      );
    }
    if (!CHIP_FACE[id]) {
      throw new Error(
        `chat-opening: AREA_ASKS["${area}"] names "${id}", which has no entry in CHIP_FACE, so it ` +
          `would be dropped silently and that area would fall back to the generic asks. Give it a ` +
          `label and an icon.`
      );
    }
  }
}

/**
 * The tail, in order, so a row is always full.
 *
 * It matters that these are the SAME four the product shipped before this file existed, in the
 * same order: a customer whose questionnaire never reached this database (the white-glove and lead
 * cohort, whose answers post to the CRM instead) should see exactly what they saw yesterday rather
 * than a worse guess.
 */
const GENERIC_ASKS = ["triage", "week-ahead", "summarise", "reply", "whats-important", "who-owes"];

/** How many the row shows. Four, matching what was there: this sits directly under the composer,
 *  and a wall of suggestions there competes with the thing it is encouraging. */
export const CHIP_ROW_SIZE = 4;

function answerList(answers: Record<string, unknown> | null, key: string): string[] {
  if (!answers) return [];
  const v = answers[key];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return typeof v === "string" && v.trim() ? [v] : [];
}

function answerText(answers: Record<string, unknown> | null, key: string): string {
  if (!answers) return "";
  const v = answers[key];
  return typeof v === "string" ? v.trim() : "";
}

/**
 * The candidate chips for one customer, best first.
 *
 * Returns MORE than the row shows, because the caller filters by what is actually connected and
 * the row still has to come out full. Something that needs mail sits in this list; the browser,
 * which is the only place that knows whether mail is connected, is what drops it.
 */
export function buildChips(answers: Record<string, unknown> | null): ChatChip[] {
  const ids: string[] = [];
  for (const area of answerList(answers, "brokenAreas")) {
    for (const id of AREA_ASKS[area] ?? []) ids.push(id);
  }
  ids.push(...GENERIC_ASKS);

  const chips: ChatChip[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    const shortcut = SHORTCUTS_BY_ID.get(id);
    const face = CHIP_FACE[id];
    // A missing face or a renamed id costs one chip, not the row. This runs per request for a
    // paying customer's chat screen, so it degrades rather than throwing the way the static
    // lists in config/shortcuts.ts do at import time.
    if (!shortcut || !face) continue;
    seen.add(id);
    chips.push({ id, label: face.label, icon: face.icon, prompt: shortcut.prompt, needs: shortcut.needs });
  }
  return chips;
}

// ── The opening line ────────────────────────────────────────────────────────────────────────────

export type Opener = {
  /** What the agent says, in its own voice, under the greeting. */
  text: string;
  /** What clicking it puts in the composer. */
  prompt: string;
};

/** Long answers get cut for the line the agent says; the prompt keeps the whole thing, because
 *  that is what the agent actually has to work from. */
const QUOTE_MAX = 120;

function quote(raw: string): string {
  const s = raw.replace(/\s+/g, " ").trim();
  return s.length > QUOTE_MAX ? `${s.slice(0, QUOTE_MAX).trimEnd()}...` : s;
}

/**
 * The line the agent opens with, or null when there is nothing of theirs to say.
 *
 * Null is a real answer and the caller must handle it: the white-glove and lead cohort have no
 * answers in this database at all, and inventing an opener for them would be the agent claiming to
 * remember a conversation that never happened.
 *
 * THE PROMPT IS AN INVITATION TO BE INTERVIEWED, not a request for a deliverable. "Draft my
 * invoice chasers" from a standing start produces a generic draft and a disappointed owner, since
 * the agent has their voice but not their terms, their customers or their cycle. "Ask me whatever
 * you need to know" turns the first exchange into the agent asking questions, which is both a
 * better first answer and the thing the product is actually selling.
 */
export function buildOpener(answers: Record<string, unknown> | null): Opener | null {
  // What they volunteered, in their own words, beats anything picked off a list. Somebody who
  // wrote out the task they hate most has already told you where to start.
  const hated = answerText(answers, "hatedTasks");
  if (hated) {
    return {
      text: `You told me the worst of it is "${quote(hated)}". Want to start there?`,
      prompt: `The thing I most want off my plate is: ${hated}\n\nAsk me whatever you need to know to take it on.`,
    };
  }

  const [area] = answerList(answers, "brokenAreas");
  if (area) {
    const lower = area.toLowerCase();
    return {
      text: `You said ${lower} is where it hurts. Want to start there?`,
      prompt: `Let's start with ${lower}. Ask me whatever you need to know to take it off my plate.`,
    };
  }

  return null;
}
