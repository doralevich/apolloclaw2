import "server-only";
import { after } from "next/server";
import { agent37 } from "@/lib/agent37";
import { DEFAULT_AGENT, INSTANCE_RESOURCES } from "@/config/agents";
import type { AgentType } from "@/config/agent-types";
import {
  AGENTS_FENCE,
  CONTEXT_FILENAME,
  GENERATED_FILES,
  IDENTITY_FENCE,
  TOOLS_FENCE,
} from "@/config/agent-workspace";
import { buildAgentsMd, buildIdentityMd, buildToolsMd } from "@/lib/agent-files";
import { buildOwnerContext } from "@/lib/enrichment";
import { buildIntakeSections, sectionsToMarkdown } from "@/lib/onboardingSections";
import { personaForAgentType } from "@/config/personas";
import { AGENT_SKILLS, skillFile, type AgentSkill } from "@/config/skills";
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
  /** The caller will write BUSINESS-CONTEXT.md itself once this returns, from a richer source
   *  than the stored answers (the in-memory uploads). Suppresses our own enrichment pass so
   *  the two don't race on the same file. */
  callerWritesContext?: boolean;
  /**
   * Skip the one-agent-per-type-per-workspace cap.
   *
   * The cap predates seats and, once seats existed, was wrong for them: a company buying an
   * agent for the office manager and one for the founder is two agents of the SAME type in one
   * workspace, which is the entire product. Every seat purchase into a workspace that already
   * had an agent - i.e. all of them - died on a 409 reading "Each workspace can have one agent
   * per type", after the card had already been charged.
   *
   * Only the seats endpoint sets this, and the cap stays on everywhere else on purpose. The
   * Stripe webhook RELIES on that 409 for idempotency: a duplicate delivery is treated as
   * "already provisioned" and acknowledged. Take the cap away globally and a Stripe retry
   * silently mints a second VPS.
   */
  allowMultiple?: boolean;
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
  filename: "SOUL.md" | typeof CONTEXT_FILENAME,
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

/**
 * Install our skills into the instance.
 *
 * OpenClaw discovers skills by itself out of $OPENCLAW_STATE_DIR/plugin-skills — a directory per
 * skill, each holding a SKILL.md — and lists what it finds in the session's available_skills.
 * There is nothing to register and no index to keep: writing the files IS installing them.
 * (Confirmed by asking a live instance what it could see, not from docs.)
 *
 * BATCHED, because this started at three skills and is now fifty-eight. One exec per skill meant
 * fifty-eight sequential round trips into the container — minutes of waiting, and close enough to
 * the route's 300-second cap to be a real risk of a half-finished install. Each exec now carries
 * as many skills as fit comfortably in a command line, so it is a handful of calls rather than
 * one per file.
 *
 * OpenClaw only. Hermes has no equivalent path, so on a Hermes image this writes nothing rather
 * than creating a directory the runtime will never look in — a silent no-op is the honest outcome
 * there, and the log line says which happened.
 *
 * Rewritten on every provision. The content is ours, the customer never edits it, and a skill
 * whose text we have improved should improve everywhere rather than only on agents created after
 * the change.
 */
