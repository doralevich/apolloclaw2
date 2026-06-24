import { NextRequest, NextResponse } from "next/server";
import { saveZoomTokens } from "../storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redirectUri = process.env.ZOOM_REDIRECT_URI || "https://www.apolloclaw.ai/pam/zoom/callback";

function html(message: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>Zoom Integration</title></head><body><main style="font-family:system-ui,sans-serif;max-width:720px;margin:48px auto;padding:0 20px;"><p>${message}</p></main></body></html>`,
    {
      status,
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return html("Missing Zoom authorization code.");
  }

  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return html("Zoom integration is not fully configured. Missing Zoom client credentials.", 500);
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Zoom OAuth token exchange failed", `${response.status} ${response.statusText}`);
    return html("Zoom authorization failed. Please contact Apollo Claw support.", 502);
  }

  const token = await response.json();

  await saveZoomTokens({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_in: token.expires_in,
    scope: token.scope,
    created_at: new Date().toISOString(),
  });

  return html("Zoom connected successfully. You can close this window.");
}
