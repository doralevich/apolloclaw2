import { requirePlatformAdmin } from "@/lib/admin";
import { applyInstanceDefaults } from "@/lib/instance-defaults";
import { logAudit } from "@/lib/audit";
import { json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/agents/{id}/apply-defaults — backfill our capability defaults onto a box that
// already exists (memory embeddings, Tavily web search, clock). New agents get these at provision;
// this is how the ones created before that lands catch up. Restarts the instance so the config
// reloads. Best-effort and idempotent - safe to run more than once.
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  const db = createAdminClient();

  // Best-effort timezone from the agent's setup answers, same source provisioning uses.
  let timezone: string | null = null;
  const { data: agentRow } = await db
    .from("agents")
    .select("workspace_id, agent_type")
    .eq("agent37_id", id)
    .maybeSingle();
  if (agentRow?.workspace_id && agentRow.agent_type) {
    const { data: setup } = await db
      .from("agent_setup")
      .select("answers")
      .eq("workspace_id", agentRow.workspace_id as string)
      .eq("agent_type", agentRow.agent_type as string)
      .maybeSingle();
    const answers = setup?.answers as Record<string, unknown> | undefined;
    if (typeof answers?.timezone === "string") timezone = answers.timezone as string;
  }

  const result = await applyInstanceDefaults(id, { timezone, restart: true });
  await logAudit({
    actorEmail: user.email,
    action: "agent.defaults_applied",
    target: id,
    metadata: { ...result },
    request,
  });
  return json(result);
});
