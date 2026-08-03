import "server-only";
import { agent37 } from "@/lib/agent37";
import {
  buildUserMd,
  ensureUserMdPointer,
  injectOwnerProfile,
  USER_MD_POINTER,
  USER_MD_POINTER_MARKER,
} from "@/lib/provision";
import { getAgentType } from "@/config/agent-types";
import { createAdminClient } from "@/lib/supabase/admin";
import { usdToMicros } from "@/lib/format";

// Repair pass for instances provisioned before the runtime-path fix, run from a browser by
// an admin rather than needing a live API key on someone's laptop.
//
// It writes the owner profile from agent_setup into every workspace the box recognises, and
// makes sure SOUL.md points at it.
//
// WHAT IT NO LONGER DOES, AND WHY. The first version copied "whichever USER.md has content"
// between directories, on the assumption that any USER.md it found was ours. On Hermes,
// USER.md is the AGENT'S own memory file. So on a live customer's box it found the agent's
// notes, decided those were the good copy, and wrote them over the questionnaire profile it
// was sent to rescue. The answers survived only because they were still in the database.
//
// The profile now lives in OWNER.md — a name nothing else writes — and is re-rendered from
// agent_setup rather than copied from whatever happens to be on disk. Nothing here reads a
// file to decide what should be in it.

export interface RepairResult {
  id: string;
  name: string;
  outcome: "repaired" | "already-correct" | "no-user-md" | "no-workspace" | "failed";
  detail?: string;
}

export interface InspectResult {
  id: string;
  files: { path: string; bytes: number; hasPointer?: boolean }[];
  /**
   * Headings and field LABELS, values stripped — "- Email: x@y.com" comes back "- Email:".
   * Enough to see the questionnaire shape is there and populated. Deliberately NOT enough to
   * tell whose it is: proving a customer's agent is configured shouldn't require reading the
   * customer's details.
   */
  preview: string[];
  error?: string;
}

/**
 * Read-only check: does this agent's memory file actually have content, and does its persona
 * point at it. Deliberately reports SIZE and LABELS, never the file's contents — the whole
 * point of this route is to verify a customer's agent without reading a customer's data.
 */
export async function inspectAgentMemory(instanceIds: string[]): Promise<InspectResult[]> {
  if (!instanceIds.length) throw new Error("inspectAgentMemory requires explicit instance ids");

  const cmd =
    'DIRS=""; ' +
    'for D in "${HERMES_STATE_DIR:-/home/node/.hermes}/memories" "${OPENCLAW_STATE_DIR:-/home/node/.openclaw}/workspace"; do ' +
    '[ -d "$D" ] && DIRS="$DIRS $D"; done; ' +
    '[ -n "$DIRS" ] || { echo NO_WORKSPACE; exit 0; }; ' +
    // Both files, because which one is populated is the whole diagnosis: OWNER.md is ours
    // (the questionnaire), USER.md is the agent's own memory. Confusing them cost a customer
    // their profile once already.
    'for D in $DIRS; do for N in USER.md MEMORY.md; do F="$D/$N"; ' +
    '[ -f "$F" ] && echo "FILE:$F:$(wc -c < "$F" | tr -d " ")" || echo "FILE:$F:missing"; done; done; ' +
    'for D in $DIRS; do F="$D/SOUL.md"; [ -f "$F" ] || continue; ' +
    `grep -qF '${USER_MD_POINTER_MARKER}' "$F" && echo "POINTER:$F" || echo "NOPOINTER:$F"; done; ` +
    // Headings and bullet LABELS only — everything after the colon on a bullet is dropped, so
    // "- Email: someone@example.com" comes back as "- Email". Enough to tell a populated
    // profile from an empty one, and to tell whose it is, without lifting the contents.
    'for D in $DIRS; do F="$D/USER.md"; [ -s "$F" ] || continue; ' +
    `grep -E '^#|^- ' "$F" | sed 's/:.*$/:/' | head -14 | sed 's/^/PREVIEW:/'; break; done; ` +
    'echo INSPECT_OK';

  const results: InspectResult[] = [];
  for (const id of instanceIds) {
    try {
      const { stdout } = await agent37.exec(id, cmd);
      const pointers = new Set((stdout.match(/POINTER:(\S+)/g) ?? []).map((s) => s.slice(8)));
      const files = (stdout.match(/FILE:(\S+)/g) ?? []).map((raw) => {
        const rest = raw.slice(5);
        const idx = rest.lastIndexOf(":");
        const path = rest.slice(0, idx);
        const size = rest.slice(idx + 1);
        return {
          path,
          bytes: size === "missing" ? -1 : Number(size),
          hasPointer: pointers.has(path.replace(/(OWNER|USER)\.md$/, "SOUL.md")),
        };
      });
      const preview = (stdout.match(/PREVIEW:(.*)/g) ?? []).map((s) => s.slice(8).trim());
      results.push({ id, files, preview });
    } catch (err) {
      results.push({ id, files: [], preview: [], error: err instanceof Error ? err.message : String(err) });
    }
  }
  return results;
}

