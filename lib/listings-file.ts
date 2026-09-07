import {
  LISTING_STATUSES,
  statusLabel,
  type ListingSide,
  type ListingStatus,
} from "@/config/listings";

// A listing row, and the markdown the agent reads.
//
// SPLIT OUT OF lib/listings.ts TO BREAK A CYCLE, and the cycle is worth naming because the
// obvious fix is the wrong one. lib/listings.ts writes the file by calling injectAgentFile from
// lib/provision.ts; provisioning in turn needs to write an EMPTY version of this file the moment
// a real estate agent is created, because USER.md now points at it and an agent told to read a
// file that is not there is worse than one never told about it. Both directions are legitimate,
// so the shared half moves down here rather than one of them importing the other.
//
// Nothing here touches the database or the network, which is also why it can be tested directly.

export interface ListingRow {
  id: number;
  agent37_id: string;
  address: string;
  side: ListingSide;
  status: ListingStatus;
  price_cents: number | null;
  beds: number | null;
  baths: number | null;
  mls_number: string | null;
  list_date: string | null;
  contract_date: string | null;
  close_date: string | null;
  client_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Whole dollars, with separators and no cents. A list price is never $915,624.99. */
export function formatPrice(cents: number | null): string | null {
  if (cents === null) return null;
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

/**
 * The file the agent reads.
 *
 * Markdown, grouped by status, one line of headline facts per row with anything else underneath.
 * Written for something that will read all of it and quote parts back, which is a different
 * document from the table a person scans: no truncation, no "and 4 more", and dates in full
 * rather than as "3 days ago", since relative time in a file written at noon is wrong by evening.
 */
export function buildListingsMd(rows: ListingRow[], generatedAt = new Date()): string {
  const out: string[] = [
    `# Listings and deals`,
    ``,
    `Your current book of business, from the Listings page in your dashboard. This is ground` +
      ` truth: when you are asked about "my listings" or "my deals", these are them.`,
    ``,
    `Last updated ${generatedAt.toISOString().slice(0, 10)}. If the owner tells you something` +
      ` here is out of date, believe them and say it needs changing on the Listings page - you` +
      ` cannot edit this file yourself.`,
    ``,
  ];

  if (!rows.length) {
    out.push(
      `Nothing here yet. The owner has not added any listings or deals, so if they ask about` +
        ` "my listings", say the list is empty rather than guessing, and point them at the` +
        ` Listings page in the dashboard.`,
      ``
    );
    return out.join("\n");
  }

  // Live work first, history last, because that is the order the questions come in.
  for (const status of LISTING_STATUSES) {
    const group = rows.filter((r) => r.status === status);
    if (!group.length) continue;

    out.push(`## ${statusLabel(status)} (${group.length})`, ``);
    for (const row of group) {
      const facts = [
        row.side === "buyer" ? "buyer side" : null,
        formatPrice(row.price_cents),
        row.beds !== null || row.baths !== null
          ? `${row.beds ?? "?"} bed / ${row.baths ?? "?"} bath`
          : null,
        row.client_name ? `client: ${row.client_name}` : null,
        row.mls_number ? `MLS ${row.mls_number}` : null,
      ].filter(Boolean);

      out.push(`### ${row.address}`);
      if (facts.length) out.push(facts.join(" | "));

      const dates = [
        row.list_date ? `listed ${row.list_date}` : null,
        row.contract_date ? `under contract ${row.contract_date}` : null,
        row.close_date ? `closing ${row.close_date}` : null,
      ].filter(Boolean);
      if (dates.length) out.push(dates.join(" | "));

      if (row.notes?.trim()) out.push(``, row.notes.trim());
      out.push(``);
    }
  }

  return out.join("\n");
}
