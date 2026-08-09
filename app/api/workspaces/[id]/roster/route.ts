import { requireAdmin, requireUser } from "@/lib/auth";
import { json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/workspaces/{id}/roster — every agent in the workspace, with WHO each one belongs to.
//
// The agent-list endpoints the dashboard already had answer "what agents exist"; an admin
// running a team needs "whose is each one, by name" — David's ask, with first and last name
// called out specifically. The names live in auth metadata, which only the service role can
// read, which is why this is its own admin-gated route rather than three more columns on the
// member-visible list.
//
// Also carries whether each agent's questionnaire has been answered, because that is the
// admin's actual question about a seat they bought: did the person I gave this to ever set it
// up, or is it running generic.

interface RosterPerson {
  first_name: string;
  last_name: string;
  email: string;
}

export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  await requireAdmin(supabase, id, user.id);

  const db = createAdminClient();

  const { data: agents, error } = await db
    .from("agents")
    .select("agent37_id, name, avatar_url, owner_id, created_by, status, created_at")
    .eq("workspace_id", id)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  // Which agents have answered questionnaires. A legacy row with no agent id predates seats
  // and can only belong to the workspace's original (oldest) agent, so it counts for that one.
  const { data: setups } = await db
    .from("agent_setup")
    .select("agent37_id")
    .eq("workspace_id", id);
  const setupDone = new Set((setups ?? []).map((r) => r.agent37_id).filter(Boolean));
  const hasLegacySetup = (setups ?? []).some((r) => !r.agent37_id);

  // One lookup per distinct person, not per agent — the admin who bought three seats is the
  // created_by on all three.
  const personIds = [
    ...new Set((agents ?? []).flatMap((a) => [a.owner_id, a.created_by]).filter(Boolean)),
  ] as string[];
  const people = new Map<string, RosterPerson>();
  for (const uid of personIds) {
    const { data } = await db.auth.admin.getUserById(uid);
    const u = data.user;
    if (!u) continue;
    const meta = (u.user_metadata ?? {}) as {
      first_name?: string;
      last_name?: string;
      full_name?: string;
      name?: string;
    };
    const full = String(meta.full_name || meta.name || "").trim();
    people.set(uid, {
      first_name: meta.first_name || full.split(/\s+/)[0] || "",
      last_name: meta.last_name || full.split(/\s+/).slice(1).join(" ") || "",
      email: u.email ?? "",
    });
  }

  return json({
    agents: (agents ?? []).map((a, i) => ({
      agent37_id: a.agent37_id,
      name: a.name,
      avatar_url: a.avatar_url,
      status: a.status,
      created_at: a.created_at,
      // owner_id is who it is FOR; created_by is who pressed the button. A null owner is a
      // workspace-wide agent from before seats, which belongs to whoever created it.
      owner: people.get((a.owner_id ?? a.created_by) as string) ?? null,
      setup_complete: setupDone.has(a.agent37_id) || (i === 0 && hasLegacySetup),
    })),
  });
});
