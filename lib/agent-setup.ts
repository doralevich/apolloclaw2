import "server-only";
import { after } from "next/server";
import type { AgentType } from "@/config/agent-types";
import { NOTIFY_EMAIL, sendMandrillEmail } from "@/lib/email";
import { ApiError } from "@/lib/http";
import { buildIntakeSections, escapeHtml, sectionsToHtml } from "@/lib/onboardingSections";
import { renderSectionsPdf } from "@/lib/pdf";
import { isAvatarPresetPath } from "@/config/avatar-presets";
import { CONTEXT_FILENAME } from "@/config/agent-workspace";
import { buildOwnerContext } from "@/lib/enrichment";
import {
  buildUserMd,
  ensureUserMdPointer,
  injectAgentFile,
  injectOwnerProfile,
  provisionTypedAgent,
  writeGeneratedFiles,
} from "@/lib/provision";
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
   * Which agent these answers describe.
   *
   * Only needed when a workspace holds more than one agent of the same type, where "the agent
   * of this type" stops being a single answer. Omitted everywhere else, and resolved from the
   * workspace as before.
   */
  agent37Id?: string;
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
  // A preset is one of two things, and nothing else is allowed into this column:
  //
  //   * a path to one of our shipped mascot avatars (config/avatar-presets.ts), matched against
  //     the exact list rather than a "/avatars/..." prefix — a prefix test would quietly promote
  //     any future file in that folder into a valid avatar;
  //   * a small inline data: URI for the generated initials avatar, length-capped so a client
  //     can't push an arbitrarily large blob into the row.
  const preset = input.avatarPreset;
  const presetUrl =
    preset && isAvatarPresetPath(preset)
      ? preset
      : preset && preset.startsWith("data:image/") && preset.length <= 20_000
        ? preset
        : undefined;
  const avatarUrl = input.avatarUpload
    ? (await uploadAgentAvatar(workspaceId, type.id, input.avatarUpload)) ?? undefined
    : presetUrl;

  // WHICH AGENT do these answers belong to?
  //
  // Named explicitly when the caller knows - a second agent in a workspace that already has
  // one, where "the agent of this type" is ambiguous and guessing would attach somebody's
  // answers to the wrong instance. Otherwise the single agent of this type, which is every
  // flow that existed before seats.
  let agentId = input.agent37Id;
  if (!agentId) {
    // Does the agent exist yet? The per-agent flow races the Stripe webhook and usually finds
    // one; the license flow never will, because nothing provisions before this point.
    const { data: agentRow } = await db
      .from("agents")
      .select("agent37_id")
      .eq("workspace_id", workspaceId)
      .or(`agent_type.eq.${type.id},template.eq.${type.template}`)
      .limit(1)
      .maybeSingle();
    agentId = agentRow?.agent37_id as string | undefined;
  }

  // Find the row this submission updates, rather than upserting on (workspace, type).
  //
  // That key meant ONE answers row per company per type, and every ApolloClaw agent is the same
  // type - so the second person in a workspace to finish the questionnaire overwrote the first
  // person's answers and took the agent37_id stamp with them, orphaning the original. Silent,
  // and unrecoverable. Migration 0023 replaced it with a surrogate key and two partial uniques;
  // this is the read side of that.
  //
  // A known agent matches its own row. An unknown one matches the unclaimed row for this type,
  // which is what keeps the licence flow idempotent when a buyer submits twice.
  const finder = db.from("agent_setup").select("id").eq("workspace_id", workspaceId);
  const { data: existingRow } = agentId
    ? await finder.eq("agent37_id", agentId).maybeSingle()
    : await finder.eq("agent_type", type.id).is("agent37_id", null).maybeSingle();

  const record = {
    workspace_id: workspaceId,
    agent_type: type.id,
    ...(agentId ? { agent37_id: agentId } : {}),
    answers,
    agent_name: agentName ?? null,
    avatar_url: avatarUrl ?? null,
    submitted_by: submittedBy ?? null,
    injected_at: null,
    updated_at: new Date().toISOString(),
  };

  const { error } = existingRow?.id
    ? await db.from("agent_setup").update(record).eq("id", existingRow.id)
    : await db.from("agent_setup").insert(record);
  if (error) throw new ApiError(500, "db_error", error.message);

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
        // We enrich below, with the uploaded files still in memory; provisioning's own pass
        // would only see the website and would be racing us for the same file.
        callerWritesContext: true,
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

  // Stamp the answers with the agent they built, now that we know which one it is.
  //
  // Seats made this necessary. The row is keyed (workspace_id, agent_type), which is one set of
  // answers per company — so a second person's agent in the same workspace would be built from,
  // and would report a checklist for, the FIRST person's answers: their calendar, their team,
  // their apps. The stamp lets a reader ask for the answers belonging to a specific agent and
  // fall back to the workspace row only when there is no per-agent one, which is every row
  // written before this shipped.
  if (agentId) {
    await db
      .from("agent_setup")
      .update({ agent37_id: agentId })
      .eq("workspace_id", workspaceId)
      .eq("agent_type", type.id);
  }

  // The agent's own name/avatar columns are ours to write directly and instantly — unlike
  // USER.md (which needs a retrying exec against the booting instance below).
  if (agentId && (agentName || avatarUrl)) {
    await db
      .from("agents")
      .update({ ...(agentName && { name: agentName }), ...(avatarUrl && { avatar_url: avatarUrl }) })
      .eq("agent37_id", agentId);
  }

  const businessName = typeof answers.companyName === "string" ? answers.companyName : "";

  if (agentId) {
    const ws = workspaceId;
    const id = agentId;
    after(async () => {
      // Uploads and website into readable text. This is the ONLY moment the uploaded bytes
      // exist — they are never persisted — so it happens here or not at all. It runs before
      // the profile write because the profile has to name what it produced.
      const context = await buildOwnerContext({
        uploads: rawUploads,
        website: typeof answers.website === "string" ? answers.website : undefined,
        businessName: businessName || undefined,
      }).catch((err) => {
        // Enrichment is a bonus; the profile is the product. Never let it take the profile down.
        console.error("[agent-setup] enrichment failed:", err);
        return null;
      });

      const ok = await injectOwnerProfile(id, buildUserMd(type.label, answers, context?.summary));
      // The file alone doesn't reach the agent — SOUL.md has to point at it.
      if (ok) await ensureUserMdPointer(id);
      // Only written once the profile that names it has landed, so the agent is never
      // pointed at a file we failed to create — or left holding one nothing references.
      if (ok && context) await injectAgentFile(id, CONTEXT_FILENAME, context.markdown);
      // AGENTS.md, TOOLS.md, IDENTITY.md — the rest of what the runtime loads at session
      // start, built from the same answers. Gated on the profile write for the same reason:
      // if that failed the instance isn't reachable yet.
      if (ok) await writeGeneratedFiles(id, { answers, agentName, contextSummary: context?.summary });
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
  const sections = buildIntakeSections({ ...answers, uploadedFiles: rawUploads, trackType: "business" });
  const provisioned = !!agentId;

  after(async () => {
    await sendTelegram(
      `🤖 ${type.label} setup completed\n` +
        `Business: ${businessName || "?"}\n` +
        `By: ${buyerEmail}\n` +
        `Agent provisioned: ${provisioned ? "yes - profile injected" : "not yet - will inject at provision"}`
    );

    const submittedAt = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    let pdf: Buffer | null = null;
    try {
      pdf = await renderSectionsPdf({
        docTitle: `${type.label} - Setup Profile`,
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
      subject: `${type.label} setup - ${businessName || buyerEmail}`,
      html:
        `<h2 style="font-family:sans-serif;color:#0B1729">${escapeHtml(type.label)} setup completed</h2>` +
        `<p style="font-family:sans-serif;font-size:13px;color:#6b7280">By ${escapeHtml(buyerEmail)}. ` +
        `${pdf ? "Full profile attached as a PDF." : "PDF unavailable - full details below."}</p>` +
        sectionsToHtml(sections),
      attachments: pdf ? [{ filename: `${type.id}-setup.pdf`, content: pdf }] : undefined,
    });
  });

  return { workspaceId, agentProvisioned: provisioned };
}
