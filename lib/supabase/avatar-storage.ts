import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Public storage for agent avatar images uploaded during onboarding
// (components/onboard/OnboardingForm.tsx's Personalize step). Public — the avatar is
// rendered as a plain <img src> in the dashboard, no signed URLs needed.
const BUCKET = "agent-avatars";
const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

async function ensureBucket() {
  const supabase = createAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
    });
    // A concurrent request may have created it a moment earlier — that's fine.
    if (error && !/already exists/i.test(error.message)) throw error;
  }

  return supabase;
}

// Decodes a base64-encoded upload (same shape the onboarding form already uses for
// company-materials uploads — see readFileAsBase64 in OnboardingForm.tsx) and stores it
// under the workspace + agent type, returning its public URL. Returns null on anything
// that doesn't look like a real, allowed image rather than throwing — a bad avatar upload
// should never block the rest of onboarding.
export async function uploadAgentAvatar(
  workspaceId: string,
  agentTypeId: string,
  upload: { name: string; type: string; size: number; dataBase64: string }
): Promise<string | null> {
  if (!ALLOWED_TYPES.has(upload.type)) return null;
  if (!upload.dataBase64 || upload.size > MAX_BYTES) return null;

  let bytes: Buffer;
  try {
    bytes = Buffer.from(upload.dataBase64, "base64");
  } catch {
    return null;
  }
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return null;

  const ext = upload.type === "image/png" ? "png" : upload.type === "image/webp" ? "webp" : "jpg";
  const path = `${workspaceId}/${agentTypeId}-${Date.now()}.${ext}`;

  const supabase = await ensureBucket();
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: upload.type,
    upsert: true,
  });
  if (error) {
    console.error("[avatar-storage:upload-failed]", error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