export async function installAgentSkills(agentId: string): Promise<string[]> {
  const installed: string[] = [];

  for (const batch of batchSkills()) {
    // One JSON blob of { slug: fileContents }, base64'd so no quoting in any skill body can
    // escape the shell. Node does the writing because mkdir -p plus a heredoc per file is
    // exactly the fiddly shell this replaces.
    const payload = JSON.stringify(Object.fromEntries(batch.map((s) => [s.slug, skillFile(s)])));
    const b64 = Buffer.from(payload, "utf8").toString("base64");

    const script =
      'const fs=require("fs");' +
      'const root=process.env.OPENCLAW_STATE_DIR||"/home/node/.openclaw";' +
      'const p=JSON.parse(fs.readFileSync("/tmp/apollo-skills.json","utf8"));' +
      'for(const [slug,body] of Object.entries(p)){' +
      'const d=root+"/plugin-skills/"+slug;' +
      'fs.mkdirSync(d,{recursive:true});' +
      'fs.writeFileSync(d+"/SKILL.md",body);' +
      'console.log("SKILL_WROTE:"+slug);}';

    const cmd =
      'ROOT="${OPENCLAW_STATE_DIR:-/home/node/.openclaw}"; ' +
      // The state dir is the test for "is this an OpenClaw box". plugin-skills may not exist yet
      // on a fresh instance, so node creates it; the state dir is not ours to invent.
      '[ -d "$ROOT" ] || { echo NOT_OPENCLAW; exit 0; }; ' +
      'command -v node >/dev/null 2>&1 || { echo NO_NODE; exit 1; }; ' +
      `printf '%s' '${b64}' | base64 -d > /tmp/apollo-skills.json; ` +
      `node -e '${script}'; ` +
      'rm -f /tmp/apollo-skills.json';

    try {
      const { stdout } = await agent37.exec(agentId, cmd);
      if (stdout.includes("NOT_OPENCLAW")) {
        console.log("[provision:skills-skipped]", agentId, "not an OpenClaw image");
        return [];
      }
      for (const m of stdout.matchAll(/SKILL_WROTE:(\S+)/g)) installed.push(m[1]);
    } catch (err) {
      // A failed batch is not a reason to abandon the rest, and none of these is load-bearing
      // enough to fail provisioning over — the agent works without them, just less well. The
      // write is idempotent, so re-running fills whatever a bad batch missed.
      console.error("[provision:skill-batch-failed]", agentId, (err as Error).message);
    }
  }

  console.log(
    "[provision:skills-installed]",
    agentId,
    `${installed.length}/${AGENT_SKILLS.length}`
  );
  return installed;
}

/**
 * Split the skills into batches small enough to pass on a command line.
 *
 * Sized by the base64 payload rather than by count, because skill bodies differ by several times
 * and a fixed count would make batch size a lottery. 48 KB leaves generous room under the usual
 * ~2 MB ARG_MAX and under whatever the exec API will accept.
 */
function batchSkills(): AgentSkill[][] {
  const MAX_ENCODED = 48 * 1024;
  const batches: AgentSkill[][] = [];
  let current: AgentSkill[] = [];
  let size = 0;

  for (const skill of AGENT_SKILLS) {
    // base64 is 4 bytes per 3, plus JSON escaping overhead — approximated generously.
    const encoded = Math.ceil((skillFile(skill).length * 4) / 3) + skill.slug.length + 16;
    if (current.length && size + encoded > MAX_ENCODED) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(skill);
    size += encoded;
  }
  if (current.length) batches.push(current);
  return batches;
}

/**
 * What our skills directory actually contains on a given instance.
 *
 * The check that matters after installing: a SKILL.md can be written successfully and still be
 * ignored by the runtime, so "did the file land" and "does the agent see it" are different
 * questions. This answers the first one honestly, which is what lets you stop guessing about the
 * second.
 *
 * Names only. The bodies are ours and already in the repo; nothing here should be reading around
 * a customer's instance for more than it needs.
 */
export async function listAgentSkills(agentId: string): Promise<string[]> {
  const cmd =
    'ROOT="${OPENCLAW_STATE_DIR:-/home/node/.openclaw}"; ' +
    'D="$ROOT/plugin-skills"; ' +
    '[ -d "$D" ] || { echo NONE; exit 0; }; ' +
    // A skill is a directory holding SKILL.md. Anything else in there isn't one, and listing it
    // would make an empty directory look installed.
    'for S in "$D"/*/; do [ -f "$S/SKILL.md" ] && basename "$S"; done';

  try {
    const { stdout } = await agent37.exec(agentId, cmd);
    if (stdout.includes("NONE")) return [];
    return stdout
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.includes(" "));
  } catch (err) {
    console.error("[provision:skills-list-failed]", agentId, (err as Error).message);
    return [];
  }
}

