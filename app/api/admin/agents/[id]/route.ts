import { after } from "next/server";
import { agent37, Agent37Error } from "@/lib/agent37";
import { requirePlatformAdmin } from "@/lib/admin";
import { purgeAgent, softDeleteAgent } from "@/lib/agent-lifecycle";
import { logAudit } from "@/lib/audit";
import { changeHostingSeats } from "@/lib/hosting-seats";
import { json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/admin/agents/{id} — remove an agent wherever it exists.
//
// Three cases from the overview, and delete now means different things for each:
//
//   HEALTHY / GHOST (a database row that is not yet in the trash) → SOFT-delete. Same safety net
//   as the customer delete: stop the instance, stamp the row, keep it restorable until the purge
//   window passes. A platform admin removing a customer's agent must be as reversible as the
//   customer doing it - that reversibility is the whole point of this change.
//
//   ALREADY TRASHED (deleted_at set) → PURGE now. The admin has looked at a soft-deleted agent
//   and chosen to skip the wait: destroy the VPS and the rows for good.
//
//   ORPHAN (an Agent37 instance with no row) → hard-delete the instance. There is nothing to
//   retain and nothing to restore; this is pure cleanup of a box the product can't see.
//
// Seat handling mirrors the customer delete: credit one hosting seat on soft-delete when the
// workspace still has a live agent, skip it when this was the last (delete-and-rebuild keeps the
// seat). Purge does NOT touch seats - they were already settled when the agent was soft-deleted.
export const DELETE = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  const db = createAdminClient();

  const { data: row } = await db
    .from("agents")
    .select("workspace_id, deleted_at")
    .eq("agent37_id", id)
    .maybeSingle();

  // ORPHAN — no row anywhere; just clean up the instance.
  if (!row) {
    let vps_deleted = false;
    try {
      await agent37.deleteAgent(id);
      vps_deleted = true;
    } catch (e) {
      if (!(e instanceof Agent37Error && e.status === 404)) throw e;
    }
    await logAudit({
      actorEmail: user.email,
      action: "agent.purged",
      target: id,
      metadata: { vps_deleted, db_deleted: false, orphan: true },
      request,
    });
    return json({ id, mode: "purged", vps_deleted, db_deleted: false });
  }

  // ALREADY TRASHED — admin chose to purge now, skipping the retention window.
  if (row.deleted_at) {
    const { vpsDeleted } = await purgeAgent(db, id, {
      actorEmail: user.email,
      request,
      reason: "admin purge (skipped retention)",
    });
    return json({ id, mode: "purged", vps_deleted: vpsDeleted, db_deleted: true });
  }

  // HEALTHY / GHOST — soft-delete with the retention window.
  const { purgeAfter } = await softDeleteAgent(db, id, {
    workspaceId: row.workspace_id,
    deletedBy: user.id,
    actorEmail: user.email,
    request,
  });

  // Credit one hosting seat if a live agent remains (the just-trashed one now reads deleted_at,
  // so this count excludes it). Best-effort, after the response.
  const { count } = await db
    .from("agents")
    .select("agent37_id", { count: "exact", head: true })
    .eq("workspace_id", row.workspace_id)
    .is("deleted_at", null);
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

  return json({ id, mode: "soft_deleted", purge_after: purgeAfter });
});
