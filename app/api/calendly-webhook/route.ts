import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { findOrCreateCrmEntity } from "@/lib/crm";
import { createAttioDeal } from "@/lib/attio";
import { upsertMailchimpContact } from "@/lib/mailchimp";

const MANDRILL_KEY = process.env.MANDRILL_API_KEY || "";
const CALENDLY_SIGNING_SECRET = process.env.CALENDLY_SIGNING_SECRET || "";
const BCC_EMAIL = "david@apolloclaw.ai";
const PRECALL_URL = "https://apolloclaw.ai/pre-call";

// ── File-based dedup: persists across server restarts ────────────────────────
import * as fs from "fs";
const DEDUP_FILE = "/tmp/ac-calendly-dedup.json";
const DEDUP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function isDuplicate(email: string): boolean {
  const key = email.toLowerCase();
  let store: Record<string, number> = {};
  try {
    if (fs.existsSync(DEDUP_FILE)) {
      store = JSON.parse(fs.readFileSync(DEDUP_FILE, "utf8"));
    }
  } catch { store = {}; }

  const now = Date.now();
  const last = store[key];
  if (last && now - last < DEDUP_TTL_MS) return true;

  // Record this send + clean up old entries
  store[key] = now;
  const cutoff = now - DEDUP_TTL_MS * 3;
  for (const k of Object.keys(store)) {
    if (store[k] < cutoff) delete store[k];
  }
  try { fs.writeFileSync(DEDUP_FILE, JSON.stringify(store)); } catch {}
  return false;
}

// ── Verify Calendly webhook signature ─────────────────────────────────────────
function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!CALENDLY_SIGNING_SECRET || !signatureHeader) return false;
  try {
    const parts = Object.fromEntries(signatureHeader.split(",").map(p => p.split("=")));
    const timestamp = parts["t"];
    const receivedSig = parts["v1"];
    if (!timestamp || !receivedSig) return false;
    const payload = `${timestamp}.${rawBody}`;
    const expected = crypto.createHmac("sha256", CALENDLY_SIGNING_SECRET).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSig));
  } catch { return false; }
}

// ── Send pre-call form email via Mandrill ──────────────────────────────────────
async function sendPrecallInvite(toEmail: string, toName: string): Promise<void> {
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
  const result = await res.json() as Array<{ status: string }>;
  if (!Array.isArray(result) || (result[0]?.status !== "sent" && result[0]?.status !== "queued")) {
    throw new Error(`Mandrill error: ${JSON.stringify(result)}`);
  }
}

// ── Main handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let rawBody: string;
  try { rawBody = await req.text(); }
  catch { return NextResponse.json({ error: "Could not read body" }, { status: 400 }); }

  if (CALENDLY_SIGNING_SECRET) {
    const sig = req.headers.get("calendly-webhook-signature");
    if (!verifySignature(rawBody, sig)) {
      console.error("[calendly-webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const event = payload.event as string;

  if (event !== "invitee.created") {
    return NextResponse.json({ ok: true, skipped: event });
  }

  const payloadData = payload.payload as Record<string, unknown>;
  const email = payloadData?.email as string;
  const name = (payloadData?.name as string) || "there";
  const scheduledEvent = payloadData?.scheduled_event as Record<string, unknown> | undefined;
  const eventStartTime = (scheduledEvent?.start_time as string) || null;

  if (!email) {
    console.error("[calendly-webhook] No invitee email in payload");
    return NextResponse.json({ error: "No invitee email" }, { status: 400 });
  }

  // ── Dedup guard: prevent double-sends within 10 minutes ───────────────────
  if (isDuplicate(email)) {
    console.log(`[calendly-webhook] Duplicate detected for ${email} - skipping`);
    return NextResponse.json({ ok: true, skipped: "duplicate" });
  }

  const firstName = name.split(" ")[0] || name;
  const lastName = name.split(" ").slice(1).join(" ") || "";
  const callTime = eventStartTime
    ? new Date(eventStartTime).toLocaleString("en-US", {
        timeZone: "America/New_York",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "TBD";

  const errors: string[] = [];

  // 1. Send pre-call questionnaire email immediately
  try {
    await sendPrecallInvite(email, name);
    console.log(`[calendly-webhook] Pre-call form sent to ${email}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[calendly-webhook] Mandrill send failed:", msg);
    errors.push(`mandrill: ${msg}`);
  }

  // 2. Create Attio deal at Prospect stage — intake is David-initiated only
  try {
    await createAttioDeal({
      name,
      email,
      firstName,
      lastName,
      referralSource: "Calendly",
    });
    console.log(`[calendly-webhook] Attio deal created for ${email} at Prospect`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[calendly-webhook] Attio deal failed:", msg);
    errors.push(`attio: ${msg}`);
  }

  // 3. Add to Mailchimp audience (no journey tag — intake is David-initiated)
  try {
    await upsertMailchimpContact(email, firstName, lastName);
    console.log(`[calendly-webhook] Mailchimp contact upserted for ${email}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[calendly-webhook] Mailchimp upsert failed:", msg);
  }

  // 4. Legacy CRM entity (non-fatal, operational record only)
  try {
    await findOrCreateCrmEntity(name, email, "prospect", `Booked via Calendly - call: ${callTime} ET`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[calendly-webhook] CRM entity failed (non-fatal):", msg);
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent_to: email });
}
