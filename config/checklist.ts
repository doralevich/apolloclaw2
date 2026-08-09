import { composioLogoUrl, DEFAULT_INTEGRATION_TOOLKITS } from "@/lib/integration-catalog";

// The setup checklist, built per customer from what they told us at intake.
//
// A generic list would have to guess. This does not have to: the questionnaire already asked
// which CRM they use, which billing tools, which parts of the business are broken — and the
// answers are stored as agent_setup.answers for every paying licence customer. So the list can
// name HubSpot because they said HubSpot, and can leave out the other five CRMs entirely.
//
// That is also what keeps it short. A twelve-item list somebody can finish beats a twenty-seven
// item list nobody starts, and the fastest way to twelve is to only show what applies.
//
// TOOL NAMES ARE FIXED, WHICH IS WHY THIS IS A LOOKUP AND NOT A MATCHER. The questionnaire's
// stack questions are checkbox groups over closed lists (STACK_CRM, STACK_COMMS, STACK_PM,
// STACK_BILLING in OnboardingForm) — there is no free text to normalise, so mapping a selection
// to a Composio toolkit is a table with about a dozen entries rather than fuzzy matching.

/** Curated-catalogue slug for a questionnaire stack option, where one exists. */
const TOOL_SLUGS: Record<string, string> = {
  Salesforce: "salesforce",
  HubSpot: "hubspot",
  // Two options, two connections. These were one "Google Workspace" checkbox anchored on mail,
  // which meant calendar was never implied by anything the customer actually ticked.
  "Google Mail": "gmail",
  "Google Calendar": "googlecalendar",
  // LEGACY. Off the questionnaire since the split above, but the split only renamed the
  // options - it could not rename the answers already stored. Every customer who ticked the
  // old checkbox has "Google Workspace" in agent_setup.answers, and without this row their
  // checklist demoted a one-click Connect Gmail into "go and search for it". Answers are
  // forever; labels are not; the lookup has to remember both.
  "Google Workspace": "gmail",
  "Office 365": "outlook",
  // In the curated catalogue all along and never mapped - David hit the "go and search for it"
  // card for an app one click away.
  "Microsoft Teams": "microsoft_teams",
  Zoom: "zoom",
  "Google Meet": "googlemeet",
  Notion: "notion",
  Asana: "asana",
  Trello: "trello",
  // One option, two products. Jira is the commoner of the pair among the businesses this sells
  // to; somebody on Linear lands on the Connections page and finds it in one search.
  "Jira / Linear": "jira",

  // ── Documents & files ──────────────────────────────────────────────────────
  // Where the documents live gets a real connection; the editors mostly do not.
  //
  // Word, Excel, PowerPoint and Google Slides are deliberately ABSENT. There is no toolkit for
  // them in the curated catalogue, and inventing a slug to fill the gap is the one failure this
  // file exists to prevent - a Connect button that dead-ends on "Could not connect app". Left
  // unmapped they still produce a checklist row, pointing at the Connections search instead of
  // promising a handshake we cannot perform. That is also honest about how the files work:
  // an Office document is reached through OneDrive or SharePoint, not through Word.
  "Google Docs": "googledocs",
  "Google Sheets": "googlesheets",
  "Google Drive": "googledrive",
  "OneDrive / SharePoint": "one_drive",
  Dropbox: "dropbox",
  Box: "box",
};

// Every slug above must exist in the curated catalogue, checked at import. A slug that is not
// there produces a Connect button that dead-ends on "Could not connect app" — the exact failure
// config/integration-rail.ts documents from a guessed Google Contacts slug. Failing the build is
// the cheaper place to find out.
const CATALOG = new Set(DEFAULT_INTEGRATION_TOOLKITS.map((t) => t.slug.toLowerCase()));
for (const [label, slug] of Object.entries(TOOL_SLUGS)) {
  if (!CATALOG.has(slug.toLowerCase())) {
    throw new Error(
      `config/checklist: "${label}" maps to "${slug}", which is not in the Connections ` +
        `catalogue. Add it to lib/integration-catalog.ts or drop the mapping.`
    );
  }
}

