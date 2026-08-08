// What to actually say to your agent.
//
// The hardest moment in this product is the one right after the build finishes. The customer
// has paid, the agent knows their business, and they are looking at a text box with no idea
// what to type. "Start chatting" is not an instruction — it is the absence of one. Almost
// everyone opens with "hi" and then something a search engine could have answered, decides
// it's a chatbot, and doesn't come back.
//
// So this file is the answer to "now what?", at two depths from one source:
//
//   FIRST_MOVES  — six things to try today, on Start Here.
//   SHORTCUT_GROUPS — the full catalogue, on /dashboard/guide.
//
// Both live here because they are the same content and would otherwise drift: the Start Here
// list is drawn FROM the catalogue by id, so an example can never be improved in one place and
// left stale in the other.
//
// Every example is written to be copied and sent as-is. That is the point — a customer who has
// to compose their own first prompt is back where they started. Where a name or company would
// make it land better, `{agent}` and `{company}` are substituted at render time.

export interface Shortcut {
  id: string;
  /** The line the customer sends. Substituted and copyable. */
  prompt: string;
  /** What it does, in one line. Written to answer "why would I ask that?" */
  detail: string;
}

export interface ShortcutGroup {
  id: string;
  title: string;
  /** Why this group of asks is worth the customer's attention. */
  blurb: string;
  shortcuts: Shortcut[];
}

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    id: "today",
    title: "Getting through today",
    blurb: "Start here most mornings. One question, and you know where you stand.",
    shortcuts: [
      {
        id: "whats-important",
        prompt: "What should I be focused on today?",
        detail: "Weighs what you told us matters against what's actually in front of you.",
      },
      {
        id: "triage",
        prompt: "Go through my inbox and tell me what actually needs me.",
        detail: "Separates the three that need you from the forty that don't. Needs email connected.",
      },
      {
        id: "one-thing",
        prompt: "If I only get one thing done today, what should it be?",
        detail: "Forces a single answer instead of a list. Useful on the bad days.",
      },
      {
        id: "week-ahead",
        prompt: "What does the rest of my week look like?",
        detail: "Compresses five days into something you can read in ten seconds.",
      },
    ],
  },
  {
    id: "money-in",
    title: "Getting paid",
    blurb: "The work most owners put off, and the work that costs the most to put off.",
    shortcuts: [
      {
        id: "who-owes",
        prompt: "Who owes us money right now, and how overdue is each one?",
        detail: "The list you keep meaning to pull together.",
      },
      {
        id: "chase",
        prompt: "Draft a polite chase for every invoice more than 30 days overdue.",
        detail: "Firm without being rude, in your voice. You approve before anything sends.",
      },
      {
        id: "quote",
        prompt: "Write a quote for [customer] for [work]. Match how we normally price this.",
        detail: "The thing that takes you an afternoon and the agent ten seconds to draft.",
      },
      {
        id: "proposal-followup",
        prompt: "Which proposals have I sent that nobody has replied to?",
        detail: "Silent proposals are the most common leak in a small business.",
      },
    ],
  },
  {
    id: "customers",
    title: "Customers and pipeline",
    blurb: "Keeping hold of the people who already said yes.",
    shortcuts: [
      {
        id: "gone-quiet",
        prompt: "Which customers have gone quiet in the last few months?",
        detail: "Cheaper to bring one of these back than to find someone new.",
      },
      {
        id: "followup",
        prompt: "Draft a follow-up to everyone I met last week.",
        detail: "The good intention that normally dies by Wednesday.",
      },
      {
        id: "brief-me",
        prompt: "I have a call with [name] in an hour. Brief me.",
        detail: "History, last conversation, anything outstanding - before you dial.",
      },
      {
        id: "log-it",
        prompt: "Log this in the CRM: [what happened on the call].",
        detail: "Notes in the system without you opening the system.",
      },
    ],
  },
  {
    id: "voice",
    title: "Writing as you",
    blurb:
      "{agent} has your tone, the words you like, and the ones you can't stand - you gave them at setup.",
    shortcuts: [
      {
        id: "reply",
        prompt: "Reply to this the way I would: [paste the email].",
        detail: "Your voice, not a template's.",
      },
      {
        id: "say-no",
        prompt: "Help me turn this down without burning the relationship.",
        detail: "Saying no gracefully is a genuine skill and this does it well.",
      },
      {
        id: "shorten",
        prompt: "Cut this in half without losing anything that matters: [paste].",
        detail: "Most business writing is twice as long as it needs to be.",
      },
      {
        id: "post",
        prompt: "Turn what we just did for [customer] into a post that sounds like me.",
        detail: "Marketing from work you already did.",
      },
    ],
  },
  {
    id: "documents",
    title: "Documents and paperwork",
    blurb: "Drag a file into the chat and ask about it. That's the whole workflow.",
    shortcuts: [
      {
        id: "read-contract",
        prompt: "Read this contract and tell me what I should be worried about.",
        detail: "Not legal advice - but it will find the clause you'd have skimmed past.",
      },
      {
        id: "summarise",
        prompt: "Give me the three things that matter in this document.",
        detail: "For the forty-page PDF you were never going to read.",
      },
      {
        id: "compare",
        prompt: "Compare these two quotes and tell me which is actually better value.",
        detail: "Like-for-like, including the parts written to be hard to compare.",
      },
      {
        id: "extract",
        prompt: "Pull every date and deadline out of this and list them.",
        detail: "Turns a document into a plan.",
      },
    ],
  },
  {
    id: "research",
    title: "Finding things out",
    blurb: "Live web access, so this is today's answer rather than last year's.",
    shortcuts: [
      {
        id: "competitor",
        prompt: "What are my competitors charging for this, and how do they describe it?",
        detail: "The pricing research nobody has time for.",
      },
      {
        id: "prospect",
        prompt: "Tell me everything useful about [company] before I meet them.",
        detail: "Fifteen minutes of tab-juggling, done while you get a coffee.",
      },
      {
        id: "supplier",
        prompt: "Find me three suppliers for [thing] and compare them.",
        detail: "Shortlist with reasons, not a list of links.",
      },
    ],
  },
  {
    id: "looking-back",
    title: "Knowing how it's going",
    blurb: "The reporting you'd do if you had a spare afternoon every week.",
    shortcuts: [
      {
        id: "weekly",
        prompt: "Every Friday at 4, send me a summary of the week.",
        detail: "Set once. It keeps arriving.",
      },
      {
        id: "how-did-we-do",
        prompt: "How did this month compare with last month?",
        detail: "The question you ask when something feels off but you can't say what.",
      },
      {
        id: "where-time-went",
        prompt: "Where did my time actually go last week?",
        detail: "Usually uncomfortable, usually useful.",
      },
    ],
  },
  {
    id: "standing-orders",
    title: "Things that keep happening",
    blurb:
      "Say it once and it sticks. This is where an agent stops being a chatbot and starts being staff.",
    shortcuts: [
      {
        id: "remind",
        prompt: "Remind me to follow up with anyone who hasn't replied in three days.",
        detail: "A rule, not a reminder - it keeps applying to new people.",
      },
      {
        id: "watch",
        prompt: "Tell me whenever an invoice goes past 30 days.",
        detail: "You stop having to remember to check.",
      },
      {
        id: "correct",
        prompt: "That's not quite how I'd say it - I'd have said [this]. Remember that.",
        detail: "Correct it once and it holds. This is how it gets to sound like you.",
      },
    ],
  },
];

