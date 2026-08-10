import { agent37 } from "@/lib/agent37";
import { requirePlatformAdmin } from "@/lib/admin";
import { ApiError, json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminAgentOverview } from "@/lib/types";

// GET /api/admin/agents — every agent on the platform, database and Agent37 compared.
//
// The workspace view answers "what does this customer have"; this answers "what EXISTS", which
// is a different question whenever the two systems disagree. They disagree in both directions
// and both have burned real time:
//
//   GHOST - a database row whose instance is gone (deleted in the Agent37 dashboard by hand).
//   The app shows a running agent; every action on it answers "Instance not found".
//
//   ORPHAN - an instance with no database row (row swept, VPS delete missed). Invisible in the
//   product, still billing as hosting.
//
// Each row states which of the three cases it is, so the cleanup that used to take a SQL
// session and an Agent37 dashboard side-by-side is one glance and one button.

/** owner_id -> email for just the ids we need, via the paged auth admin API. */
async function resolveEmails(
  db: ReturnType<typeof createAdminClient>,
  ids: (string | null)[]
): Promise<Map<string, string>> {
  const want = new Set(ids.filter(Boolean) as string[]);
  const map = new Map<string, string>();
  for (let page = 1; page <= 50 && map.size < want.size; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
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
  await requirePlatformAdmin();
  const db = createAdminClient();

  const [agentsRes, wsRes, live] = await Promise.all([
    db.from("agents").select("agent37_id, workspace_id, name, status, agent_type, owner_id, created_at"),
    db.from("workspaces").select("id, name"),
    // Live truth, or null when Agent37 is unreachable - in which case presence can't be judged
    // and every row is reported as such rather than guessed at.
    agent37.listAgents().then(
      (r) => new Map(r.data.map((a) => [a.id, a])),
      () => null
    ),
  ]);
  if (agentsRes.error) throw new ApiError(500, "db_error", agentsRes.error.message);
  if (wsRes.error) throw new ApiError(500, "db_error", wsRes.error.message);

  const wsName = new Map((wsRes.data ?? []).map((w) => [w.id as string, w.name as string]));
  const emails = await resolveEmails(db, (agentsRes.data ?? []).map((a) => a.owner_id));

  const rows: AdminAgentOverview[] = (agentsRes.data ?? []).map((a) => {
    const instance = live?.get(a.agent37_id) ?? null;
    return {
      agent37_id: a.agent37_id as string,
      name: (a.name as string | null) ?? instance?.name ?? null,
      presence: live === null ? "unknown" : instance ? "ok" : "ghost",
      live_status: instance?.status ?? null,
      db_status: (a.status as string | null) ?? null,
      workspace_id: a.workspace_id as string,
      workspace_name: wsName.get(a.workspace_id) ?? a.workspace_id,
      owner_email: emails.get(a.owner_id as string) ?? null,
      agent_type: (a.agent_type as string | null) ?? null,
      created_at: a.created_at as string,
    };
  });

  if (live) {
    const known = new Set(rows.map((r) => r.agent37_id));
    for (const instance of live.values()) {
      if (known.has(instance.id)) continue;
      rows.push({
        agent37_id: instance.id,
        name: instance.name,
        presence: "orphan",
        live_status: instance.status,
        db_status: null,
        workspace_id: null,
        workspace_name: null,
        owner_email: null,
        agent_type: null,
        // Agent37 timestamps are epoch numbers of undocumented resolution; >1e12 means ms.
        created_at: instance.created
          ? new Date(instance.created > 1e12 ? instance.created : instance.created * 1000).toISOString()
          : null,
      });
    }
  }

  rows.sort((a, b) => ((a.created_at ?? "") < (b.created_at ?? "") ? 1 : -1));
  return json({ agents: rows, live_checked: live !== null });
});
