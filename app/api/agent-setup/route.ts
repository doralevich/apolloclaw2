import { getAgentType } from "@/config/agent-types";
import { storeAgentSetup, type AvatarUpload } from "@/lib/agent-setup";
import { requireMember, requireUser } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { buildIntakeSections, normalizeForHtml } from "@/lib/onboardingSections";
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

// The response goes out in a second; the work AFTER it is what needs the room. `after()`
// here reads the customer's website, extracts their uploads, and then retries exec against an
// instance that may still be booting — and all of that counts against this function's
// duration. The default 60s cut it off mid-retry.
export const maxDuration = 300;

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
  if (!type) throw new ApiError(404, "not_found", "Unknown agent type");
  // Sold and configured on another site — its questionnaire is not ours to accept.
  if (type.externalUrl) throw new ApiError(404, "not_found", "Unknown agent type");

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

  // This route used to serve only PAID types, which meant the license build — the one thing
  // we actually sell — had no way to be configured except by buying it again. Opening it up
  // needs a rule that can't be abused into free provisioning, and this is it: you may fill in
  // the questionnaire for an agent THAT ALREADY EXISTS in your workspace.
  //
  // Paid types are exempt because they race the Stripe webhook: the buyer often lands here
  // before provisioning finishes, and the answers are stored for the webhook to pick up.
  if (!type.planKey) {
    const { data: existing } = await createAdminClient()
      .from("agents")
      .select("agent37_id")
      .eq("workspace_id", workspaceId)
      .eq("agent_type", type.id)
      .limit(1)
      .maybeSingle();
    if (!existing) {
      throw new ApiError(
        400,
        "invalid_request",
        `There is no ${type.label} in this workspace to set up yet.`
      );
    }
  }

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

// GET /api/agent-setup?workspace=<id>&type=<agent_type>
//
// Reads the stored questionnaire back to its owner: "what your agent knows about you".
//
// Someone who has just paid for an agent has no way to check that it absorbed what they
// typed — the only route was to ask it in chat and hope. The answers already exist in
// agent_setup; nothing read them.
//
// Sections are assembled HERE rather than client-side for two reasons. lib/onboardingSections
// type-imports from lib/pdf, which is server-only and pulls in @react-pdf/renderer, so the
// client has no business near it. And the raw `answers` blob is every field ever collected —
// sending the rendered label/value pairs means the browser receives what it displays and
// nothing more.
export const GET = route(async (request: Request) => {
  const { supabase, user } = await requireUser();
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspace");
  const agentType = url.searchParams.get("type");

  if (!workspaceId) throw new ApiError(400, "invalid_request", "workspace is required");
  if (!agentType) throw new ApiError(400, "invalid_request", "type is required");
  await requireMember(supabase, workspaceId, user.id);

  // Service-role: agent_setup is RLS-on-no-policy (server-only by design), so a user-scoped
  // read returns nothing. Membership was just checked above.
  const { data } = await createAdminClient()
    .from("agent_setup")
    .select("answers, updated_at, injected_at")
    .eq("workspace_id", workspaceId)
    .eq("agent_type", agentType)
    .maybeSingle();

  if (!data) return json({ sections: [], updated_at: null, injected_at: null });

  const answers = (data.answers ?? {}) as Record<string, unknown>;
  const sections = buildIntakeSections(answers)
    .map((s) => ({
      title: s.title,
      // normalizeForHtml is a value -> display-string normaliser (it joins arrays, trims,
      // and turns null into ""); the name is historical. It does no escaping — React does
      // that at render.
      rows: s.rows
        .map((r) => ({ label: r.label, value: normalizeForHtml(r.value) }))
        .filter((r) => r.value),
    }))
    .filter((s) => s.rows.length > 0);

  return json({
    sections,
    updated_at: data.updated_at ?? null,
    injected_at: data.injected_at ?? null,
  });
});
