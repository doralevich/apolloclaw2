import { requireMember, requireUser } from "@/lib/auth";
import { getAgentPlanUsage } from "@/lib/agent-plan";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/workspaces/{id}/agent-plan - the workspace's agent plan and how much of it is in use,
// for the "2 of 3 agents" line and the Add agent / Upgrade buttons. Any member may read it; only
// Super Admin sets it (/api/admin/workspaces/{id}/agent-plan).
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  await requireMember(supabase, id, user.id);
  return json(await getAgentPlanUsage(id));
});
