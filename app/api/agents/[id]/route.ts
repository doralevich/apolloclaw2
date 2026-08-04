import { isAvatarPresetPath } from "@/config/avatar-presets";
import { agent37 } from "@/lib/agent37";
import { requireAgentAccess } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { uploadAgentAvatar } from "@/lib/supabase/avatar-storage";

type Ctx = { params: Promise<{ id: string }> };

interface AvatarUpload {
  name: string;
  type: string;
  size: number;
  dataBase64: string;
}

// PATCH /api/agents/[id] { name?, avatar_preset?, avatar_upload? }
//
// Renaming, and changing the picture. The picture was previously settable only during the
// onboarding questionnaire — pick once, at the least informed moment there is, and live with
// it. Now it can be changed whenever.
//
// Every field is optional and applied only if present, so the picker can send a picture
// without touching the name.
export const PATCH = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, row: agent } = await requireAgentAccess(id, "admin");

  const body = await readJson<{
    name?: string;
    avatar_preset?: string;
    avatar_upload?: AvatarUpload;
  }>(request);

  const update: { name?: string; avatar_url?: string } = {};

  if (body.name !== undefined) {
    const trimmed = body.name.trim();
    if (!trimmed) throw new ApiError(400, "invalid_request", "name cannot be empty");
    update.name = trimmed.slice(0, 80);
  }

  if (body.avatar_upload) {
    const url = await uploadAgentAvatar(agent.workspace_id, agent.agent_type ?? "agent", body.avatar_upload);
    if (!url) throw new ApiError(500, "upload_failed", "Couldn't store that image. Try a smaller PNG or JPEG.");
    update.avatar_url = url;
  } else if (body.avatar_preset !== undefined) {
    // Same rule as the questionnaire (lib/agent-setup.ts): one of our shipped avatars matched
    // against the exact list, or a small inline data: URI for the generated initials image.
    // Anything else is a client writing an arbitrary URL into a column we render as an <img>.
    const preset = body.avatar_preset;
    const ok = isAvatarPresetPath(preset) || (preset.startsWith("data:image/") && preset.length <= 20_000);
    if (!ok) throw new ApiError(400, "invalid_request", "Unrecognised avatar");
    update.avatar_url = preset;
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "invalid_request", "Nothing to update");
  }

  const { error } = await supabase.from("agents").update(update).eq("agent37_id", id);
  if (error) throw new ApiError(500, "db_error", error.message);

  return json({ id, ...update });
});

export const DELETE = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase } = await requireAgentAccess(id, "admin");

  await agent37.deleteAgent(id);
  await supabase.from("agents").delete().eq("agent37_id", id);

  return json({ id, deleted: true });
});
