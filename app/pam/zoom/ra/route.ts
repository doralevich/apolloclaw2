import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

async function zoomGet(path: string, token: string) {
  const response = await fetch(`https://api.zoom.us/v2${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Zoom API error ${response.status}: ${body}`);
  }
  return response.json();
}

// GET /pam/zoom/ra?action=list&limit=10
// GET /pam/zoom/ra?action=transcript&call_id=<id>
// GET /pam/zoom/ra?action=latest
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "list";
    const callId = searchParams.get("call_id");
    const limit  = searchParams.get("limit") || "10";

    const token = await fetchServerToServerToken();

    if (action === "list") {
      const data = await zoomGet(`/revenue_accelerator/calls?page_size=${limit}`, token);
      return NextResponse.json({ success: true, calls: data.calls ?? data.conversations ?? [] });
    }

    if (action === "latest") {
      const data  = await zoomGet("/revenue_accelerator/calls?page_size=1", token);
      const calls = data.calls ?? data.conversations ?? [];
      if (!calls.length) return NextResponse.json({ success: true, call: null, transcript: null });
      const call   = calls[0];
      const id     = call.id;
      let transcript = null;
      try {
        transcript = await zoomGet(`/revenue_accelerator/calls/${id}/transcript`, token);
      } catch {
        // transcript may not be ready yet
      }
      return NextResponse.json({ success: true, call, transcript });
    }

    if (action === "transcript") {
      if (!callId) return NextResponse.json({ error: "call_id is required" }, { status: 400 });
      const [call, transcript] = await Promise.allSettled([
        zoomGet(`/revenue_accelerator/calls/${callId}`, token),
        zoomGet(`/revenue_accelerator/calls/${callId}/transcript`, token),
      ]);
      return NextResponse.json({
        success: true,
        call:       call.status === "fulfilled" ? call.value : null,
        transcript: transcript.status === "fulfilled" ? transcript.value : null,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });

  } catch (err: any) {
    console.error("[pam/zoom/ra]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
