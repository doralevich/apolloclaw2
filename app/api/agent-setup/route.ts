import { after } from "next/server";
import { getAgentType } from "@/config/agent-types";
import { setupSectionsFor } from "@/config/onboarding";
import { requireMember, requireUser } from "@/lib/auth";
import { NOTIFY_EMAIL, sendMandrillEmail } from "@/lib/email";
import { ApiError, json, readJson, route } from "@/lib/http";
import { renderSectionsPdf } from "@/lib/pdf";
import { buildUserMd, injectAgentFile } from "@/lib/provision";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegram } from "@/lib/telegram";

// A section of the emailed submission: labeled answers grouped by questionnaire step.
type SetupSection = { title: string; rows: { label: string; value: string | string[] }[] };

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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

  // Team heads-up: Telegram (same channel as the intake flows) + an email with a PDF of
  // the full submission. Runs after the response so PDF rendering / email never blocks the
  // buyer's "building your agent" screen.
  const businessName = typeof answers.business_name === "string" ? answers.business_name : "";
  const sections: SetupSection[] = setupSectionsFor(type.id, type.label)
    .map((s) => ({
      title: s.title,
      rows: s.questions
        .map((q) => ({ label: q.label, value: answers[q.id] }))
        .filter((r): r is { label: string; value: string | string[] } => {
          const v = r.value;
          return v != null && (Array.isArray(v) ? v.length > 0 : v.trim().length > 0);
        }),
    }))
    .filter((s) => s.rows.length > 0);
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

    const inlineHtml = sections
      .map(
        (s) =>
          `<h3 style="font-family:sans-serif;color:#E8342A;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:14px 0 4px">${esc(s.title)}</h3>` +
          `<table style="font-family:sans-serif;font-size:13px;border-collapse:collapse">` +
          s.rows
            .map(
              (r) =>
                `<tr><td style="padding:3px 12px 3px 0;color:#6b7280;vertical-align:top">${esc(r.label)}</td>` +
                `<td>${esc(Array.isArray(r.value) ? r.value.join(", ") : r.value)}</td></tr>`
            )
            .join("") +
          `</table>`
      )
      .join("");

    await sendMandrillEmail({
      to: NOTIFY_EMAIL,
      subject: `${type.label} setup — ${businessName || buyer}`,
      html:
        `<h2 style="font-family:sans-serif;color:#0B1729">${esc(type.label)} setup completed</h2>` +
        `<p style="font-family:sans-serif;font-size:13px;color:#6b7280">By ${esc(buyer)}. ` +
        `${pdf ? "Full profile attached as a PDF." : "PDF unavailable — full details below."}</p>` +
        inlineHtml,
      attachments: pdf ? [{ filename: `${type.id}-setup.pdf`, content: pdf }] : undefined,
    });
  });

  // workspace_id feeds the post-submit "building your agent" screen, which polls the
  // workspace's agent list until the webhook-provisioned agent shows up running.
  return json({ ok: true, agent_provisioned: !!agentId, workspace_id: workspaceId });
});
