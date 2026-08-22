import { agent37 } from "@/lib/agent37";
import { requirePlatformAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { findAuthUserIdByEmail } from "@/lib/license-session";
import { logAudit } from "@/lib/audit";
import { ApiError, json, readJson, route } from "@/lib/http";
import type { AdminWorkspaceSummary } from "@/lib/types";

// How many workspaces the god-view shows. No pagination by design — newest 50.
const LIMIT = 50;

// Resolve owner_id -> email via the service-role auth admin API. The `auth.users` table
// isn't exposed to PostgREST, so we page through listUsers (small user base under the
// allowlist) building a map for just the owners we need.
async function resolveEmails(
  admin: ReturnType<typeof createAdminClient>,
  ownerIds: string[]
): Promise<Map<string, string>> {
  const want = new Set(ownerIds);
  const map = new Map<string, string>();
  // Page until an EMPTY page (not until a short page): GoTrue may cap perPage below what
  // we request, so a page shorter than `perPage` doesn't mean we've reached the end.
  // Stop early once every owner we care about is resolved; the page cap is a safety net.
  for (let page = 1; page <= 50 && map.size < want.size; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    const users = data?.users ?? [];
    if (users.length === 0) break;
    for (const u of users) {
      if (u.email && want.has(u.id)) map.set(u.id, u.email);
    }
  }
  return map;
}

export const GET = route(async () => {
  const { user } = await requirePlatformAdmin();
  const admin = createAdminClient();

  const { data: workspaces, error } = await admin
    .from("workspaces")
    .select("id, name, owner_id, created_at")
    .order("created_at", { ascending: false })
    .limit(LIMIT);
  if (error) throw new ApiError(500, "db_error", error.message);

  const rows = (workspaces ?? []) as {
    id: string;
    name: string;
    owner_id: string;
    created_at: string;
  }[];
  const ids = rows.map((w) => w.id);

  if (ids.length === 0) return json({ workspaces: [] as AdminWorkspaceSummary[] });

  // Counts + live statuses in parallel. listAgents() is a single agent37 call that
  // returns every instance account-wide; we use it to compute live "running" counts
  // without per-agent calls. Owner emails come from the auth admin API.
  const [membersRes, agentsRes, liveRes, emails] = await Promise.all([
    admin.from("memberships").select("workspace_id, user_id").in("workspace_id", ids),
    admin.from("agents").select("workspace_id, agent37_id, status").in("workspace_id", ids),
    agent37.listAgents().then(
      (r) => new Map(r.data.map((a) => [a.id, a.status])),
      () => new Map<string, string>()
    ),
    resolveEmails(admin, [...new Set(rows.map((w) => w.owner_id))]),
  ]);

  if (membersRes.error) throw new ApiError(500, "db_error", membersRes.error.message);
  if (agentsRes.error) throw new ApiError(500, "db_error", agentsRes.error.message);

  const memberCount = new Map<string, number>();
  // Workspaces the CALLING admin already belongs to - the UI offers "Leave" there instead of
  // "join", so a support session can be closed out from the same card that opened it.
  const mine = new Set<string>();
  for (const m of membersRes.data ?? []) {
    memberCount.set(m.workspace_id, (memberCount.get(m.workspace_id) ?? 0) + 1);
    if (m.user_id === user.id) mine.add(m.workspace_id);
  }

  const agentCount = new Map<string, number>();
  const runningCount = new Map<string, number>();
  for (const a of agentsRes.data ?? []) {
    agentCount.set(a.workspace_id, (agentCount.get(a.workspace_id) ?? 0) + 1);
    const liveStatus = liveRes.get(a.agent37_id) ?? a.status;
    if (liveStatus === "running") {
      runningCount.set(a.workspace_id, (runningCount.get(a.workspace_id) ?? 0) + 1);
    }
  }

  const summaries: AdminWorkspaceSummary[] = rows.map((w) => ({
    id: w.id,
    name: w.name,
    owner_id: w.owner_id,
    owner_email: emails.get(w.owner_id) ?? null,
    created_at: w.created_at,
    member_count: memberCount.get(w.id) ?? 0,
    agent_count: agentCount.get(w.id) ?? 0,
    running_count: runningCount.get(w.id) ?? 0,
    you_are_member: mine.has(w.id),
  }));

  return json({ workspaces: summaries });
});

// POST /api/admin/workspaces { email, name? } — create a new workspace owned by an existing
// user, from the god-view. The seam for standing up a white-glove client by hand: create the
// workspace here, then "Create Apollo Agent" drops a blank OpenClaw box into it, then Open /
// log in to the instance to write the customized files. The owner must already have an account
// (a workspace needs an owner_id); if they don't, they register first.
export const POST = route(async (request: Request) => {
  const { user } = await requirePlatformAdmin();
  const { email, name } = await readJson<{ email?: string; name?: string }>(request);
  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (!cleanEmail) throw new ApiError(400, "invalid_request", "email is required");

  const admin = createAdminClient();
  const ownerId = await findAuthUserIdByEmail(admin, cleanEmail);
  if (!ownerId) {
    throw new ApiError(404, "not_found", `No account found for ${cleanEmail}. The user needs to register first.`);
  }

  const wsName = (name ?? "").trim() || `${cleanEmail}'s Workspace`;
  const { data, error } = await admin
    .from("workspaces")
    // The on_workspace_created trigger adds the owner's admin membership, same as every other
    // workspace-creation path, so the user lands in it on their next login.
    .insert({ name: wsName, owner_id: ownerId })
    .select("id, name, owner_id, created_at")
    .single();
  if (error) throw new ApiError(500, "db_error", error.message);

  await logAudit({
    actorEmail: user.email,
    action: "workspace.created_for_user",
    target: cleanEmail,
    metadata: { workspace_id: data.id, name: wsName },
    request,
  });

  return json({ workspace: data }, 201);
});
