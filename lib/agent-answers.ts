import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

// One agent's questionnaire answers, resolved from agent_setup.
//
// Lived inside app/api/agents/[id]/checklist/route.ts until the connect flow needed the same
// lookup to work out whether a customer runs on Google or Microsoft. Two copies of this would
// drift the first time the fallback rule changed, and the fallback rule is the subtle half.

/** agent37_id -> the answers that agent was built from, if any reached this database. */
export async function loadAgentAnswers(
  db: ReturnType<typeof createAdminClient>,
  agentId: string
): Promise<Record<string, unknown> | null> {
  const { data: agent } = await db
    .from("agents")
    .select("workspace_id")
    .eq("agent37_id", agentId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!agent?.workspace_id) return null;

  // THIS agent's answers first.
  //
  // It used to take the workspace's most recent row, which was right while a workspace held one
  // agent and wrong the moment it holds two: an office manager's checklist would list the
  // founder's apps and the founder's handovers, and tick itself off against work she has no
  // part in. Seats stamp agent_setup.agent37_id, so the right row can be asked for by name.
  const { data: own } = await db
    .from("agent_setup")
    .select("answers")
    .eq("agent37_id", agentId)
    .maybeSingle();

  // Falling back to the workspace row covers every set of answers written before seats existed,
  // which have no agent id on them. Restricted to rows not claimed by some OTHER agent, so a
  // colleague's answers are never borrowed - better a generic checklist than a confidently
  // wrong one.
  let row = own;
  if (!row) {
    const { data: legacy } = await db
      .from("agent_setup")
      .select("answers")
      .eq("workspace_id", agent.workspace_id)
      .is("agent37_id", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    row = legacy;
  }

  const answers = row?.answers;
  return answers && typeof answers === "object" ? (answers as Record<string, unknown>) : null;
}
