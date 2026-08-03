#!/usr/bin/env node
/**
 * backfill-agent-memory.mjs — put each agent's USER.md where its runtime actually reads it.
 *
 * Two problems, both on instances provisioned before the fix in lib/provision.ts:
 *
 *   1. WRONG PLACE. Templates carry different runtimes. OpenClaw images read
 *      $OPENCLAW_STATE_DIR/workspace; Hermes images read $HERMES_STATE_DIR/memories. We wrote
 *      to the OpenClaw path unconditionally, so on a Hermes box the write succeeded into a
 *      directory nothing reads while the agent's real USER.md sat at 0 bytes.
 *   2. NO POINTER. A dedicated template's SOUL.md persona has no reason to know about a file
 *      we invented, so even a correctly-placed USER.md went unread.
 *
 * This copies whichever USER.md has content into every workspace the box recognises, then
 * appends the pointer to each SOUL.md.
 *
 *   AGENT37_API_KEY=... node scripts/backfill-agent-memory.mjs [--dry-run] [instanceId...]
 *
 * With no instance IDs it visits every instance the key can see. Idempotent: contents are
 * compared before copying and the pointer is marker-guarded, so re-running is a no-op.
 * Instances with no populated USER.md anywhere are left alone.
 *
 * KEEP THE POINTER TEXT BELOW IN SYNC WITH lib/provision.ts (source of truth).
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const MARKER = "<!-- apollo:user-md-pointer -->";

const POINTER = `

${MARKER}
## Who you work for

There is a USER.md beside this file in your workspace. It holds your owner's answers from
their setup questionnaire: who they are, their business, how it runs, and where it hurts.

Read it at the start of every session, before your first reply. Treat it as ground truth
about them the way you treat this file as ground truth about yourself, and keep it current
as you learn more. Never tell your owner you don't know who they are — you do, it is written
down, go and read it.
`;

// ── Load .env.local (same pattern as seed-stripe-catalog.mjs) ─────────────────
const here = dirname(fileURLToPath(import.meta.url));
try {
  const raw = readFileSync(resolve(here, "..", ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // no .env.local — rely on the ambient environment
}

const KEY = process.env.AGENT37_API_KEY;
const BASE = (process.env.AGENT37_API_BASE_URL || "https://api.agent37.com").replace(/\/$/, "");
if (!KEY) {
  console.error("AGENT37_API_KEY is not set (env or .env.local).");
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const ids = args.filter((a) => !a.startsWith("--"));

async function api(path, init) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || body?.message || res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  return body;
}

// Everything is decided inside the container, because only the box knows which runtime it
// is. Find the USER.md that actually has content, copy it into every other workspace the
// image recognises, then append the pointer to each SOUL.md. An instance with no populated
// USER.md anywhere is left alone — there is nothing to copy and nothing to point at.
const b64 = Buffer.from(POINTER, "utf8").toString("base64");
const CMD =
  'DIRS=""; ' +
  'for D in "${HERMES_STATE_DIR:-/home/node/.hermes}/memories" "${OPENCLAW_STATE_DIR:-/home/node/.openclaw}/workspace"; do ' +
  '[ -d "$D" ] && DIRS="$DIRS $D"; done; ' +
  '[ -n "$DIRS" ] || { echo NO_WORKSPACE; exit 0; }; ' +
  // -s: exists AND is non-empty. Taylor's Hermes USER.md existed at 0 bytes, which is
  // exactly the case a plain -f test would have called "already fine".
  'SRC=""; for D in $DIRS; do [ -s "$D/USER.md" ] && { SRC="$D/USER.md"; break; }; done; ' +
  '[ -n "$SRC" ] || { echo NO_USER_MD; exit 0; }; ' +
  'COPIED=0; for D in $DIRS; do [ "$D/USER.md" = "$SRC" ] && continue; ' +
  'cmp -s "$SRC" "$D/USER.md" || { cp "$SRC" "$D/USER.md"; COPIED=1; }; done; ' +
  'PTR=0; for D in $DIRS; do F="$D/SOUL.md"; touch "$F"; ' +
  `grep -qF '${MARKER}' "$F" || { printf '%s' '${b64}' | base64 -d >> "$F"; PTR=1; }; done; ` +
  'echo "RESULT copied=$COPIED pointer=$PTR src=$SRC"';

const targets = ids.length
  ? ids.map((id) => ({ id, name: id }))
  : (await api("/instances")).data.map((i) => ({ id: i.id, name: i.name || i.id }));

console.log(`${dryRun ? "[dry run] " : ""}${targets.length} instance(s) to visit\n`);

let added = 0;
let skipped = 0;
let failed = 0;

for (const t of targets) {
  if (dryRun) {
    console.log(`  would visit  ${t.name} (${t.id})`);
    continue;
  }
  try {
    const { stdout } = await api(`/instances/${t.id}/exec`, {
      method: "POST",
      body: JSON.stringify({ command: CMD }),
    });
    const m = stdout.match(/RESULT copied=(\d) pointer=(\d) src=(\S+)/);
    if (m) {
      const [, copied, pointer, src] = m;
      const did = [copied === "1" && "copied USER.md", pointer === "1" && "added pointer"]
        .filter(Boolean)
        .join(", ");
      if (did) {
        added++;
        console.log(`  ${did.padEnd(30)} ${t.name} (from ${src})`);
      } else {
        skipped++;
        console.log(`  already correct                ${t.name}`);
      }
    } else if (stdout.includes("NO_WORKSPACE")) {
      skipped++;
      console.log(`  no recognised workspace        ${t.name}`);
    } else {
      skipped++;
      console.log(`  no populated USER.md           ${t.name}`);
    }
  } catch (err) {
    failed++;
    console.error(`  FAILED         ${t.name} (${t.id}): ${err.message}`);
  }
}

if (!dryRun) {
  console.log(`\nadded ${added}, skipped ${skipped}, failed ${failed}`);
}
process.exit(failed > 0 ? 1 : 0);
