import { requireAgentAccess, requireEntitled } from "@/lib/auth";
import { agentIdFromName, setupSecondAgent, type AgentSpec } from "@/lib/multi-agent-test";
import { readInstanceRoster } from "@/lib/instance-roster";
import { uploadSubAgentAvatar, type ImageUpload } from "@/lib/supabase/avatar-storage";
import { runtimeForTemplate } from "@/config/agents";
import { logAudit } from "@/lib/audit";
import { ApiError, json, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// Agents the customer manages on their own instance, from the My Agent page.
//
//   POST { name, role, persona?, avatar? }  add an agent to this instance and restart
//
// One additional agent per instance for now; several at once is the next build. Editing and
// removing one are on /api/agents/{id}/subagents/{subId}. Admin of the instance only, and the
// instance has to be entitled (a turn drives model usage billed to it) and OpenClaw (only an
// OpenClaw box can carry more than one agent).
export const maxDuration = 300;

export const POST = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, user, row } = await requireAgentAccess(id, "admin");
  await requireEntitled(supabase);
  if (runtimeForTemplate(row.template) !== "OpenClaw") {
    throw new ApiError(400, "invalid_request", "Only an OpenClaw instance can carry more than one agent.");
  }

  const body = await readJson<{ name?: unknown; role?: unknown; persona?: unknown; avatar?: ImageUpload }>(request);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const persona = typeof body.persona === "string" ? body.persona.trim() : "";
  if (!name) throw new ApiError(400, "invalid_request", "Give the agent a name.");
  if (!role) throw new ApiError(400, "invalid_request", "Give the agent a role, such as CFO or Scheduler.");
  const agentId = agentIdFromName(name);
  if (!agentId) {
    throw new ApiError(400, "invalid_request", 'Give the agent a name with some letters or digits, not just symbols, and not "main".');
  }

  // One additional agent per instance for now.
  const roster = await readInstanceRoster(id);
  const others = roster.agents.filter((a) => a.id !== "main");
  if (others.length > 0) {
    throw new ApiError(409, "limit_reached", "This instance already has an additional agent. Edit or remove it before adding another. Several agents at once is coming.");
  }
  if (agentId === "main" || others.some((a) => a.id === agentId)) {
    throw new ApiError(409, "limit_reached", "An agent with that name is already here.");
  }

  const avatarUrl = body.avatar ? (await uploadSubAgentAvatar(id, agentId, body.avatar)) ?? undefined : undefined;
  const agent: AgentSpec = { id: agentId, name, role, persona, avatarUrl };
  const result = await setupSecondAgent(id, { agent });
  await logAudit({ actorEmail: user.email, action: "agent.subagent_added", target: id, metadata: { agent: { id: agentId, name, role }, ok: result.ok, restarted: result.restarted, note: result.note ?? null }, request });
  if (!result.ok) throw new ApiError(502, "setup_failed", result.note || "The instance did not confirm the new agent.");
  return json({ ok: true, agent: { id: agentId, name, role, avatarUrl: avatarUrl ?? null }, restarted: result.restarted });
});
