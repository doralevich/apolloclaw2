import "server-only";
import { after } from "next/server";
import type { AgentType } from "@/config/agent-types";
import { NOTIFY_EMAIL, sendMandrillEmail } from "@/lib/email";
import { ApiError } from "@/lib/http";
import { buildIntakeSections, escapeHtml, sectionsToHtml } from "@/lib/onboardingSections";
import { renderSectionsPdf } from "@/lib/pdf";
import { buildUserMd, injectAgentFile, provisionTypedAgent } from "@/lib/provision";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadAgentAvatar } from "@/lib/supabase/avatar-storage";
import { sendTelegram } from "@/lib/telegram";

// The shared body of "the customer finished the questionnaire". Two routes reach it and
// they differ ONLY in how the caller is authorized:
//
//   /api/agent-setup       — a logged-in member of the workspace (the older per-agent flow,
//                            where the Stripe webhook does the provisioning).
//   /api/onboard/complete  — nobody logged in at all; authority comes from a paid Stripe
//                            checkout session (the license flow, where the buyer has an
//                            account created for them but has never set a password).
//
// Everything downstream of that difference — sanitizing, storing, provisioning, writing
// USER.md, telling the team — is identical, so it lives here once. Authorization is
// deliberately NOT this function's job: it trusts the workspaceId it is handed, and every
// caller must have earned it.

const MAX_ANSWERS_BYTES = 200_000;

// Deep-sanitize the rich onboarding payload: strip anything that isn't a plain
// string/number/boolean/array/object, cap string lengths and nesting depth, and never
// persist raw uploaded-file bytes (kept only in memory for the notification email).
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