// Undo for the pointer. The repair walks every instance the API key can see, and this
// account is shared with The College Agent — so a fleet-wide run reaches agents belonging to
// a different product. This takes the block back out of a named instance's SOUL.md.
//
// The removal is an exact-substring delete done in Node rather than a line-range delete in
// sed: the block is appended at the end today, but anything the agent itself writes afterwards
// would sit below it, and "delete from the marker to EOF" would take that with it.
function removeCommand(): string {
  const pointerB64 = Buffer.from(USER_MD_POINTER, "utf8").toString("base64");
  // argv[0] is node, argv[1] is THIS script, so the caller's arguments start at [2]. Getting
  // that wrong pointed the script at its own source, where it duly found no pointer block and
  // reported the file as clean — which is how it came back "ABSENT:/tmp/strip-pointer.js".
  const script = `
const fs = require("fs");
const file = process.argv[2];
const encoded = process.argv[3];
if (!file || !encoded) { console.log("BADARGS:" + JSON.stringify(process.argv.slice(1))); process.exit(1); }
const block = Buffer.from(encoded, "base64").toString("utf8");
const before = fs.readFileSync(file, "utf8");
if (!before.includes(block)) { console.log("ABSENT:" + file); process.exit(0); }
fs.writeFileSync(file, before.split(block).join(""));
console.log("REMOVED:" + file);
`;
  const scriptB64 = Buffer.from(script, "utf8").toString("base64");

  return (
    'DIRS=""; ' +
    'for D in "${HERMES_STATE_DIR:-/home/node/.hermes}/memories" "${OPENCLAW_STATE_DIR:-/home/node/.openclaw}/workspace"; do ' +
    '[ -d "$D" ] && DIRS="$DIRS $D"; done; ' +
    '[ -n "$DIRS" ] || { echo NO_WORKSPACE; exit 0; }; ' +
    // The marker is checked in shell BEFORE Node is involved. A missing or broken node would
    // otherwise produce silence, which the first version of this reported as "not present" —
    // indistinguishable from a confirmed clean file, and wrong in the one case that matters.
    'for D in $DIRS; do F="$D/SOUL.md"; [ -f "$F" ] || { echo "NOFILE:$D"; continue; }; ' +
    `grep -qF '${USER_MD_POINTER_MARKER}' "$F" && echo "MARKER:$F" || echo "NOMARKER:$F"; done; ` +
    'command -v node >/dev/null 2>&1 || { echo NO_NODE; exit 0; }; ' +
    `printf '%s' '${scriptB64}' | base64 -d > /tmp/strip-pointer.js; ` +
    'for D in $DIRS; do F="$D/SOUL.md"; [ -f "$F" ] || continue; ' +
    `node /tmp/strip-pointer.js "$F" '${pointerB64}' 2>&1; done; ` +
    'rm -f /tmp/strip-pointer.js; ' +
    'echo REMOVE_OK'
  );
}

/**
 * Take the pointer block back out of the named instances. Instance ids are REQUIRED — an
 * undo that defaults to "every agent on the account" is not an undo worth having.
 */
