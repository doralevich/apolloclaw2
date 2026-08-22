// The setup checklist, built per customer from what they told us at intake.
//
// A generic list would have to guess. This does not have to: the questionnaire already asked
// which parts of the business are broken — and the answers are stored as agent_setup.answers for
// every paying licence customer. So the list can name the work they said hurts and leave out the
// rest.
//
// That is also what keeps it short. A twelve-item list somebody can finish beats a twenty-seven
// item list nobody starts, and the fastest way to twelve is to only show what applies.
//
// WHAT IS NOT HERE ANY MORE: the "Connect your tools" app cards (Gmail, Outlook, Drive, OneDrive
// and the customer's own named stack). Those duplicated the Connections page, which already lists
// every app with the same Connect/Manage state — David's call to take them off the checklist and
// leave app-connecting to the one page built for it. The checklist now carries only the work the
// customer hands over; where the agent answers you (channels) and when it runs (the schedule) are
// rendered by ChecklistView from their own panels, not from this list.

/** What to draw in the row's tile. A real product logo where one exists, a lucide name otherwise.
 *  The `logo` variant is still used by the summary/channel tiles that share this type. */
export type ChecklistIcon = { kind: "logo"; src: string } | { kind: "icon"; name: string };

// "Start using it" is gone, and with it the "Ask it something real" row. Opening chat is not a
// setup step you tick off — it is the thing the setup was for — so it is a button on the page
// rather than the last item on a list somebody has to finish first.
export type ChecklistCategory = "Hand it your work";

export type ChecklistItem = {
  /** Stable id. Stored in agent_checklist_items when the item is self-reported. */
  id: string;
  title: string;
  body: string;
  category: ChecklistCategory;
  href: string;
  cta: string;
  /** The tile at the front of the row. Lucide names for handover rows; the `logo` variant of the
   *  type stays for the app/channel tiles rendered elsewhere from the same shape. */
  icon: ChecklistIcon;
  /**
   * The Composio toolkit this row connects, when it is an app. No checklist item carries one any
   * more (app cards moved to the Connections page), but the field stays on the type because the
   * shared row renderers still read it.
   */
  toolkitSlug?: string;
  /**
   * How this item ticks itself, if it can. Items with no `derived` are self-reported and the
   * customer ticks them by hand.
   */
  derived?: "tools" | "channel" | "asked" | `toolkit:${string}` | `channel:${string}`;
};

function answerList(answers: Record<string, unknown>, key: string): string[] {
  const v = answers[key];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return typeof v === "string" && v.trim() ? [v] : [];
}

function answerText(answers: Record<string, unknown>, key: string): string {
  const v = answers[key];
  return typeof v === "string" ? v.trim() : "";
}

/** The parts of the business they said are broken, and what handing each one over looks like. */
const AREA_ITEMS: Record<string, string> = {
  "Sales / Lead Generation":
    "Tell it how a lead reaches you and what happens next, so it can chase the ones going cold.",
  "Customer Support / Service":
    "Give it the questions you answer over and over, and let it draft the replies.",
  "Operations / Admin": "Name the admin that eats your week - it is usually the first thing to go.",
  "Marketing & Content": "Tell it who you are writing for and hand it a first draft to react to.",
  "Invoicing & Finance":
    "Tell it your billing cycle and who is usually late. Chasing invoices is work nobody misses.",
  "Scheduling & Calendar": "Let it own the back-and-forth of finding a time.",
  "Hiring & HR": "Give it the role you are hiring for and let it screen against it.",
  "Reporting & Analytics": "Tell it which numbers you actually look at, and how often.",
  "Order Fulfillment / Shipping": "Walk it through what happens between an order and a delivery.",
  "Email & Inbox": "Point it at the inbox and say what deserves your attention and what does not.",
  "Team Communication": "Tell it who needs to know what, and let it do the telling.",
  "Vendor / Supplier Management": "List who you buy from and what you chase them about.",
  "Project Management": "Describe how work moves from idea to done here.",
  "Customer Onboarding": "Give it the steps a new customer goes through, in order.",
  "Contracts & Proposals": "Upload one you are happy with - it becomes the template for the rest.",
};

/** Lucide icon per broken area, so a list of handovers is scannable rather than fifteen grey rows. */
const AREA_ICONS: Record<string, string> = {
  "Sales / Lead Generation": "TrendingUp",
  "Customer Support / Service": "LifeBuoy",
  "Operations / Admin": "Settings2",
  "Marketing & Content": "Megaphone",
  "Invoicing & Finance": "Receipt",
  "Scheduling & Calendar": "CalendarDays",
  "Hiring & HR": "UserPlus",
  "Reporting & Analytics": "BarChart3",
  "Order Fulfillment / Shipping": "Package",
  "Email & Inbox": "Mail",
  "Team Communication": "Users",
  "Vendor / Supplier Management": "Truck",
  "Project Management": "SquareCheck",
  "Customer Onboarding": "UserCheck",
  "Contracts & Proposals": "FileSignature",
};

// Enough to be worth finishing, few enough to look finishable. Past about a dozen a checklist
// stops reading as progress and starts reading as a chore list — and the intake gives us more
// candidates than that for anyone who ticked a lot of boxes.
const MAX_ITEMS = 12;

/**
 * Build one customer's checklist from their questionnaire answers.
 *
 * Returns an empty list when there are no answers — the white-glove and lead cohort, whose
 * questionnaire posts to /api/intake and lands in the CRM project, so nothing about it reaches
 * this database. With the app cards gone there is nothing generic left to show them; the page
 * still renders the channel and schedule panels, which do not come from this list.
 */
export function buildChecklist(answers: Record<string, unknown> | null): ChecklistItem[] {
  if (!answers) return [];

  const items: ChecklistItem[] = [];

  // ── What they said is broken ─────────────────────────────────────────────────────────────
  // Self-reported, every one of them. Handing over invoicing happens in a conversation, and no
  // column anywhere records that it went well.
  for (const area of answerList(answers, "brokenAreas")) {
    const body = AREA_ITEMS[area];
    if (!body) continue;
    items.push({
      id: `area:${area.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}`,
      title: `Hand over ${area.toLowerCase()}`,
      body,
      category: "Hand it your work",
      href: "/dashboard/chat",
      cta: "Start that conversation",
      icon: { kind: "icon", name: AREA_ICONS[area] ?? "Sparkles" },
    });
  }

  // ── The one they volunteered ─────────────────────────────────────────────────────────────
  // Free text, quoted back. Somebody who wrote out the task they hate most has already told you
  // what success looks like for them; this is the item most worth finishing.
  const hated = answerText(answers, "hatedTasks");
  if (hated) {
    items.push({
      id: "hated",
      title: "Take the task you hate most off your plate",
      body: `You told us: “${hated.length > 160 ? `${hated.slice(0, 160)}…` : hated}”`,
      category: "Hand it your work",
      href: "/dashboard/chat",
      cta: "Start that conversation",
      icon: { kind: "icon", name: "Flame" },
    });
  }

  return items.slice(0, MAX_ITEMS);
}

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = ["Hand it your work"];

/** Where the OAuth handshake starts. Same route the Connections page uses, so the two can never
 *  disagree about how an app connects. Kept for the shared row renderers. */
export function connectHref(agentId: string, slug: string): string {
  return `/api/agents/${encodeURIComponent(agentId)}/integrations/connect/redirect?toolkit=${encodeURIComponent(slug)}`;
}
