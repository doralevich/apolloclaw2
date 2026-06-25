import { NextResponse } from "next/server";
import {
  ensureZoomStorageLayout,
  objectExists,
  prefixHasObjects,
  readZoomTokens,
  tokenLooksExpired,
} from "../storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const expectedScopes = [
  "meeting:read:search",
  "meeting:read:meeting_transcript",
  "meeting:read:meeting_audio",
  "meeting:read:meeting_chat",
  "cloud_recording:read:list_recording_files",
  "cloud_recording:read:list_user_recordings",
  "cloud_recording:read:recording_analytics_details",
  "cloud_recording:read:content",
  "cloud_recording:read:recording",
];

function scopeList(scope: unknown) {
  if (typeof scope !== "string") return [];
  return scope.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
}

export async function GET() {
  try {
    await ensureZoomStorageLayout();
  } catch {
    // Continue with partial reporting. This endpoint exposes only safe booleans and scope names.
  }

  const token = await readZoomTokens();
  const scopes = scopeList(token?.scope);
  const missingScopes = expectedScopes.filter((scope) => !scopes.includes(scope));

  return NextResponse.json({
    ok: true,
    env: {
      ZOOM_CLIENT_ID: Boolean(process.env.ZOOM_CLIENT_ID),
      ZOOM_CLIENT_SECRET: Boolean(process.env.ZOOM_CLIENT_SECRET),
      ZOOM_REDIRECT_URI: Boolean(process.env.ZOOM_REDIRECT_URI),
      ZOOM_WEBHOOK_SECRET_TOKEN: Boolean(process.env.ZOOM_WEBHOOK_SECRET_TOKEN),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY),
      ZOOM_STORAGE_BUCKET: Boolean(process.env.ZOOM_STORAGE_BUCKET),
    },
    storage: {
      token_file_exists: await objectExists("pam/tokens.json"),
      events_folder_exists: await prefixHasObjects("pam/events"),
      transcripts_folder_exists: await prefixHasObjects("pam/transcripts"),
      errors_folder_exists: await prefixHasObjects("pam/events/errors"),
    },
    token: token ? {
      present: true,
      created_at: token.created_at,
      expires_in: token.expires_in,
      close_to_expiring_or_expired: tokenLooksExpired(token),
      has_access_token: Boolean(token.access_token),
      has_refresh_token: Boolean(token.refresh_token),
      scopes,
      expected_scopes_present: missingScopes.length === 0,
      missing_scopes: missingScopes,
    } : {
      present: false,
      scopes: [],
      expected_scopes_present: false,
      missing_scopes: expectedScopes,
    },
  });
}
