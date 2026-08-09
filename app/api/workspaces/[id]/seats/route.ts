import { after } from "next/server";
import { requireAdmin, requireEntitled, requireUser } from "@/lib/auth";
import { sendMandrillEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/onboardingSections";
import { publicSiteOrigin } from "@/lib/site-url";
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
    /**
     * The admin's own words for the invitation email, from the compose step in AddAgentButton.
     * Optional - absent (the Members checkbox path) the stock subject and body send. The accept
     * button is appended server-side either way, so an admin editing the text can never edit
     * away the one link the email exists to deliver.
     */
    invite_subject?: string;
    invite_body?: string;
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
  const type = licenseAgentType();
  let agentId: string;
  try {
    const agent = await provisionTypedAgent({
      type,
      workspaceId: id,
      // created_by is the admin who paid; owner_id below is who it is FOR. They are different
      // people here, which is the entire point of a seat.
      userId: user.id,
      name: body.name?.trim() || undefined,
      allowTemplateFallback: true,
      // A workspace holding two agents of the same type IS a seat — the office manager's and
      // the founder's. The per-type cap predates this endpoint and made every seat purchase
      // into an existing workspace fail on a 409, after the card was charged. See
      // ProvisionInput.allowMultiple for why the cap stays on everywhere else.
      allowMultiple: true,
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

    // The email David noticed was missing. Every OTHER way an agent comes to exist sends one -
    // the Stripe webhook mails licence buyers and agent buyers - but a seat is billed as a
    // quantity change, no checkout session ever completes, so no webhook fires and this path
    // was silent. The person who just added an agent got a toast that vanished and an invoice
    // later, with nothing in between.
    //
    // After the response, best effort: the agent exists and is billed either way, and a mail
    // failure must not turn a successful build into an error screen.
    const setupUrl = `${publicSiteOrigin()}/onboard/${encodeURIComponent(type.id)}?ws=${encodeURIComponent(id)}&agent=${encodeURIComponent(agentId)}`;
    after(async () => {
      try {
        await sendMandrillEmail({
          to: email,
          subject: "Your new agent is building",
          html:
            `<div style="font-family:sans-serif;color:#0B1729;font-size:15px;line-height:1.7">` +
            `<h2 style="color:#0B1729">Your new agent is on its way.</h2>` +
            `<p>It has been created and is building now. Hosting for it was added to your ` +
            `subscription - one line, pro-rated from today.</p>` +
            `<p>Its setup questions are what turn it from a general assistant into yours: how ` +
            `this work is different, who it deals with, what it should take off your plate.</p>` +
            `<p><a href="${setupUrl}" style="display:inline-block;background:#D72B2B;color:#fff;font-weight:700;padding:14px 30px;border-radius:6px;text-decoration:none">Set up your new agent</a></p>` +
            `<p style="color:#6b7280;font-size:13px">This link keeps working - come back to it whenever suits.</p>` +
            `</div>`,
        });
      } catch (err) {
        console.error("[seats] welcome email failed:", email, err);
      }
    });

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

  // Mail the invitation. The URL is still returned below - the admin watching the dialog can
  // copy it into Slack - but "the invitee finds out" must not depend on the admin remembering
  // to do that: their agent is already built and waiting, and an invitation nobody delivers is
  // a seat being billed for an empty chair.
  const acceptUrl = inviteUrl(request, invite.token);
  const inviterName = ((user.user_metadata ?? {}) as { first_name?: string }).first_name || user.email || "A colleague";

  // The admin's words when they wrote some, ours when they did not. Custom body is plain text
  // from a textarea: escaped, then line breaks honoured - never interpreted as HTML, so nothing
  // an admin pastes can inject markup into mail we sign.
  const customSubject = (body.invite_subject ?? "").trim().slice(0, 200);
  const customBody = (body.invite_body ?? "").trim().slice(0, 5000);
  const bodyHtml = customBody
    ? `<p>${escapeHtml(customBody).replace(/\n/g, "<br />")}</p>`
    : `<h2 style="color:#0B1729">${escapeHtml(inviterName)} set up an AI agent for you.</h2>` +
      `<p>It is already built and running. Accept the invitation, choose a password, and ` +
      `it is yours - a short questionnaire personalises it to how you work.</p>`;
  after(async () => {
    try {
      await sendMandrillEmail({
        to: email,
        subject: customSubject || "An AI agent is waiting for you",
        html:
          `<div style="font-family:sans-serif;color:#0B1729;font-size:15px;line-height:1.7">` +
          bodyHtml +
          `<p><a href="${acceptUrl}" style="display:inline-block;background:#D72B2B;color:#fff;font-weight:700;padding:14px 30px;border-radius:6px;text-decoration:none">Accept your invitation</a></p>` +
          `<p style="color:#6b7280;font-size:13px">If you were not expecting this, you can ignore this email.</p>` +
          `</div>`,
      });
    } catch (err) {
      console.error("[seats] invite email failed:", email, err);
    }
  });

  return json(
    { agent_id: agentId, seats, email, invited: true, url: acceptUrl },
    201
  );
});
