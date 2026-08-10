import { after } from "next/server";
import { agent37, Agent37Error } from "@/lib/agent37";
import { requirePlatformAdmin } from "@/lib/admin";
import { purgeAgentRows } from "@/lib/admin-teardown";
import { logAudit } from "@/lib/audit";
import { changeHostingSeats } from "@/lib/hosting-seats";
import { json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/admin/agents/{id} — remove an agent wherever it exists.
//
// The customer-facing delete (/api/agents/[id]) requires workspace-admin membership, which a
// platform admin usually isn't; and it assumes both halves exist. This one is built for the
// overview's three cases and treats each half as optional: the instance is deleted if Agent37
// still has it (a 404 is success - a GHOST's instance is already gone), the database rows are
// purged if any exist (an ORPHAN has none). So the same button cleans up a healthy agent, a
// ghost row, or an orphan VPS.
//
// Seat handling mirrors the customer delete exactly: credit one hosting seat when the
// workspace still has an agent left, skip it when this was the last (delete-and-rebuild keeps
// the seat), best-effort and after the response so Stripe can never resurrect a deleted agent.
export const DELETE = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;

  let vps_deleted = false;
  try {
    await agent37.deleteAgent(id);
    vps_deleted = true;
  } catch (e) {
    if (!(e instanceof Agent37Error && e.status === 404)) throw e;
  }

  const db = createAdminClient();
  const { data: row } = await db
    .from("agents")
    .select("workspace_id")
    .eq("agent37_id", id)
    .maybeSingle();

  let db_deleted = false;
  if (row) {
    await purgeAgentRows(db, id);
    db_deleted = true;

    const { count } = await db
      .from("agents")
      .select("agent37_id", { count: "exact", head: true })
      .eq("workspace_id", row.workspace_id);
    if ((count ?? 0) >= 1) {
      after(async () => {
        try {
          const seats = await changeHostingSeats(row.workspace_id, -1);
          console.log("[admin:agents:delete] hosting seat credited", row.workspace_id, "->", seats);
        } catch (err) {
          console.error("[admin:agents:delete] seat credit FAILED:", row.workspace_id, err);
        }
      });
    }
  }

  await logAudit({
    actorEmail: user.email,
    action: "agent.deleted",
    target: id,
    metadata: { vps_deleted, db_deleted, workspace_id: row?.workspace_id ?? null },
    request,
  });

  return json({ id, vps_deleted, db_deleted });
});
