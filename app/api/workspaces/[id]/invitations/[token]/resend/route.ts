import { requireAdmin, requireUser } from "@/lib/auth";
import { sendMandrillEmail } from "@/lib/email";
import { ApiError, json, route } from "@/lib/http";
import { inviteUrl } from "@/lib/invites";
import { escapeHtml } from "@/lib/onboardingSections";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";

type Ctx = { params: Promise<{ id: string; token: string }> };

// POST — send a pending invitation's email again.
//
// Invitations are delivered by email now, and email gets lost: spam folders, a colleague on
// holiday, a typo the admin has since fixed by revoking and reinviting. Before this route the
// admin's only tools were "copy the link and paste it into Slack" or "revoke and start over" -
// the second of which, for a seat invitation, would tear down billing state for what is really
// just "send it again".
//
// Same stock email the original send uses. The custom subject/body from the compose step is
// not stored (deliberately - invitations carry access, and the less they carry besides, the
// better), so a resend is the stock invitation, which says everything the accept needs.
export const POST = route(async (request: Request, { params }: Ctx) => {
  const limited = await enforceRateLimit(request, "invite_resend", LIMITS.form);
  if (limited) return limited;

  const { id, token } = await params;
  const { supabase, user } = await requireUser();
  await requireAdmin(supabase, id, user.id);

  const { data: invite, error } = await supabase
    .from("invitations")
    .select("token, email, expires_at")
    .eq("workspace_id", id)
    .eq("token", token)
    .maybeSingle();
  if (error) throw new ApiError(500, "db_error", error.message);
  if (!invite) throw new ApiError(404, "not_found", "That invitation no longer exists.");
  if (!invite.email) {
    // Link-only invitations have nowhere to send to - the admin who made one shares it
    // themselves, and the UI does not offer Resend on those rows.
    throw new ApiError(400, "invalid_request", "This invitation has no email address on it.");
  }
  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
    throw new ApiError(410, "expired", "This invitation has expired - revoke it and invite again.");
  }

  const acceptUrl = inviteUrl(request, invite.token);
  const inviterName =
    ((user.user_metadata ?? {}) as { first_name?: string }).first_name || user.email || "A colleague";

  await sendMandrillEmail({
    to: invite.email,
    subject: "Your ApolloClaw invitation (resent)",
    html:
      `<div style="font-family:sans-serif;color:#0B1729;font-size:15px;line-height:1.7">` +
      `<h2 style="color:#0B1729">${escapeHtml(inviterName)} invited you to ApolloClaw.</h2>` +
      `<p>Accept the invitation, choose a password, and you are in.</p>` +
      `<p><a href="${acceptUrl}" style="display:inline-block;background:#D72B2B;color:#fff;font-weight:700;padding:14px 30px;border-radius:6px;text-decoration:none">Accept your invitation</a></p>` +
      `<p style="color:#6b7280;font-size:13px">If you were not expecting this, you can ignore this email.</p>` +
      `</div>`,
  });

  return json({ ok: true, email: invite.email });
});
