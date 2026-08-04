import { requireAdmin, requireMember, requireUser } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { inviteUrl } from "@/lib/invites";
import type { Invitation, Role, WorkspaceMember } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const role = await requireMember(supabase, id, user.id);

  const { data: members, error } = await supabase.rpc("get_workspace_members", { p_workspace: id });
  if (error) throw new ApiError(500, "db_error", error.message);

  let invitations: Invitation[] = [];
  if (role === "admin") {
    const { data: inv } = await supabase
      .from("invitations")
      .select("*")
      .eq("workspace_id", id)
      .order("created_at", { ascending: false });
    invitations = ((inv as Omit<Invitation, "url">[]) ?? []).map((i) => ({
      ...i,
      url: inviteUrl(request, i.token),
    }));
  }

  return json({ members: (members as WorkspaceMember[]) ?? [], invitations, role });
});

export const POST = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  await requireAdmin(supabase, id, user.id);

  // Defaults to member, not admin. This used to be hardcoded to admin, so inviting anyone
  // handed them the workspace — they could rename it, delete it, buy credits and remove the
  // person who invited them. If a caller omits the field the safe reading of "add this
  // person" is the smaller grant; handing over control should take saying so.
  const body = await readJson<{ role?: string }>(request).catch(() => ({}) as { role?: string });
  const role: Role = body.role === "admin" ? "admin" : "member";

  const { data, error } = await supabase
    .from("invitations")
    .insert({ workspace_id: id, role, created_by: user.id })
    .select("token")
    .single();
  if (error) throw new ApiError(500, "db_error", error.message);

  return json({ token: data.token, role, url: inviteUrl(request, data.token) }, 201);
});