// WHERE THE PROFILE HAS TO GO, settled by reading the Hermes source rather than guessing:
//
//   agent/learning_mutations.py:  _MEMORY_FILES = {"memory": "MEMORY.md", "profile": "USER.md"}
//
// Hermes loads exactly those two files out of ~/.hermes/memories and injects them into the
// system prompt at session start. USER.md is not "the agent's file" — it is the PROFILE file,
// the one place the runtime looks to learn who its owner is. That is our content's home.
//
// We spent a day getting here the long way. First we wrote USER.md but into the OpenClaw
// directory, which Hermes never reads. Then a repair pass copied "whichever copy has content"
// and overwrote a customer's answers with the agent's own notes. So we renamed ours to
// OWNER.md to stop the collision — and OWNER.md is a filename Hermes has never heard of, so
// the agent went on not knowing anyone, now for a completely different reason.
//
// The collision was real; a new filename was the wrong answer to it. Both writers belong in
// USER.md, so our content goes in a FENCED BLOCK and everything outside the fence is left
// exactly as found. The agent keeps what it learns, we keep what the customer told us, and
// neither erases the other.
export const OWNER_BLOCK_START = "<!-- apollo:owner-profile:start -->";
export const OWNER_BLOCK_END = "<!-- apollo:owner-profile:end -->";

// Fenced pointer written into SOUL.md. Less load-bearing now that the profile sits in a file
// the runtime injects on its own, but harmless, and it still carries the OpenClaw layout where
// nothing is auto-loaded.
export const USER_MD_POINTER_MARKER = "<!-- apollo:owner-pointer:start -->";
export const USER_MD_POINTER_END = "<!-- apollo:owner-pointer:end -->";

// The single-marker block from before the fence existed, and the one that named OWNER.md.
// Both are removed on sight.
export const LEGACY_POINTER_MARKER = "<!-- apollo:user-md-pointer -->";

export const USER_MD_POINTER = `

${USER_MD_POINTER_MARKER}
## Who you work for, and what was written for you

Your owner filled out a setup questionnaire before you existed. Their answers became the
files sitting beside this one:

- **USER.md** — who they are: them, their business, how it runs, where it hurts.
- **AGENTS.md** — how to work for them: what to push on, how to sound, what not to touch.
- **TOOLS.md** — the software their business actually runs on.
- **IDENTITY.md** — your name and who you serve.

Treat them as ground truth about your owner, the way you treat this file as ground truth
about yourself. Never tell your owner you don't know who they are — it's written down.

Each of those files has a block marked \`apollo:…:start\` … \`:end\`. That block is theirs,
not yours: it is rewritten whenever they update their answers, so anything you put INSIDE
one will be lost. Everything outside the markers is yours to keep — write there.
${USER_MD_POINTER_END}
`;

// Merge a block INTO a file, inside our fence, in every workspace the instance recognises.
// Anything outside the fence is preserved exactly.
//
// Node, not shell, because this is a surgical replace of one region of a file that another
// writer owns the rest of.
export async function injectFencedBlock(
  agentId: string,
  filename: string,
  markdown: string,
  markers: { start: string; end: string }
): Promise<boolean> {
  const script = `
const fs = require("fs");
const [file, bodyB64, startM, endM] = process.argv.slice(2);
if (!file || !bodyB64) { console.log("BADARGS"); process.exit(1); }
const body = Buffer.from(bodyB64, "base64").toString("utf8");
const block = startM + "\\n" + body.replace(/\\s+$/, "") + "\\n" + endM;

let text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const a = text.indexOf(startM);
if (a === -1) {
  // First write: our block goes at the TOP. A profile is what the agent should read before
  // anything it has since written, and a file the runtime injects whole reads top-down.
  text = block + (text.trim() ? "\\n\\n" + text.replace(/^\\s+/, "") : "\\n");
} else {
  const b = text.indexOf(endM, a);
  text = b === -1
    ? text.slice(0, a) + block
    : text.slice(0, a) + block + text.slice(b + endM.length);
}
fs.writeFileSync(file, text.replace(/\\s+$/, "") + "\\n");
console.log("PROFILE_SET:" + file);
`;
  const scriptB64 = Buffer.from(script, "utf8").toString("base64");
  const bodyB64 = Buffer.from(markdown, "utf8").toString("base64");

  const cmd =
    `${CANDIDATE_DIRS}` +
    'command -v node >/dev/null 2>&1 || { echo NO_NODE; exit 1; }; ' +
    `printf '%s' '${scriptB64}' | base64 -d > /tmp/apollo-profile.js; ` +
    `for D in $DIRS; do F="$D/${filename}"; touch "$F"; ` +
    `node /tmp/apollo-profile.js "$F" '${bodyB64}' '${markers.start}' '${markers.end}' 2>&1; done; ` +
    'rm -f /tmp/apollo-profile.js; ' +
    'echo PROFILE_OK';

  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const { stdout } = await agent37.exec(agentId, cmd);
      const landed = stdout.match(/PROFILE_SET:(\S+)/g);
      if (landed) {
        console.log("[provision:file-merged]", agentId, filename, landed.join(" "));
        return true;
      }
      if (stdout.includes("PROFILE_OK")) {
        console.error("[provision:file-no-write]", agentId, filename, stdout.trim().slice(0, 300));
        return false;
      }
    } catch {
      // instance still provisioning/booting — wait and retry
    }
    await sleep(15_000);
  }
  console.error("[provision:file-merge-failed]", agentId, filename);
  return false;
}

