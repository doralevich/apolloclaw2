import { requireAgentAccess } from "@/lib/auth";
import { portsForTemplate } from "@/config/agents";
import { ApiError, json, readJson, route } from "@/lib/http";
import { instanceSignedUrl } from "@/lib/openclaw-dashboard";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { row } = await requireAgentAccess(id, "member");

  const { port, ttl_seconds } = await readJson<{ port?: number; ttl_seconds?: number }>(request);
  if (!port) throw new ApiError(400, "invalid_request", "port is required");
  // Enforce the allowlist server-side, scoped to what this agent's template actually serves:
  // a member must not open an arbitrary internal port.
  const allowedPorts = Object.values(portsForTemplate(row.template)) as number[];
  if (!allowedPorts.includes(port)) {
    throw new ApiError(400, "invalid_request", "port is not openable for this agent");
  }

  // Signed URL + OpenClaw dashboard token ride-along, shared with the admin god-view's
  // open-instance button (lib/openclaw-dashboard.ts).
  return json(await instanceSignedUrl(id, port, ttl_seconds));
});
