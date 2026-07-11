import { agent37 } from "@/lib/agent37";
import { requireEntitled, requireMember, requireUser } from "@/lib/auth";
import { requirePlatformAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_AGENT } from "@/config/agents";
import { getAgentType } from "@/config/agent-types";
import { provisionTypedAgent } from "@/lib/provision";
import { usdToMicros } from "@/lib/format";
import { ApiError, json, readJson, route } from "@/lib/http";
import type { Agent, AgentRow, MergedAgent } from "@/lib/types";

async function resolveTemplate(): Promise<string | undefined> {
  try {
    const { data } = await agent37.listTemplates();
    const preferred = data.find((t) => t.name === DEFAULT_AGENT.template);
    if (preferred) return preferred.name;
    const builtin = data.find((t) => t.scope === "system");
    return (builtin ?? data[0])?.name;
  } catch {
    return DEFAULT_AGENT.template;
  }
}

// Self-serve provisioning: any entitled member of the workspace can create one agent per
// type. Everything spend-shaped (template, machine size, budget cap) comes from the
// agent-type registry — never from the client. Paid types never provision here: they go
// through Checkout (/api/build/checkout) and are provisioned by the Stripe webhook.
async function createTypedAgent(typeId: string, workspaceId: string | undefined, rawName: string | undefined) {
  const { supabase, user } = await requireUser();
  if (!workspaceId) throw new ApiError(400, "invalid_request", "workspace_id is required");
  await requireMember(supabase, workspaceId, user.id);
  await requireEntitled(supabase);

  const type = getAgentType(typeId);
  if (!type) throw new ApiError(404, "not_found", "Unknown agent type");
  if (!type.available) {
    throw new ApiError(400, "invalid_request", `${type.label} isn't available yet — coming soon.`);
  }
  if (type.planKey) {
    throw new ApiError(
      402,
      "payment_required",
      `${type.label} is a paid agent — purchase it through checkout to provision it.`
    );
  }
  if (type.externalUrl) {
    throw new ApiError(
      400,
      "invalid_request",
      `${type.label} is sold at ${new URL(type.externalUrl).hostname} — purchase and setup happen there.`
    );
  }

  const agent = await provisionTypedAgent({
    type,
    workspaceId,
    userId: user.id,
    name: rawName,
  });

  return json(agent, 201);
}

export const GET = route(async (request: Request) => {
  const { supabase, user } = await requireUser();
  const workspaceId = new URL(request.url).searchParams.get("workspace");
  if (!workspaceId) throw new ApiError(400, "invalid_request", "workspace query param is required");

  const role = await requireMember(supabase, workspaceId, user.id);

  const { data: rows, error } = await supabase
    .from("agents")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(500, "db_error", error.message);

  let live = new Map<string, Agent>();
  let templateImages = new Map<string, string>();
  const [liveRes, tmplRes] = await Promise.allSettled([
    agent37.listAgents(),
    agent37.listTemplates(),
  ]);
  if (liveRes.status === "fulfilled") {
    live = new Map(liveRes.value.data.map((i) => [i.id, i]));
  }
  if (tmplRes.status === "fulfilled") {
    templateImages = new Map(
      tmplRes.value.data.filter((t) => t.image_ref).map((t) => [t.name, t.image_ref])
    );
  }

  const agents: MergedAgent[] = (rows as AgentRow[]).map((row) => {
    const l = live.get(row.agent37_id);
    if (l && l.status !== row.status) {
      void supabase
        .rpc("set_agent_status", { p_agent37_id: row.agent37_id, p_status: l.status })
        .then(undefined, (err: unknown) => console.error("[agents:set_agent_status]", err));
    }
    const latestImage = l ? templateImages.get(l.template) : undefined;
    return {
      ...row,
      cpu: l?.resources.cpu ?? row.cpu,
      memory: l?.resources.memory ?? row.memory,
      disk: l?.resources.disk ?? row.disk,
      live_status: l?.status ?? row.status,
      status_reason: l?.status_reason ?? null,
      past_due: l?.past_due ?? false,
      ports: l?.ports ?? [],
      update_available: !!(l?.image_ref && latestImage && l.image_ref !== latestImage),
    };
  });

  return json({ agents, role });
});

export const POST = route(async (request: Request) => {
  const body = await readJson<{ workspace_id?: string; type?: string; name?: string }>(request);

  // `type` present -> self-serve flow: an entitled workspace member provisions a typed
  // agent from the registry (config/agent-types.ts).
  if (body.type !== undefined) {
    return createTypedAgent(body.type, body.workspace_id, body.name);
  }

  // No `type` -> the original platform-admin flow, unchanged: admins provision the default
  // OpenClaw agent (for any workspace, on a user's behalf).
  const { user } = await requirePlatformAdmin();

  // Shape is fixed server-side (DEFAULT_AGENT); the caller only picks the workspace.
  const workspaceId = body.workspace_id;
  if (!workspaceId) throw new ApiError(400, "invalid_request", "workspace_id is required");

  // Service-role client: the admin is provisioning into a workspace they're not a member
  // of, so RLS (agents_insert checks is_workspace_admin) would reject a user-scoped insert.
  const db = createAdminClient();

  // Validate the target workspace exists and resolve its owner — the agent is tagged to
  // the end user in agent37, while created_by records the admin who provisioned it.
  const { data: workspace, error: wsError } = await db
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .maybeSingle();
  if (wsError) throw new ApiError(500, "db_error", wsError.message);
  if (!workspace) throw new ApiError(404, "not_found", "Workspace not found");
  const ownerId = (workspace.owner_id as string) ?? user.id;

  const template = await resolveTemplate();

  const agent = await agent37.createAgent({
    template,
    resources: {
      cpu: DEFAULT_AGENT.cpu,
      memory: DEFAULT_AGENT.memory,
      disk: DEFAULT_AGENT.disk,
    },
    user: ownerId,
    metadata: { app_workspace: workspaceId },
    budget: { monthly_cap_micros: usdToMicros(DEFAULT_AGENT.monthlyCapUsd) },
  });

  const { error } = await db.from("agents").insert({
    agent37_id: agent.id,
    workspace_id: workspaceId,
    name: agent.name || null,
    status: agent.status,
    template: agent.template,
    cpu: agent.resources.cpu,
    memory: agent.resources.memory,
    disk: agent.resources.disk,
    created_by: user.id,
  });
  if (error) {
    // Roll back the orphaned agent so we never bill for an untracked box.
    try {
      await agent37.deleteAgent(agent.id);
    } catch (rollbackErr) {
      console.error("[agents:rollback-failed]", agent.id, rollbackErr);
    }
    throw new ApiError(500, "db_error", error.message);
  }

  return json(agent, 201);
});