/**
 * Stack options that are chat apps rather than integrations.
 *
 * Slack and Telegram are where the agent ANSWERS you, which in this product is a Channel with a
 * bot token, not an OAuth connection. Sending somebody to Connections to look for Slack would
 * be sending them somewhere it will never appear.
 */
const CHANNEL_TOOLS = new Set(["Slack", "Telegram", "WhatsApp"]);

/** Selections that mean "none" — never turned into an item. */
const NEGATIVE = new Set(["No CRM currently", "No PM tool", "None", "Other", "None / Not applicable"]);

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

// "Start using it" is gone, and with it the "Ask it something real" row. Opening chat is not a
// setup step you tick off — it is the thing the setup was for — so it is a button on the page
// rather than the last item on a list somebody has to finish first.
export type ChecklistCategory = "Connect your tools" | "Hand it your work";

/** What to draw in the row's tile. A real product logo where one exists, a lucide name otherwise. */
export type ChecklistIcon = { kind: "logo"; src: string } | { kind: "icon"; name: string };

export type ChecklistItem = {
  /** Stable id. Stored in agent_checklist_items when the item is self-reported. */
  id: string;
  title: string;
  body: string;
  category: ChecklistCategory;
  href: string;
  cta: string;
  /**
   * The tile at the front of the row.
   *
   * Product logos wherever there is one — a HubSpot row with the HubSpot mark is recognisable at
   * a glance in a way "Connect HubSpot" in grey text is not, and the Connections page already
   * serves these from Composio's CDN. Lucide names elsewhere, resolved in the component so this
   * file stays JSX-free and server-safe.
   */
  icon: ChecklistIcon;
  /**
   * The Composio toolkit this row connects, when it is an app. Its presence is what turns the
   * row into a real Connect button that starts OAuth from here — the page David asked for
   * "the actual connections" on — rather than a link to go and find it on another screen.
   */
  toolkitSlug?: string;
  /**
   * How this item ticks itself, if it can. Items with no `derived` are self-reported and the
   * customer ticks them by hand. `toolkit:<slug>` and `channel:<id>` tick on THAT app or THAT
   * channel specifically — a customer who named both Slack and Telegram gets two rows, and one
   * ticking because the other connected would be the page lying about the one it named.
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

// There is no CORE row any more.
//
// "Choose where it answers you" was one line pointing at the Channels page. It is now the
// Channels page's own panel, rendered inside this one — David asked for the cards exactly as
// they appear there, and the panel is the only way to get "exactly" and keep it that way.
// Anything short of reusing it drifts from config/channels.ts the first time a setup step
// changes, and the customer is the one who finds out.
//
// The named-channel rows went with it. Somebody who told us they use Slack does not need a row
// saying "Put it in Slack" above a Slack card that already says Not connected and expands into
// the steps.

// Enough to be worth finishing, few enough to look finishable. Past about a dozen a checklist
// stops reading as progress and starts reading as a chore list — and the intake gives us more
// candidates than that for anyone who ticked a lot of boxes.
const MAX_ITEMS = 12;

/**
 * Build one customer's checklist from their questionnaire answers.
 *
 * Falls back to CORE alone when there are no answers, which is the white-glove and lead cohort:
 * their questionnaire posts to /api/intake and lands in the CRM project, so nothing about it
 * reaches this database. They get a short generic list rather than a wrong personal one.
 */
// The floor under "Connect your tools": mail and files, both vendors, from the Essentials
// shelf's own reasoning — these are the connections that change whether an agent can do
// anything at all.
//
// "Only what they picked at onboarding" had a hole: an agent provisioned outside the licence
// questionnaire has no answers, and a customer who skipped the stack page has answers naming
// nothing — both landed on an empty section with an apology in a dashed box. David's call,
// pointing at the original layout: show the essentials instead. Four cards somebody might not
// need beat zero cards nobody can use, and every one of these is worth connecting anyway.
const ESSENTIAL_FALLBACK_SLUGS = ["gmail", "googledrive", "outlook", "one_drive"];

function essentialItems(): ChecklistItem[] {
  return ESSENTIAL_FALLBACK_SLUGS.flatMap((slug) => {
    const t = DEFAULT_INTEGRATION_TOOLKITS.find((tk) => tk.slug === slug);
    if (!t) return [];
    return [
      {
        id: `tool:${slug}`,
        title: `Connect ${t.name}`,
        // The catalogue's own line ("Gmail is Google's email service."), not "you told us" -
        // these are offered, not remembered, and the copy must not claim otherwise. The
        // description is nullable in the catalogue type; every curated entry has one, but the
        // fallback keeps the card honest rather than the build red if that ever changes.
        body: t.description ?? `Connect ${t.name} so your agent can reach it.`,
        category: "Connect your tools" as const,
        href: "/dashboard/integrations",
        cta: "Connect",
        icon: { kind: "logo" as const, src: composioLogoUrl(slug) },
        toolkitSlug: slug,
        derived: `toolkit:${slug}` as const,
      },
    ];
  });
}

export function buildChecklist(answers: Record<string, unknown> | null): ChecklistItem[] {
  // No answers: the essentials, nothing personal claimed. This is the white-glove and lead
  // cohort, whose questionnaire lands in the CRM project rather than this database.
  if (!answers) return essentialItems();

  const items: ChecklistItem[] = [];

  // ── Their stack ──────────────────────────────────────────────────────────────────────────
  const stack = [
    ...answerList(answers, "crmTools"),
    ...answerList(answers, "commsTools"),
    ...answerList(answers, "pmTools"),
    ...answerList(answers, "billingTools"),
    ...answerList(answers, "docsTools"),
  ];
  const seenTools = new Set<string>();
  for (const label of stack) {
    if (NEGATIVE.has(label) || seenTools.has(label)) continue;
    seenTools.add(label);

    // Chat apps are skipped here: they are not OAuth connections, and ChannelsPanel below the
    // app grid already lists every one of them with its own state and setup steps.
    if (CHANNEL_TOOLS.has(label)) continue;

    const slug = TOOL_SLUGS[label];
    items.push({
      id: `tool:${slug ?? label.toLowerCase().replace(/\s+/g, "-")}`,
      title: `Connect ${label}`,
      body: slug
        ? `You told us you use ${label}. Connecting it is one click and the agent can read it.`
        : // No curated slug: Composio may still carry it, so this points at the catalogue's own
          // search rather than promising a Connect button we cannot build a link for.
          `You told us you use ${label}. Search for it in Connections - the catalogue runs well ` +
          `past the apps listed on the front page.`,
      category: "Connect your tools",
      href: "/dashboard/integrations",
      cta: slug ? "Connect" : "Search Connections",
      // The real product mark when we have a slug for it. Without one there is no logo to fetch,
      // so a neutral tile rather than a broken image.
      icon: slug ? { kind: "logo", src: composioLogoUrl(slug) } : { kind: "icon", name: "Search" },
      toolkitSlug: slug,
      derived: slug ? (`toolkit:${slug}` as const) : undefined,
    });
  }

  // Answered the questionnaire but named no apps — ticked "None", or skipped the stack page.
  // Same fallback as no answers at all: the essentials are still worth connecting, and an
  // empty section under a heading that counts to zero reads as broken rather than as honest.
  if (!items.some((i) => i.category === "Connect your tools")) {
    items.push(...essentialItems());
  }

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

  // Trim from the end, which drops generated items before CORE — those three apply to everybody
  // and one of them is how you talk to the thing at all.
  return items.slice(0, MAX_ITEMS);
}

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = ["Connect your tools", "Hand it your work"];

/** Where the OAuth handshake starts. Same route the Connections page uses, so the two can never
 *  disagree about how an app connects. */
export function connectHref(agentId: string, slug: string): string {
  return `/api/agents/${encodeURIComponent(agentId)}/integrations/connect/redirect?toolkit=${encodeURIComponent(slug)}`;
}
