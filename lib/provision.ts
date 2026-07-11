import "server-only";
import { after } from "next/server";
import { agent37 } from "@/lib/agent37";
import { DEFAULT_AGENT } from "@/config/agents";
import type { AgentType } from "@/config/agent-types";
import { personaForAgentType } from "@/config/personas";
import { usdToMicros } from "@/lib/format";
import { ApiError } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Agent } from "@/lib/types";

// Typed-agent provisioning, shared by the two entry points:
//   * POST /api/agents (self-serve, entitlement-gated — the free College Agent path)
//   * the Stripe webhook (paid agents, after checkout.session.completed)
// Both run the same cap check -> template resolve -> create -> record pipeline; only the
// authorization in front of it differs, so that stays in the callers.

export interface ProvisionInput {
  type: AgentType;
  workspaceId: string;
  /** The end user the instance is tagged to in Agent37 and recorded as created_by. */
  userId: string;
  name?: string;
  /** When true (paid path), a missing dedicated template falls back to the generic
   *  OpenClaw template + persona injection instead of failing — the customer has already
   *  paid, so "wrong image" beats "no agent". */
  allowTemplateFallback?: boolean;
}

// Where OpenClaw keeps its workspace on the instance (same state dir the signed-url
// route reads the gateway token from). SOUL.md there is the agent's persona.
const WRITE_SOUL_CMD_PREFIX =
  'WS="${OPENCLAW_STATE_DIR:-/home/node/.openclaw}/workspace"; mkdir -p "$WS" && ';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Best-effort persona injection for instances provisioned on the generic template (a
// dedicated template like ceo-agent carries its persona baked in — never overwrite it).
// The instance boots asynchronously after create, so retry exec for a while; a miss is
// logged, not thrown — the agent exists and an admin can re-run the write by hand.
async function injectPersona(agentId: string, typeId: string): Promise<void> {
  const persona = personaForAgentType(typeId);
  if (!persona) return;

  const b64 = Buffer.from(persona, "utf8").toString("base64");
  const cmd = `${WRITE_SOUL_CMD_PREFIX}printf '%s' '${b64}' | base64 -d > "$WS/SOUL.md" && echo PERSONA_OK`;

  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const { stdout } = await agent37.exec(agentId, cmd);
      if (stdout.includes("PERSONA_OK")) return;
    } catch {
      // instance still provisioning/booting — wait and retry
    }
    await sleep(15_000);
  }
  console.error("[provision:persona-inject-failed]", agentId, typeId);
}

// Resolve which Agent37 template to actually provision. A listTemplates hiccup is
// tolerated (createAgent still fails loudly if the template truly doesn't exist), but a
// listing that's MISSING the dedicated template either falls back (paid path) or fails
// fast — a typed create must never silently provision the wrong kind of agent.
async function resolveProvisionTemplate(
  type: AgentType,
  allowFallback: boolean
): Promise<{ template: string; fellBack: boolean }> {
  let templates;
  try {
    ({ data: templates } = await agent37.listTemplates());
  } catch {
    return { template: type.template, fellBack: false };
  }
  if (templates.some((t) => t.name === type.template)) {
    return { template: type.template, fellBack: false };
  }
  if (allowFallback && templates.some((t) => t.name === DEFAULT_AGENT.template)) {
    console.warn("[provision:template-fallback]", type.id, "->", DEFAULT_AGENT.template);
    return { template: DEFAULT_AGENT.template, fellBack: true };
  }
  throw new ApiError(
    502,
    "template_unavailable",
    `The ${type.label} template isn't registered yet. Please try again later.`
  );
}

export async function provisionTypedAgent(input: ProvisionInput): Promise<Agent> {
  const { type, workspaceId, userId, allowTemplateFallback = false } = input;

  // Service-role client: callers have already authorized the request (member+entitled
  // gates on the API route; a verified Stripe signature + paid session on the webhook).
  const db = createAdminClient();

  // Cap: one agent of each type per workspace. Keyed on agent_type with a template
  // fallback for legacy rows that predate the column. Best-effort — two simultaneous
  // creates could race past it, but the UI disables the card once the list refreshes.
  const { data: existing, error: capError } = await db
    .from("agents")
    .select("agent37_id")
    .eq("workspace_id", workspaceId)
    .or(`agent_type.eq.${type.id},template.eq.${type.template}`)
    .limit(1);
  if (capError) throw new ApiError(500, "db_error", capError.message);
  if (existing && existing.length > 0) {
    throw new ApiError(
      409,
      "conflict",
      `This workspace already has a ${type.label}. Each workspace can have one agent per type.`
    );
  }

  const { template, fellBack } = await resolveProvisionTemplate(type, allowTemplateFallback);

  const agent = await agent37.createAgent({
    template,
    resources: { cpu: type.resources.cpu, memory: type.resources.memory, disk: type.resources.disk },
    user: userId,
    name: input.name?.trim() || type.label,
    metadata: { app_workspace: workspaceId, agent_type: type.id },
    budget: { monthly_cap_micros: usdToMicros(type.monthlyCapUsd) },
  });

  const { error } = await db.from("agents").insert({
    agent37_id: agent.id,
    workspace_id: workspaceId,
    name: agent.name || null,
    status: agent.status,
    template: agent.template,
    agent_type: type.id,
    cpu: agent.resources.cpu,
    memory: agent.resources.memory,
    disk: agent.resources.disk,
    created_by: userId,
  });
  if (error) {
    // Roll back the orphaned agent so we never bill for an untracked box.
    try {
      await agent37.deleteAgent(agent.id);
    } catch (rollbackErr) {
      console.error("[agents:rollback-failed]", agent.id, rollbackErr);
    }
    throw new ApiError(500, "db_error", error.message);
  }

  // Generic-template instances need the persona written in; runs after the response so
  // neither the API caller nor Stripe's webhook delivery waits on the instance booting.
  if (fellBack) {
    after(() => injectPersona(agent.id, type.id));
  }

  return agent;
}
