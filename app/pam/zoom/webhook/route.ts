import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  getStorageDescription,
  readZoomTokens,
  sanitizeErrorMessage,
  saveZoomError,
  saveZoomMetadata,
  saveZoomRawEvent,
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

async function refreshAccessToken(refreshToken: string, existingScope?: string) {
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
    scope: token.scope || existingScope,
    created_at: new Date().toISOString(),
  };
  await saveZoomTokens(stored);
  return stored.access_token;
}

async function getAccessToken() {
  const token = await readZoomTokens();
  if (!token) throw new Error("No stored Zoom OAuth token");
  if (!tokenLooksExpired(token)) return token.access_token;
  return refreshAccessToken(token.refresh_token, token.scope);
}

function extractMeetingId(payload: any) {
  return payload?.object?.uuid || payload?.object?.id || payload?.object?.meeting_id || payload?.meeting_id || null;
}

function getEventType(event: string) {
  return event || "unknown";
}

function buildTranscriptRecord(params: {
  payload: any;
  recordingDetails: any;
  transcriptText: string;
  receivedAt: string;
}) {
  const object = params.payload?.object || {};
  const details = params.recordingDetails || {};
  const meetingUuid = object.uuid || details.uuid || "";
  const meetingId = object.id || object.meeting_id || details.id || "";
  const durationMinutes = details.duration || object.duration || "";

  return {
    source: "zoom",
    event_type: "meeting_transcript_ready",
    meeting_id: meetingId ? String(meetingId) : "",
    meeting_uuid: meetingUuid ? String(meetingUuid) : "",
    topic: details.topic || object.topic || "",
    start_time: details.start_time || object.start_time || "",
    duration_minutes: durationMinutes === "" ? "" : String(durationMinutes),
    host_email: details.host_email || object.host_email || "",
    participants: Array.isArray(object.participants) ? object.participants : [],
    recording_url: details.share_url || details.recording_play_url || "",
    transcript_text: params.transcriptText || "",
    transcript_format: "vtt",
    received_at: params.receivedAt,
  };
}

function isRecordingReadyEvent(event: string) {
  const normalized = String(event || "").toLowerCase();
  return normalized === "recording.completed" || normalized.includes("recording");
}

async function logSafeError(params: {
  eventType: string;
  meetingIdOrUuid?: string | null;
  failedStep: string;
  error: unknown;
}) {
  try {
    await saveZoomError({
      timestamp: new Date().toISOString(),
      event_type: params.eventType,
      meeting_id_or_uuid: params.meetingIdOrUuid || null,
      failed_step: params.failedStep,
      message: sanitizeErrorMessage(params.error),
    });
  } catch {
    // Do not throw from error logging. Also do not log secrets.
  }
}

async function handleRecordingEvent(event: string, payload: any) {
  const eventType = getEventType(event);
  const meetingId = extractMeetingId(payload);
  const paths = storagePathsForMeeting(String(meetingId || "unknown"));

  try {
    await saveZoomRawEvent(paths.event, {
      source: "zoom",
      event_type: eventType,
      received_at: new Date().toISOString(),
      payload,
    });
  } catch (error) {
    await logSafeError({ eventType, meetingIdOrUuid: meetingId, failedStep: "save_raw_webhook_event", error });
  }

  if (!meetingId) {
    const error = new Error("Zoom recording event missing meeting ID or UUID");
    await logSafeError({ eventType, meetingIdOrUuid: null, failedStep: "extract_meeting_id", error });
    throw error;
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (error) {
    await logSafeError({ eventType, meetingIdOrUuid: meetingId, failedStep: "get_or_refresh_access_token", error });
    throw error;
  }

  const encodedMeetingId = encodeZoomMeetingId(String(meetingId));
  let recordingDetails: any;
  try {
    const response = await fetch(`https://api.zoom.us/v2/meetings/${encodedMeetingId}/recordings`, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Zoom recording details failed: ${response.status}`);
    recordingDetails = await response.json();
  } catch (error) {
    await logSafeError({ eventType, meetingIdOrUuid: meetingId, failedStep: "fetch_recording_details", error });
    throw error;
  }

  const transcriptFile = (recordingDetails.recording_files || []).find((file: any) => {
    const fileType = String(file.file_type || "").toUpperCase();
    const extension = String(file.file_extension || "").toUpperCase();
    return fileType === "TRANSCRIPT" || extension === "VTT";
  });

  let transcriptPath: string | null = null;
  let transcriptText = "";
  if (transcriptFile?.download_url) {
    try {
      const transcriptResponse = await fetch(transcriptFile.download_url, {
        headers: { authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (!transcriptResponse.ok) throw new Error(`Zoom transcript download failed: ${transcriptResponse.status}`);
      transcriptText = await transcriptResponse.text();
      transcriptPath = await saveZoomTranscript(paths.transcript, transcriptText);
    } catch (error) {
      await logSafeError({ eventType, meetingIdOrUuid: meetingId, failedStep: "download_or_save_transcript", error });
      throw error;
    }
  } else {
    await logSafeError({
      eventType,
      meetingIdOrUuid: meetingId,
      failedStep: "find_transcript_file",
      error: new Error("No transcript file found in recording_files"),
    });
  }

  let metadataPath: string;
  try {
    metadataPath = await saveZoomMetadata(paths.metadata, buildTranscriptRecord({
      payload,
      recordingDetails,
      transcriptText,
      receivedAt: new Date().toISOString(),
    }));
  } catch (error) {
    await logSafeError({ eventType, meetingIdOrUuid: meetingId, failedStep: "save_handoff_payload", error });
    throw error;
  }

  return {
    meetingId,
    eventType,
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

  const eventType = getEventType(body.event);
  const meetingId = extractMeetingId(body.payload);

  if (body.event === "endpoint.url_validation") {
    const plainToken = body?.payload?.plainToken;
    if (!plainToken) return NextResponse.json({ error: "Missing plainToken" }, { status: 400 });
    if (!secret) return NextResponse.json({ error: "Missing ZOOM_WEBHOOK_SECRET_TOKEN" }, { status: 500 });
    return NextResponse.json({ plainToken, encryptedToken: hmacHex(plainToken, secret) });
  }

  if (secret && !verifyZoomSignature(rawBody, req, secret)) {
    await logSafeError({ eventType, meetingIdOrUuid: meetingId, failedStep: "verify_webhook_signature", error: new Error("Invalid Zoom webhook signature") });
    return NextResponse.json({ error: "Invalid Zoom webhook signature" }, { status: 401 });
  }

  if (isRecordingReadyEvent(body.event)) {
    try {
      const result = await handleRecordingEvent(body.event, body.payload);
      return NextResponse.json({ ok: true, ...result });
    } catch {
      return NextResponse.json({ ok: false, error: "Recording webhook processing failed" }, { status: 202 });
    }
  }

  try {
    const paths = storagePathsForMeeting(String(meetingId || "unknown"));
    const eventPath = await saveZoomRawEvent(paths.event, {
      source: "zoom",
      event_type: eventType,
      received_at: new Date().toISOString(),
      payload: body.payload,
    });
    return NextResponse.json({ ok: true, eventPath, storage: getStorageDescription() });
  } catch (error) {
    await logSafeError({ eventType, meetingIdOrUuid: meetingId, failedStep: "save_non_recording_event", error });
    return NextResponse.json({ ok: true, storage: getStorageDescription() });
  }
}
