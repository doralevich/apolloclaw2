import { requirePlatformAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { ApiError, json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/admin/workspaces/leave-all — drop every SUPPORT membership in one go.
//
// Each "Open in ApolloClaw" joins the admin to a customer's workspace so the product's
// membership-gated machinery works. Those memberships accumulate: an admin who has helped fifty
// customers is a member of fifty workspaces, which clutters their own workspace list and used to
// leak into which one they landed in. Leaving them one at a time is the chore this replaces.
//
// It only ever removes the CALLER'S OWN membership rows, and never in a workspace they OWN - their
// own workspace(s) are left untouched. Customers' real members are never affected.
export const POST = route(async (request: Request) => {
  const { user } = await requirePlatformAdmin();
  const db = createAdminClient();

  const { data: mems, error: memErr } = await db
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", user.id);
  if (memErr) throw new ApiError(500, "db_error", memErr.message);

  const ids = (mems ?? []).map((m) => m.workspace_id as string);
  if (ids.length === 0) return json({ left: [] as string[], count: 0 });

  // Of the workspaces I'm a member of, the ones I do NOT own are the support memberships.
  const { data: ws, error: wsErr } = await db
    .from("workspaces")
    .select("id, name, owner_id")
    .in("id", ids);
  if (wsErr) throw new ApiError(500, "db_error", wsErr.message);

  const toLeave = (ws ?? []).filter((w) => w.owner_id !== user.id);

  const left: string[] = [];
  for (const w of toLeave) {
    const { error } = await db
      .from("memberships")
      .delete()
      .eq("workspace_id", w.id as string)
      .eq("user_id", user.id);
    if (error) {
      // Best-effort: one failed row shouldn't strand the rest. It stays a membership and the next
      // run picks it up.
      console.error("[admin:leave-all] failed to leave", w.id, error.message);
      continue;
    }
    left.push((w.name as string) ?? (w.id as string));
    await logAudit({
      actorEmail: user.email,
      action: "workspace.left",
      target: w.id as string,
      metadata: { via: "bulk cleanup", workspace_name: w.name },
      request,
    });
  }

  return json({ left, count: left.length });
});
