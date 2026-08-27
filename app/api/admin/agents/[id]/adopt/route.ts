import { agent37 } from "@/lib/agent37";
import { requirePlatformAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { getAgentType } from "@/config/agent-types";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/agents/{id}/adopt  { workspace_id, owner_id?, agent_type? }
//
// Take an ORPHAN - an Agent37 instance the product has no database row for - and attach it to a
// workspace by creating the missing agents row. This is the recovery path when Agent37 restores
// an instance we'd deleted, or when a swept row left a live VPS stranded: the instance is real and
// running, it just needs a home in the database again.
//
// The row is built from the LIVE instance (template, resources, name) rather than guessed, so the
// adopted agent matches what's actually hosted. agent_type is the one thing Agent37 can't tell us
// - it's ours - so the caller picks it (default apollo, the license agent).
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  const body = await readJson<{ workspace_id?: string; owner_id?: string; agent_type?: string }>(request);

  const workspaceId = body.workspace_id?.trim();
  if (!workspaceId) throw new ApiError(400, "invalid_request", "Pick a workspace to adopt this instance into.");

  const db = createAdminClient();

  // Already has a row? Then it isn't an orphan - don't manufacture a duplicate. A trashed row is
  // its own case: restore is the reversible path, not a second adoption.
  const { data: existing } = await db
    .from("agents")
    .select("agent37_id, deleted_at")
    .eq("agent37_id", id)
    .maybeSingle();
  if (existing) {
    throw new ApiError(
      409,
      "conflict",
      existing.deleted_at
        ? "That agent is in the trash - restore it instead of adopting."
        : "That agent already belongs to a workspace."
    );
  }

  const { data: ws } = await db.from("workspaces").select("id, owner_id").eq("id", workspaceId).maybeSingle();
  if (!ws) throw new ApiError(404, "not_found", "No such workspace.");
  // Default the agent's owner to the workspace owner, so it behaves like the workspace's main
  // agent rather than a member seat unless an owner is explicitly named.
  const ownerId = body.owner_id?.trim() || (ws.owner_id as string);

  const agentType = body.agent_type?.trim() || null;
  if (agentType && !getAgentType(agentType)) {
    throw new ApiError(400, "invalid_request", `Unknown agent type "${agentType}".`);
  }

  // Confirm the instance is really there and read its real shape. If Agent37 is down we refuse -
  // adopting a row for an instance we can't see would just manufacture a ghost (the opposite bug).
  let instance;
  try {
    const { data } = await agent37.listAgents();
    instance = data.find((a) => a.id === id) ?? null;
  } catch (e) {
    throw new ApiError(502, "agent37_error", `Couldn't reach Agent37 to confirm the instance: ${(e as Error).message}`);
  }
  if (!instance) {
    throw new ApiError(404, "not_found", "No live Agent37 instance with that id to adopt.");
  }

  const { error } = await db.from("agents").insert({
    agent37_id: id,
    workspace_id: workspaceId,
    owner_id: ownerId,
    created_by: ownerId,
    name: instance.name ?? null,
    status: instance.status ?? "running",
    template: instance.template ?? "agent37-openclaw",
    cpu: instance.resources?.cpu ?? null,
    memory: instance.resources?.memory ?? null,
    disk: instance.resources?.disk ?? null,
    ...(agentType ? { agent_type: agentType } : {}),
  });
  if (error) throw new ApiError(500, "db_error", error.message);

  await logAudit({
    actorEmail: user.email,
    action: "agent.restored",
    target: id,
    metadata: { via: "adopt orphan", workspace_id: workspaceId, owner_id: ownerId, agent_type: agentType },
    request,
  });

  return json({ id, adopted: true, workspace_id: workspaceId });
});
