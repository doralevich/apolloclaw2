import "server-only";

// Shared Mandrill sender — the same transport the intake/pre-call/setup routes use, so
// storefront notifications (agent purchased, agent setup completed) land in the same inbox
// with the same from/bcc identity. Best-effort: never throws, returns whether it sent.
//
// Requires MANDRILL_API_KEY in the environment (present on Vercel). When absent it logs and
// no-ops so a missing key never breaks a checkout or a setup submission.

const MANDRILL_KEY = process.env.MANDRILL_API_KEY || "";

// Internal notifications go here; the storefront isn't a per-customer confirmation flow.
export const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "david@apolloclaw.ai";

export interface EmailAttachment {
  filename: string;
  /** Raw file bytes; base64-encoded for Mandrill here. */
  content: Buffer;
  type?: string;
}

export async function sendMandrillEmail(opts: {
  to?: string;
  toName?: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<boolean> {
  if (!MANDRILL_KEY) {
    console.warn("[email] MANDRILL_API_KEY not set - skipping:", opts.subject);
    return false;
  }
  const to = opts.to || NOTIFY_EMAIL;
  try {
    const message: Record<string, unknown> = {
      from_email: "david@apolloclaw.ai",
      from_name: "Apollo[Claw] Storefront",
      to: [{ email: to, name: opts.toName || to, type: "to" }],
      subject: opts.subject,
      html: opts.html,
      important: true,
    };
    if (opts.attachments?.length) {
      message.attachments = opts.attachments.map((a) => ({
        type: a.type || "application/pdf",
        name: a.filename,
        content: a.content.toString("base64"),
      }));
    }
    const res = await fetch("https://mandrillapp.com/api/1.0/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: MANDRILL_KEY, message }),
    });
    const result = (await res.json()) as Array<{ status: string }>;
    const ok = Array.isArray(result) && result[0]?.status !== "rejected" && result[0]?.status !== "invalid";
    if (!ok) console.error("[email] Mandrill rejected:", JSON.stringify(result));
    return ok;
  } catch (err) {
    console.error("[email] Mandrill send failed:", err);
    return false;
  }
}
