import { after } from "next/server";
import { getAgentType } from "@/config/agent-types";
import { requireMember, requireUser } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { buildUserMd, injectAgentFile } from "@/lib/provision";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegram } from "@/lib/telegram";

// POST /api/agent-setup { workspace_id?, agent_type, answers }
//
// Stores the post-purchase questionnaire (/onboard/[agent]) and pushes it into the
// provisioned instance as USER.md. Ordering with the Stripe webhook is race-free by
// construction: whichever side finishes second finds the other's work — the webhook's
// provision path injects stored answers, and this route injects into an existing agent.

const MAX_ANSWERS_BYTES = 20_000;

// Answers arrive as { questionId: string | string[] } from our own form, but the route
// trusts nothing: keep only string/string[] values, trimmed and bounded.
function sanitizeAnswers(raw: unknown): Record<string, string | string[]> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ApiError(400, "invalid_request", "answers must be an object");
  }
  const clean: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string") {
      const v = value.trim().slice(0, 2000);
      if (v) clean[key.slice(0, 64)] = v;
    } else if (Array.isArray(value)) {
      const v = value.filter((x): x is string => typeof x === "string").map((x) => x.trim().slice(0, 200)).filter(Boolean);
      if (v.length) clean[key.slice(0, 64)] = v;
    }
  }
  if (Object.keys(clean).length === 0) {
    throw new ApiError(400, "invalid_request", "answers is empty");
  }
  if (JSON.stringify(clean).length > MAX_ANSWERS_BYTES) {
    throw new ApiError(400, "invalid_request", "answers is too large");
  }
  return clean;
}

export const POST = route(async (request: Request) => {
  const { supabase, user } = await requireUser();
  const body = await readJson<{ workspace_id?: string; agent_type?: string; answers?: unknown }>(request);

  if (!body.agent_type) throw new ApiError(400, "invalid_request", "agent_type is required");
  const type = getAgentType(body.agent_type);
  if (!type || !type.planKey) throw new ApiError(404, "not_found", "Unknown agent type");

  const db = createAdminClient();

  // The checkout success URL carries the workspace; a direct visit falls back to the
  // user's first workspace (the common case — self-serve users have exactly one).
  let workspaceId = body.workspace_id;
  if (!workspaceId) {
    const { data } = await db
      .from("memberships")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    workspaceId = (data?.workspace_id as string) ?? undefined;
  }
  if (!workspaceId) throw new ApiError(400, "invalid_request", "No workspace found for this account");
  await requireMember(supabase, workspaceId, user.id);

  const answers = sanitizeAnswers(body.answers);

  const { error } = await db.from("agent_setup").upsert(
    {
      workspace_id: workspaceId,
      agent_type: type.id,
      answers,
      submitted_by: user.id,
      injected_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id,agent_type" }
  );
  if (error) throw new ApiError(500, "db_error", error.message);

  // Agent already provisioned (webhook won the race)? Push USER.md now, after the
  // response — the instance may still be booting and the write retries for a while.
  const { data: agentRow } = await db
    .from("agents")
    .select("agent37_id")
    .eq("workspace_id", workspaceId)
    .or(`agent_type.eq.${type.id},template.eq.${type.template}`)
    .limit(1)
    .maybeSingle();

  const agentId = agentRow?.agent37_id as string | undefined;
  if (agentId) {
    const ws = workspaceId;
    after(async () => {
      const ok = await injectAgentFile(agentId, "USER.md", buildUserMd(type.label, answers));
      if (ok) {
        await db
          .from("agent_setup")
          .update({ injected_at: new Date().toISOString() })
          .eq("workspace_id", ws)
          .eq("agent_type", type.id);
      }
    });
  }

  // Heads-up to the team, same channel as the intake forms. Best-effort.
  after(() =>
    sendTelegram(
      `🤖 ${type.label} setup completed\n` +
        `Business: ${typeof answers.business_name === "string" ? answers.business_name : "?"}\n` +
        `By: ${user.email ?? user.id}\n` +
        `Agent provisioned: ${agentId ? "yes — profile injected" : "not yet — will inject at provision"}`
    )
  );

  return json({ ok: true, agent_provisioned: !!agentId });
});
