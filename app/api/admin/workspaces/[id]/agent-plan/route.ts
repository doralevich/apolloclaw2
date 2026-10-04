import { requirePlatformAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { getAgentPlanUsage, setWorkspaceAgentPlan } from "@/lib/agent-plan";
import { AGENT_TIERS } from "@/config/agent-plans";
import { ApiError, json, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// Super Admin: a workspace's agent plan.
//
//   GET                          the plan and how much of it is in use
//   PUT { plan, agentLimit? }    set the tier, and optionally a number of the workspace's own
//                                (null or absent clears it back to the tier's count)
export const GET = route(async (_request: Request, { params }: Ctx) => {
  await requirePlatformAdmin();
  const { id } = await params;
  return json(await getAgentPlanUsage(id));
});

export const PUT = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  const body = await readJson<{ plan?: unknown; agentLimit?: unknown }>(request);
  const plan = typeof body.plan === "string" ? body.plan : "";
  if (!AGENT_TIERS.some((t) => t.id === plan)) {
    throw new ApiError(400, "invalid_request", `Pick a plan: ${AGENT_TIERS.map((t) => t.id).join(", ")}.`);
  }
  let agentLimit: number | null = null;
  if (body.agentLimit !== undefined && body.agentLimit !== null && body.agentLimit !== "") {
    const n = Number(body.agentLimit);
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      throw new ApiError(400, "invalid_request", "A custom limit is a whole number from 1 to 100.");
    }
    agentLimit = n;
  }
  try {
    await setWorkspaceAgentPlan(id, plan, agentLimit, user.email ?? null);
  } catch (e) {
    throw new ApiError(500, "plan_save_failed", `Could not save the plan: ${(e as Error).message}. Has migration 0033 been applied?`);
  }
  await logAudit({ actorEmail: user.email, action: "workspace.agent_plan_set", target: id, metadata: { plan, agentLimit }, request });
  return json(await getAgentPlanUsage(id));
});
