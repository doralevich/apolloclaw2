import { createClient } from "@supabase/supabase-js";

export type StoredZoomToken = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
  created_at: string;
};

export type ZoomSafeError = {
  timestamp: string;
  event_type: string;
  meeting_id_or_uuid?: string | null;
  failed_step: string;
  message: string;
};

const defaultSupabaseUrl = "https://moubzvpffhqvumipbnfj.supabase.co";
const bucketName = process.env.ZOOM_STORAGE_BUCKET || "zoom-integrations";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || defaultSupabaseUrl;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

  if (!serviceKey) {
    throw new Error("Supabase service role key is not configured");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function jsonFile(data: unknown) {
  return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
}

function textFile(data: string) {
  return new Blob([data], { type: "text/vtt; charset=utf-8" });
}

export function safeFilePart(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 160) || "zoom-meeting";
}

export function sanitizeErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || "Unknown error");
  return raw
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
    .replace(/Basic\s+[A-Za-z0-9._~+/=-]+/gi, "Basic [REDACTED]")
    .replace(/access_token[\"'=:\s]+[A-Za-z0-9._~+/=-]+/gi, "access_token=[REDACTED]")
    .replace(/refresh_token[\"'=:\s]+[A-Za-z0-9._~+/=-]+/gi, "refresh_token=[REDACTED]")
    .slice(0, 500);
}

async function ensureBucket() {
  const supabase = getSupabaseAdmin();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  const exists = buckets?.some((bucket) => bucket.name === bucketName);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 20 * 1024 * 1024,
    });
    if (error) throw error;
  }

  return supabase;
}

async function uploadPrivate(path: string, body: Blob) {
  const supabase = await ensureBucket();
  const { error } = await supabase.storage.from(bucketName).upload(path, body, {
    contentType: body.type || "application/octet-stream",
    upsert: true,
  });
  if (error) throw error;
  return `${bucketName}/${path}`;
}

async function downloadPrivateText(path: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(bucketName).download(path);
  if (error) return null;
  return data.text();
}

export async function ensureZoomStorageLayout() {
  await uploadPrivate("pam/events/.keep", textFile(""));
  await uploadPrivate("pam/events/errors/.keep", textFile(""));
  await uploadPrivate("pam/transcripts/.keep", textFile(""));
}

export async function saveZoomTokens(token: StoredZoomToken) {
  await ensureZoomStorageLayout();
  return uploadPrivate("pam/tokens.json", jsonFile(token));
}

export async function readZoomTokens(): Promise<StoredZoomToken | null> {
  const raw = await downloadPrivateText("pam/tokens.json");
  if (!raw) return null;
  return JSON.parse(raw) as StoredZoomToken;
}

export function tokenLooksExpired(token: StoredZoomToken) {
  const created = Date.parse(token.created_at);
  if (!Number.isFinite(created)) return true;
  const safetyWindowMs = 5 * 60_000;
  return Date.now() >= created + token.expires_in * 1000 - safetyWindowMs;
}

export function storagePathsForMeeting(meetingId: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const base = `${stamp}-${safeFilePart(meetingId)}`;
  return {
    metadata: `pam/transcripts/${base}.metadata.json`,
    transcript: `pam/transcripts/${base}.vtt`,
    event: `pam/events/${base}.event.json`,
  };
}

export function errorPathForMeeting(eventType: string, meetingIdOrUuid?: string | null) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `pam/events/errors/${stamp}-${safeFilePart(eventType)}-${safeFilePart(meetingIdOrUuid || "unknown")}.json`;
}

export async function saveZoomMetadata(path: string, data: unknown) {
  return uploadPrivate(path, jsonFile(data));
}

export async function saveZoomTranscript(path: string, transcript: string) {
  return uploadPrivate(path, textFile(transcript));
}

export async function saveZoomRawEvent(path: string, data: unknown) {
  return uploadPrivate(path, jsonFile(data));
}

export async function saveZoomError(error: ZoomSafeError) {
  return uploadPrivate(errorPathForMeeting(error.event_type, error.meeting_id_or_uuid), jsonFile(error));
}

export async function objectExists(path: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(bucketName).download(path);
  return Boolean(data && !error);
}

export async function prefixHasObjects(prefix: string) {
  const supabase = await ensureBucket();
  const folder = prefix.replace(/\/$/, "");
  const { data, error } = await supabase.storage.from(bucketName).list(folder, { limit: 1 });
  if (error) return false;
  return Boolean(data && data.length > 0);
}

export function getStorageDescription() {
  return `Supabase Storage private bucket ${bucketName}, paths pam/tokens.json, pam/transcripts/, pam/events/, and pam/events/errors/`;
}
