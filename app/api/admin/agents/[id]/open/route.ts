import { requirePlatformAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { portsForTemplate } from "@/config/agents";
import { ApiError, json, route } from "@/lib/http";
import { instanceSignedUrl } from "@/lib/openclaw-dashboard";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/agents/{id}/open — log the operator into a customer's instance.
//
// Built for white-glove onboarding: a client signs up, and David needs to open their
// OpenClaw dashboard and confirm the intake actually configured what it was supposed to.
// The customer-facing signed-url route can't do it - it requires membership in the
// workspace, which a platform admin deliberately isn't - so this is the same signed URL
// and gateway-token ride-along behind the platform-admin gate instead.
//
// Every open is audit-logged. Entering a customer's instance is the most privileged thing
// the god-view does, and "who opened whose agent, when" must never be a mystery.
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;

  // The dashboard port depends on the instance's template (the college-agent image remaps
  // its surfaces and exposes none of the standard ports). Orphan instances have no row;
  // they get the default openclaw template's port map.
  const { data: row } = await createAdminClient()
    .from("agents")
    .select("template")
    .eq("agent37_id", id)
    .maybeSingle();
  const port = portsForTemplate(row?.template).dashboard;
  if (!port) {
    throw new ApiError(400, "invalid_request", "This agent's template doesn't expose a dashboard.");
  }

  const result = await instanceSignedUrl(id, port);

  await logAudit({
    actorEmail: user.email,
    action: "agent.dashboard_opened",
    target: id,
    request,
  });

  return json(result);
});
