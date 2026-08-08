import { requireUser } from "@/lib/auth";
import { isAvatarPresetPath } from "@/config/avatar-presets";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadUserAvatar, type ImageUpload } from "@/lib/supabase/avatar-storage";

// The signed-in person's own name.
//
// It had no home before this. Checkout writes first_name/last_name into auth metadata from the
// Stripe session, and until now that was the only writer — so an account created any other way
// had no name at all, and one captured wrongly stayed wrong forever. The greeting on Start Here
// falls back to the email's local part in that case, which is how "daveo@" became "Hey Daveo",
// and there was no screen anywhere to correct it.
//
// Admin client because updating your own user metadata through the anon client would let the
// browser write arbitrary keys into it. This route takes two strings and writes two strings.

const MAX_NAME = 80;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_NAME) : "";
}

export const PATCH = route(async (request: Request) => {
  const { user } = await requireUser();
  const body = await readJson<{
    first_name?: string;
    last_name?: string;
    avatar_upload?: ImageUpload;
    /** Explicit empty string clears the picture. Absent means "leave it alone". */
    avatar_url?: string;
    /** One of the shipped portraits, matched against the exact list. */
    avatar_preset?: string;
  }>(request);

  const first = clean(body.first_name);
  const last = clean(body.last_name);

  // Upload first: a storage failure must not half-write the name. storeImage returns null
  // rather than throwing on a bad file, so this leaves the existing picture alone instead of
  // clearing it — losing a face because a JPEG was malformed would be a strange trade.
  let avatarUrl: string | undefined;
  if (body.avatar_upload) {
    avatarUrl = (await uploadUserAvatar(user.id, body.avatar_upload)) ?? undefined;
  } else if (body.avatar_preset !== undefined) {
    // Matched against the exact shipped list, the same rule /api/agents/[id] applies. This
    // value ends up in user_metadata and is rendered as an <img src>, so accepting a bare
    // string here would let the browser point everyone's face at any URL it liked.
    if (!isAvatarPresetPath(body.avatar_preset)) {
      throw new ApiError(400, "invalid_request", "Unknown avatar");
    }
    avatarUrl = body.avatar_preset;
  } else if (body.avatar_url === "") {
    avatarUrl = "";
  }

  const db = createAdminClient();
  const { error } = await db.auth.admin.updateUserById(user.id, {
    // Merged, not replaced. `phone` is written here by the Stripe webhook and nothing on this
    // screen collects it — a bare object would silently drop it.
    user_metadata: {
      ...(user.user_metadata ?? {}),
      first_name: first,
      last_name: last,
      ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
    },
  });
  if (error) throw new Error(error.message);

  return json({ ok: true, first_name: first, last_name: last, avatar_url: avatarUrl });
});
