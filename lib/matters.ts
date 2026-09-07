import "server-only";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { injectAgentFile } from "@/lib/provision";
import { MATTERS_FILENAME } from "@/config/agent-workspace";
import { buildMattersMd, type MatterRow } from "@/lib/matters-file";

// The matter list, and getting it in front of the agent.
//
// Same two halves as lib/listings.ts, and the second one is again the point. The scheduled reports
// we ship for the Law Agent open with "go through my open matters" and "everything waiting on my
// sign-off", and until now the agent had to ask what those were before it could start.
//
// Written into the workspace as reference material rather than as an auto-loaded file: a matter
// list is opened when a question touches a matter, and paying for it on every turn would cost more
// than it is worth on the turns that never do.

export type { MatterRow };

/** One practice's matters, soonest deadline first within each status group. */
export async function listMatters(agentId: string): Promise<MatterRow[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("agent_matters")
    .select("*")
    .eq("agent37_id", agentId)
    // nullsFirst: false so a matter with no next action sorts after the ones that have a date.
    // An undated matter is not urgent by default, and putting it first would push a real
    // deadline down the page.
    .order("next_action_on", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as MatterRow[];
}

/**
 * Push the current matter list onto the instance.
 *
 * Best effort and out of band, exactly as for listings: the write is an exec into a container that
 * may be asleep, and nobody should watch a spinner on "save matter" for it. A failed sync leaves
 * the file one edit stale until the next change, and the log line says when.
 */
export function syncMattersAfterChange(agentId: string): void {
  after(async () => {
    try {
      const rows = await listMatters(agentId);
      // Two attempts rather than the provisioning six. This box has been up for months; a refusal
      // now will be a refusal in fifteen seconds.
      await injectAgentFile(agentId, MATTERS_FILENAME, buildMattersMd(rows), 2);
      console.log("[matters:synced]", agentId, rows.length);
    } catch (err) {
      console.error("[matters:sync-failed]", agentId, (err as Error).message);
    }
  });
}

export { buildMattersMd } from "@/lib/matters-file";
