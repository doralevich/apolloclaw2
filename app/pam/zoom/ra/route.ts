/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Zoom Revenue Accelerator (ZRA) API route
// Correct base paths: /zra/conversations  (was incorrectly /revenue_accelerator/calls)
// Reference: https://developers.zoom.us/docs/api/iq
// ---------------------------------------------------------------------------

async function fetchServerToServerToken(): Promise<string> {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  if (!clientId || !clientSecret || !accountId)
    throw new Error("Missing Zoom Server-to-Server credentials");

  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: "POST",
      headers: {
        authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      cache: "no-store",
    }
  );
  if (!response.ok) throw new Error(`Zoom token fetch failed: ${response.status}`);
  const data = await response.json();
  return data.access_token;
}

interface ZoomApiResult {
  ok: boolean;
  status: number;
  body: any;
  errorCode?: number;
  errorMessage?: string;
}

async function zoomGetRaw(path: string, token: string): Promise<ZoomApiResult> {
  const response = await fetch(`https://api.zoom.us/v2${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  let body: any;
  try {
    body = await response.json();
  } catch {
    body = {};
  }
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      body,
      errorCode: body?.code,
      errorMessage: body?.message,
    };
  }
  return { ok: true, status: response.status, body };
}

async function zoomGetWithFallback(
  primaryPath: string,
  fallbackPath: string,
  token: string,
  action: string
): Promise<{ result: ZoomApiResult; endpointUsed: string; fallbackUsed: boolean }> {
  const primary = await zoomGetRaw(primaryPath, token);

  console.log(JSON.stringify({
    level: "info",
    tag: "[pam/zoom/ra]",
    action,
    path: primaryPath,
    status: primary.status,
    zoomErrorCode: primary.errorCode ?? null,
    zoomErrorMessage: primary.errorMessage ?? null,
    fallbackAttempted: false,
  }));

  // 404 with Zoom error code 2300 = "endpoint not recognized" — try fallback
  if (!primary.ok && (primary.status === 404 || primary.errorCode === 2300)) {
    const fallback = await zoomGetRaw(fallbackPath, token);

    console.log(JSON.stringify({
      level: "info",
      tag: "[pam/zoom/ra]",
      action,
      path: fallbackPath,
      status: fallback.status,
      zoomErrorCode: fallback.errorCode ?? null,
      zoomErrorMessage: fallback.errorMessage ?? null,
      fallbackAttempted: true,
    }));

    if (fallback.ok) {
      return { result: fallback, endpointUsed: fallbackPath, fallbackUsed: true };
    }
    // Both failed — return primary error for clarity
    return { result: primary, endpointUsed: primaryPath, fallbackUsed: true };
  }

  return { result: primary, endpointUsed: primaryPath, fallbackUsed: false };
}

// Normalize a ZRA conversation object to our canonical call shape
function normalizeCall(conv: any): {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  host_email: string;
} {
  return {
    id: conv.conversation_id ?? conv.id ?? "",
    topic: conv.conversation_topic ?? conv.topic ?? "",
    start_time: conv.meeting_start_time ?? conv.start_time ?? "",
    duration: typeof conv.duration === "number" ? conv.duration : 0,
    // ZRA list endpoint returns host_id not host_email; detail may have host_email
    host_email: conv.host_email ?? conv.host_id ?? "",
  };
}

// Flatten ZRA interactions participants into transcript sentences
// interactions response: { participants: [{ display_name, speaker_type, transcripts: [{ text, start_time, end_time }] }] }
function normalizeTranscript(interactions: any): {
  available: boolean;
  reason?: string;
  sentences: Array<{ speaker: string; text: string; start_time: number | string }>;
} {
  const participants: any[] = interactions?.participants ?? [];
  if (!participants.length) {
    return { available: false, reason: "no_transcript_found", sentences: [] };
  }

  const sentences: Array<{ speaker: string; text: string; start_time: number | string }> = [];

  for (const participant of participants) {
    const speakerName: string = participant.display_name ?? participant.email ?? "Unknown";
    const transcripts: any[] = participant.transcripts ?? [];
    for (const seg of transcripts) {
      sentences.push({
        speaker: speakerName,
        text: seg.text ?? "",
        start_time: seg.start_time ?? 0,
      });
    }
  }

  if (!sentences.length) {
    return { available: false, reason: "no_transcript_found", sentences: [] };
  }

  // Sort by start_time if they are strings (ISO timestamps)
  sentences.sort((a, b) => {
    const ta = String(a.start_time);
    const tb = String(b.start_time);
    return ta < tb ? -1 : ta > tb ? 1 : 0;
  });

  return { available: true, sentences };
}

function zoomErrorToTranscriptReason(errorCode?: number): string {
  if (!errorCode) return "unknown";
  // ZRA-specific processing codes (from Zoom docs)
  if (errorCode === 3309) return "processing_not_ready";
  if (errorCode === 3301) return "consent_not_accepted";
  if (errorCode === 3302) return "recording_failed";
  return "unknown";
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "list";
    const callId = searchParams.get("call_id");
    const limit = parseInt(searchParams.get("limit") ?? "10", 10) || 10;

    const token = await fetchServerToServerToken();

    // -----------------------------------------------------------------------
    // action=list  — list recent conversations
    // -----------------------------------------------------------------------
    if (action === "list") {
      const primaryPath = `/zra/conversations?page_size=${limit}`;
      const fallbackPath = `/iq/conversations?page_size=${limit}`;

      const { result, endpointUsed, fallbackUsed } = await zoomGetWithFallback(
        primaryPath,
        fallbackPath,
        token,
        "list"
      );

      if (!result.ok) {
        return NextResponse.json({
          success: false,
          source: "zoom_revenue_accelerator",
          error: {
            message: result.errorMessage ?? "Zoom API error",
            code: result.errorCode ?? result.status,
            http_status: result.status,
          },
          diagnostics: { endpoint_used: endpointUsed, fallback_used: fallbackUsed },
        }, { status: 502 });
      }

      const conversations: any[] = result.body.conversations ?? result.body.calls ?? [];

      return NextResponse.json({
        success: true,
        source: "zoom_revenue_accelerator",
        calls: conversations.map(normalizeCall),
        diagnostics: { endpoint_used: endpointUsed, fallback_used: fallbackUsed },
      });
    }

    // -----------------------------------------------------------------------
    // action=latest  — most recent conversation + transcript
    // -----------------------------------------------------------------------
    if (action === "latest") {
      const primaryPath = `/zra/conversations?page_size=1`;
      const fallbackPath = `/iq/conversations?page_size=1`;

      const { result, endpointUsed, fallbackUsed } = await zoomGetWithFallback(
        primaryPath,
        fallbackPath,
        token,
        "latest"
      );

      if (!result.ok) {
        return NextResponse.json({
          success: false,
          source: "zoom_revenue_accelerator",
          error: {
            message: result.errorMessage ?? "Zoom API error",
            code: result.errorCode ?? result.status,
            http_status: result.status,
          },
          diagnostics: { endpoint_used: endpointUsed, fallback_used: fallbackUsed },
        }, { status: 502 });
      }

      const conversations: any[] = result.body.conversations ?? result.body.calls ?? [];
      if (!conversations.length) {
        return NextResponse.json({
          success: true,
          source: "zoom_revenue_accelerator",
          call: null,
          transcript: { available: false, reason: "no_transcript_found", sentences: [] },
          diagnostics: { endpoint_used: endpointUsed, fallback_used: fallbackUsed },
        });
      }

      const conv = conversations[0];
      const call = normalizeCall(conv);
      const convId = call.id;

      // Fetch detail + interactions in parallel
      const [detailResult, interactionsResult] = await Promise.all([
        zoomGetRaw(
          endpointUsed.startsWith("/iq") ? `/iq/conversations/${convId}` : `/zra/conversations/${convId}`,
          token
        ),
        zoomGetRaw(
          endpointUsed.startsWith("/iq")
            ? `/iq/conversations/${convId}/interactions`
            : `/zra/conversations/${convId}/interactions`,
          token
        ),
      ]);

      console.log(JSON.stringify({
        level: "info",
        tag: "[pam/zoom/ra]",
        action: "latest:detail",
        convId,
        detailStatus: detailResult.status,
        interactionsStatus: interactionsResult.status,
        interactionsErrorCode: interactionsResult.errorCode ?? null,
      }));

      // Merge detail fields into call if available
      if (detailResult.ok) {
        const d = detailResult.body;
        call.host_email = d.host_email ?? d.host_id ?? call.host_email;
        call.topic = d.conversation_topic ?? d.topic ?? call.topic;
        call.start_time = d.meeting_start_time ?? d.start_time ?? call.start_time;
        call.duration = d.duration ?? call.duration;
      }

      let transcript: any;
      if (!interactionsResult.ok) {
        const reason = zoomErrorToTranscriptReason(interactionsResult.errorCode);
        transcript = { available: false, reason, sentences: [] };
      } else {
        transcript = normalizeTranscript(interactionsResult.body);
      }

      return NextResponse.json({
        success: true,
        source: "zoom_revenue_accelerator",
        call,
        transcript,
        diagnostics: { endpoint_used: endpointUsed, fallback_used: fallbackUsed },
      });
    }

    // -----------------------------------------------------------------------
    // action=transcript  — specific call transcript by call_id
    // -----------------------------------------------------------------------
    if (action === "transcript") {
      if (!callId) {
        return NextResponse.json({ error: "call_id is required for action=transcript" }, { status: 400 });
      }

      const primaryDetailPath = `/zra/conversations/${callId}`;
      const primaryInteractionsPath = `/zra/conversations/${callId}/interactions`;
      const fallbackDetailPath = `/iq/conversations/${callId}`;
      const fallbackInteractionsPath = `/iq/conversations/${callId}/interactions`;

      // Try primary detail first
      const detailResult = await zoomGetRaw(primaryDetailPath, token);
      console.log(JSON.stringify({
        level: "info",
        tag: "[pam/zoom/ra]",
        action: "transcript:detail",
        callId,
        path: primaryDetailPath,
        status: detailResult.status,
        zoomErrorCode: detailResult.errorCode ?? null,
      }));

      const useFallback = !detailResult.ok && (detailResult.status === 404 || detailResult.errorCode === 2300);
      const detailPath = useFallback ? fallbackDetailPath : primaryDetailPath;
      const interactionsPath = useFallback ? fallbackInteractionsPath : primaryInteractionsPath;

      const [finalDetailResult, interactionsResult] = await Promise.all([
        useFallback ? zoomGetRaw(fallbackDetailPath, token) : Promise.resolve(detailResult),
        zoomGetRaw(interactionsPath, token),
      ]);

      console.log(JSON.stringify({
        level: "info",
        tag: "[pam/zoom/ra]",
        action: "transcript:interactions",
        callId,
        path: interactionsPath,
        status: interactionsResult.status,
        zoomErrorCode: interactionsResult.errorCode ?? null,
        fallbackUsed: useFallback,
      }));

      if (!finalDetailResult.ok && !interactionsResult.ok) {
        return NextResponse.json({
          success: false,
          source: "zoom_revenue_accelerator",
          error: {
            message: finalDetailResult.errorMessage ?? "Conversation not found",
            code: finalDetailResult.errorCode ?? finalDetailResult.status,
            http_status: finalDetailResult.status,
          },
          diagnostics: { endpoint_used: detailPath, fallback_used: useFallback },
        }, { status: 502 });
      }

      const call = finalDetailResult.ok ? normalizeCall(finalDetailResult.body) : {
        id: callId, topic: "", start_time: "", duration: 0, host_email: "",
      };

      let transcript: any;
      if (!interactionsResult.ok) {
        const reason = zoomErrorToTranscriptReason(interactionsResult.errorCode);
        transcript = { available: false, reason, sentences: [] };
      } else {
        transcript = normalizeTranscript(interactionsResult.body);
      }

      return NextResponse.json({
        success: true,
        source: "zoom_revenue_accelerator",
        call,
        transcript,
        diagnostics: { endpoint_used: detailPath, fallback_used: useFallback },
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}. Valid: list, latest, transcript` }, { status: 400 });

  } catch (err: any) {
    console.error(JSON.stringify({
      level: "error",
      tag: "[pam/zoom/ra]",
      message: err?.message ?? "Unknown error",
    }));
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