/** The owner profile, into USER.md — the file both runtimes load as "who you work for". */
export function injectOwnerProfile(agentId: string, markdown: string): Promise<boolean> {
  return injectFencedBlock(agentId, "USER.md", markdown, {
    start: OWNER_BLOCK_START,
    end: OWNER_BLOCK_END,
  });
}

// Put the CURRENT pointer block into SOUL.md in every workspace the instance recognises,
// replacing whatever version is already there.
//
// Done in Node rather than shell because it is a rewrite, not an append: strip any fenced
// block, strip the legacy single-marker block, then append the current text. Everything the
// template or the agent wrote is preserved — only our own block is touched.
export async function ensureUserMdPointer(agentId: string): Promise<boolean> {
  const script = `
const fs = require("fs");
const [file, blockB64, startM, endM, legacyM] = process.argv.slice(2);
if (!file || !blockB64) { console.log("BADARGS"); process.exit(1); }
const block = Buffer.from(blockB64, "base64").toString("utf8");
let text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";

// Fenced block: drop everything from start marker to end marker, wherever it sits.
for (;;) {
  const a = text.indexOf(startM);
  if (a === -1) break;
  const b = text.indexOf(endM, a);
  if (b === -1) { text = text.slice(0, a); break; }
  text = text.slice(0, a) + text.slice(b + endM.length);
}

// Legacy block: one marker, no end, written by appending — so it ran to the end of the file
// at the time. Cut from the marker to the end of ITS last line, not to EOF, in case the agent
// has written below it since.
const li = text.indexOf(legacyM);
if (li !== -1) {
  const tail = "down, go and read it.";
  const te = text.indexOf(tail, li);
  text = te === -1 ? text.slice(0, li) : text.slice(0, li) + text.slice(te + tail.length);
}

fs.writeFileSync(file, text.replace(/\s+$/, "") + block);
console.log("POINTER_SET:" + file);
`;
  const scriptB64 = Buffer.from(script, "utf8").toString("base64");
  const blockB64 = Buffer.from(USER_MD_POINTER, "utf8").toString("base64");

  const cmd =
    `${CANDIDATE_DIRS}` +
    'command -v node >/dev/null 2>&1 || { echo NO_NODE; exit 1; }; ' +
    `printf '%s' '${scriptB64}' | base64 -d > /tmp/apollo-pointer.js; ` +
    'for D in $DIRS; do F="$D/SOUL.md"; touch "$F"; ' +
    `node /tmp/apollo-pointer.js "$F" '${blockB64}' '${USER_MD_POINTER_MARKER}' '${USER_MD_POINTER_END}' '${LEGACY_POINTER_MARKER}' 2>&1; done; ` +
    'rm -f /tmp/apollo-pointer.js; ' +
    'echo POINTER_OK';

  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const { stdout } = await agent37.exec(agentId, cmd);
      if (stdout.includes("POINTER_SET")) return true;
      // POINTER_OK without a single POINTER_SET means the script never wrote anything —
      // report that as a failure rather than counting the shell's own exit as success.
      if (stdout.includes("POINTER_OK")) {
        console.error("[provision:pointer-no-write]", agentId, stdout.trim().slice(0, 300));
        return false;
      }
    } catch {
      // instance still provisioning/booting — wait and retry
    }
    await sleep(15_000);
  }
  console.error("[provision:pointer-inject-failed]", agentId);
  return false;
}

export interface WorkspaceWrite {
  answers: Record<string, unknown>;
  /** The name the customer chose for their agent, for IDENTITY.md. */
  agentName?: string;
  /** What enrichment produced, if anything — one line for AGENTS.md's "where to look". */
  contextSummary?: string;
}

