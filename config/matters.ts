// The shape of a matter, shared by the database check constraints, the API guard and the page.
//
// A leaf module with no imports, for the same reason config/listings.ts is one: the client
// component, the server route and lib/matters.ts all need these, and lib/matters.ts is
// server-only so it cannot be the home for anything the dashboard renders.
//
// DELIBERATELY NOT MERGED WITH config/listings.ts. The two are the same IDEA - the book of work
// the agent reads - and almost none of the same fields: a matter has no price, no beds and no
// MLS number, and a listing has no opposing party, no jurisdiction and no privilege posture.
// Folding them into one table with fifteen nullable columns would make every query a filter on
// agent type and every form a conditional, to save a file that is mostly a list of strings.

/** Open work first, closed last. Every list in the product renders in this order. */
export const MATTER_STATUSES = [
  "intake",
  "active",
  "on_hold",
  "awaiting_client",
  "closed",
] as const;

export type MatterStatus = (typeof MATTER_STATUSES)[number];

const STATUS_LABELS: Record<MatterStatus, string> = {
  intake: "Intake",
  active: "Active",
  on_hold: "On hold",
  awaiting_client: "Awaiting client",
  closed: "Closed",
};

export function matterStatusLabel(status: MatterStatus): string {
  return STATUS_LABELS[status];
}

export function isMatterStatus(value: string): value is MatterStatus {
  return (MATTER_STATUSES as readonly string[]).includes(value);
}

/** The agent types that get a Matters page. Legal today. */
export const MATTERS_FOR_TYPES = ["legal"] as const;

export function hasMatters(agentTypeId: string | null | undefined): boolean {
  return !!agentTypeId && (MATTERS_FOR_TYPES as readonly string[]).includes(agentTypeId);
}
