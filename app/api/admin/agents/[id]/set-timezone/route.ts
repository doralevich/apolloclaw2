import { assertNotOtherApp, requirePlatformAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAgentType } from "@/config/agent-types";
import {
  buildUserMd,
  ensureUserMdPointer,
  injectOwnerProfile,
  writeGeneratedFiles,
} from "@/lib/provision";
import { applyInstanceDefaults } from "@/lib/instance-defaults";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/agents/{id}/set-timezone — record a customer's timezone on an agent that was
// set up before the questionnaire asked for one, and push the corrected answer to the box.
//
// WHY THIS EXISTS. AGENTS.md carries a "Their day" section built from answers.timezone, and it
// tells the agent that "today" means today where the customer is and to trust that over the box
// clock. Nothing ever collected the answer, so on every agent provisioned to date that section
// shipped blank — while the daily brief, the end-of-day summary, the weekly plan and every
// "by Thursday" follow-up all reason about dates.
//
// The questionnaire now asks. This is the other half: the agents that already exist.
//
// WHY NOT JUST RE-SAVE THE QUESTIONNAIRE. That path works — lib/agent-setup.ts rewrites the same
// files on every edit — but it re-runs upload and website enrichment as a side effect, needs the
// customer's login, and costs a full submission to change one field. This writes one key and
// re-pushes, which is also the tool to reach for the next time a field is added late.
//
// Idempotent, and safe to run on an agent that already has a timezone: passing the same value
// rewrites the same files.
export const maxDuration = 300;

export const POST = route(async (request: Request, { params }: Ctx) => {
  const { user } = await requirePlatformAdmin();
  const { id } = await params;
  // The College Agent's boxes are listed in the overview but are not ours to touch.
  await assertNotOtherApp(id);

  const body = await readJson<{ timezone?: unknown; bestTime?: unknown }>(request);
  const timezone = typeof body.timezone === "string" ? body.timezone.trim() : "";
  if (!timezone) {
    throw new ApiError(400, "invalid_request", "Pass an IANA timezone, e.g. America/New_York.");
  }
  // Reject anything /etc/localtime and Intl would not accept, here rather than on the box: a bad
  // value would be written into answers and then silently skipped by every consumer forever.
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone });
  } catch {
    throw new ApiError(400, "invalid_request", `Not a valid IANA timezone: "${timezone}".`);
  }
  const bestTime = typeof body.bestTime === "string" ? body.bestTime.trim() : undefined;

  const db = createAdminClient();
  const { data: agentRow } = await db
    .from("agents")
    .select("workspace_id, agent_type")
    .eq("agent37_id", id)
    .maybeSingle();
  if (!agentRow?.workspace_id || !agentRow.agent_type) {
    throw new ApiError(404, "not_found", "No agent row for that instance, or no type recorded.");
  }
  const workspaceId = agentRow.workspace_id as string;
  const agentTypeId = agentRow.agent_type as string;

  const { data: setup } = await db
    .from("agent_setup")
    .select("answers, agent_name")
    .eq("workspace_id", workspaceId)
    .eq("agent_type", agentTypeId)
    .maybeSingle();
  // A blank agent has no answers to correct, and inventing a setup row for one would put a
  // half-empty profile on a box the customer never filled anything in for.
  if (!setup?.answers) {
    throw new ApiError(404, "not_found", "No setup row - nothing to correct on a blank agent.");
  }

  const answers: Record<string, unknown> = { ...(setup.answers as Record<string, unknown>), timezone };
  if (bestTime !== undefined) answers.bestTime = bestTime;

  const { error: saveErr } = await db
    .from("agent_setup")
    .update({ answers })
    .eq("workspace_id", workspaceId)
    .eq("agent_type", agentTypeId);
  if (saveErr) throw new Error(saveErr.message);

  // Push in the same order lib/agent-setup.ts uses on an edit: the profile first, then the
  // pointer that makes the runtime read it, then the fenced files. The generated files are
  // gated on the profile write for the same reason they are there — if that failed, the
  // instance is not reachable and the rest would fail too.
  const type = getAgentType(agentTypeId);
  const agentName = (setup.agent_name as string | null) ?? undefined;
  const profile = await injectOwnerProfile(
    id,
    buildUserMd(type?.label ?? agentTypeId, answers, undefined, agentTypeId)
  );
  const pointer = profile ? await ensureUserMdPointer(id) : false;
  const files = profile ? await writeGeneratedFiles(id, { answers, agentName }) : [];

  // Now that the answer exists, the clock step in applyInstanceDefaults finally has something to
  // set — which is the half of this that the agent cannot read but every timestamp depends on.
  const defaults = await applyInstanceDefaults(id, { timezone, restart: true });

  const result = { timezone, bestTime, profile, pointer, files, clock: defaults.timezone };
  await logAudit({
    actorEmail: user.email,
    action: "agent.timezone_set",
    target: id,
    metadata: { ...result },
    request,
  });
  return json(result);
});
