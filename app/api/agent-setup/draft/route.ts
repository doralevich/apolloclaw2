import { getAgentType } from "@/config/agent-types";
import { sanitizeAnswers } from "@/lib/agent-setup";
import { requireMember, requireUser } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/admin";

// PUT /api/agent-setup/draft { workspace_id, agent_type, agent37_id?, answers, step }
//
// The questionnaire's autosave. The conversational intake (components/onboard/
// ConversationalIntake.tsx) asks one question at a time and saves after every answer, so a
// closed tab, a refresh or a phone call in the middle costs nothing: /onboard/<type> reads the
// row back and resumes at `step` (David, Nov 5 2026: the college agent's intake does this with
// localStorage; here it is the row in agent_setup, which is also what the finished
// questionnaire lands in, so there is one place answers live).
//
// Nothing is provisioned here, and nothing is injected into an instance. Only /api/agent-setup
// does that, on the final submit. A draft is an agent_setup row like any other, with `intakeStep`
// inside its answers saying how far along it is; the final submit overwrites the whole row.
//
// Which row: the agent's own when the caller names one (editing a finished questionnaire), else
// the workspace's pending row for this type (migration 0023: one unclaimed row per type), which
// is the row the final submit then claims.

export const PUT = route(async (request: Request) => {
  const { supabase, user } = await requireUser();
  const body = await readJson<{
    workspace_id?: string;
    agent_type?: string;
    agent37_id?: string;
    answers?: Record<string, unknown>;
    agent_name?: string;
    step?: number;
  }>(request);

  if (!body.workspace_id) throw new ApiError(400, "invalid_request", "workspace_id is required");
  if (!body.agent_type) throw new ApiError(400, "invalid_request", "agent_type is required");
  const type = getAgentType(body.agent_type);
  if (!type || type.externalUrl) throw new ApiError(404, "not_found", "Unknown agent type");
  await requireMember(supabase, body.workspace_id, user.id);

  const step = Number.isFinite(body.step) ? Math.max(0, Math.floor(body.step as number)) : 0;
  const answers = { ...sanitizeAnswers(body.answers), intakeStep: step };
  const agentName = typeof body.agent_name === "string" ? body.agent_name.trim().slice(0, 80) || null : null;
  const db = createAdminClient();
  const now = new Date().toISOString();

  let query = db.from("agent_setup").select("id").eq("workspace_id", body.workspace_id).eq("agent_type", type.id);
  query = body.agent37_id ? query.eq("agent37_id", body.agent37_id) : query.is("agent37_id", null);
  const { data: existing, error: findError } = await query.limit(1).maybeSingle();
  if (findError) throw new ApiError(500, "db_error", findError.message);

  if (existing?.id) {
    const { error } = await db
      .from("agent_setup")
      .update({ answers, agent_name: agentName, submitted_by: user.id, updated_at: now })
      .eq("id", existing.id);
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ ok: true, step });
  }

  const { error } = await db.from("agent_setup").insert({
    workspace_id: body.workspace_id,
    agent_type: type.id,
    agent37_id: body.agent37_id ?? null,
    answers,
    agent_name: agentName,
    submitted_by: user.id,
    updated_at: now,
  });
  if (error) {
    // 23505: two tabs raced to create the pending row. The other one won; its next save wins.
    if (error.code === "23505") return json({ ok: true, step });
    throw new ApiError(500, "db_error", error.message);
  }
  return json({ ok: true, step });
});
