import { getWorkspaceOwner, requireAdmin, requireUser } from "@/lib/auth";
import { ApiError, json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string; userId: string }> };

export const DELETE = route(async (_request: Request, { params }: Ctx) => {
  const { id, userId } = await params;
  const { supabase, user } = await requireUser();

  if (userId !== user.id) {
    await requireAdmin(supabase, id, user.id);
  }
  if ((await getWorkspaceOwner(supabase, id)) === userId) {
    throw new ApiError(400, "invalid_request", "The workspace owner cannot be removed");
  }

  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("workspace_id", id)
    .eq("user_id", userId);
  if (error) throw new ApiError(500, "db_error", error.message);

  return json({ user_id: userId, removed: true });
});
