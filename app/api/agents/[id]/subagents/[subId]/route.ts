import { requireAgentAccess, requireEntitled } from "@/lib/auth";
import { removeSubAgent, setupSecondAgent, type AgentSpec } from "@/lib/multi-agent-test";
import { removeAddOnAgent } from "@/lib/plan-billing";
import { readInstanceRoster } from "@/lib/instance-roster";
import { uploadSubAgentAvatar, type ImageUpload } from "@/lib/supabase/avatar-storage";
import { runtimeForTemplate } from "@/config/agents";
import { logAudit } from "@/lib/audit";
import { ApiError, json, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string; subId: string }> };

// One agent on an instance, managed from the My Agent page.
//
//   PATCH  { name?, role?, persona?, avatar? }  change the agent's name, role, persona, or image
//   DELETE                                     remove this agent, keep the others, and restart
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

  // This agent only: the others on the box stay as they are. Removing the last one takes the
  // box back to its single primary agent, the same restore the admin lab has always used.
  const result = await removeSubAgent(id, subId);
  // An extra agent bought on a plan comes off the bill with it (credited on the next invoice).
  if (result.ok) await removeAddOnAgent(row.workspace_id).catch((e) => console.error("[subagent:remove-addon]", id, (e as Error).message));
  await logAudit({ actorEmail: user.email, action: "agent.subagent_removed", target: id, metadata: { subId, ok: result.ok, note: result.note ?? null }, request });
  if (!result.ok) throw new ApiError(502, "remove_failed", result.note || "The instance did not confirm the removal.");
  return json({ ok: true, removed: true, restarted: result.restarted });
});
