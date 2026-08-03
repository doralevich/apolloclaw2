import "server-only";
import { after } from "next/server";
import { agent37 } from "@/lib/agent37";
import { DEFAULT_AGENT } from "@/config/agents";
import type { AgentType } from "@/config/agent-types";
import { buildIntakeSections, sectionsToMarkdown } from "@/lib/onboardingSections";
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
  /** The end user the instance is tagged to in Agent37, and the default for created_by. */
  userId: string;
  /** Who actually pressed the button, when that isn't the owner — a platform admin
   *  provisioning on someone's behalf. The instance still belongs to `userId`; this only
   *  records who did it, which is the question asked afterwards. */
  createdBy?: string;
  name?: string;
  /** When true (paid path), a missing dedicated template falls back to the generic
   *  OpenClaw template + persona injection instead of failing — the customer has already
   *  paid, so "wrong image" beats "no agent". */
  allowTemplateFallback?: boolean;
}

// Where the agent keeps the files it reads about itself and its owner. This is NOT one
// fixed path: templates carry different runtimes, and they disagree.
//
//   * OpenClaw images keep them in $OPENCLAW_STATE_DIR/workspace (default ~/.openclaw).
//   * Hermes images keep them in $HERMES_STATE_DIR/memories (default ~/.hermes), which is
//     also where the agent itself writes what it learns between sessions.
//
// We used to assume the first one. On a Hermes image that produced the worst possible
// outcome: the write SUCCEEDED, into a directory nothing reads, while the agent's real
// USER.md sat empty a few directories away — so the dashboard reported setup Complete and
// the agent answered "I don't know who you are".
//
// So: write to every candidate that exists on the box, rather than picking one. Both are
// the right place on some image and harmless on the other, and a template that grows a
// third location shows up as one line here instead of a silent hole.
const CANDIDATE_DIRS =
  'DIRS=""; ' +
  'for D in "${HERMES_STATE_DIR:-/home/node/.hermes}/memories" "${OPENCLAW_STATE_DIR:-/home/node/.openclaw}/workspace"; do ' +
  '[ -d "$D" ] && DIRS="$DIRS $D"; done; ' +
  // Nothing recognisable on the box (very early boot, or an image we haven't seen): fall
  // back to the OpenClaw layout, which is what every instance before this used.
  '[ -n "$DIRS" ] || { D="${OPENCLAW_STATE_DIR:-/home/node/.openclaw}/workspace"; mkdir -p "$D"; DIRS="$D"; }; ';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Best-effort write of a markdown file into every workspace the instance recognises. The
// instance boots asynchronously after create, so retry exec for a while; a miss is
// logged and reported (false), not thrown — the agent exists and the write can rerun.
//
// Reports which directories it landed in, because "the write succeeded" told us nothing
// useful last time.
export async function injectAgentFile(
  agentId: string,
  filename: "SOUL.md" | "OWNER.md",
  content: string
): Promise<boolean> {
  const b64 = Buffer.from(content, "utf8").toString("base64");
  const cmd =
    `${CANDIDATE_DIRS}` +
    `for D in $DIRS; do printf '%s' '${b64}' | base64 -d > "$D/${filename}" && echo "WROTE:$D"; done; ` +
    `echo WRITE_OK`;

  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const { stdout } = await agent37.exec(agentId, cmd);
      if (stdout.includes("WRITE_OK")) {
        const landed = stdout.match(/WROTE:(\S+)/g)?.join(" ") ?? "(none)";
        console.log("[provision:file-injected]", agentId, filename, landed);
        return true;
      }
    } catch {
      // instance still provisioning/booting — wait and retry
    }
    await sleep(15_000);
  }
  console.error("[provision:file-inject-failed]", agentId, filename);
  return false;
}

