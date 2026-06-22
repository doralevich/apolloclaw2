import { requireAdmin, requireUser } from "@/lib/auth";
import { ApiError, json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string; token: string }> };

export const DELETE = route(async (_request: Request, { params }: Ctx) => {
  const { id, token } = await params;
  const { supabase, user } = await requireUser();
  await requireAdmin(supabase, id, user.id);

  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("token", token)
    .eq("workspace_id", id);
  if (error) throw new ApiError(500, "db_error", error.message);

  return json({ token, deleted: true });
});
