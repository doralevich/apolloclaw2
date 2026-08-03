import { licenseAgentType } from "@/config/agent-types";
import { storeAgentSetup, type AvatarUpload } from "@/lib/agent-setup";
import { ApiError, json, readJson, route } from "@/lib/http";
import { findBuyerAccount, verifyPaidLicenseSession } from "@/lib/license-session";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";

// POST /api/onboard/complete { session_id, answers, agent_name?, avatar_upload?, avatar_preset? }
//
// The end of the license journey: the buyer has paid, answered the questionnaire, and named
// their agent. This stores the answers and provisions the agent from them.
//
// The per-agent equivalent is /api/agent-setup, and the two share everything downstream
// (lib/agent-setup.ts). They differ only in how the caller is authorized. That route wants a
// logged-in workspace member; this one cannot have that, because the buyer has an account
// created for them by the Stripe webhook and has never set a password. A paid checkout
// session stands in — see lib/license-session.ts for why that is a reasonable token and
// what it deliberately does NOT grant.
//
// Unlike the per-agent flow, this provisions rather than waiting for a webhook to do it.
// Nothing else ever will: the webhook creates the account and stops, on purpose, because
// under this model what gets built depends on the answers that only arrive here.

export const POST = route(async (request: Request) => {
  const limited = await enforceRateLimit(request, "onboard_complete", LIMITS.form);
  if (limited) return limited;

  const body = await readJson<{
    session_id?: string;
    answers?: Record<string, unknown>;
    agent_name?: string;
    avatar_upload?: AvatarUpload;
    avatar_preset?: string;
  }>(request);

  if (!body.session_id) throw new ApiError(400, "invalid_request", "session_id is required");
  const { email } = await verifyPaidLicenseSession(body.session_id);

  // Throws 409 account_pending if the webhook has not landed yet. The client retries on
  // that rather than showing a failure, since it resolves itself within seconds.
  const { userId, workspaceId } = await findBuyerAccount(email);

  const result = await storeAgentSetup({
    type: licenseAgentType(),
    workspaceId,
    submittedBy: userId,
    buyerEmail: email,
    answers: body.answers,
    agentName: body.agent_name,
    avatarUpload: body.avatar_upload,
    avatarPreset: body.avatar_preset,
    provisionIfMissing: true,
  });

  return json({ ok: true, agent_provisioned: result.agentProvisioned, workspace_id: result.workspaceId });
});
