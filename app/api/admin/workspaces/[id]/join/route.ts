import { requirePlatformAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { ApiError, json, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/workspaces/{id}/join — support access to a customer's workspace.
//
// The god-view can already open an instance's OpenClaw Control UI, but "help the client with
// their setup" happens in the ApolloClaw dashboard: the checklist, integrations, channels,
// skills. All of that machinery is membership-gated on purpose, so instead of building a
// parallel admin copy of the whole dashboard, the admin becomes a real admin MEMBER of the
// workspace - one row in memberships - and the ordinary product does the rest. The customer
// can see the membership on their Members page, which for white-glove service is a feature,
// not a leak: they know who was in their workspace.
//
// Idempotent (an existing membership is left as-is), audit-logged, and reversed by DELETE
// below when the support session is done.
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  const db = createAdminClient();

  const { data: ws } = await db.from("workspaces").select("id, name").eq("id", id).maybeSingle();
  if (!ws) throw new ApiError(404, "not_found", "No such workspace.");

  const { data: existing } = await db
    .from("memberships")
    .select("role")
    .eq("workspace_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    const { error } = await db
      .from("memberships")
      .insert({ workspace_id: id, user_id: user.id, role: "admin" });
    if (error) throw new ApiError(500, "db_error", error.message);
    await logAudit({
      actorEmail: user.email,
      action: "workspace.joined",
      target: id,
      metadata: { workspace_name: ws.name },
      request,
    });
  }

  return json({ workspace_id: id, joined: !existing, role: existing?.role ?? "admin" });
});

// DELETE — leave the workspace once the support session is over. Only removes the caller's
// own membership; a customer's real members can't be touched from here.
export const DELETE = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  const db = createAdminClient();

  const { error } = await db
    .from("memberships")
    .delete()
    .eq("workspace_id", id)
    .eq("user_id", user.id);
  if (error) throw new ApiError(500, "db_error", error.message);

  await logAudit({ actorEmail: user.email, action: "workspace.left", target: id, request });
  return json({ workspace_id: id, left: true });
});
