import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { processConsultationBooking } from "@/lib/consultation-booking";

// cal.com booking webhook. Replaces the Calendly one now that scheduling moved to cal.com.
//
// Point a cal.com webhook (Settings → Developer → Webhooks) at https://apolloclaw.ai/api/cal-webhook
// subscribed to "Booking Created", with a secret, and set that same secret as CALCOM_WEBHOOK_SECRET
// in the server env. cal.com signs the raw body with HMAC-SHA256 and sends it as X-Cal-Signature-256.

const CAL_SIGNING_SECRET = process.env.CALCOM_WEBHOOK_SECRET || "";

function verifyCalSignature(rawBody: string, signature: string | null): boolean {
  if (!CAL_SIGNING_SECRET || !signature) return false;
  try {
    const expected = crypto.createHmac("sha256", CAL_SIGNING_SECRET).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
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

  // Signature is enforced only when the secret is configured, matching the Calendly receiver: a
  // missing secret means "not set up yet", not "reject everything".
  if (CAL_SIGNING_SECRET) {
    const sig = req.headers.get("x-cal-signature-256");
    if (!verifyCalSignature(rawBody, sig)) {
      console.error("[cal-webhook] invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.triggerEvent !== "BOOKING_CREATED") {
    return NextResponse.json({ ok: true, skipped: body.triggerEvent });
  }

  const payload = body.payload as Record<string, unknown> | undefined;
  // cal.com carries the booker under attendees[0]; the organizer is us.
  const attendees = (payload?.attendees as Array<Record<string, unknown>> | undefined) ?? [];
  const attendee = attendees[0];
  const email = (attendee?.email as string) || "";
  const name = (attendee?.name as string) || "there";
  const startTime = (payload?.startTime as string) || null;

  if (!email) {
    console.error("[cal-webhook] no attendee email in payload");
    return NextResponse.json({ error: "No attendee email" }, { status: 400 });
  }

  const { deduped, errors } = await processConsultationBooking({
    email,
    name,
    startTime,
    source: "Cal.com",
  });
  if (deduped) return NextResponse.json({ ok: true, skipped: "duplicate" });
  if (errors.length > 0) return NextResponse.json({ ok: false, errors }, { status: 500 });
  return NextResponse.json({ ok: true, sent_to: email });
}