/** The six shown on Start Here — chosen as the fastest route to "oh, it actually knows me". */
const FIRST_MOVE_IDS = ["whats-important", "brief-me", "triage", "read-contract", "chase", "correct"];

export const FIRST_MOVES: Shortcut[] = FIRST_MOVE_IDS.map((id) => {
  const found = SHORTCUT_GROUPS.flatMap((g) => g.shortcuts).find((s) => s.id === id);
  // Unreachable unless an id above is renamed without updating this list. Throwing at import
  // beats rendering a Start Here page with gaps in it.
  if (!found) throw new Error(`FIRST_MOVE_IDS names a shortcut that doesn't exist: ${id}`);
  return found;
});

// The four chips under the chat composer.
//
// Same content again, drawn from the same catalogue — but these carry a SHORT LABEL as well as
// the prompt, because a chip is read at a glance while hovering over a text box. "Summarize my
// emails" is four words on a button; the prompt it sends is the full, careful sentence from
// above, which is the one the agent actually needs.
//
// Four, and no more. This sits directly under the composer, and a wall of suggestions there
// competes with the thing it is meant to be encouraging.
export interface ChatChip {
  id: string;
  label: string;
  prompt: string;
  /** Lucide icon name, resolved in ChatView. Kept as a string so this file stays free of JSX. */
  icon: "mail" | "calendar" | "file" | "pen";
}

const CHAT_CHIP_LABELS: Array<[string, string, ChatChip["icon"]]> = [
  ["triage", "Summarize my emails", "mail"],
  ["week-ahead", "What's on my calendar?", "calendar"],
  ["summarise", "Find recent documents", "file"],
  ["reply", "Draft a response", "pen"],
];

export const CHAT_CHIPS: ChatChip[] = CHAT_CHIP_LABELS.map(([id, label, icon]) => {
  const found = SHORTCUT_GROUPS.flatMap((g) => g.shortcuts).find((s) => s.id === id);
  // Same reasoning as FIRST_MOVES: throwing at import beats a chat page with a blank chip on it.
  if (!found) throw new Error(`CHAT_CHIP_LABELS names a shortcut that doesn't exist: ${id}`);
  return { id, label, prompt: found.prompt, icon };
});

/** Swap `{agent}` and `{company}` for the real thing. Falls back to wording that still reads
 *  as a sentence when we don't know the company — "your business" beats an empty gap. */
export function fillShortcut(text: string, agentName: string, companyName?: string): string {
  return text.replace(/\{agent\}/g, agentName).replace(/\{company\}/g, companyName || "your business");
}
