import "server-only";
import { agent37 } from "@/lib/agent37";
import { USER_MD_POINTER, USER_MD_POINTER_MARKER } from "@/lib/provision";
import { createAdminClient } from "@/lib/supabase/admin";

// Repair pass for instances provisioned before the runtime-path fix. In-app twin of
// scripts/backfill-agent-memory.mjs — same shell, same outcomes — so the repair can be run
// from a browser by an admin instead of needing a live API key on someone's laptop.
//
// Two problems it fixes, both invisible from outside the box:
//   1. WRONG PLACE. OpenClaw images read $OPENCLAW_STATE_DIR/workspace, Hermes images read
//      $HERMES_STATE_DIR/memories. We wrote to the OpenClaw path unconditionally, so on a
//      Hermes box the write succeeded into a directory nothing reads.
//   2. NO POINTER. A template's own SOUL.md has no reason to mention a file we invented.

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
    'for D in $DIRS; do F="$D/USER.md"; ' +
    '[ -f "$F" ] && echo "FILE:$F:$(wc -c < "$F" | tr -d " ")" || echo "FILE:$F:missing"; done; ' +
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
          hasPointer: pointers.has(path.replace(/USER\.md$/, "SOUL.md")),
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

function repairCommand(): string {
  const b64 = Buffer.from(USER_MD_POINTER, "utf8").toString("base64");
  return (
    'DIRS=""; ' +
    'for D in "${HERMES_STATE_DIR:-/home/node/.hermes}/memories" "${OPENCLAW_STATE_DIR:-/home/node/.openclaw}/workspace"; do ' +
    '[ -d "$D" ] && DIRS="$DIRS $D"; done; ' +
    '[ -n "$DIRS" ] || { echo NO_WORKSPACE; exit 0; }; ' +
    // -s: exists AND is non-empty. The Hermes USER.md that started this existed at 0 bytes,
    // which a plain -f test would have called "already fine".
    'SRC=""; for D in $DIRS; do [ -s "$D/USER.md" ] && { SRC="$D/USER.md"; break; }; done; ' +
    '[ -n "$SRC" ] || { echo NO_USER_MD; exit 0; }; ' +
    'COPIED=0; for D in $DIRS; do [ "$D/USER.md" = "$SRC" ] && continue; ' +
    'cmp -s "$SRC" "$D/USER.md" || { cp "$SRC" "$D/USER.md"; COPIED=1; }; done; ' +
    'PTR=0; for D in $DIRS; do F="$D/SOUL.md"; touch "$F"; ' +
    `grep -qF '${USER_MD_POINTER_MARKER}' "$F" || { printf '%s' '${b64}' | base64 -d >> "$F"; PTR=1; }; done; ` +
    'echo "RESULT copied=$COPIED pointer=$PTR src=$SRC"'
  );
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
 * Visit this dashboard's agents (or the named subset of them) and put USER.md where the
 * runtime reads it.
 *
 * Targets come from OUR `agents` table, never from listAgents(). The Agent37 account is
 * shared with The College Agent, so "every instance the key can see" includes another
 * product's live customers — a fleet-wide run appended our pointer to two of them before this
 * was scoped. An explicit id that isn't ours is refused rather than quietly honoured.
 */
export async function repairAgentMemory(instanceIds?: string[]): Promise<RepairResult[]> {
  const cmd = repairCommand();

  const { data, error } = await createAdminClient().from("agents").select("agent37_id, name");
  if (error) throw new Error(`could not read this dashboard's agents: ${error.message}`);

  const rows = (data ?? []) as { agent37_id: string; name: string | null }[];
  const ours = new Map(rows.map((r) => [r.agent37_id, r.name || r.agent37_id]));

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

  const targets = requested.filter((id) => ours.has(id)).map((id) => ({ id, name: ours.get(id) as string }));

  for (const t of targets) {
    try {
      const { stdout } = await agent37.exec(t.id, cmd);
      const m = stdout.match(/RESULT copied=(\d) pointer=(\d) src=(\S+)/);
      if (m) {
        const [, copied, pointer, src] = m;
        const did = [copied === "1" && "copied USER.md", pointer === "1" && "added pointer"]
          .filter(Boolean)
          .join(", ");
        results.push(
          did
            ? { id: t.id, name: t.name, outcome: "repaired", detail: `${did} (source ${src})` }
            : { id: t.id, name: t.name, outcome: "already-correct", detail: `source ${src}` }
        );
      } else if (stdout.includes("NO_WORKSPACE")) {
        results.push({ id: t.id, name: t.name, outcome: "no-workspace" });
      } else {
        results.push({ id: t.id, name: t.name, outcome: "no-user-md" });
      }
    } catch (err) {
      results.push({
        id: t.id,
        name: t.name,
        outcome: "failed",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return results;
}
