import { after } from "next/server";
import { isAvatarPresetPath } from "@/config/avatar-presets";
import { agent37 } from "@/lib/agent37";
import { requireAgentAccess } from "@/lib/auth";
import { changeHostingSeats } from "@/lib/hosting-seats";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
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
    if (!ok) throw new ApiError(400, "invalid_request", "Unrecognized avatar");
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
  const { supabase, row: agent } = await requireAgentAccess(id, "admin");

  await agent37.deleteAgent(id);
  await supabase.from("agents").delete().eq("agent37_id", id);

  // Give the seat back — David's call, after testing left him billed for an agent he had
  // deleted. Adding through seats bumps the hosting quantity, so removing has to bump it down,
  // or "delete the test agent" quietly becomes a subscription line nobody is using.
  //
  // ONLY when at least one agent remains. Deleting your last agent is the delete-and-rebuild
  // flow: the quantity stays at 1, you keep paying for the seat you still own, and the rebuild
  // provisions against it without touching billing. changeHostingSeats floors at 1 anyway, so
  // even a miscount here cannot zero out the subscription; the count is so the ordinary rebuild
  // does not trigger a pointless no-op call. Decrease credits the account (create_prorations)
  // rather than refunding cash — the same proration the increase charged.
  //
  // After the response and best-effort: the agent is gone either way, and a Stripe hiccup must
  // not resurrect it on an error screen. The log line is the trail if the credit is missed.
  const db = createAdminClient();
  const { count } = await db
    .from("agents")
    .select("agent37_id", { count: "exact", head: true })
    .eq("workspace_id", agent.workspace_id);
  if ((count ?? 0) >= 1) {
    after(async () => {
      try {
        const seats = await changeHostingSeats(agent.workspace_id, -1);
        console.log("[agents:delete] hosting seat credited", agent.workspace_id, "->", seats);
      } catch (err) {
        console.error("[agents:delete] seat credit FAILED - workspace may be over-billed:", agent.workspace_id, err);
      }
    });
  }

  return json({ id, deleted: true });
});
