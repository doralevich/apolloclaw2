import { after } from "next/server";
import { requireAdmin, requireEntitled, requireUser } from "@/lib/auth";
import { sendMandrillEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/onboardingSections";
import { publicSiteOrigin } from "@/lib/site-url";
import { ApiError, json, readJson, route } from "@/lib/http";
import {
  changeHostingSeats,
  discardStagedAgentFee,
  hostingSeatCount,
  reverseAgentFee,
  stageAgentFee,
} from "@/lib/hosting-seats";
import { inviteUrl } from "@/lib/invites";
import { licenseAgentType } from "@/config/agent-types";
import { provisionTypedAgent } from "@/lib/provision";
import { domainVerdict, emailDomain } from "@/lib/seats";
import { getStripe } from "@/lib/stripe/client";
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
    /**
     * A promotion code the admin typed, applied to the one-time additional-agent fee. Optional.
     * Empty or absent means full price. Validated against Stripe below before any card is
     * touched, so a mistyped code stops the add rather than being silently ignored.
     */
    coupon?: string;
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

  // External domains are BLOCKED - David's call. This endpoint charges the workspace's card and
  // builds a VPS the instant it is pressed, and an address at another company is a mistyped one
  // far more often than an agency deliberately provisioning for a client. Refuse it outright
  // rather than charging on a confirm; the rare genuine cross-company case is handled by hand.
  //
  // "different" only - a public-mailbox address on either side is "unverifiable", not external,
  // and blocking those would lock out any admin whose own address is gmail.com. See lib/seats.ts.
  if (domainVerdict(user.email ?? "", email) === "different") {
    throw new ApiError(
      403,
      "external_domain",
      `${email} is outside ${emailDomain(user.email ?? "")}. Agents can only be added for people at your own company.`
    );
  }

  const db = createAdminClient();

  // Resolve the coupon BEFORE anything bills, so a bad code fails the add cleanly. A promotion
  // code is what the admin types; it wraps the coupon that actually carries the discount.
  let couponId: string | undefined;
  let couponPromoId: string | undefined;
  const couponCode = (typeof body.coupon === "string" ? body.coupon : "").trim();
  if (couponCode) {
    const { data: promos } = await getStripe().promotionCodes.list({
      code: couponCode,
      active: true,
      limit: 1,
    });
    // active:true already filters to codes whose coupon is still valid; the coupon rides on the
    // promotion, expanded or as a bare id depending on the API's mood, so handle both.
    const promo = promos[0];
    const coup = promo?.promotion.coupon;
    couponId = typeof coup === "string" ? coup : coup?.id;
    if (!promo || !couponId) {
      throw new ApiError(400, "invalid_coupon", `The coupon code "${couponCode}" isn't valid.`);
    }
    couponPromoId = promo.id;

    // Redemption cap. We compute this discount ourselves rather than letting Stripe apply it (so
    // the fee reverses to the penny if the build fails), which means Stripe never counts a
    // dashboard use. So the cap is checked against BOTH counts: Stripe's times_redeemed (the
    // public-checkout uses Stripe does apply) plus our own ledger of dashboard uses. A shared
    // code is capped across both surfaces; a dashboard-only code by the ledger alone.
    if (promo.max_redemptions != null) {
      const { count, error: countErr } = await db
        .from("coupon_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("promotion_code_id", promo.id);
      // Fail CLOSED on a count error - a cap we cannot verify is a cap we must not overrun. The
      // add is refused, not silently uncapped.
      if (countErr) {
        throw new ApiError(503, "coupon_check_failed", "Could not verify the coupon right now. Try again in a moment.");
      }
      const used = (promo.times_redeemed ?? 0) + (count ?? 0);
      if (used >= promo.max_redemptions) {
        throw new ApiError(409, "coupon_exhausted", `The coupon code "${couponCode}" has been fully redeemed.`);
      }
    }
  }

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
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();
    if (owned) {
      throw new ApiError(409, "seat_exists", `${email} already has an agent in this workspace.`);
    }
  }

  // ── 1. Bill ────────────────────────────────────────────────────────────────
  // Two lines, one invoice: the one-time additional-agent fee (David's call - the Basic
  // license price, $449) is staged as a pending invoice item FIRST, so the always_invoice run
  // that bills the pro-rated seat sweeps it onto the same invoice. null means there is no
  // subscription to add to. Refused rather than quietly provisioning a free agent: an instance
  // nobody is billed for is a leak that only shows up as an infra invoice months later.
  const fee = await stageAgentFee(id, couponId);
  if (fee === null) {
    throw new ApiError(
      409,
      "no_subscription",
      "This workspace has no hosting subscription to add a seat to. Talk to us and we'll set it up."
    );
  }

  let seats: number | null;
  try {
    seats = await changeHostingSeats(id, +1);
  } catch (err) {
    // The fee is still pending - nothing has been invoiced - so it can simply be discarded.
    await discardStagedAgentFee(fee).catch((cleanupErr) => {
      console.error("[seats] discarding staged agent fee failed - it will bill on the next invoice:", id, cleanupErr);
    });
    throw err;
  }
  if (seats === null) {
    // The subscription vanished between the two lookups - cancelled mid-request. Clean up.
    await discardStagedAgentFee(fee).catch((cleanupErr) => {
      console.error("[seats] discarding staged agent fee failed - it will bill on the next invoice:", id, cleanupErr);
    });
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
      // sign-in, and that is what personalizes this instance.
      callerWritesContext: true,
    });
    agentId = agent.id;
  } catch (err) {
    // Charged but not built. Give the money back before surfacing the failure, so a retry does
    // not stack a second seat onto the bill. Both lines: the seat quantity comes back down
    // (a proration credit), and the one-time fee - already swept onto the paid invoice by the
    // seat change - is offset by a matching credit on the next invoice.
    await changeHostingSeats(id, -1).catch((rollbackErr) => {
      console.error("[seats] rollback failed - workspace is billed for an unbuilt seat:", id, rollbackErr);
    });
    await reverseAgentFee(id, fee.amountCents).catch((rollbackErr) => {
      console.error("[seats] agent fee reversal failed - workspace is billed for an unbuilt agent:", id, rollbackErr);
    });
    throw err;
  }

  // Record the coupon redemption now that the agent is built AND billed - not at resolve time,
  // so a build that fails and reverses the fee does not also burn a redemption against the cap.
  // Best effort: a lost row would at worst let the code be used once more than its cap, never
  // charge anyone or block a legitimate add.
  if (couponPromoId) {
    const { error: ledgerErr } = await db.from("coupon_redemptions").insert({
      promotion_code_id: couponPromoId,
      code: couponCode,
      coupon_id: couponId,
      workspace_id: id,
      agent37_id: agentId,
      redeemed_by: user.id,
    });
    if (ledgerErr) {
      console.error("[seats] recording coupon redemption failed - cap may under-count:", couponPromoId, ledgerErr);
    }
  }

  // ── 3. Hand it to them ─────────────────────────────────────────────────────
  // The agent belongs to the colleague from the moment it exists. If they are already a member
  // we can name them; if not, the invitation carries the address and accept_invitation binds
  // the membership, with claimSeatFor() below attaching the agent on first sign-in.
  if (member) {
    await db.from("agents").update({ owner_id: member.user_id }).eq("agent37_id", agentId);

    // The email David noticed was missing. Every OTHER way an agent comes to exist sends one -
    // the Stripe webhook mails license buyers and agent buyers - but a seat is billed as a
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
            `<p>It has been created and is building now. Your invoice carries the one-time ` +
            `agent license and its hosting seat, pro-rated from today.</p>` +
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
      `it is yours - a short questionnaire personalizes it to how you work.</p>`;
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
