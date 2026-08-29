import "server-only";
import { agent37 } from "@/lib/agent37";

// The capabilities a new OpenClaw box should come up WITH, applied by us at provision time
// (and backfillable onto existing boxes) rather than waiting on the base image to ship them.
//
// Two things a fresh instance is missing until we set them:
//
//   MEMORY (searchable) — OpenClaw defaults its memory embeddings to OpenAI, and the box has no
//   OpenAI key, so building the index fails with `No API key found for provider "openai"` and
//   recall-by-meaning is dead. We point it at a LOCAL embedding model instead: node-llama-cpp
//   runs it on the box, the default GGUF (~0.3 GB) auto-downloads on first use, and there is no
//   API key and no per-customer cost. Private, and free.
//
//   WEB SEARCH — off by default. We enable the Tavily plugin (built for agents: it returns
//   cleaned, answer-ready page content, not just links) with one key that covers the whole fleet,
//   read from TAVILY_API_KEY. If that env var is unset the search step is skipped and logged, so
//   the rest still applies.
//
// TIMEZONE is mostly handled already (captured at onboarding, written into USER.md, used by
// schedules). We additionally set the box's own clock, best-effort, so timestamps line up. The
// clock step touches the OS only, never openclaw.json, so it is always safe to run.
//
// ── SAFETY: config writes are GATED OFF by default ──────────────────────────────────────────
// The exact openclaw.json keys below were taken from the OpenClaw docs, not a live box. On the
// first real backfill a wrong key took a customer instance's agent runtime down: after the
// config was written and the box restarted, chat returned "The 'openclaw' harness is not
// available on this instance." The memory/Tavily writes are therefore disabled unless
// INSTANCE_DEFAULTS_CONFIG=on, so neither a provision nor a manual apply can brick a box while
// the keys are unverified. The clock step still runs. Use inspectInstanceDefaults against a
// known-good box to learn the real shape, fix CONFIG below, then flip the flag on. If a box was
// already bricked, revertInstanceDefaults removes exactly the keys we set and restarts it.

/** Master switch for the openclaw.json writes (memory + Tavily). Off until the keys below are
 *  verified against a live instance. The clock step is unaffected and always runs. */
const CONFIG_WRITES_ENABLED = process.env.INSTANCE_DEFAULTS_CONFIG === "on";

// ── The config we merge. Tweak here if a live instance reports different keys. ──────────────

/** Dotted paths into the OpenClaw config (openclaw.json), set via a deep-merge that preserves
 *  everything else. */
const CONFIG = {
  /** Local embeddings: node-llama-cpp resolves the default GGUF and auto-downloads it. */
  memorySearchProvider: ["memory", "search", "provider"] as const,
  memorySearchProviderValue: "local",
  /** Tavily web-search plugin. */
  tavilyEnabled: ["plugins", "entries", "tavily", "enabled"] as const,
  tavilyApiKeyPath: ["plugins", "entries", "tavily", "config", "webSearch", "apiKey"] as const,
};

export interface InstanceDefaultsOptions {
  /** IANA timezone (e.g. "America/New_York"); best-effort sets the box clock. */
  timezone?: string | null;
  /** Overrides process.env.TAVILY_API_KEY when provided (e.g. a per-call value). */
  tavilyApiKey?: string | null;
  /** Restart the instance after writing config so it reloads (used by the backfill on a box
   *  that is already running; a freshly provisioned box reads the config as it finishes booting). */
  restart?: boolean;
}

export interface InstanceDefaultsResult {
  applied: boolean;
  memory: boolean;
  webSearch: boolean;
  timezone: boolean;
  note?: string;
}

