import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Public storage for the images customers upload: agent avatars (the onboarding form's
// Personalize step), workspace logos (dashboard settings), and the person's own picture. Public buckets — both are
// rendered as a plain <img src> in the dashboard, so signed URLs would buy nothing.
const AVATAR_BUCKET = "agent-avatars";
const LOGO_BUCKET = "workspace-logos";
const USER_BUCKET = "user-avatars";
const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
// SVG is deliberately absent. It is the format a company most likely HAS its logo in, and the
// one we cannot serve from a public bucket without care: an SVG is a document, it can carry
// script, and the browser will run it when the file is opened directly. Asking for a PNG is a
// small annoyance; hosting arbitrary SVG on our origin is not.

async function ensureBucket(bucket: string) {
  const supabase = createAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (!buckets?.some((b) => b.name === bucket)) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: MAX_BYTES,
    });
    // A concurrent request may have created it a moment earlier — that's fine.
    if (error && !/already exists/i.test(error.message)) throw error;
  }

  return supabase;
}

export interface ImageUpload { name: string; type: string; size: number; dataBase64: string }

// Shared decode + validate + store. Returns null on anything that isn't a real, allowed image
// rather than throwing: a bad upload should never take down the flow around it.
async function storeImage(bucket: string, path: (ext: string) => string, upload: ImageUpload): Promise<string | null> {
  if (!ALLOWED_TYPES.has(upload.type)) return null;
  if (!upload.dataBase64 || upload.size > MAX_BYTES) return null;

  let bytes: Buffer;
  try {
    bytes = Buffer.from(upload.dataBase64, "base64");
  } catch {
    return null;
  }
  // Checked on the DECODED bytes, not the claimed size — `size` comes from the client and a
  // caller could report anything.
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return null;

  const ext = upload.type === "image/png" ? "png" : upload.type === "image/webp" ? "webp" : "jpg";
  const supabase = await ensureBucket(bucket);
  const key = path(ext);
  const { error } = await supabase.storage.from(bucket).upload(key, bytes, {
    contentType: upload.type,
    upsert: true,
  });
  if (error) {
    console.error("[image-storage:upload-failed]", bucket, error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * The customer's own logo, shown in their dashboard sidebar.
 *
 * Timestamped filename rather than a fixed one per workspace: the URL is public and cached,
 * and overwriting in place would leave people looking at their old logo until the CDN felt
 * like letting go.
 */
export async function uploadWorkspaceLogo(
  workspaceId: string,
  upload: ImageUpload
): Promise<string | null> {
  return storeImage(LOGO_BUCKET, (ext) => `${workspaceId}/logo-${Date.now()}.${ext}`, upload);
}

// Decodes a base64-encoded upload (same shape the onboarding form already uses for
// company-materials uploads — see readFileAsBase64 in OnboardingForm.tsx) and stores it
// under the workspace + agent type, returning its public URL. Returns null on anything
// that doesn't look like a real, allowed image rather than throwing — a bad avatar upload
// should never block the rest of onboarding.
export async function uploadAgentAvatar(
  workspaceId: string,
  agentTypeId: string,
  upload: ImageUpload
): Promise<string | null> {
  return storeImage(AVATAR_BUCKET, (ext) => `${workspaceId}/${agentTypeId}-${Date.now()}.${ext}`, upload);
}

/**
 * The signed-in person's own picture, shown beside their messages in chat.
 *
 * Its own bucket rather than a folder inside agent-avatars: this one belongs to a USER, not to a
 * workspace, and it outlives every workspace they are a member of. Keying it under a workspace
 * id would make "which of my workspaces did I upload this in" a real question, and deleting that
 * workspace would take their face with it.
 *
 * Timestamped for the same reason the workspace logo is: the URL is public and cached, so
 * overwriting in place would leave them looking at their old picture until the CDN let go.
 */
export async function uploadUserAvatar(userId: string, upload: ImageUpload): Promise<string | null> {
  return storeImage(USER_BUCKET, (ext) => `${userId}/avatar-${Date.now()}.${ext}`, upload);
}
