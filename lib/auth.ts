import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/http";
import type { AgentRow, Role } from "@/lib/types";

export type DB = Awaited<ReturnType<typeof createClient>>;

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function requireUser() {
  const { supabase, user } = await getSession();
  if (!user) throw new ApiError(401, "unauthorized", "Sign in required");
  return { supabase, user };
}

export async function getRole(db: DB, workspaceId: string, userId: string): Promise<Role | null> {
  const { data } = await db
    .from("memberships")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.role as Role) ?? null;
}

// 404 (not 403) so we don't leak whether the workspace exists.
export async function requireMember(db: DB, workspaceId: string, userId: string): Promise<Role> {
  const role = await getRole(db, workspaceId, userId);
  if (!role) throw new ApiError(404, "not_found", "Workspace not found");
  return role;
}

export async function requireAdmin(db: DB, workspaceId: string, userId: string): Promise<void> {
  const role = await getRole(db, workspaceId, userId);
  if (role !== "admin") throw new ApiError(403, "forbidden", "Admin role required");
}

// v1 entitlement gate (allowlist). `can_create_agent()` (SECURITY DEFINER) checks the
// caller's JWT email against public.entitlements. Apply to EVERY spend-increasing action
// — not just create — so the gate still holds once Stripe makes entitlements revocable.
// This is the single seam Stripe later fills (allowlist -> active subscription).
export async function requireEntitled(db: DB): Promise<void> {
  const { data: allowed, error } = await db.rpc("can_create_agent");
  if (error) throw new ApiError(500, "db_error", error.message);
  if (!allowed) throw new ApiError(403, "forbidden", "Your account isn't approved for this yet.");
}

export async function getAgentRow(db: DB, agent37Id: string): Promise<AgentRow> {
  const { data } = await db.from("agents").select("*").eq("agent37_id", agent37Id).maybeSingle();
  if (!data) throw new ApiError(404, "not_found", "Agent not found");
  return data as AgentRow;
}

// The auth preamble every per-agent route shares: authenticate, resolve the agent's
// row, then enforce the workspace role. Returns the pieces handlers go on to use.
//
// SEATS ARE ENFORCED HERE, not in the listing. /api/agents hides other people's agents from the
// sidebar, but hiding is not access control: an agent37 id appears in every URL its owner
// visits, and a member who has one can call /api/agents/{id}/chat directly. Since chat history,
// connected mailboxes and channel tokens all hang off these routes, workspace membership alone
// would mean a company's office manager could read the founder's threads by typing an id.
//
// Every per-agent route funnels through this function, so this is the one place that has to be
// right rather than thirty.
export async function requireAgentAccess(agent37Id: string, level: "member" | "admin") {
  const { supabase, user } = await requireUser();
  const row = await getAgentRow(supabase, agent37Id);
  if (level === "admin") {
    // Already the stricter test: a workspace admin owns the billing and the agent lifecycle,
    // so they reach every agent in their workspace by design.
    await requireAdmin(supabase, row.workspace_id, user.id);
    return { supabase, user, row };
  }

  const role = await requireMember(supabase, row.workspace_id, user.id);

  // Admins see everything. A member reaches their own agent, and any agent with no owner —
  // those predate seats and were workspace-wide when they were created, so refusing them now
  // would lock somebody out of the agent they use every day.
  const owner = (row as AgentRow & { owner_id?: string | null }).owner_id ?? null;
  if (role !== "admin" && owner && owner !== user.id) {
    // 404, not 403. "You may not touch this agent" confirms the id names a real agent in a
    // workspace they belong to, which is exactly what someone probing ids is trying to learn.
    throw new ApiError(404, "not_found", "Agent not found");
  }

  return { supabase, user, row };
}

export async function getWorkspaceOwner(db: DB, workspaceId: string): Promise<string | null> {
  const { data } = await db.from("workspaces").select("owner_id").eq("id", workspaceId).maybeSingle();
  return (data?.owner_id as string) ?? null;
}