function isValidTz(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The guarded shell preamble every on-box step shares: bail cleanly on a non-OpenClaw image,
 *  require node for the JSON work. */
const GUARD =
  'ROOT="${OPENCLAW_STATE_DIR:-/home/node/.openclaw}"; ' +
  '[ -d "$ROOT" ] || { echo NOT_OPENCLAW; exit 0; }; ' +
  'command -v node >/dev/null 2>&1 || { echo NO_NODE; exit 1; }; ';

/**
 * Merge our capability defaults into one instance's OpenClaw config.
 *
 * Best-effort: an OpenClaw-only step (a Hermes/other box is a logged no-op), never throws, retries
 * a few times while the box is still booting, and reports which pieces landed. The openclaw.json
 * writes only run when INSTANCE_DEFAULTS_CONFIG=on; otherwise only the OS clock is touched.
 */
export async function applyInstanceDefaults(
  agentId: string,
  opts: InstanceDefaultsOptions = {}
): Promise<InstanceDefaultsResult> {
  const tavilyKey = (opts.tavilyApiKey ?? process.env.TAVILY_API_KEY ?? "").trim();
  const tz = opts.timezone && isValidTz(opts.timezone) ? opts.timezone : "";

  // Best-effort clock, before node so its output is separable. Needs write access we may not
  // have (the runtime user is often not root); a failure is a logged skip, and USER.md already
  // carries the timezone for the agent regardless.
  const tzStep = tz
    ? `if ln -sf "/usr/share/zoneinfo/${tz}" /etc/localtime 2>/dev/null; then echo "${tz}" > /etc/timezone 2>/dev/null; echo "TZ_SET:${tz}"; else echo "TZ_SKIP"; fi; `
    : "";

  // When config writes are disabled we still do the clock, then stop — no openclaw.json touch,
  // so there is nothing that can take the harness down.
  if (!CONFIG_WRITES_ENABLED) {
    const cmd = GUARD + tzStep + 'echo "CONFIG_WRITES_DISABLED";';
    const res = await runWithRetries(agentId, cmd);
    if (res.note) return { applied: false, memory: false, webSearch: false, timezone: false, note: res.note };
    return {
      applied: /TZ_SET:/.test(res.stdout),
      memory: false,
      webSearch: false,
      timezone: /TZ_SET:/.test(res.stdout),
      note: "config-writes-disabled: memory/web-search held pending schema verification (set INSTANCE_DEFAULTS_CONFIG=on once keys are confirmed)",
    };
  }

  // The instruction blob the on-box script reads. Keys are the config paths above so the script
  // stays dumb and the contract lives in one place.
  const payload = JSON.stringify({
    memoryProviderPath: CONFIG.memorySearchProvider,
    memoryProviderValue: CONFIG.memorySearchProviderValue,
    tavilyEnabledPath: CONFIG.tavilyEnabled,
    tavilyApiKeyPath: CONFIG.tavilyApiKeyPath,
    tavilyApiKey: tavilyKey || null,
  });
  const b64 = Buffer.from(payload, "utf8").toString("base64");

  // Node does the merge: read the config if present (and BAIL on a parse error rather than
  // clobber a working config), deep-set our keys, write it back pretty-printed.
  const script =
    'const fs=require("fs");' +
    'const root=process.env.OPENCLAW_STATE_DIR||"/home/node/.openclaw";' +
    'const o=JSON.parse(fs.readFileSync("/tmp/apollo-defaults.json","utf8"));' +
    'const cands=["openclaw.json","config.json"].map(f=>root+"/"+f);' +
    'let file=cands.find(f=>fs.existsSync(f));' +
    'let cfg={};' +
    'if(file){try{cfg=JSON.parse(fs.readFileSync(file,"utf8"));}catch(e){console.log("CONFIG_PARSE_FAIL:"+file);process.exit(0);}}else{file=cands[0];}' +
    'const set=(obj,keys,val)=>{let c=obj;for(let i=0;i<keys.length-1;i++){if(typeof c[keys[i]]!=="object"||c[keys[i]]===null)c[keys[i]]={};c=c[keys[i]];}c[keys[keys.length-1]]=val;};' +
    'set(cfg,o.memoryProviderPath,o.memoryProviderValue);' +
    'let tav=false;' +
    'if(o.tavilyApiKey){set(cfg,o.tavilyEnabledPath,true);set(cfg,o.tavilyApiKeyPath,o.tavilyApiKey);tav=true;}' +
    'fs.writeFileSync(file,JSON.stringify(cfg,null,2));' +
    'console.log("DEFAULTS_WROTE:"+file+":memory=local"+(tav?",tavily=on":",tavily=skip"));';

  const cmd =
    GUARD +
    tzStep +
    `printf '%s' '${b64}' | base64 -d > /tmp/apollo-defaults.json; ` +
    `node -e '${script}'; ` +
    "rm -f /tmp/apollo-defaults.json";

  const res = await runWithRetries(agentId, cmd);
  if (res.note) return { applied: false, memory: false, webSearch: false, timezone: false, note: res.note };
  if (/CONFIG_PARSE_FAIL/.test(res.stdout)) {
    console.error("[instance-defaults:parse-fail]", agentId, "left existing config untouched");
    return { applied: false, memory: false, webSearch: false, timezone: false, note: "config-parse-fail" };
  }
  const wrote = /DEFAULTS_WROTE:(\S+)/.exec(res.stdout);
  if (wrote) {
    const webSearch = /tavily=on/.test(res.stdout);
    const timezone = /TZ_SET:/.test(res.stdout);
    console.log("[instance-defaults:applied]", agentId, wrote[1], { webSearch, timezone });
    if (opts.restart) await restartQuietly(agentId);
    return {
      applied: true,
      memory: true,
      webSearch,
      timezone,
      ...(webSearch ? {} : { note: "TAVILY_API_KEY not set - web search left off" }),
    };
  }
  console.error("[instance-defaults:failed]", agentId, "no confirmation after retries");
  return { applied: false, memory: false, webSearch: false, timezone: false, note: "no-confirmation" };
}

export interface RevertResult {
  reverted: boolean;
  removed: string[];
  note?: string;
}

/**
 * Undo exactly the openclaw.json keys applyInstanceDefaults sets — for a box whose harness the
 * defaults took down. Surgical: removes `memory.search.provider` only when it is still our marker
 * ("local"), removes the whole `plugins.entries.tavily` entry, and prunes any parent objects our
 * write created and left empty, so unrelated config (other plugins, other memory settings) is
 * preserved. Idempotent — removing an absent key is a no-op. Restarts when asked so the box
 * reloads a clean config.
 */
export async function revertInstanceDefaults(
  agentId: string,
  opts: { restart?: boolean } = {}
): Promise<RevertResult> {
  const script =
    'const fs=require("fs");' +
    'const root=process.env.OPENCLAW_STATE_DIR||"/home/node/.openclaw";' +
    'const cands=["openclaw.json","config.json"].map(f=>root+"/"+f);' +
    'const file=cands.find(f=>fs.existsSync(f));' +
    'if(!file){console.log("NO_CONFIG");process.exit(0);}' +
    'let cfg;try{cfg=JSON.parse(fs.readFileSync(file,"utf8"));}catch(e){console.log("CONFIG_PARSE_FAIL:"+file);process.exit(0);}' +
    'const removed=[];' +
    'if(cfg.memory&&cfg.memory.search&&cfg.memory.search.provider==="local"){delete cfg.memory.search.provider;removed.push("memory.search.provider");if(Object.keys(cfg.memory.search).length===0)delete cfg.memory.search;if(cfg.memory&&Object.keys(cfg.memory).length===0)delete cfg.memory;}' +
    'if(cfg.plugins&&cfg.plugins.entries&&cfg.plugins.entries.tavily){delete cfg.plugins.entries.tavily;removed.push("plugins.entries.tavily");if(Object.keys(cfg.plugins.entries).length===0)delete cfg.plugins.entries;if(cfg.plugins&&Object.keys(cfg.plugins).length===0)delete cfg.plugins;}' +
    'fs.writeFileSync(file,JSON.stringify(cfg,null,2));' +
    'console.log("REVERTED:"+file+":"+(removed.join(",")||"none"));';

  const cmd = GUARD + `node -e '${script}'`;
  const res = await runWithRetries(agentId, cmd);
  if (res.note) return { reverted: false, removed: [], note: res.note };
  if (/NO_CONFIG/.test(res.stdout)) return { reverted: false, removed: [], note: "no-config-file" };
  if (/CONFIG_PARSE_FAIL/.test(res.stdout)) return { reverted: false, removed: [], note: "config-parse-fail" };
  const m = /REVERTED:\S+:(\S*)/.exec(res.stdout);
  const removed = m && m[1] && m[1] !== "none" ? m[1].split(",") : [];
  console.log("[instance-defaults:reverted]", agentId, removed);
  if (opts.restart) await restartQuietly(agentId);
  return { reverted: true, removed };
}

export interface InspectResult {
  ok: boolean;
  file?: string;
  memoryProvider?: string | null;
  tavilyPresent?: boolean;
  tavilyEnabled?: boolean;
  note?: string;
}

/**
 * Report the shape of the keys we care about on one box, so the real OpenClaw schema can be
 * learned from a known-good instance before re-enabling the writes. Never prints the config
 * contents or the Tavily key — only whether our keys are present and their non-secret values.
 */
export async function inspectInstanceDefaults(agentId: string): Promise<InspectResult> {
  const script =
    'const fs=require("fs");' +
    'const root=process.env.OPENCLAW_STATE_DIR||"/home/node/.openclaw";' +
    'const cands=["openclaw.json","config.json"].map(f=>root+"/"+f);' +
    'const file=cands.find(f=>fs.existsSync(f));' +
    'if(!file){console.log("NO_CONFIG");process.exit(0);}' +
    'let cfg;try{cfg=JSON.parse(fs.readFileSync(file,"utf8"));}catch(e){console.log("CONFIG_PARSE_FAIL");process.exit(0);}' +
    'const mp=cfg.memory&&cfg.memory.search?cfg.memory.search.provider:undefined;' +
    'const tav=cfg.plugins&&cfg.plugins.entries?cfg.plugins.entries.tavily:undefined;' +
    'console.log("INSPECT:"+JSON.stringify({file:file,memoryProvider:mp===undefined?null:mp,tavilyPresent:!!tav,tavilyEnabled:tav?!!tav.enabled:false}));';

  const cmd = GUARD + `node -e '${script}'`;
  const res = await runWithRetries(agentId, cmd);
  if (res.note) return { ok: false, note: res.note };
  if (/NO_CONFIG/.test(res.stdout)) return { ok: false, note: "no-config-file" };
  if (/CONFIG_PARSE_FAIL/.test(res.stdout)) return { ok: false, note: "config-parse-fail" };
  const m = /INSPECT:(\{.*\})/.exec(res.stdout);
  if (!m) return { ok: false, note: "no-output" };
  try {
    const parsed = JSON.parse(m[1]) as {
      file: string;
      memoryProvider: string | null;
      tavilyPresent: boolean;
      tavilyEnabled: boolean;
    };
    return { ok: true, ...parsed };
  } catch {
    return { ok: false, note: "parse-output-failed" };
  }
}

/** Run one guarded command against a booting box, retrying while it wakes. Returns the stdout,
 *  or a terminal `note` for the non-OpenClaw / no-confirmation cases the callers all share. */
async function runWithRetries(
  agentId: string,
  cmd: string
): Promise<{ stdout: string; note?: string }> {
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const { stdout } = await agent37.exec(agentId, cmd);
      if (stdout.includes("NOT_OPENCLAW")) {
        console.log("[instance-defaults:skipped]", agentId, "not an OpenClaw image");
        return { stdout, note: "not-openclaw" };
      }
      return { stdout };
    } catch {
      // Still booting - wait and retry, same cadence as the file/skill injectors.
    }
    if (attempt < 6) await new Promise((r) => setTimeout(r, 15_000));
  }
  return { stdout: "", note: "no-confirmation" };
}

/** Reload the box so a config change takes effect. Best-effort — a restart failure is logged,
 *  not thrown, since the config is already written either way. */
async function restartQuietly(agentId: string): Promise<void> {
  try {
    await agent37.restart(agentId);
    console.log("[instance-defaults:restarted]", agentId);
  } catch (err) {
    console.error("[instance-defaults:restart-failed]", agentId, (err as Error).message);
  }
}