// Writing the profile is not the same as the agent reading it. A dedicated template boots
// with its own SOUL.md persona (we deliberately don't overwrite one), and that persona has no
// reason to know about a file we invented — so the agent sits next to a full profile of its
// owner and still answers "I don't know who you are". This appends a pointer to SOUL.md
// instead of replacing it, so the template's own character survives intact.
//
// The profile lives in OWNER.md, NOT USER.md. On Hermes, USER.md is the agent's OWN memory
// file: it writes what it learns there between sessions. We used the same name, so on one
// customer's box there were two different USER.md files — the questionnaire in one directory,
// the agent's own notes in another — and a repair pass that copied "whichever has content"
// overwrote the questionnaire with the notes. Two writers, one filename, and the customer's
// answers lost. Different name, no collision, and the agent keeps its own memory intact.
export const USER_MD_POINTER_MARKER = "<!-- apollo:user-md-pointer -->";

export const USER_MD_POINTER = `

${USER_MD_POINTER_MARKER}
## Who you work for

There is an OWNER.md beside this file in your workspace. It holds your owner's answers from
their setup questionnaire: who they are, their business, how it runs, and where it hurts.

Read it at the start of every session, before your first reply, and treat it as ground truth
about them the way you treat this file as ground truth about yourself. Never tell your owner
you don't know who they are — you do, it is written down, go and read it.

OWNER.md is theirs, not yours: it is replaced whenever they update their answers, so anything
you write into it will be lost. Keep what you learn in your own memory, as you normally would.
`;

// Append the pointer to SOUL.md in every workspace the instance recognises, once each.
// Idempotent via the marker, so re-submitted setup answers can't stack duplicate blocks.
// Best-effort and retried for the same reason injectAgentFile is: the instance may still
// be booting.
export async function ensureUserMdPointer(agentId: string): Promise<boolean> {
  const b64 = Buffer.from(USER_MD_POINTER, "utf8").toString("base64");
  const cmd =
    `${CANDIDATE_DIRS}` +
    `for D in $DIRS; do F="$D/SOUL.md"; touch "$F"; ` +
    `grep -qF '${USER_MD_POINTER_MARKER}' "$F" || printf '%s' '${b64}' | base64 -d >> "$F"; done; ` +
    `echo POINTER_OK`;

  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const { stdout } = await agent37.exec(agentId, cmd);
      if (stdout.includes("POINTER_OK")) return true;
    } catch {
      // instance still provisioning/booting — wait and retry
    }
    await sleep(15_000);
  }
  console.error("[provision:pointer-inject-failed]", agentId);
  return false;
}

// Render questionnaire answers as the USER.md the agent reads. Labels come from the
// shared onboarding section builder (the same one behind the free /onboard lead form and
// its PDF/email) so the file reads like notes, not a form dump.
export function buildUserMd(typeLabel: string, answers: Record<string, unknown>): string {
  const sections = buildIntakeSections({ ...answers, trackType: "business" });
  return [
    `# About the business you work for`,
    ``,
    `Notes from your owner's ${typeLabel} setup questionnaire. Treat this as ground truth`,
    `about who you work for — and update it as you learn more.`,
    ``,
    sectionsToMarkdown(sections),
  ].join("\n");
}

