import { agent37 } from "@/lib/agent37";
import { requireEntitled, requireMember, requireUser } from "@/lib/auth";
import { requirePlatformAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_AGENT } from "@/config/agents";
import { getAgentType, type AgentType } from "@/config/agent-types";
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

// Template check for the typed self-serve flow. Mirrors resolveTemplate's tolerance for a
// listTemplates hiccup (createAgent will still fail loudly if the template truly doesn't
// exist), but unlike the admin flow there is NO fallback to an arbitrary builtin — a typed
// create must never provision the wrong kind of agent, so a listing that's missing the
// template fails fast with a clear message.
async function verifyTypedTemplate(type: AgentType): Promise<string> {
  let templates;
  try {
    ({ data: templates } = await agent37.listTemplates());
  } catch {
    return type.template;
  }
  const match = templates.find((t) => t.name === type.template);
  if (!match) {
    throw new ApiError(
      502,
      "template_unavailable",
      `The ${type.label} template isn't registered yet. Please try again later.`
    );
  }
  return match.name;
}

// Self-serve provisioning: any entitled member of the workspace can create one agent per
// type. Everything spend-shaped (template, machine size, budget cap) comes from the
// agent-type registry — never from the client.
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

  // Service-role client past this point: the guard chain above (member + entitled) is the
  // authorization, matching how the admin flow and the per-agent routes write rows.
  const db = createAdminClient();

  // Cap: one agent of each type per workspace (keyed by template, which is what the row
  // actually stores). Best-effort check — two simultaneous creates could race past it, but
  // the modal disables the card as soon as the list refreshes.
  const { data: existing, error: capError } = await db
    .from("agents")
    .select("agent37_id")
    .eq("workspace_id", workspaceId)
    .eq("template", type.template)
    .limit(1);
  if (capError) throw new ApiError(500, "db_error", capError.message);
  if (existing && existing.length > 0) {
    throw new ApiError(
      409,
      "conflict",
      `This workspace already has a ${type.label}. Each workspace can have one agent per type.`
    );
  }

  const template = await verifyTypedTemplate(type);

  const agent = await agent37.createAgent({
    template,
    resources: { cpu: type.resources.cpu, memory: type.resources.memory, disk: type.resources.disk },
    user: user.id,
    name: rawName?.trim() || type.label,
    metadata: { app_workspace: workspaceId, agent_type: type.id },
    budget: { monthly_cap_micros: usdToMicros(type.monthlyCapUsd) },
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
