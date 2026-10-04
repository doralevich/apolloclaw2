import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { readInstanceRoster } from "@/lib/instance-roster";
import { runtimeForTemplate } from "@/config/agents";
import { agentTier, type AgentPlanUsage } from "@/config/agent-plans";

// A workspace's agent plan, and how much of it is in use. See config/agent-plans.ts for the
// tiers and supabase/migrations/0033_workspace_agent_plans.sql for why the plan sits in a table
// only the server can touch.

/** The plan a workspace is on. No row means a customer from before the plans (the legacy tier),
 *  and so does any read failure: a missing plan must never reprice anyone or stop them using the
 *  agents they have. `own` is a per-workspace number set from Super Admin, when there is one. */
export async function getWorkspaceAgentPlan(workspaceId: string) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("workspace_agent_plans")
    .select("plan, agent_limit")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) console.error("[agent-plan:read-failed]", workspaceId, error.message);
  const tier = agentTier((data?.plan as string | undefined) ?? null);
  const own = typeof data?.agent_limit === "number" && data.agent_limit > 0 ? data.agent_limit : null;
  return { tier, own };
}

/** Every agent the workspace runs: one per instance, plus each additional agent an OpenClaw box
 *  reports. A box that cannot be read right now counts as its one main agent, which errs toward
 *  letting the customer add rather than blocking them on a sleeping container. */
export async function countWorkspaceAgents(workspaceId: string): Promise<{ agents: number; instances: number }> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("agents")
    .select("agent37_id, template")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null);
  if (error) throw new Error(error.message);
  const counts = await Promise.all(
    (data ?? []).map(async (row: { agent37_id: string; template: string | null }) => {
      if (runtimeForTemplate(row.template) !== "OpenClaw") return 1;
      const roster = await readInstanceRoster(row.agent37_id).catch(() => null);
      return roster?.ok && roster.agents.length > 0 ? roster.agents.length : 1;
    })
  );
  return { agents: counts.reduce((a, b) => a + b, 0), instances: counts.length };
}

export async function getAgentPlanUsage(workspaceId: string): Promise<AgentPlanUsage> {
  const [{ tier, own }, count] = await Promise.all([getWorkspaceAgentPlan(workspaceId), countWorkspaceAgents(workspaceId)]);
  // A legacy customer pays per instance, so their limit is the instances they pay for: adding
  // one more agent is the seat flow they already have, at the price they already pay.
  const base = tier.id === "legacy" ? Math.max(1, count.instances) : tier.agents;
  const limit = own ?? base;
  return { tier, limit, custom: own !== null, used: count.agents, canAdd: count.agents < limit };
}

/** Set a workspace's plan from Super Admin. `agentLimit` null clears a per-workspace number. */
export async function setWorkspaceAgentPlan(
  workspaceId: string,
  plan: string,
  agentLimit: number | null,
  updatedBy: string | null
): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from("workspace_agent_plans").upsert(
    {
      workspace_id: workspaceId,
      plan,
      agent_limit: agentLimit,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    },
    { onConflict: "workspace_id" }
  );
  if (error) throw new Error(error.message);
}
