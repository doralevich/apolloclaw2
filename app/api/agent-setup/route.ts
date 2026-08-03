import { getAgentType } from "@/config/agent-types";
import { storeAgentSetup, type AvatarUpload } from "@/lib/agent-setup";
import { requireMember, requireUser } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/agent-setup { workspace_id?, agent_type, answers, agent_name?, avatar_upload?, avatar_preset? }
//
// Stores the post-purchase questionnaire (the SAME questionnaire as the free /onboard lead
// form — see components/onboard/OnboardingForm.tsx) and pushes it into the provisioned
// instance as USER.md. Ordering with the Stripe webhook is race-free by construction:
// whichever side finishes second finds the other's work — the webhook's provision path
// injects stored answers, and this route injects into an existing agent.
//
// This route's own job is authorization: a logged-in member of the workspace. Everything
// after that is shared with the license flow and lives in lib/agent-setup.ts.

export const POST = route(async (request: Request) => {
  const { supabase, user } = await requireUser();
  const body = await readJson<{
    workspace_id?: string;
    agent_type?: string;
    answers?: Record<string, unknown>;
    // Personalize step (components/onboard/OnboardingForm.tsx): a chosen agent name, and
    // an avatar as EITHER an uploaded file (same base64 shape as the company-materials
    // upload) OR a preset — already a full `data:image/svg+xml` URI, nothing to upload.
    agent_name?: string;
    avatar_upload?: AvatarUpload;
    avatar_preset?: string;
  }>(request);

  if (!body.agent_type) throw new ApiError(400, "invalid_request", "agent_type is required");
  const type = getAgentType(body.agent_type);
  if (!type || !type.planKey) throw new ApiError(404, "not_found", "Unknown agent type");

  // The checkout success URL carries the workspace; a direct visit falls back to the
  // user's first workspace (the common case — self-serve users have exactly one).
  let workspaceId = body.workspace_id;
  if (!workspaceId) {
    const { data } = await createAdminClient()
      .from("memberships")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    workspaceId = (data?.workspace_id as string) ?? undefined;
  }
  if (!workspaceId) throw new ApiError(400, "invalid_request", "No workspace found for this account");
  await requireMember(supabase, workspaceId, user.id);

  const result = await storeAgentSetup({
    type,
    workspaceId,
    submittedBy: user.id,
    buyerEmail: user.email ?? user.id,
    answers: body.answers,
    agentName: body.agent_name,
    avatarUpload: body.avatar_upload,
    avatarPreset: body.avatar_preset,
    // The Stripe webhook provisions this flow's agents; this route only ever injects into
    // whatever it finds.
    provisionIfMissing: false,
  });

  // workspace_id feeds the post-submit "building your agent" screen, which polls the
  // workspace's agent list until the webhook-provisioned agent shows up running.
  return json({ ok: true, agent_provisioned: result.agentProvisioned, workspace_id: result.workspaceId });
});
