import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { processConsultationBooking } from "@/lib/consultation-booking";

// Legacy Calendly booking webhook. Scheduling moved to cal.com (see /api/cal-webhook); this stays
// so any Calendly booking still in flight is handled, and shares the same pre-call-form + CRM
// pipeline. Safe to remove once the Calendly webhook is deleted in the Calendly dashboard.

const CALENDLY_SIGNING_SECRET = process.env.CALENDLY_SIGNING_SECRET || "";

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!CALENDLY_SIGNING_SECRET || !signatureHeader) return false;
  try {
    const parts = Object.fromEntries(signatureHeader.split(",").map((p) => p.split("=")));
    const timestamp = parts["t"];
    const receivedSig = parts["v1"];
    if (!timestamp || !receivedSig) return false;
    const payload = `${timestamp}.${rawBody}`;
    const expected = crypto.createHmac("sha256", CALENDLY_SIGNING_SECRET).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSig));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Could not read body" }, { status: 400 });
  }

  if (CALENDLY_SIGNING_SECRET) {
    const sig = req.headers.get("calendly-webhook-signature");
    if (!verifySignature(rawBody, sig)) {
      console.error("[calendly-webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event !== "invitee.created") {
    return NextResponse.json({ ok: true, skipped: payload.event });
  }

  const payloadData = payload.payload as Record<string, unknown> | undefined;
  const email = (payloadData?.email as string) || "";
  const name = (payloadData?.name as string) || "there";
  const scheduledEvent = payloadData?.scheduled_event as Record<string, unknown> | undefined;
  const startTime = (scheduledEvent?.start_time as string) || null;

  if (!email) {
    console.error("[calendly-webhook] No invitee email in payload");
    return NextResponse.json({ error: "No invitee email" }, { status: 400 });
  }

  const { deduped, errors } = await processConsultationBooking({
    email,
    name,
    startTime,
    source: "Calendly",
  });
  if (deduped) return NextResponse.json({ ok: true, skipped: "duplicate" });
  if (errors.length > 0) return NextResponse.json({ ok: false, errors }, { status: 500 });
  return NextResponse.json({ ok: true, sent_to: email });
}