// Post-create injection for a paid agent: persona (fallback template only — dedicated
// templates carry their own) and USER.md from any setup answers already submitted for
// this workspace + type. Marks agent_setup.injected_at when the USER.md write lands.
async function injectAfterProvision(agentId: string, type: AgentType, workspaceId: string, fellBack: boolean): Promise<void> {
  if (fellBack) {
    const persona = personaForAgentType(type.id);
    if (persona) await injectAgentFile(agentId, "SOUL.md", persona);
  }

  const db = createAdminClient();
  const { data: setup } = await db
    .from("agent_setup")
    .select("answers, agent_name, avatar_url")
    .eq("workspace_id", workspaceId)
    .eq("agent_type", type.id)
    .maybeSingle();
  if (!setup) return;

  // Onboarding can finish before the agent even exists (fast questionnaire, slow webhook);
  // in that case provisionTypedAgent's own agent_setup lookup already set the name/avatar
  // at creation time. This only has work to do for the OTHER race — the agent existed but
  // its row was created (name defaulted, no avatar) before this row picked up a name/avatar
  // — so only touch what's actually still missing.
  const personalization: Record<string, string> = {};
  if (setup.agent_name) personalization.name = setup.agent_name as string;
  if (setup.avatar_url) personalization.avatar_url = setup.avatar_url as string;
  if (Object.keys(personalization).length > 0) {
    await db.from("agents").update(personalization).eq("agent37_id", agentId);
  }

  if (!setup.answers) return;
  const ok = await injectAgentFile(agentId, "OWNER.md", buildUserMd(type.label, setup.answers as Record<string, unknown>));
  if (ok) await ensureUserMdPointer(agentId);
  if (ok) {
    await db
      .from("agent_setup")
      .update({ injected_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("workspace_id", workspaceId)
      .eq("agent_type", type.id);
  }
}

// Looked up before creation so a customer who finishes onboarding before the Stripe
// webhook provisions their agent still gets their chosen name/avatar on the FIRST insert,
// not a later update.
async function lookupPendingPersonalization(
  db: ReturnType<typeof createAdminClient>,
  workspaceId: string,
  typeId: string
): Promise<{ name?: string; avatarUrl?: string }> {
  const { data } = await db
    .from("agent_setup")
    .select("agent_name, avatar_url")
    .eq("workspace_id", workspaceId)
    .eq("agent_type", typeId)
    .maybeSingle();
  return { name: data?.agent_name ?? undefined, avatarUrl: data?.avatar_url ?? undefined };
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

  // The registry hasn't been renamed yet (or has been rolled back). A former name for the
  // SAME template is the right agent, not a fallback — provision it and say so, so the logs
  // show a rename that hasn't finished rather than looking like everything is fine.
  for (const alias of type.templateAliases ?? []) {
    if (templates.some((t) => t.name === alias)) {
      console.warn("[provision:template-alias]", type.template, "not in registry, using", alias);
      return { template: alias, fellBack: false };
    }
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
    // Legacy rows predate agent_type and are identified by template alone — which includes
    // rows written under a FORMER template name, so the aliases have to be in the cap check
    // too. Miss them and a rename quietly lets one workspace hold two of the same agent.
    .or(
      [
        `agent_type.eq.${type.id}`,
        ...[type.template, ...(type.templateAliases ?? [])].map((t) => `template.eq.${t}`),
      ].join(",")
    )
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

  // The customer's chosen name/avatar (Personalize step, components/onboard/OnboardingForm.tsx)
  // may already be sitting in agent_setup if they finished onboarding before this ran.
  const pending = await lookupPendingPersonalization(db, workspaceId, type.id);

  const agent = await agent37.createAgent({
    template,
    resources: { cpu: type.resources.cpu, memory: type.resources.memory, disk: type.resources.disk },
    user: userId,
    name: input.name?.trim() || pending.name?.trim() || type.label,
    metadata: { app_workspace: workspaceId, agent_type: type.id },
    budget: { monthly_cap_micros: usdToMicros(type.monthlyCapUsd) },
  });

  const { error } = await db.from("agents").insert({
    agent37_id: agent.id,
    workspace_id: workspaceId,
    name: agent.name || null,
    avatar_url: pending.avatarUrl || null,
    status: agent.status,
    template: agent.template,
    agent_type: type.id,
    cpu: agent.resources.cpu,
    memory: agent.resources.memory,
    disk: agent.resources.disk,
    created_by: input.createdBy ?? userId,
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

  // Persona (fallback template only) + any already-submitted setup answers get written
  // into the instance after the response, so neither the API caller nor Stripe's webhook
  // delivery waits on the instance booting.
  after(() => injectAfterProvision(agent.id, type, workspaceId, fellBack));

  return agent;
}
