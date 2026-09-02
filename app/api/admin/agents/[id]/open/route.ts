import { requirePlatformAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { isKnownTemplate, portsForTemplate } from "@/config/agents";
import { ApiError, json, route } from "@/lib/http";
import { agent37 } from "@/lib/agent37";
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

  // The dashboard port depends on the instance's template, and getting it wrong is silent:
  // the signed URL mints fine and the tab just never loads. This used to read the template
  // ONLY from our own row and let portsForTemplate fall back to the OpenClaw map when there
  // wasn't one - so every instance with no row here (this Agent37 account is shared with the
  // College Agent, whose Hermes boxes serve 9119, not OpenClaw's 18789) got a URL pointing at
  // a port nothing listens on. Ask Agent37 for the real template instead of assuming.
  const { data: row } = await createAdminClient()
    .from("agents")
    .select("template")
    .eq("agent37_id", id)
    .maybeSingle();
  let template: string | null | undefined = row?.template;
  if (!template) {
    template = await agent37.listAgents().then(
      (r) => r.data.find((a) => a.id === id)?.template ?? null,
      () => null
    );
  }
  if (!isKnownTemplate(template)) {
    // Better an explanation than a blank tab: say what it is and where it can be opened.
    throw new ApiError(
      400,
      "invalid_request",
      "This instance isn't one this app manages - it has no record here and its template isn't one we serve. It most likely belongs to the College Agent, which shares this Agent37 account; open it from that app's admin instead."
    );
  }
  const port = portsForTemplate(template).dashboard;
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
