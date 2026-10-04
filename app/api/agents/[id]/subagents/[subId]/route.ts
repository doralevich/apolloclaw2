import { requireAgentAccess, requireEntitled } from "@/lib/auth";
import { setupSecondAgent, revertSecondAgent, type AgentSpec } from "@/lib/multi-agent-test";
import { readInstanceRoster } from "@/lib/instance-roster";
import { uploadSubAgentAvatar, type ImageUpload } from "@/lib/supabase/avatar-storage";
import { runtimeForTemplate } from "@/config/agents";
import { logAudit } from "@/lib/audit";
import { ApiError, json, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string; subId: string }> };

// One agent on an instance, managed from the My Agent page.
//
//   PATCH  { role?, persona?, avatar? }  change the agent's role, persona, or image and restart
//   DELETE                               remove the agent and restart
//
// The name and id stay; editing rewrites the agent's workspace from the merged spec. "main" is
// the primary agent and is never managed here.
export const maxDuration = 300;

async function requireSubAgent(id: string, subId: string) {
  if (subId === "main") throw new ApiError(400, "invalid_request", "The primary agent cannot be managed here.");
  const roster = await readInstanceRoster(id);
  const agent = roster.agents.find((a) => a.id === subId && a.id !== "main");
  if (!agent) throw new ApiError(404, "not_found", "That agent is not on this instance.");
  return agent;
}

export const PATCH = route(async (request: Request, { params }: Ctx) => {
  const { id, subId } = await params;
  const { supabase, user, row } = await requireAgentAccess(id, "admin");
  await requireEntitled(supabase);
  if (runtimeForTemplate(row.template) !== "OpenClaw") {
    throw new ApiError(400, "invalid_request", "Only an OpenClaw instance carries more than one agent.");
  }
  const current = await requireSubAgent(id, subId);

  const body = await readJson<{ name?: unknown; role?: unknown; persona?: unknown; avatar?: ImageUpload }>(request);
  // The display name can change; the agent id (its workspace on the box) stays, so the avatar,
  // history and tab keep pointing at the same agent.
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : current.name || subId;
  const role = typeof body.role === "string" && body.role.trim() ? body.role.trim() : current.role || "";
  const persona = typeof body.persona === "string" ? body.persona.trim() : "";
  if (!role) throw new ApiError(400, "invalid_request", "Give the agent a role.");
  // A new image replaces the old; without one the existing avatar is kept.
  const avatarUrl = body.avatar ? (await uploadSubAgentAvatar(id, subId, body.avatar)) ?? current.avatarUrl ?? undefined : current.avatarUrl ?? undefined;

  const agent: AgentSpec = { id: subId, name, role, persona, avatarUrl };
  const result = await setupSecondAgent(id, { agent });
  await logAudit({ actorEmail: user.email, action: "agent.subagent_edited", target: id, metadata: { subId, name, role, ok: result.ok, note: result.note ?? null }, request });
  if (!result.ok) throw new ApiError(502, "setup_failed", result.note || "The instance did not confirm the change.");
  return json({ ok: true, agent: { id: subId, name, role, avatarUrl: avatarUrl ?? null }, restarted: result.restarted });
});

export const DELETE = route(async (request: Request, { params }: Ctx) => {
  const { id, subId } = await params;
  const { supabase, user, row } = await requireAgentAccess(id, "admin");
  await requireEntitled(supabase);
  if (runtimeForTemplate(row.template) !== "OpenClaw") {
    throw new ApiError(400, "invalid_request", "Only an OpenClaw instance carries more than one agent.");
  }
  await requireSubAgent(id, subId);

  // One additional agent per instance today, so removing it restores the box to the primary
  // agent. Revert takes the config back to its pre-multiagent state and drops the agent's
  // workspace. When several agents at once lands, this becomes a per-agent removal.
  const result = await revertSecondAgent(id);
  await logAudit({ actorEmail: user.email, action: "agent.subagent_removed", target: id, metadata: { subId, ok: result.ok, restored: result.restored, note: result.note ?? null }, request });
  if (!result.ok) throw new ApiError(502, "revert_failed", result.note || "The instance did not confirm the removal.");
  return json({ ok: true, removed: result.restored, restarted: result.restarted });
});