/**
 * Write the questionnaire-derived files an OpenClaw agent auto-loads: AGENTS.md (how to work
 * for this owner), TOOLS.md (their stack), IDENTITY.md (who this agent is).
 *
 * USER.md is NOT here — it goes through injectOwnerProfile, which every caller does first and
 * gates on, because a failed profile write means the box isn't ready and there is no point
 * trying three more.
 *
 * Sequential, and each write is independent: one file failing (a template that ships AGENTS.md
 * read-only, say) must not cost the other two. Returns what landed, for the logs.
 */
export async function writeGeneratedFiles(agentId: string, input: WorkspaceWrite): Promise<string[]> {
  const files: Array<[string, string, { start: string; end: string }]> = [
    [GENERATED_FILES.agents, buildAgentsMd(input.answers, input.contextSummary), AGENTS_FENCE],
    [GENERATED_FILES.tools, buildToolsMd(input.answers), TOOLS_FENCE],
    [GENERATED_FILES.identity, buildIdentityMd(input.agentName, input.answers), IDENTITY_FENCE],
  ];

  const landed: string[] = [];
  for (const [filename, body, markers] of files) {
    try {
      if (await injectFencedBlock(agentId, filename, body, markers)) landed.push(filename);
    } catch (err) {
      console.error("[provision:generated-file-failed]", agentId, filename, err);
    }
  }
  console.log("[provision:generated-files]", agentId, landed.join(" ") || "(none)");
  return landed;
}

// Render questionnaire answers as the USER.md the agent reads. Labels come from the
// shared onboarding section builder (the same one behind the free /onboard lead form and
// its PDF/email) so the file reads like notes, not a form dump.
export function buildUserMd(
  typeLabel: string,
  answers: Record<string, unknown>,
  /** One line describing what landed in BUSINESS-CONTEXT.md ("2 pages from their website and
   *  3 uploaded documents"). Omitted when enrichment found nothing — an agent told to read a
   *  file that isn't there is worse than one that was never told about it. */
  contextSummary?: string
): string {
  const sections = buildIntakeSections({ ...answers, trackType: "business" });
  return [
    `# About the business you work for`,
    ``,
    `Notes from your owner's ${typeLabel} setup questionnaire. Treat this as ground truth`,
    `about who you work for - and update it as you learn more.`,
    ``,
    sectionsToMarkdown(sections),
    ...(contextSummary
      ? [
          ``,
          `## Source material`,
          ``,
          `There is a file called \`${CONTEXT_FILENAME}\` in this same directory holding`,
          `${contextSummary}, captured during setup. It is too long to keep here, so read it`,
          `when you need the detail - what they sell, how they describe themselves, their own`,
          `words. Prefer it over guessing, and treat anything in it as a snapshot from setup`,
          `rather than as today's truth.`,
        ]
      : []),
  ].join("\n");
}

