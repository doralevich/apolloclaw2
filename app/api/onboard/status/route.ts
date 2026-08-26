import { agent37 } from "@/lib/agent37";
import { licenseAgentType } from "@/config/agent-types";
import { ApiError, json, route } from "@/lib/http";
import { findBuyerAccount, verifyPaidLicenseSession } from "@/lib/license-session";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/onboard/status?id=cs_... — build progress for the license flow's "building your
// agent" screen.
//
// The dashboard equivalent is /api/agents, which needs a logged-in member. This buyer has
// no session yet (they have not set a password), so the paid checkout session authorizes
// the read instead — see lib/license-session.ts.
//
// The response says only what the screen draws: whether the agent row exists and whether
// its instance reports running. No agent id, no workspace id, no instance internals.

export const GET = route(async (request: Request) => {
  // The build screen polls every few seconds for a couple of minutes, so this needs more
  // headroom than a form post. `assistant` is the hourly bucket that fits that shape.
  const limited = await enforceRateLimit(request, "onboard_status", LIMITS.assistant);
  if (limited) return limited;

  const id = new URL(request.url).searchParams.get("id")?.trim() || "";
  if (!id) throw new ApiError(400, "invalid_request", "id is required");

  const { email } = await verifyPaidLicenseSession(id);
  const { workspaceId } = await findBuyerAccount(email);
  const type = licenseAgentType();

  const { data: row } = await createAdminClient()
    .from("agents")
    .select("agent37_id")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .or(`agent_type.eq.${type.id},template.eq.${type.template}`)
    .limit(1)
    .maybeSingle();

  const agentId = row?.agent37_id as string | undefined;
  if (!agentId) return json({ created: false, running: false });

  // The DB row appears the moment the instance is created; "running" comes from Agent37
  // itself. A failure to reach it is reported as not-yet-running rather than as an error —
  // the screen is a progress indicator, and it should keep waiting rather than break.
  let running = false;
  try {
    const { data } = await agent37.listAgents();
    running = data.some((a) => a.id === agentId && a.status === "running");
  } catch (err) {
    console.error("[onboard-status] could not reach Agent37:", err);
  }

  return json({ created: true, running });
});
