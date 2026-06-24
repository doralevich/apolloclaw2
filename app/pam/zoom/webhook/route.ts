import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  getStorageDescription,
  readZoomTokens,
  saveZoomMetadata,
  saveZoomTokens,
  saveZoomTranscript,
  storagePathsForMeeting,
  tokenLooksExpired,
} from "../storage";

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

async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Missing Zoom client credentials");

  const response = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Zoom refresh failed: ${response.status}`);
  const token = await response.json();
  const stored = {
    access_token: token.access_token,
    refresh_token: token.refresh_token || refreshToken,
    expires_in: token.expires_in,
    scope: token.scope,
    created_at: new Date().toISOString(),
  };
  await saveZoomTokens(stored);
  return stored.access_token;
}

async function getAccessToken() {
  const token = await readZoomTokens();
  if (!token) throw new Error("No stored Zoom OAuth token");
  if (!tokenLooksExpired(token)) return token.access_token;
  return refreshAccessToken(token.refresh_token);
}

function extractMeetingId(payload: any) {
  return payload?.object?.uuid || payload?.object?.id || payload?.object?.meeting_id || payload?.meeting_id || null;
}

async function handleRecordingEvent(event: string, payload: any) {
  const meetingId = extractMeetingId(payload);
  if (!meetingId) throw new Error("Zoom recording event missing meeting ID or UUID");

  const accessToken = await getAccessToken();
  const encodedMeetingId = encodeZoomMeetingId(String(meetingId));
  const response = await fetch(`https://api.zoom.us/v2/meetings/${encodedMeetingId}/recordings`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Zoom recording details failed: ${response.status}`);
  const recordingDetails = await response.json();
  const paths = storagePathsForMeeting(String(meetingId));

  const transcriptFile = (recordingDetails.recording_files || []).find((file: any) => {
    const fileType = String(file.file_type || "").toUpperCase();
    const extension = String(file.file_extension || "").toUpperCase();
    return fileType === "TRANSCRIPT" || extension === "VTT";
  });

  let transcriptPath: string | null = null;
  if (transcriptFile?.download_url) {
    const transcriptResponse = await fetch(transcriptFile.download_url, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!transcriptResponse.ok) throw new Error(`Zoom transcript download failed: ${transcriptResponse.status}`);
    transcriptPath = await saveZoomTranscript(paths.transcript, await transcriptResponse.text());
  }

  const metadataPath = await saveZoomMetadata(paths.metadata, {
    event,
    meeting_id: meetingId,
    received_at: new Date().toISOString(),
    recording_details: recordingDetails,
    transcript_saved: Boolean(transcriptPath),
    transcript_path: transcriptPath,
  });

  return {
    meetingId,
    transcriptSaved: Boolean(transcriptPath),
    metadataPath,
    transcriptPath,
  };
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

  if (String(body.event || "").includes("recording")) {
    try {
      const result = await handleRecordingEvent(body.event, body.payload);
      return NextResponse.json({ ok: true, ...result });
    } catch (error) {
      console.error("Zoom recording webhook processing failed", error instanceof Error ? error.message : "Unknown error");
      return NextResponse.json({ ok: false, error: "Recording webhook processing failed" }, { status: 202 });
    }
  }

  try {
    const eventMeetingId = extractMeetingId(body.payload) || "unknown";
    const paths = storagePathsForMeeting(String(eventMeetingId));
    const eventPath = await saveZoomMetadata(paths.event, {
      event: body.event,
      received_at: new Date().toISOString(),
      payload: body.payload,
    });
    return NextResponse.json({ ok: true, eventPath, storage: getStorageDescription() });
  } catch {
    return NextResponse.json({ ok: true, storage: getStorageDescription() });
  }
}
