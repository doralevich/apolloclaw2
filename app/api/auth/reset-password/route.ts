import { sendMandrillEmail } from "@/lib/email";
import { json, readJson, route } from "@/lib/http";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { publicSiteOrigin } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/auth/reset-password { email } — the password reset, in our envelope.
//
// The login page used to call supabase.auth.resetPasswordForEmail, which sends Supabase's own
// email: their sender, their subject, their template, "Supabase" on a message our customer
// reads while deciding whether it is phishing. David's call: it should come from Apollo Claw,
// like every other email we send. Deliverability agrees - apolloclaw.ai has DKIM and SPF set
// up and warmed; Supabase's shared mailer has whatever reputation the rest of its tenants left
// it.
//
// So the server mints the same recovery link Supabase would have mailed
// (auth.admin.generateLink) and Mandrill delivers it in our name. The link's semantics are
// unchanged: it lands on /auth/callback, signs the holder in, and forwards to /reset-password.
//
// ALWAYS 200. The login page deliberately does not reveal whether an address has an account,
// and this route must not undo that: an unknown address gets the same "check your email" as a
// known one, and only the known one gets mail. The error split below exists solely so a REAL
// failure (Supabase down, misconfigured key) still surfaces instead of masquerading as sent.

export const POST = route(async (request: Request) => {
  const limited = await enforceRateLimit(request, "reset_password", LIMITS.form);
  if (limited) return limited;

  const body = await readJson<{ email?: string }>(request);
  const email = (typeof body.email === "string" ? body.email : "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    // Not worth a 400 that distinguishes "malformed" from "unknown" to a prober; the UI
    // validates before sending, so anyone hitting this branch is not using the UI.
    return json({ ok: true });
  }

  const db = createAdminClient();
  const redirectTo = `${publicSiteOrigin(new URL(request.url).origin)}/auth/callback?next=${encodeURIComponent("/reset-password")}`;

  const { data, error } = await db.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error) {
    // "User not found" is the enumeration case: same answer as success, no mail. Anything else
    // is our infrastructure failing and should say so.
    if (/not.?found/i.test(error.message)) return json({ ok: true });
    console.error("[reset-password] generateLink failed:", error.message);
    throw new Error("Could not create a reset link. Please try again.");
  }

  const link = data.properties?.action_link;
  if (!link) {
    console.error("[reset-password] no action_link in response for", email);
    throw new Error("Could not create a reset link. Please try again.");
  }

  await sendMandrillEmail({
    to: email,
    subject: "Reset your ApolloClaw password",
    html:
      `<div style="font-family:sans-serif;color:#0B1729;font-size:15px;line-height:1.7">` +
      `<h2 style="color:#0B1729">Reset your password</h2>` +
      `<p>Somebody - hopefully you - asked to reset the password for this ApolloClaw account. ` +
      `The link below signs you in and takes you straight to choosing a new one.</p>` +
      `<p><a href="${link}" style="display:inline-block;background:#D72B2B;color:#fff;font-weight:700;padding:14px 30px;border-radius:6px;text-decoration:none">Choose a new password</a></p>` +
      `<p style="color:#6b7280;font-size:13px">If this wasn't you, you can ignore this email - ` +
      `your password stays as it is and the link expires on its own.</p>` +
      `</div>`,
  });

  return json({ ok: true });
});
