import "server-only";
import { agent37 } from "@/lib/agent37";
import { USER_MD_POINTER, USER_MD_POINTER_MARKER } from "@/lib/provision";

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

/** Visit every instance (or the ones named) and put USER.md where its runtime reads it. */
export async function repairAgentMemory(instanceIds?: string[]): Promise<RepairResult[]> {
  const cmd = repairCommand();

  const targets = instanceIds?.length
    ? instanceIds.map((id) => ({ id, name: id }))
    : (await agent37.listAgents()).data.map((i) => ({ id: i.id, name: i.name || i.id }));

  const results: RepairResult[] = [];
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
