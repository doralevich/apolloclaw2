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

// A readable plaintext version of the HTML we are sending.
//
// Not a general HTML-to-text converter and not trying to be: these are our own templates, so
// this only has to handle the tags they use. Blocks become line breaks, links keep their URL in
// brackets (a plaintext part that says "Add credits" with no address is useless to anyone
// actually reading it), and entities we emit are decoded.
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    // Keep the destination. Someone reading the text part has no other way to reach it.
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, label) =>
      `${String(label).replace(/<[^>]+>/g, "").trim()} (${href})`
    )
    .replace(/<\/(p|div|h[1-6]|li|tr|table)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&middot;/g, "-")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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
      // "Apollo[Claw] Storefront" before. Two problems for a message a CUSTOMER reads:
      // "Storefront" is internal language nobody outside this repo would recognise, and square
      // brackets in a display name are unusual enough that filters treat them as a weak
      // negative. The wordmark keeps its brackets; the envelope does not.
      from_name: "Apollo Claw",
      to: [{ email: to, name: opts.toName || to, type: "to" }],
      subject: opts.subject,
      html: opts.html,
      // A PLAINTEXT ALTERNATIVE, which none of these had.
      //
      // Every message this sends has been single-part HTML, and "HTML with no text part" is one
      // of the oldest and most reliable spam heuristics there is - SpamAssassin scores it by
      // name (MIME_HTML_ONLY) and the big providers weight it. Legitimate transactional mail
      // almost always carries both parts, so sending only one marks us out from the mail we are
      // trying to look like.
      text: htmlToText(opts.html),
      important: true,
      // Link tracking OFF for transactional mail, explicitly rather than by account default.
      //
      // Mandrill's click tracking rewrites every href to a mandrillapp.com redirect. On a
      // password reset or a receipt that means the visible domain no longer matches the sender,
      // which is exactly the shape of a phishing message - and it costs us the one thing these
      // emails have going for them, which is that their links point where they say they do.
      // There is nothing to learn from the click rate on a password reset anyway.
      track_clicks: false,
      track_opens: false,
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
