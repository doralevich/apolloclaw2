import "server-only";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { injectAgentFile } from "@/lib/provision";
import { LISTINGS_FILENAME } from "@/config/agent-workspace";
import { LISTING_SIDES, LISTING_STATUSES } from "@/config/listings";
import { buildListingsMd, type ListingRow } from "@/lib/listings-file";

// The book of business, and getting it in front of the agent.
//
// THE SECOND HALF IS THE POINT. A table the dashboard renders is a spreadsheet with extra steps;
// what makes this worth building is that the agent reads it. The scheduled reports we ship for
// real estate open with "for each of my active listings" and "every deal I have under contract",
// and until now the agent had to ask what those were - every morning, before it could start.
//
// HOW IT GETS THERE: the same mechanism as BUSINESS-CONTEXT.md. We write a markdown file into
// every workspace directory the instance recognises, and the agent opens it when a question needs
// it. Not one of the auto-loaded files, deliberately - a book of business is reference material
// read a few times a day, not context worth paying for on every turn.

/** One agent's whole book, in the order the file and the page both want it. */
export async function listListings(agentId: string): Promise<ListingRow[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("agent_listings")
    .select("*")
    .eq("agent37_id", agentId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ListingRow[];
}

/**
 * Push the current book onto the instance.
 *
 * BEST EFFORT AND OUT OF BAND. Writing this is an exec into a container that may be asleep, which
 * is seconds at best and a retry loop at worst, and no customer should watch a spinner on "save
 * listing" for it. So every mutation returns as soon as the row is written and this runs after,
 * exactly like the provisioning writes.
 *
 * The cost of that choice, stated plainly: a failed sync means the file on the box is one edit
 * stale until the next change. That is the right trade against making the page feel broken, and
 * the log line says when it happened.
 */
export function syncListingsAfterChange(agentId: string): void {
  after(async () => {
    try {
      const rows = await listListings(agentId);
      // Two attempts, not the provisioning default of six. This box has been up for months: if
      // it refuses one exec it will refuse the next, and ninety seconds of retries to learn that
      // is time the platform pays for and nobody gets back.
      await injectAgentFile(agentId, LISTINGS_FILENAME, buildListingsMd(rows), 2);
      console.log("[listings:synced]", agentId, rows.length);
    } catch (err) {
      console.error("[listings:sync-failed]", agentId, (err as Error).message);
    }
  });
}

export { LISTING_SIDES, LISTING_STATUSES };
export { buildListingsMd, formatPrice, type ListingRow } from "@/lib/listings-file";