// Post-create injection for a paid agent: persona (fallback template only — dedicated
// templates carry their own) and USER.md from any setup answers already submitted for
// this workspace + type. Marks agent_setup.injected_at when the USER.md write lands.
async function injectAfterProvision(
  agentId: string,
  type: AgentType,
  workspaceId: string,
  skipContext: boolean
): Promise<void> {
  // SOUL.md, always — not only when the template fell back.
  //
  // It used to be fallback-only because the dedicated image carried its own persona, which is
  // precisely what tied us to a bespoke image. With the persona in config/personas.ts instead,
  // a stock OpenClaw box plus the files we generate IS the custom agent, and the image is
  // something we can swap without losing the product.
  //
  // Written FIRST, before the profile and the pointer, because ensureUserMdPointer merges a
  // fenced block into this same file — and writing the whole file afterwards would take the
  // pointer back out with it.
  const persona = personaForAgentType(type.id);
  if (persona) await injectAgentFile(agentId, "SOUL.md", persona);

  // Alongside the persona, and for the same reason: both are ours, neither depends on the
  // questionnaire, and an agent whose answers never arrive should still know how to work.
  await installAgentSkills(agentId);

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
  const answers = setup.answers as Record<string, unknown>;

  // Website enrichment only. The uploaded files are NOT available here: their bytes live in
  // memory for exactly one request (the questionnaire submission) and are never persisted, so
  // by the time provisioning runs there is nothing to extract. The website is a stored answer,
  // so it can still be read.
  //
  // Skipped entirely when the caller is doing its own pass — /api/onboard/complete provisions
  // and then enriches with the uploads in hand, and two writers racing on one file would leave
  // whichever finished last, not whichever knew more.
  const context = skipContext
    ? null
    : await buildOwnerContext({
        website: typeof answers.website === "string" ? answers.website : undefined,
        businessName: typeof answers.companyName === "string" ? answers.companyName : undefined,
      }).catch((err) => {
        console.error("[provision] enrichment failed:", err);
        return null;
      });

  const ok = await injectOwnerProfile(agentId, buildUserMd(type.label, answers, context?.summary));
  if (ok) await ensureUserMdPointer(agentId);
  if (ok && context) await injectAgentFile(agentId, CONTEXT_FILENAME, context.markdown);
  if (ok) {
    await writeGeneratedFiles(agentId, {
      answers,
      agentName: (setup.agent_name as string | null) ?? undefined,
      contextSummary: context?.summary,
    });
  }
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
  const { type, workspaceId, userId, allowTemplateFallback = false, allowMultiple = false } = input;

  // Service-role client: callers have already authorized the request (member+entitled
  // gates on the API route; a verified Stripe signature + paid session on the webhook).
  const db = createAdminClient();

  // Cap: one agent of each type per workspace. Keyed on agent_type with a template
  // fallback for legacy rows that predate the column. Best-effort — two simultaneous
  // creates could race past it, but the UI disables the card once the list refreshes.
  const { data: existing, error: capError } = allowMultiple
    ? { data: null, error: null }
    : await db
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

  const { template } = await resolveProvisionTemplate(type, allowTemplateFallback);

  // The customer's chosen name/avatar (Personalize step, components/onboard/OnboardingForm.tsx)
  // may already be sitting in agent_setup if they finished onboarding before this ran.
  const pending = await lookupPendingPersonalization(db, workspaceId, type.id);

  // Two names, two audiences — David's rule, restored after "Iris" turned up in his ops list.
  //
  // The PERSONA name (Iris, Max, Atlas) is what the customer calls their agent, chosen at the
  // Personalize step. It lives in OUR agents table and nowhere else. The INSTANCE name is what
  // David reads in the Agent37 dashboard at 2am when a box is misbehaving, and "Iris" answers
  // none of the questions he has there: whose is it, which workspace, who to email. For a while
  // this call sent the persona as the instance name, which is how a row named Iris ended up
  // beside "Steve Cronin's Workspace" - same list, two naming schemes, one of them a riddle.
  //
  // So the instance is named after the workspace, with the persona appended only as a
  // disambiguator - a workspace can hold several agents now (seats), and two rows both reading
  // "Acme's Workspace" would trade one riddle for another.
  const personaName = input.name?.trim() || pending.name?.trim() || "";
  const { data: ws } = await db
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .maybeSingle();
  const instanceName = [ws?.name?.trim() || type.label, personaName || null]
    .filter(Boolean)
    .join(" - ");

  const agent = await agent37.createAgent({
    template,
    // Every instance, every type, both runtimes — one size, from config/agents.ts. This is
    // the only call in the app that creates an Agent37 instance, so there is no second path
    // a different shape could come in through.
    resources: { ...INSTANCE_RESOURCES },
    user: userId,
    name: instanceName,
    metadata: { app_workspace: workspaceId, agent_type: type.id },
    budget: { monthly_cap_micros: usdToMicros(type.monthlyCapUsd) },
  });

  const { error } = await db.from("agents").insert({
    agent37_id: agent.id,
    workspace_id: workspaceId,
    // The persona, NOT agent.name. agent.name is now the ops label above, and echoing it back
    // here would greet the customer with "Acme's Workspace - Iris" in their own sidebar.
    name: personaName || null,
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
  // The persona is written on every provision now, not only when the template fell back, so
  // nothing downstream needs to know which image it got. resolveProvisionTemplate still reports
  // and logs the fallback for the operator.
  after(() => injectAfterProvision(agent.id, type, workspaceId, !!input.callerWritesContext));

  return agent;
}
