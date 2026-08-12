import "server-only";
import * as fs from "fs";
import { findOrCreateCrmEntity } from "@/lib/crm";
import { createAttioDeal } from "@/lib/attio";
import { upsertMailchimpContact } from "@/lib/mailchimp";

// What happens when someone books a consultation, independent of WHICH scheduler sent the event.
//
// This was inlined in the Calendly webhook. The move to cal.com means a second receiver that does
// the exact same four things - pre-call form email, Attio deal, Mailchimp contact, legacy CRM row
// - so the work lives here and each webhook just parses its own payload and calls this.

const MANDRILL_KEY = process.env.MANDRILL_API_KEY || "";
const BCC_EMAIL = "david@apolloclaw.ai";
const PRECALL_URL = "https://apolloclaw.ai/pre-call";

// ── File-based dedup: persists across server restarts, shared across schedulers ──
const DEDUP_FILE = "/tmp/ac-consult-dedup.json";
const DEDUP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function isDuplicateBooking(email: string): boolean {
  const key = email.toLowerCase();
  let store: Record<string, number> = {};
  try {
    if (fs.existsSync(DEDUP_FILE)) store = JSON.parse(fs.readFileSync(DEDUP_FILE, "utf8"));
  } catch {
    store = {};
  }

  const now = Date.now();
  const last = store[key];
  if (last && now - last < DEDUP_TTL_MS) return true;

  store[key] = now;
  const cutoff = now - DEDUP_TTL_MS * 3;
  for (const k of Object.keys(store)) {
    if (store[k] < cutoff) delete store[k];
  }
  try {
    fs.writeFileSync(DEDUP_FILE, JSON.stringify(store));
  } catch {
    // Best effort; a missed dedup means at worst one duplicate email, not a failure.
  }
  return false;
}

// ── Send pre-call form email via Mandrill ──────────────────────────────────────
export async function sendPrecallInvite(toEmail: string, toName: string): Promise<void> {
  const firstName = toName.split(" ")[0] || toName;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0;color:#1a1a1a;">
      <div style="border-bottom:2px solid #E8342A;padding-bottom:14px;margin-bottom:24px;">
        <span style="font-family:'Courier New',monospace;font-size:20px;font-weight:900;">Apollo<span style="color:#E8342A;">[</span>Claw<span style="color:#E8342A;">]</span></span>
      </div>
      <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${firstName},</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">Looking forward to talking. Before we meet, take 2–3 minutes to fill out this quick questionnaire - it helps us come prepared and make the most of our time together.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${PRECALL_URL}" style="display:inline-block;background:#E8342A;color:#ffffff;font-weight:800;font-size:15px;padding:14px 36px;border-radius:6px;text-decoration:none;">Complete Pre-Call Form →</a>
      </div>
      <p style="font-size:15px;line-height:1.7;margin:24px 0 0;">See you soon.</p>
      <p style="font-size:13px;color:#6b7280;margin:4px 0 0;">- David Oralevich, Apollo[Claw]</p>
      <p style="font-size:11px;color:#9da3af;margin-top:32px;border-top:1px solid #e0e0e0;padding-top:12px;">Apollo[Claw] AI Consulting | 69 Roslyn Road, Roslyn Heights, NY 11577</p>
    </div>`;

  const res = await fetch("https://mandrillapp.com/api/1.0/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: MANDRILL_KEY,
      message: {
        from_email: "david@apolloclaw.ai",
        from_name: "David Oralevich",
        to: [{ email: toEmail, name: toName, type: "to" }],
        bcc_address: BCC_EMAIL,
        subject: "Before our call - one quick form - Apollo[Claw]",
        html,
        important: true,
      },
    }),
  });
  const result = (await res.json()) as Array<{ status: string }>;
  if (!Array.isArray(result) || (result[0]?.status !== "sent" && result[0]?.status !== "queued")) {
    throw new Error(`Mandrill error: ${JSON.stringify(result)}`);
  }
}

export interface ConsultationBooking {
  email: string;
  name: string;
  /** ISO start time of the booked slot, if the payload carried one. */
  startTime?: string | null;
  /** Which scheduler this came from, for the CRM note. */
  source: string;
}

/**
 * The four things every booking triggers. Deduped by email (10 min), and each step is independent
 * - a failure in one is recorded but does not stop the others, because the pre-call email is the
 * one the customer sees and the CRM steps are ours to reconcile.
 *
 * Returns the fatal errors (pre-call email + Attio); Mailchimp and the legacy CRM row are
 * best-effort and never fail the webhook.
 */
export async function processConsultationBooking(
  booking: ConsultationBooking
): Promise<{ deduped: boolean; errors: string[] }> {
  const { email, name, startTime, source } = booking;
  if (isDuplicateBooking(email)) {
    console.log(`[consultation] duplicate for ${email} - skipping`);
    return { deduped: true, errors: [] };
  }

  const firstName = name.split(" ")[0] || name;
  const lastName = name.split(" ").slice(1).join(" ") || "";
  const callTime = startTime
    ? new Date(startTime).toLocaleString("en-US", {
        timeZone: "America/New_York",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "TBD";

  const errors: string[] = [];

  try {
    await sendPrecallInvite(email, name);
    console.log(`[consultation] pre-call form sent to ${email}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[consultation] Mandrill send failed:", msg);
    errors.push(`mandrill: ${msg}`);
  }

  try {
    await createAttioDeal({ name, email, firstName, lastName, referralSource: source });
    console.log(`[consultation] Attio deal created for ${email} at Prospect`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[consultation] Attio deal failed:", msg);
    errors.push(`attio: ${msg}`);
  }

  try {
    await upsertMailchimpContact(email, firstName, lastName);
    console.log(`[consultation] Mailchimp contact upserted for ${email}`);
  } catch (err) {
    console.error("[consultation] Mailchimp upsert failed:", err instanceof Error ? err.message : err);
  }

  try {
    await findOrCreateCrmEntity(name, email, "prospect", `Booked via ${source} - call: ${callTime} ET`);
  } catch (err) {
    console.error("[consultation] CRM entity failed (non-fatal):", err instanceof Error ? err.message : err);
  }

  return { deduped: false, errors };
}
