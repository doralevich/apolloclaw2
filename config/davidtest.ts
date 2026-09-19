// The scenarios /davidtest can put the product into.
//
// WHY THIS EXISTS. /davidtest/purchase walks the purchase journey - pick an agent, answer the
// questionnaire, see the files it would generate - and stops at the moment the agent is built.
// Everything after that moment could only be seen by buying a licence, paying, provisioning a
// real VPS and connecting a real Google account. So the screens a new owner actually meets first
// were the hardest ones in the product to look at.
//
// This is the other half: the post-build screens, rendered from the REAL components against
// fabricated API answers. Not a mockup of them - the actual ConnectFlow and ChatView, wired to a
// fetch interceptor instead of the database. If a screen looks right here it looks right in
// production, because it is the same component.
//
// NOTHING HERE IS WRITTEN ANYWHERE. Every intercepted call is a GET whose answer is invented in
// the browser. See components/davidtest/mock-api.ts.

/** The answers a scenario pretends the customer gave. Shapes copied from real agent_setup rows. */
export type Scenario = {
  id: string;
  label: string;
  /** What this one is for, in the picker. */
  note: string;
  answers: Record<string, unknown> | null;
};

export const SCENARIOS: Scenario[] = [
  {
    id: "goals-generic",
    label: "Generic flow, goals answered",
    note: "The common case since the Operations & Pain Points page came off: aiGoals, no brokenAreas.",
    answers: {
      firstName: "David",
      companyName: "Acme Roofing",
      aiGoals: [
        "Inbox & email management",
        "Appointment scheduling",
        "Proposals & quotes",
        "Research & competitive intel",
      ],
      growthBottleneck: ["Me - my time and attention are the ceiling"],
    },
  },
  {
    id: "hated",
    label: "They wrote what they hate",
    note: "The strongest opener: their own words, quoted back. Only about one in four fills this in.",
    answers: {
      firstName: "David",
      companyName: "Acme Roofing",
      hatedTasks: "chasing invoices that are 60 days late, and rewriting the same follow-up email",
      aiGoals: ["Invoicing & billing", "Lead qualification & follow-up"],
    },
  },
  {
    id: "role",
    label: "Role agent (legal)",
    note: "Role flows write the deep-dive's own words into aiGoals, so the keyword pass handles it.",
    answers: {
      firstName: "David",
      companyName: "Winter & Stahl",
      aiGoals: ["Client or internal intake", "Research memos", "Document organisation and filing"],
      legalDetails: { legal_tools: "NetDocuments" },
    },
  },
  {
    id: "legacy-areas",
    label: "Legacy record (brokenAreas)",
    note: "Written before the pain-points page was removed. A handful of real accounts look like this.",
    answers: {
      firstName: "David",
      companyName: "Acme Roofing",
      brokenAreas: ["Invoicing & Finance", "Sales / Lead Generation"],
    },
  },
  {
    id: "none",
    label: "No answers at all",
    note: "White-glove and lead cohort: their questionnaire posts to the CRM, so nothing reaches this database. Everything must fall back cleanly.",
    answers: null,
  },
];

export function scenario(id: string | null): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

/** What a scenario pretends is already connected. Keys are the toolkit slugs the real API returns. */
export const CONNECTION_SETS: { id: string; label: string; slugs: string[] }[] = [
  { id: "none", label: "Nothing connected", slugs: [] },
  { id: "gmail", label: "Gmail only", slugs: ["gmail"] },
  { id: "google", label: "Google, all three", slugs: ["gmail", "googlecalendar", "googledrive"] },
  { id: "outlook", label: "Outlook (covers mail + calendar)", slugs: ["outlook"] },
];

export function connectionSet(id: string | null): string[] {
  return (CONNECTION_SETS.find((c) => c.id === id) ?? CONNECTION_SETS[0]).slugs;
}
