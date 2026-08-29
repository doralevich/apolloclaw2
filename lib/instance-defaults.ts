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
// schedules). We additionally set the box's own clock, best-effort, so timestamps line up.
//
// SHAPE OF THE CONFIG is taken from the OpenClaw docs, not a live box (we can't reach one from
// CI). The exact keys live in the constants below so a first-run tweak is a one-line change, and
// the whole thing is best-effort and non-fatal: it never fails a provision, it logs what it did,
// and it is idempotent so a re-run (or the backfill) just re-applies.

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

/**
 * Merge our capability defaults into one instance's OpenClaw config.
 *
 * Best-effort: an OpenClaw-only step (a Hermes/other box is a logged no-op), never throws, retries
 * a few times while the box is still booting, and reports which pieces landed.
 */
export async function applyInstanceDefaults(
  agentId: string,
  opts: InstanceDefaultsOptions = {}
): Promise<InstanceDefaultsResult> {
  const tavilyKey = (opts.tavilyApiKey ?? process.env.TAVILY_API_KEY ?? "").trim();
  const tz = opts.timezone && isValidTz(opts.timezone) ? opts.timezone : "";

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

  // Best-effort clock, before node so its output is separable. Needs write access we may not
  // have (the runtime user is often not root); a failure is a logged skip, and USER.md already
  // carries the timezone for the agent regardless.
  const tzStep = tz
    ? `if ln -sf "/usr/share/zoneinfo/${tz}" /etc/localtime 2>/dev/null; then echo "${tz}" > /etc/timezone 2>/dev/null; echo "TZ_SET:${tz}"; else echo "TZ_SKIP"; fi; `
    : "";

  const cmd =
    'ROOT="${OPENCLAW_STATE_DIR:-/home/node/.openclaw}"; ' +
    '[ -d "$ROOT" ] || { echo NOT_OPENCLAW; exit 0; }; ' +
    'command -v node >/dev/null 2>&1 || { echo NO_NODE; exit 1; }; ' +
    tzStep +
    `printf '%s' '${b64}' | base64 -d > /tmp/apollo-defaults.json; ` +
    `node -e '${script}'; ` +
    "rm -f /tmp/apollo-defaults.json";

  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const { stdout } = await agent37.exec(agentId, cmd);
      if (stdout.includes("NOT_OPENCLAW")) {
        console.log("[instance-defaults:skipped]", agentId, "not an OpenClaw image");
        return { applied: false, memory: false, webSearch: false, timezone: false, note: "not-openclaw" };
      }
      if (stdout.includes("CONFIG_PARSE_FAIL")) {
        console.error("[instance-defaults:parse-fail]", agentId, "left existing config untouched");
        return { applied: false, memory: false, webSearch: false, timezone: false, note: "config-parse-fail" };
      }
      const wrote = /DEFAULTS_WROTE:(\S+)/.exec(stdout);
      if (wrote) {
        const webSearch = /tavily=on/.test(stdout);
        const timezone = /TZ_SET:/.test(stdout);
        console.log("[instance-defaults:applied]", agentId, wrote[1], { webSearch, timezone });

        if (opts.restart) {
          // Reload so the new config takes effect on an already-running box. Fresh provisions
          // read it as they finish booting, so provisioning does not pass restart.
          try {
            await agent37.restart(agentId);
            console.log("[instance-defaults:restarted]", agentId);
          } catch (err) {
            console.error("[instance-defaults:restart-failed]", agentId, (err as Error).message);
          }
        }

        return {
          applied: true,
          memory: true,
          webSearch,
          timezone,
          ...(webSearch ? {} : { note: "TAVILY_API_KEY not set - web search left off" }),
        };
      }
    } catch {
      // Still booting - wait and retry, same cadence as the file/skill injectors.
    }
    if (attempt < 6) await new Promise((r) => setTimeout(r, 15_000));
  }

  console.error("[instance-defaults:failed]", agentId, "no confirmation after retries");
  return { applied: false, memory: false, webSearch: false, timezone: false, note: "no-confirmation" };
}
