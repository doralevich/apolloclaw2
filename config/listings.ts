// The shape of a listing, shared by the database check constraints, the API guard and the page.
//
// A leaf module with no imports for the same reason config/agent-workspace.ts is one: the client
// component, the server route and lib/listings.ts all need these, and lib/listings.ts is
// server-only so it cannot be the home for anything the dashboard renders.

/** Live work first, history last. Every list in the product renders in this order. */
export const LISTING_STATUSES = [
  "coming_soon",
  "active",
  "under_contract",
  "closed",
  "withdrawn",
] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const LISTING_SIDES = ["listing", "buyer"] as const;

export type ListingSide = (typeof LISTING_SIDES)[number];

const STATUS_LABELS: Record<ListingStatus, string> = {
  coming_soon: "Coming soon",
  active: "Active",
  under_contract: "Under contract",
  closed: "Closed",
  withdrawn: "Withdrawn",
};

export function statusLabel(status: ListingStatus): string {
  return STATUS_LABELS[status];
}

export function isListingStatus(value: string): value is ListingStatus {
  return (LISTING_STATUSES as readonly string[]).includes(value);
}

export function isListingSide(value: string): value is ListingSide {
  return (LISTING_SIDES as readonly string[]).includes(value);
}

/** The agent types that get a Listings page. Real estate today; the mechanism is the same one
 *  skills and scheduled reports use, so a second role is one entry rather than a refactor. */
export const LISTINGS_FOR_TYPES = ["realestate"] as const;

export function hasListings(agentTypeId: string | null | undefined): boolean {
  return !!agentTypeId && (LISTINGS_FOR_TYPES as readonly string[]).includes(agentTypeId);
}
