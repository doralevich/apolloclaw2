import { getWorkspaceOwner, requireAdmin, requireUser } from "@/lib/auth";
import { agent37 } from "@/lib/agent37";
import { ApiError, json, readJson, route } from "@/lib/http";
import type { Workspace } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  await requireAdmin(supabase, id, user.id);

  // Rename only. The logo upload this also accepted is retired (the rail always shows the
  // ApolloClaw mark now, per David), so the write surface shrinks to match: nothing accepts
  // an image here any more, and stored logo_url values are simply never read.
  const body = await readJson<{ name?: string }>(request);
  const update: { name?: string } = {};

  if (body.name !== undefined) {
    const trimmed = body.name.trim();
    if (!trimmed) throw new ApiError(400, "invalid_request", "Workspace name is required");
    update.name = trimmed.slice(0, 120);
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "invalid_request", "Nothing to update");
  }

  const { data, error } = await supabase
    .from("workspaces")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new ApiError(500, "db_error", error.message);

  return json({ workspace: data as Workspace });
});

export const DELETE = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const owner = await getWorkspaceOwner(supabase, id);
  if (!owner) throw new ApiError(404, "not_found", "Workspace not found");
  if (owner !== user.id) throw new ApiError(403, "forbidden", "Only the owner can delete a workspace");

  // Tear down the workspace's Agent37 agents first so none are orphaned. Concurrent —
  // each delete is independent and per-agent failures are logged, never fatal.
  const { data: rows } = await supabase.from("agents").select("agent37_id").eq("workspace_id", id);
  await Promise.allSettled(
    (rows ?? []).map((row) =>
      agent37
        .deleteAgent(row.agent37_id as string)
        .catch((err) => console.error("[workspace-delete:orphaned-agent]", row.agent37_id, err))
    )
  );

  const { error } = await supabase.from("workspaces").delete().eq("id", id);
  if (error) throw new ApiError(500, "db_error", error.message);

  return json({ id, deleted: true });
});