export function sanitizeAnswers(raw: unknown): Record<string, unknown> {
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

export interface AvatarUpload { name: string; type: string; size: number; dataBase64: string }

export interface SetupInput {
  type: AgentType;
  workspaceId: string;
  /** Who to record as the submitter. Absent on the license flow until they log in. */
  submittedBy?: string;
  /** For the notification email and Telegram line. */
  buyerEmail: string;
  answers?: Record<string, unknown>;
  agentName?: string;
  avatarUpload?: AvatarUpload;
  avatarPreset?: string;
  /**
   * Provision the agent here if it does not exist yet.
   *
   * False for the per-agent flow, where the Stripe webhook provisions and this route only
   * has to inject into whatever it finds. True for the license flow, where nothing else
   * ever will: the webhook creates the account and stops, deliberately, because the build
   * depends on the answers that only arrive here.
   */
  provisionIfMissing?: boolean;
}

export interface SetupResult {
  workspaceId: string;
  agentProvisioned: boolean;
}

export async function storeAgentSetup(input: SetupInput): Promise<SetupResult> {
  const { type, workspaceId, submittedBy, buyerEmail, provisionIfMissing = false } = input;
  const db = createAdminClient();

  // Raw uploaded files (with base64) live only in memory long enough to attach to the
  // internal notification email below; sanitizeAnswers strips them before the DB write.
  const rawUploads = Array.isArray(input.answers?.uploadedFiles)
    ? (input.answers.uploadedFiles as Array<Record<string, unknown>>)
    : [];
  const answers = sanitizeAnswers(input.answers);

  const agentName = input.agentName?.trim().slice(0, 80) || undefined;
  // A preset is already a small inline data: URI generated client-side (see AVATAR_PRESETS
  // in OnboardingForm.tsx) — cap its length so nothing but a real preset/upload URL lands
  // in this column.
  const presetUrl =
    input.avatarPreset && input.avatarPreset.startsWith("data:image/") && input.avatarPreset.length <= 20_000
      ? input.avatarPreset
      : undefined;
  const avatarUrl = input.avatarUpload
    ? (await uploadAgentAvatar(workspaceId, type.id, input.avatarUpload)) ?? undefined
    : presetUrl;

  const { error } = await db.from("agent_setup").upsert(
    {
      workspace_id: workspaceId,
      agent_type: type.id,
      answers,
      agent_name: agentName ?? null,
      avatar_url: avatarUrl ?? null,
      submitted_by: submittedBy ?? null,
      injected_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id,agent_type" }
  );
  if (error) throw new ApiError(500, "db_error", error.message);

  // Does the agent exist yet? The per-agent flow races the Stripe webhook and usually finds
  // one; the license flow never will, because nothing provisions before this point.
  const { data: agentRow } = await db
    .from("agents")
    .select("agent37_id")
    .eq("workspace_id", workspaceId)
    .or(`agent_type.eq.${type.id},template.eq.${type.template}`)
    .limit(1)
    .maybeSingle();

  let agentId = agentRow?.agent37_id as string | undefined;

  if (!agentId && provisionIfMissing) {
    // Agent37 tags the instance to an end user and the row records created_by, so there is
    // no sensible provisioning without one. Every caller that sets provisionIfMissing has
    // resolved the buyer's account first; this guards the combination rather than trusting
    // a future caller to remember.
    if (!submittedBy) {
      throw new ApiError(500, "invalid_state", "Cannot provision an agent without an owner.");
    }
    try {
      // The setup row is written above BEFORE this runs, so provisionTypedAgent picks up
      // the chosen name and avatar itself (it reads pending personalization out of
      // agent_setup) and the ordering needs no coordination.
      const agent = await provisionTypedAgent({
        type,
        workspaceId,
        userId: submittedBy,
        name: agentName,
        // The customer has already paid — a missing dedicated template must not fail the
        // order.
        allowTemplateFallback: true,
      });
      agentId = agent.id;
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Already provisioned between the read above and now (a double submit, or the
        // webhook). That is the state we wanted; find it and carry on.
        const { data: retry } = await db
          .from("agents")
          .select("agent37_id")
          .eq("workspace_id", workspaceId)
          .or(`agent_type.eq.${type.id},template.eq.${type.template}`)
          .limit(1)
          .maybeSingle();
        agentId = retry?.agent37_id as string | undefined;
      } else {
        // Anything else is a real failure and the caller should hear about it: the buyer is
        // watching a build screen that will otherwise spin forever. Their answers are
        // already saved, so a retry loses nothing.
        throw err;
      }
    }
  }

  // The agent's own name/avatar columns are ours to write directly and instantly — unlike
  // USER.md (which needs a retrying exec against the booting instance below).
  if (agentId && (agentName || avatarUrl)) {
    await db
      .from("agents")
      .update({ ...(agentName && { name: agentName }), ...(avatarUrl && { avatar_url: avatarUrl }) })
      .eq("agent37_id", agentId);
  }

  if (agentId) {
    const ws = workspaceId;
    const id = agentId;
    after(async () => {
      const ok = await injectAgentFile(id, "USER.md", buildUserMd(type.label, answers));
      if (ok) {
        await db
          .from("agent_setup")
          .update({ injected_at: new Date().toISOString() })
          .eq("workspace_id", ws)
          .eq("agent_type", type.id);
      }
    });
  }

  // Team heads-up: Telegram (same channel as the intake flows) + an email with a PDF of the
  // full submission. Runs after the response so PDF rendering and email never block the
  // buyer's "building your agent" screen.
  const businessName = typeof answers.companyName === "string" ? answers.companyName : "";
  const sections = buildIntakeSections({ ...answers, uploadedFiles: rawUploads, trackType: "business" });
  const provisioned = !!agentId;

  after(async () => {
    await sendTelegram(
      `🤖 ${type.label} setup completed\n` +
        `Business: ${businessName || "?"}\n` +
        `By: ${buyerEmail}\n` +
        `Agent provisioned: ${provisioned ? "yes — profile injected" : "not yet — will inject at provision"}`
    );

    const submittedAt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    let pdf: Buffer | null = null;
    try {
      pdf = await renderSectionsPdf({
        docTitle: `${type.label} — Setup Profile`,
        heading: [businessName, buyerEmail].filter(Boolean).join(" • "),
        submittedAt,
        badge: type.label,
        sections,
      });
    } catch (err) {
      console.error("[agent-setup] PDF generation failed:", err);
    }

    await sendMandrillEmail({
      to: NOTIFY_EMAIL,
      subject: `${type.label} setup — ${businessName || buyerEmail}`,
      html:
        `<h2 style="font-family:sans-serif;color:#0B1729">${escapeHtml(type.label)} setup completed</h2>` +
        `<p style="font-family:sans-serif;font-size:13px;color:#6b7280">By ${escapeHtml(buyerEmail)}. ` +
        `${pdf ? "Full profile attached as a PDF." : "PDF unavailable — full details below."}</p>` +
        sectionsToHtml(sections),
      attachments: pdf ? [{ filename: `${type.id}-setup.pdf`, content: pdf }] : undefined,
    });
  });

  return { workspaceId, agentProvisioned: provisioned };
}
