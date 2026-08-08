import { agent37 } from "@/lib/agent37";
import { requireAdmin, requireEntitled, requireMember, requireUser } from "@/lib/auth";
import { requirePlatformAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAgentType, licenseAgentType } from "@/config/agent-types";
import { provisionTypedAgent } from "@/lib/provision";
import { ApiError, json, readJson, route } from "@/lib/http";
import type { Agent, AgentRow, MergedAgent } from "@/lib/types";

// Self-serve provisioning: an entitled workspace ADMIN can create one agent per type.
// Everything spend-shaped (template, machine size, budget cap) comes from the
// agent-type registry — never from the client. Paid types never provision here: they go
// through Checkout (/api/build/checkout) and are provisioned by the Stripe webhook.
async function createTypedAgent(typeId: string, workspaceId: string | undefined, rawName: string | undefined) {
  const { supabase, user } = await requireUser();
  if (!workspaceId) throw new ApiError(400, "invalid_request", "workspace_id is required");
  // Admin: provisioning an agent creates a billable instance with its own spend cap.
  await requireAdmin(supabase, workspaceId, user.id);
  await requireEntitled(supabase);

  const type = getAgentType(typeId);
  if (!type) throw new ApiError(404, "not_found", "Unknown agent type");
  if (!type.available) {
    throw new ApiError(400, "invalid_request", `${type.label} isn't available yet - coming soon.`);
  }
  if (type.planKey) {
    throw new ApiError(
      402,
      "payment_required",
      `${type.label} is a paid agent - purchase it through checkout to provision it.`
    );
  }
  if (type.externalUrl) {
    throw new ApiError(
      400,
      "invalid_request",
      `${type.label} is sold at ${new URL(type.externalUrl).hostname} - purchase and setup happen there.`
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

// POST provisions, then writes the profile and context into the instance from `after()` —
// work that outlives the response but still counts against this function's duration.
export const maxDuration = 300;

export const GET = route(async (request: Request) => {
  const { supabase, user } = await requireUser();
  const workspaceId = new URL(request.url).searchParams.get("workspace");
  if (!workspaceId) throw new ApiError(400, "invalid_request", "workspace query param is required");

  const role = await requireMember(supabase, workspaceId, user.id);

  // Seats: a member sees their own agents, an admin sees the workspace's.
  //
  // This is the whole point of agents.owner_id. Chat history lives on the instance, so without
  // it a company that buys a second agent for its office manager gets one where the office
  // manager can switch to the founder's agent and read those threads — and would have no way
  // to know that was possible until it happened.
  //
  // owner_id IS NULL is included deliberately: those agents predate seats and were
  // workspace-wide when they were created, so filtering them out would take an agent away from
  // somebody already using it every day.
  let query = supabase.from("agents").select("*").eq("workspace_id", workspaceId);
  if (role !== "admin") {
    query = query.or(`owner_id.eq.${user.id},owner_id.is.null`);
  }

  const { data: rows, error } = await query.order("created_at", { ascending: false });
  if (error) throw new ApiError(500, "db_error", error.message);

  // Which agent types in this workspace have had their setup questionnaire completed, and
  // whether those answers have reached the running agent. Read with the service-role client
  // because agent_setup is deliberately RLS-on-no-policy (server-only); the caller's membership
  // was already checked by requireMember above.
  //
  // Setup is tracked PER AGENT, not per workspace: buying a CFO agent after a CEO agent means
  // filling in the CFO questionnaire, because the answers that make a CEO agent useful are not
  // the ones a CFO agent needs (David's call).
  const setupByType = new Map<string, { completed: boolean; injected: boolean }>();
  try {
    const { data: setupRows } = await createAdminClient()
      .from("agent_setup")
      .select("agent_type, injected_at")
      .eq("workspace_id", workspaceId);
    for (const r of (setupRows ?? []) as { agent_type: string; injected_at: string | null }[]) {
      setupByType.set(r.agent_type, { completed: true, injected: !!r.injected_at });
    }
  } catch (err) {
    // A failed lookup must not blank out the agent list; the UI treats "unknown" as complete
    // rather than nagging a customer who has already filled it in.
    console.error("[agents] agent_setup lookup failed:", (err as Error).message);
  }

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
      // Undefined when the lookup failed — distinct from false, so the UI can stay quiet
      // rather than wrongly telling someone their setup is incomplete.
      setup_completed: row.agent_type ? setupByType.get(row.agent_type)?.completed ?? false : undefined,
      setup_injected: row.agent_type ? setupByType.get(row.agent_type)?.injected ?? false : undefined,
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

  // No `type` -> the platform-admin flow: provision into ANY workspace, on the owner's
  // behalf, without the membership and entitlement gates the self-serve path applies.
  //
  // It used to build a stock OpenClaw box from DEFAULT_AGENT — the pre-product admin tool,
  // still wired to the platform default long after we had a product. An admin pressing
  // "create" in the god-view got something no customer has: wrong runtime, wrong resources,
  // no agent_type, and so no questionnaire tracking or USER.md injection.
  //
  // It now provisions the Apollo Agent, the same type and the same path the customer's
  // purchase takes. The only difference left between the two is who is allowed to ask.
  const { user } = await requirePlatformAdmin();

  // Shape is fixed server-side by the agent type; the caller only picks the workspace.
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

  // Same pipeline as a purchase: template resolution (including the rename alias), the
  // one-per-type cap, rollback if the row insert fails, and the setup-answer injection that
  // makes the agent know whose it is. The instance belongs to the workspace owner;
  // created_by records the admin who pressed the button.
  const agent = await provisionTypedAgent({
    type: licenseAgentType(),
    workspaceId,
    userId: ownerId,
    createdBy: user.id,
    name: body.name,
    // No customer has paid here, so a missing template should fail loudly rather than
    // quietly hand an admin the wrong kind of box — which is the bug this replaces.
    allowTemplateFallback: false,
  });

  return json(agent, 201);
});
