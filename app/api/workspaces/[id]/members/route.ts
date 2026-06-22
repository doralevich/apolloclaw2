import { requireAdmin, requireMember, requireUser } from "@/lib/auth";
import { ApiError, json, route } from "@/lib/http";
import { inviteUrl } from "@/lib/invites";
import type { Invitation, WorkspaceMember } from "@/lib/types";

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

  const { data, error } = await supabase
    .from("invitations")
    .insert({ workspace_id: id, role: "admin", created_by: user.id })
    .select("token")
    .single();
  if (error) throw new ApiError(500, "db_error", error.message);

  return json({ token: data.token, url: inviteUrl(request, data.token) }, 201);
});
