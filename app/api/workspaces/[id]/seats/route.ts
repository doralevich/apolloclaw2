import { requireAdmin, requireEntitled, requireUser } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { changeHostingSeats, hostingSeatCount } from "@/lib/hosting-seats";
import { inviteUrl } from "@/lib/invites";
import { licenseAgentType } from "@/config/agent-types";
import { provisionTypedAgent } from "@/lib/provision";
import { domainVerdict, emailDomain } from "@/lib/seats";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/workspaces/{id}/seats — add an agent for someone in the office.
//
// The one endpoint in this codebase that both charges a card and creates a VPS in the same
// request, so the ordering below is the design rather than an implementation detail.
//
// WHY THE ADMIN, AND NOT THE INVITEE. The agent is provisioned HERE, when the person paying
// asks for it — not when the invitation is accepted. Provisioning on accept would mean a
// mistyped address that happens to be a real mailbox mints a VPS and a monthly charge, and the
// admin would find out on the invoice. It also means the seat is ready before the colleague
// ever signs in, which is the experience you want: they accept, and their agent is already
// there.
//
// ORDER: bill, then build. Stripe first because a declined card must not leave a running
// instance nobody is paying for, and because the reverse failure — charged, no agent — is
// recoverable by hand while the other is a silent monthly leak. If provisioning fails after the
// charge lands, the quantity is rolled back before the error is returned.

export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  await requireAdmin(supabase, id, user.id);

  // What they are paying for now, so the dialog can state the change rather than spring it.
  // null means no Stripe subscription at all — a white-glove customer set up by hand.
  return json({ seats: await hostingSeatCount(id) });
});

export const POST = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  await requireAdmin(supabase, id, user.id);
  await requireEntitled(supabase);

  const body = await readJson<{
    email?: string;
    name?: string;
    allow_external?: boolean;
    /**
     * Deliberately adding ANOTHER agent for someone who already has one.
     *
     * The duplicate guard below exists to stop an admin double-charging for a colleague by
     * pressing twice, which is an accident. "A second agent for myself" is the same request
     * made on purpose, and the two are indistinguishable at this layer - so the caller says
     * which it is, and only the Add-another button on Settings > My Agent sets this.
     */
    additional?: boolean;
  }>(request);
  const email = (typeof body.email === "string" ? body.email : "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "invalid_request", "A valid email address is required.");
  }

  // Same confirm-don't-refuse rule as the plain invitation. See lib/seats.ts.
  if (!body.allow_external && domainVerdict(user.email ?? "", email) === "different") {
    throw new ApiError(
      409,
      "external_domain",
      `${email} is outside ${emailDomain(user.email ?? "")}. Confirm if you meant to add a seat for someone at another company.`
    );
  }

  const db = createAdminClient();

  // Already a member with an agent of their own? Adding a second would charge for a seat they
  // already have, and this endpoint is one press away from doing that twice.
  const { data: existingMember } = await db.rpc("get_workspace_members", { p_workspace: id });
  const member = (existingMember as Array<{ user_id: string; email: string }> | null)?.find(
    (m) => m.email?.trim().toLowerCase() === email
  );
  if (member && !body.additional) {
    const { data: owned } = await db
      .from("agents")
      .select("agent37_id")
      .eq("workspace_id", id)
      .eq("owner_id", member.user_id)
      .limit(1)
      .maybeSingle();
    if (owned) {
      throw new ApiError(409, "seat_exists", `${email} already has an agent in this workspace.`);
    }
  }

  // ── 1. Bill ────────────────────────────────────────────────────────────────
  // null means there is no subscription to add to. Refused rather than quietly provisioning a
  // free agent: an instance nobody is billed for is a leak that only shows up as an infra
  // invoice months later.
  const seats = await changeHostingSeats(id, +1);
  if (seats === null) {
    throw new ApiError(
      409,
      "no_subscription",
      "This workspace has no hosting subscription to add a seat to. Talk to us and we'll set it up."
    );
  }

  // ── 2. Build ───────────────────────────────────────────────────────────────
  let agentId: string;
  try {
    const type = licenseAgentType();
    const agent = await provisionTypedAgent({
      type,
      workspaceId: id,
      // created_by is the admin who paid; owner_id below is who it is FOR. They are different
      // people here, which is the entire point of a seat.
      userId: user.id,
      name: body.name?.trim() || undefined,
      allowTemplateFallback: true,
      // No answers to write yet — the colleague fills in their own questionnaire on first
      // sign-in, and that is what personalises this instance.
      callerWritesContext: true,
    });
    agentId = agent.id;
  } catch (err) {
    // Charged but not built. Give the money back before surfacing the failure, so a retry does
    // not stack a second seat onto the bill.
    await changeHostingSeats(id, -1).catch((rollbackErr) => {
      console.error("[seats] rollback failed - workspace is billed for an unbuilt seat:", id, rollbackErr);
    });
    throw err;
  }

  // ── 3. Hand it to them ─────────────────────────────────────────────────────
  // The agent belongs to the colleague from the moment it exists. If they are already a member
  // we can name them; if not, the invitation carries the address and accept_invitation binds
  // the membership, with claimSeatFor() below attaching the agent on first sign-in.
  if (member) {
    await db.from("agents").update({ owner_id: member.user_id }).eq("agent37_id", agentId);
    return json({ agent_id: agentId, seats, email, invited: false }, 201);
  }

  const { data: invite, error } = await supabase
    .from("invitations")
    .insert({ workspace_id: id, role: "member", created_by: user.id, email, with_agent: true })
    .select("token")
    .single();
  if (error) throw new ApiError(500, "db_error", error.message);

  // Until they accept, the agent belongs to the ADMIN who paid for it.
  //
  // Not null. A null owner means "workspace-wide, predates seats", which every member can see —
  // so leaving it null while waiting would show the unclaimed agent to the whole office. The
  // admin already sees every agent in their workspace, so parking it on them adds no access and
  // keeps the invariant "an agent created under seats always has an owner".
  //
  // claimSeat() in lib/seats.ts hands it over on accept.
  await db.from("agents").update({ owner_id: user.id }).eq("agent37_id", agentId);

  return json(
    { agent_id: agentId, seats, email, invited: true, url: inviteUrl(request, invite.token) },
    201
  );
});
