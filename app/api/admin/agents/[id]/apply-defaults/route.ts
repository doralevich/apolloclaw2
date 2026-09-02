import { assertNotOtherApp, requirePlatformAdmin } from "@/lib/admin";
import { applyInstanceDefaults } from "@/lib/instance-defaults";
import { logAudit } from "@/lib/audit";
import { json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// applyInstanceDefaults retries for up to ~90s while a sleeping box wakes, then restarts it. The
// platform default timeout (~15s) kills that mid-flight before we can log or respond, so a slow
// box silently fails. Match the other exec-heavy admin routes (install-skills, repair-memory).
export const maxDuration = 300;

// POST /api/admin/agents/{id}/apply-defaults — backfill our capability defaults onto a box that
// already exists (memory embeddings, Tavily web search, clock). New agents get these at provision;
// this is how the ones created before that lands catch up. Restarts the instance so the config
// reloads. Best-effort and idempotent - safe to run more than once.
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  // The College Agent's boxes are listed in the overview but are not ours to touch.
  await assertNotOtherApp(id);
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