export async function removeUserMdPointer(instanceIds: string[]): Promise<RepairResult[]> {
  if (!instanceIds.length) throw new Error("removeUserMdPointer requires explicit instance ids");
  const cmd = removeCommand();

  const results: RepairResult[] = [];
  for (const id of instanceIds) {
    try {
      const { stdout } = await agent37.exec(id, cmd);
      const removed = stdout.match(/REMOVED:(\S+)/g) ?? [];
      const absent = stdout.match(/ABSENT:(\S+)/g) ?? [];
      const marked = stdout.match(/MARKER:(\S+)/g) ?? [];

      if (removed.length) {
        results.push({ id, name: id, outcome: "repaired", detail: `pointer removed from ${removed.length} file(s)` });
      } else if (marked.length) {
        // The marker is there but the exact block didn't match — the file was edited after we
        // appended, or an older build wrote different text. Do NOT call that clean.
        results.push({
          id,
          name: id,
          outcome: "failed",
          detail: `marker found in ${marked.length} file(s) but the block did not match exactly; needs a look. stdout: ${stdout.trim().slice(0, 400)}`,
        });
      } else if (absent.length) {
        results.push({ id, name: id, outcome: "already-correct", detail: "pointer confirmed absent" });
      } else {
        // No marker, no ABSENT, no REMOVED: node missing, exec truncated, something unexpected.
        // Report the raw output rather than inventing a verdict.
        results.push({
          id,
          name: id,
          outcome: "failed",
          detail: `inconclusive. stdout: ${stdout.trim().slice(0, 400) || "(empty)"}`,
        });
      }
    } catch (err) {
      results.push({
        id,
        name: id,
        outcome: "failed",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return results;
}

/**
 * Re-render each agent's owner profile from agent_setup, write it as OWNER.md, and make sure
 * SOUL.md points at it.
 *
 * The profile comes from the DATABASE every time. The previous version copied a file it found
 * on the instance, which meant a box in an unexpected state could feed its own contents back
 * in as the answer — and on one customer's agent it did exactly that.
 *
 * Targets come from OUR `agents` table, never from listAgents(). The Agent37 account is
 * shared with The College Agent, so "every instance the key can see" includes another
 * product's live customers. An explicit id that isn't ours is refused rather than quietly
 * honoured.
 */
export async function repairAgentMemory(instanceIds?: string[]): Promise<RepairResult[]> {
  const db = createAdminClient();
  const { data, error } = await db.from("agents").select("agent37_id, name, workspace_id, agent_type");
  if (error) throw new Error(`could not read this dashboard's agents: ${error.message}`);

  const rows = (data ?? []) as {
    agent37_id: string;
    name: string | null;
    workspace_id: string;
    agent_type: string | null;
  }[];
  const ours = new Map(rows.map((r) => [r.agent37_id, r]));
  const requested = instanceIds?.length ? instanceIds : [...ours.keys()];

  // An id we don't own is refused and SAID SO, rather than skipped quietly — a caller who
  // pasted the wrong instance should learn that, not read an empty result as success.
  const results: RepairResult[] = requested
    .filter((id) => !ours.has(id))
    .map((id) => ({
      id,
      name: id,
      outcome: "failed" as const,
      detail: "not an agent of this dashboard — refusing to touch it",
    }));

  for (const id of requested.filter((i) => ours.has(i))) {
    const row = ours.get(id)!;
    const name = row.name || id;
    try {
      const type = row.agent_type ? getAgentType(row.agent_type) : undefined;
      const { data: setup } = await db
        .from("agent_setup")
        .select("answers")
        .eq("workspace_id", row.workspace_id)
        .eq("agent_type", row.agent_type ?? "")
        .maybeSingle();

      if (!setup?.answers) {
        results.push({ id, name, outcome: "no-user-md", detail: "no questionnaire answers to write" });
        continue;
      }

      const md = buildUserMd(type?.label ?? "Apollo Agent", setup.answers as Record<string, unknown>);
      const wrote = await injectOwnerProfile(id, md);
      if (!wrote) {
        results.push({ id, name, outcome: "failed", detail: "could not write the profile into USER.md on the instance" });
        continue;
      }

      // The same writer provisioning uses: it REPLACES whatever pointer version is on the
      // box, including the old block that named USER.md. "Already present" was the reason a
      // repaired agent still read the wrong file.
      const pointed = await ensureUserMdPointer(id);

      // The monthly cap is set at CREATE time, so an agent provisioned before a cap change
      // keeps the old number — Nova and Ember were capped at $5 while hosting was sold as
      // including $25. Repair is the natural place to reconcile an instance with what its
      // type is currently sold as. Purchased credit is preserved by setMonthlyCap.
      let capNote = "";
      if (type) {
        try {
          const changed = await agent37.setMonthlyCap(id, usdToMicros(type.monthlyCapUsd));
          capNote = changed ? `, monthly cap set to $${type.monthlyCapUsd}` : "";
        } catch (err) {
          capNote = `, cap NOT updated (${err instanceof Error ? err.message : String(err)})`;
        }
      }

      results.push({
        id,
        name,
        outcome: pointed ? "repaired" : "failed",
        detail: pointed
          ? `wrote the profile into USER.md from the questionnaire, pointer set to current version${capNote}`
          : `profile written but the pointer could not be set${capNote}`,
      });
    } catch (err) {
      results.push({ id, name, outcome: "failed", detail: err instanceof Error ? err.message : String(err) });
    }
  }
  return results;
}
