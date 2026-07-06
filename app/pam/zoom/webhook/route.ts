import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hmacHex(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function verifyZoomSignature(rawBody: string, req: NextRequest, secret: string) {
  const timestamp = req.headers.get("x-zm-request-timestamp");
  const signature = req.headers.get("x-zm-signature");
  if (!timestamp || !signature) return false;

  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    return false;
  }

  const message = `v0:${timestamp}:${rawBody}`;
  const expected = `v0=${hmacHex(message, secret)}`;
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

function encodeZoomMeetingId(meetingId: string) {
  const encoded = encodeURIComponent(meetingId);
  return /[^A-Za-z0-9_-]/.test(meetingId) ? encodeURIComponent(encoded) : encoded;
}

async function fetchServerToServerToken(): Promise<string> {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  if (!clientId || !clientSecret || !accountId) throw new Error("Missing Zoom Server-to-Server credentials");

  const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Zoom S2S token fetch failed: ${response.status}`);
  const token = await response.json();
  return token.access_token;
}

function extractMeetingId(payload: any) {
  return payload?.object?.uuid || payload?.object?.id || payload?.object?.meeting_id || payload?.meeting_id || null;
}

function isRecordingReadyEvent(event: string) {
  const normalized = String(event || "").toLowerCase();
  return normalized === "recording.completed" || normalized === "recording.transcript_completed" || normalized.includes("recording");
}

async function sendToPam(text: string) {
  const botToken = process.env.PAM_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.PAM_TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    cache: "no-store",
  });
}

function buildPamMessage(payload: any, recordingDetails: any, transcriptText: string) {
  const object = payload?.object || {};
  const topic = recordingDetails?.topic || object?.topic || "Meeting";
  const startTime = recordingDetails?.start_time || object?.start_time || "";
  const duration = recordingDetails?.duration || object?.duration || "";
  const hostEmail = recordingDetails?.host_email || object?.host_email || "";
  const date = startTime ? new Date(startTime).toLocaleString("en-US", { timeZone: "America/New_York" }) : "";

  const lines = [
    `<b>New Zoom Recording: ${topic}</b>`,
    date ? `Date: ${date}` : "",
    duration ? `Duration: ${duration} minutes` : "",
    hostEmail ? `Host: ${hostEmail}` : "",
    "",
    "Please review this transcript, summarize the key points, action items, and any follow-ups Taylor should be aware of.",
    "",
    "<b>Transcript:</b>",
    transcriptText.slice(0, 3500),
    transcriptText.length > 3500 ? "\n[Transcript truncated]" : "",
  ].filter(Boolean);

  return lines.join("\n");
}

async function handleRecordingEvent(event: string, payload: any) {
  const meetingId = extractMeetingId(payload);
  if (!meetingId) throw new Error("Zoom recording event missing meeting ID or UUID");

  const accessToken = await fetchServerToServerToken();
  const encodedMeetingId = encodeZoomMeetingId(String(meetingId));

  const response = await fetch(`https://api.zoom.us/v2/meetings/${encodedMeetingId}/recordings`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Zoom recording details failed: ${response.status}`);
  const recordingDetails = await response.json();

  const transcriptFile = (recordingDetails.recording_files || []).find((file: any) => {
    const fileType = String(file.file_type || "").toUpperCase();
    const extension = String(file.file_extension || "").toUpperCase();
    return fileType === "TRANSCRIPT" || extension === "VTT";
  });

  let transcriptText = "";
  if (transcriptFile?.download_url) {
    const transcriptResponse = await fetch(transcriptFile.download_url, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!transcriptResponse.ok) throw new Error(`Zoom transcript download failed: ${transcriptResponse.status}`);
    transcriptText = await transcriptResponse.text();
  }

  const pamMessage = buildPamMessage(payload, recordingDetails, transcriptText);
  await sendToPam(pamMessage);

  return { ok: true, meetingId, transcriptLength: transcriptText.length };
}

export async function POST(req: NextRequest) {
  const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;
  const rawBody = await req.text();
  let body: any;

  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.event === "endpoint.url_validation") {
    const plainToken = body?.payload?.plainToken;
    if (!plainToken) return NextResponse.json({ error: "Missing plainToken" }, { status: 400 });
    if (!secret) return NextResponse.json({ error: "Missing ZOOM_WEBHOOK_SECRET_TOKEN" }, { status: 500 });
    return NextResponse.json({ plainToken, encryptedToken: hmacHex(plainToken, secret) });
  }

  if (secret && !verifyZoomSignature(rawBody, req, secret)) {
    return NextResponse.json({ error: "Invalid Zoom webhook signature" }, { status: 401 });
  }

  if (isRecordingReadyEvent(body.event)) {
    try {
      const result = await handleRecordingEvent(body.event, body.payload);
      return NextResponse.json(result);
    } catch (err: any) {
      console.error("Recording webhook error:", err?.message);
      return NextResponse.json({ ok: false, error: "Recording webhook processing failed" }, { status: 202 });
    }
  }

  return NextResponse.json({ ok: true });
}
