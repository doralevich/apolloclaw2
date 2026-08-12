import { requireAdmin, requireMember, requireUser } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { inviteUrl } from "@/lib/invites";
import { domainVerdict, emailDomain } from "@/lib/seats";
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
  const body = await readJson<{
    role?: string;
    email?: string;
    /** Give this person an agent of their own. Costs money — see below. */
    with_agent?: boolean;
  }>(request).catch(() => ({}) as Record<string, never>);
  const role: Role = body.role === "admin" ? "admin" : "member";

  // Optional, so the old copy-a-link invitation still works. Supplied, it has to be real: this
  // address decides who the seat is for and, once provisioning is wired up, what a mistyped
  // one would cost.
  const email = (typeof body.email === "string" ? body.email : "").trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "invalid_request", "That doesn't look like an email address.");
  }

  // External domains are BLOCKED - David's call. An outside address on an invitation is a typo
  // far more often than a deliberate cross-company invite; the rare genuine case is handled by
  // hand rather than waved through here.
  //
  // "different" only - a public-mailbox address on either side is "unverifiable", not external,
  // and blocking those would lock out any admin whose own address is gmail.com. See lib/seats.ts.
  if (email && domainVerdict(user.email ?? "", email) === "different") {
    throw new ApiError(
      403,
      "external_domain",
      `${email} is outside ${emailDomain(user.email ?? "")}. You can only invite people from your own company.`
    );
  }

  // with_agent is recorded here, on the ADMIN's request, and never read from the invitee at
  // accept time. Provisioning spends real money on a VPS and its credit, so the person paying
  // is the only one who gets to ask for it.
  const withAgent = body.with_agent === true;

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      workspace_id: id,
      role,
      created_by: user.id,
      ...(email ? { email } : {}),
      with_agent: withAgent,
    })
    .select("token")
    .single();
  if (error) throw new ApiError(500, "db_error", error.message);

  return json(
    { token: data.token, role, email: email || null, with_agent: withAgent, url: inviteUrl(request, data.token) },
    201
  );
});
