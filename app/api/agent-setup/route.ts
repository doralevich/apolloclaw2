import { after } from "next/server";
import { getAgentType } from "@/config/agent-types";
import { requireMember, requireUser } from "@/lib/auth";
import { NOTIFY_EMAIL, sendMandrillEmail } from "@/lib/email";
import { ApiError, json, readJson, route } from "@/lib/http";
import { buildIntakeSections, escapeHtml, sectionsToHtml } from "@/lib/onboardingSections";
import { renderSectionsPdf } from "@/lib/pdf";
import { buildUserMd, injectAgentFile } from "@/lib/provision";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegram } from "@/lib/telegram";

// POST /api/agent-setup { workspace_id?, agent_type, answers }
//
// Stores the post-purchase questionnaire (the SAME questionnaire as the free /onboard
// lead form — see components/onboard/OnboardingForm.tsx) and pushes it into the
// provisioned instance as USER.md. Ordering with the Stripe webhook is race-free by
// construction: whichever side finishes second finds the other's work — the webhook's
// provision path injects stored answers, and this route injects into an existing agent.

const MAX_ANSWERS_BYTES = 200_000;

// Deep-sanitize the rich onboarding payload: strip anything that isn't a plain
// string/number/boolean/array/object, cap string lengths and nesting depth, and never
// persist raw uploaded-file bytes (kept only in memory for the notification email below).
function sanitizeValue(v: unknown, depth = 0): unknown {
  if (depth > 6) return undefined;
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string") {
    const s = v.trim().slice(0, 4000);
    return s || undefined;
  }
  if (typeof v === "number" || typeof v === "boolean") return v;
  if (Array.isArray(v)) {
    const arr = v.map((x) => sanitizeValue(x, depth + 1)).filter((x) => x !== undefined);
    return arr.length ? arr : undefined;
  }
  if (typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (k === "dataBase64") continue; // raw file bytes never persisted to the DB
      const clean = sanitizeValue(val, depth + 1);
      if (clean !== undefined) out[k.slice(0, 64)] = clean;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return undefined;
}

function sanitizeAnswers(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ApiError(400, "invalid_request", "answers must be an object");
  }
  const clean = (sanitizeValue(raw) as Record<string, unknown>) ?? {};
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
  const body = await readJson<{ workspace_id?: string; agent_type?: string; answers?: Record<string, unknown> }>(request);

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

  // Raw uploaded files (with base64) live only in memory long enough to attach to the
  // internal notification email below; sanitizeAnswers strips them before the DB write.
  const rawUploads = Array.isArray(body.answers?.uploadedFiles) ? (body.answers!.uploadedFiles as Array<Record<string, unknown>>) : [];
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

  // Team heads-up: Telegram (same channel as the intake flows) + an email with a PDF of
  // the full submission. Runs after the response so PDF rendering / email never blocks the
  // buyer's "building your agent" screen.
  const businessName = typeof answers.companyName === "string" ? answers.companyName : "";
  const sections = buildIntakeSections({ ...answers, uploadedFiles: rawUploads, trackType: "business" });
  const buyer = user.email ?? user.id;

  after(async () => {
    await sendTelegram(
      `🤖 ${type.label} setup completed\n` +
        `Business: ${businessName || "?"}\n` +
        `By: ${buyer}\n` +
        `Agent provisioned: ${agentId ? "yes — profile injected" : "not yet — will inject at provision"}`
    );

    const submittedAt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    let pdf: Buffer | null = null;
    try {
      pdf = await renderSectionsPdf({
        docTitle: `${type.label} — Setup Profile`,
        heading: [businessName, user.email].filter(Boolean).join(" • "),
        submittedAt,
        badge: type.label,
        sections,
      });
    } catch (err) {
      console.error("[agent-setup] PDF generation failed:", err);
    }

    await sendMandrillEmail({
      to: NOTIFY_EMAIL,
      subject: `${type.label} setup — ${businessName || buyer}`,
      html:
        `<h2 style="font-family:sans-serif;color:#0B1729">${escapeHtml(type.label)} setup completed</h2>` +
        `<p style="font-family:sans-serif;font-size:13px;color:#6b7280">By ${escapeHtml(buyer)}. ` +
        `${pdf ? "Full profile attached as a PDF." : "PDF unavailable — full details below."}</p>` +
        sectionsToHtml(sections),
      attachments: pdf ? [{ filename: `${type.id}-setup.pdf`, content: pdf }] : undefined,
    });
  });

  // workspace_id feeds the post-submit "building your agent" screen, which polls the
  // workspace's agent list until the webhook-provisioned agent shows up running.
  return json({ ok: true, agent_provisioned: !!agentId, workspace_id: workspaceId });
});
