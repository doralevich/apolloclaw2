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
//   BROWSER — off by default, and it is a different thing from search. The browser tool drives a
//   real isolated Chrome profile over CDP, which is why an instance without one says it needs a
//   browser session instead of quietly falling back to fetching the page. We write the config only
//   where the image actually ships a Chrome; where it does not, the fix is the image, not this
//   file, and the result says so rather than switching on a tool with nothing behind it.
//
// TIMEZONE is mostly handled already (captured at onboarding, written into USER.md, used by
// schedules). We additionally set the box's own clock, best-effort, so timestamps line up. The
// clock step touches the OS only, never openclaw.json, so it is always safe to run.
//
// ── SAFETY: config writes are GATED OFF by default ──────────────────────────────────────────
// The keys here were taken from a docs page rather than a live box. On the first real backfill a
// wrong key took a customer instance's agent runtime down: after the config was written and the
// box restarted, chat returned "The 'openclaw' harness is not available on this instance."
//
// THE MEMORY KEY WAS THE WRONG ONE, and is now fixed - see CONFIG below. That is the likeliest
// explanation for the outage, but it is an explanation, not a test: nothing here has been run
// against a live instance since. The flag therefore stays as it is. Flip it only after
// inspectInstanceDefaults on a real box confirms the shapes, and then on ONE box before the
// fleet. If a box was already bricked, revertInstanceDefaults removes exactly the keys we set
// (old path and new) and restarts it.
//
// The clock and the Chrome probe are unaffected and always run: neither writes config.

/** Master switch for the openclaw.json writes (memory + Tavily). Off until the keys below are
 *  verified against a live instance. The clock step is unaffected and always runs. */
const CONFIG_WRITES_ENABLED = process.env.INSTANCE_DEFAULTS_CONFIG === "on";

// ── The config we merge. Tweak here if a live instance reports different keys. ──────────────

/** Dotted paths into the OpenClaw config (openclaw.json), set via a deep-merge that preserves
 *  everything else. */
const CONFIG = {
  // MEMORY. The path below was `memory.search.provider`, taken from a docs page, and it is not
  // where OpenClaw reads this. The real one is under agents.defaults - two bug reports against
  // the runtime (openclaw#70836, openclaw#72875) both quote the same shape while arguing about
  // something else, which is the most reliable kind of evidence for a config key: nobody in
  // either thread is trying to convince anyone what the path is.
  //
  // That wrong path is the likeliest cause of the harness going down on the first backfill. A key
  // OpenClaw does not know is not necessarily ignored; `memory` is a real top-level section and we
  // were writing a `search` object into it that its schema had no room for.
  memoryEnabled: ["agents", "defaults", "memorySearch", "enabled"] as const,
  memoryProvider: ["agents", "defaults", "memorySearch", "provider"] as const,
  memoryProviderValue: "local",
  // A model path is REQUIRED - "local" with nothing to load is not a working config, and the
  // original write set no model at all. The hf: form lets the runtime resolve and cache the GGUF
  // itself (~0.3 GB, once per box). Overridable so a swap doesn't need a deploy.
  memoryModelPath: ["agents", "defaults", "memorySearch", "local", "modelPath"] as const,
  memoryModelValue:
    process.env.OPENCLAW_EMBED_MODEL?.trim() ||
    "hf:ggml-org/embeddinggemma-300m-qat-q8_0-GGUF/embeddinggemma-300m-qat-Q8_0.gguf",

  /** Tavily web-search plugin. STILL UNVERIFIED - see the note above the flag. */
  tavilyEnabled: ["plugins", "entries", "tavily", "enabled"] as const,
  tavilyApiKeyPath: ["plugins", "entries", "tavily", "config", "webSearch", "apiKey"] as const,

  // BROWSER. Written only when the box actually has a Chrome to drive (see CHROME_PROBE). The
  // browser tool is not a plugin and not search: it drives a real isolated Chrome profile over
  // CDP, which is why a fresh instance asks for a browser session rather than falling back to
  // fetching a page. headless and noSandbox are both required in a container.
  browserEnabled: ["browser", "enabled"] as const,
  browserHeadless: ["browser", "headless"] as const,
  browserNoSandbox: ["browser", "noSandbox"] as const,
  browserProfile: ["browser", "defaultProfile"] as const,
  browserProfileValue: "openclaw",

  // AND THE TOOL ITSELF, which is a different switch from the subsystem above.
  //
  // browser.enabled:false turns the browser OFF. It does not take the tool off the list the model
  // is shown, so the agent still sees a browser it can call, calls it, and tells its owner it needs
  // a browser session. Switching off the engine does not stop the offer.
  //
  // tools.deny does. OpenClaw's own docs are explicit that a denied tool is "not sent to model
  // providers" — it never reaches the model, so there is nothing to mention. Deny beats allow,
  // matching is case-insensitive.
  //
  // An ARRAY, so it is appended to and filtered rather than overwritten: anything else the customer
  // or a template denied stays denied. Removed again the moment a box has a Chrome, otherwise
  // installing one would leave a browser that works and a tool nobody can call.
  toolsDeny: ["tools", "deny"] as const,
  browserToolName: "browser",
};

/** What the first backfill wrote. Wrong, and removed from any box still carrying it. */
const LEGACY_MEMORY_PATH = ["memory", "search", "provider"] as const;

/** Chrome under any of the names the common images use. Empty output means no browser on the box,
 *  and then we write no browser config at all - a tool switched on with nothing behind it is how
 *  an agent ends up promising to open a page it cannot open. */
const CHROME_PROBE =
  'CHROME=""; for b in google-chrome google-chrome-stable chromium chromium-browser; do ' +
  'if command -v "$b" >/dev/null 2>&1; then CHROME="$(command -v "$b")"; break; fi; done; ';

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
  /** True only when the box had a Chrome binary and the browser block was written. */
  browser: boolean;
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
    // Still probe for Chrome, so a dry run reports whether the image would support the browser
    // tool. Reading which binaries exist changes nothing on the box.
    const cmd = GUARD + tzStep + CHROME_PROBE + 'echo "CHROME:$CHROME"; echo "CONFIG_WRITES_DISABLED";';
    const res = await runWithRetries(agentId, cmd);
    if (res.note) {
      return { applied: false, memory: false, webSearch: false, browser: false, timezone: false, note: res.note };
    }
    const chrome = /CHROME:(\S+)/.exec(res.stdout)?.[1] ?? "";
    return {
      applied: /TZ_SET:/.test(res.stdout),
      memory: false,
      webSearch: false,
      browser: false,
      timezone: /TZ_SET:/.test(res.stdout),
      note:
        "config-writes-disabled: memory/web-search/browser held pending schema verification " +
        `(set INSTANCE_DEFAULTS_CONFIG=on once keys are confirmed). Chrome on box: ${chrome || "none"}`,
    };
  }

  // The instruction blob the on-box script reads. Keys are the config paths above so the script
  // stays dumb and the contract lives in one place.
  const payload = JSON.stringify({
    memoryEnabledPath: CONFIG.memoryEnabled,
    memoryProviderPath: CONFIG.memoryProvider,
    memoryProviderValue: CONFIG.memoryProviderValue,
    memoryModelPath: CONFIG.memoryModelPath,
    memoryModelValue: CONFIG.memoryModelValue,
    legacyMemoryPath: LEGACY_MEMORY_PATH,
    tavilyEnabledPath: CONFIG.tavilyEnabled,
    tavilyApiKeyPath: CONFIG.tavilyApiKeyPath,
    tavilyApiKey: tavilyKey || null,
    browserEnabledPath: CONFIG.browserEnabled,
    browserHeadlessPath: CONFIG.browserHeadless,
    browserNoSandboxPath: CONFIG.browserNoSandbox,
    browserProfilePath: CONFIG.browserProfile,
    browserProfileValue: CONFIG.browserProfileValue,
    toolsDenyPath: CONFIG.toolsDeny,
    browserToolName: CONFIG.browserToolName,
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
    // Drop the wrong path from the first backfill before writing the right one, so a box that got
    // the bad write is repaired by the same pass that fixes everyone else.
    'const del=(obj,keys)=>{let c=obj;for(let i=0;i<keys.length-1;i++){if(!c[keys[i]]||typeof c[keys[i]]!=="object")return false;c=c[keys[i]];}if(!(keys[keys.length-1] in c))return false;delete c[keys[keys.length-1]];return true;};' +
    'const legacy=del(cfg,o.legacyMemoryPath);' +
    'if(legacy&&cfg.memory&&cfg.memory.search&&Object.keys(cfg.memory.search).length===0){delete cfg.memory.search;if(Object.keys(cfg.memory).length===0)delete cfg.memory;}' +
    'set(cfg,o.memoryEnabledPath,true);' +
    'set(cfg,o.memoryProviderPath,o.memoryProviderValue);' +
    'set(cfg,o.memoryModelPath,o.memoryModelValue);' +
    'let tav=false;' +
    'if(o.tavilyApiKey){set(cfg,o.tavilyEnabledPath,true);set(cfg,o.tavilyApiKeyPath,o.tavilyApiKey);tav=true;}' +
    // Browser only where there is a Chrome to drive.
    //
    // Where there is none we write enabled:FALSE rather than nothing, and that is the whole point
    // of this branch. An unconfigured browser tool is not absent - the agent can still see it, so
    // it reaches for it, fails to attach to a Chrome that was never started, and tells its owner
    // it needs a browser session. That is the message on the new instance. Turning the tool off
    // explicitly is what makes the agent stop offering something it cannot do and use search
    // instead.
    // Read tools.deny as it stands, so ours is added to the customer's list rather than over it.
    'const get=(obj,keys)=>{let c=obj;for(const k of keys){if(!c||typeof c!=="object")return undefined;c=c[k];}return c;};' +
    'const denyNow=get(cfg,o.toolsDenyPath);' +
    'const deny=Array.isArray(denyNow)?denyNow.slice():[];' +
    'const isBrowser=(x)=>typeof x==="string"&&x.toLowerCase()===o.browserToolName;' +
    'let br=false;' +
    'if(process.env.APOLLO_CHROME){' +
    'set(cfg,o.browserEnabledPath,true);set(cfg,o.browserHeadlessPath,true);set(cfg,o.browserNoSandboxPath,true);set(cfg,o.browserProfilePath,o.browserProfileValue);' +
    // A box that has gained a Chrome must lose the deny, or the tool stays invisible to the model
    // and the working browser is unreachable.
    'if(deny.some(isBrowser)){const kept=deny.filter(x=>!isBrowser(x));if(kept.length){set(cfg,o.toolsDenyPath,kept);}else{del(cfg,o.toolsDenyPath);if(cfg.tools&&Object.keys(cfg.tools).length===0)delete cfg.tools;}}' +
    'br=true;}' +
    'else{set(cfg,o.browserEnabledPath,false);' +
    'if(!deny.some(isBrowser)){deny.push(o.browserToolName);set(cfg,o.toolsDenyPath,deny);}}' +
    'fs.writeFileSync(file,JSON.stringify(cfg,null,2));' +
    'console.log("DEFAULTS_WROTE:"+file+":memory=local"+(legacy?",legacy=removed":"")+(tav?",tavily=on":",tavily=skip")+(br?",browser=on":",browser=skip"));';

  const cmd =
    GUARD +
    tzStep +
    CHROME_PROBE +
    'echo "CHROME:$CHROME"; ' +
    `printf '%s' '${b64}' | base64 -d > /tmp/apollo-defaults.json; ` +
    `APOLLO_CHROME="$CHROME" node -e '${script}'; ` +
    "rm -f /tmp/apollo-defaults.json";

  const res = await runWithRetries(agentId, cmd);
  if (res.note) {
    return { applied: false, memory: false, webSearch: false, browser: false, timezone: false, note: res.note };
  }
  if (/CONFIG_PARSE_FAIL/.test(res.stdout)) {
    console.error("[instance-defaults:parse-fail]", agentId, "left existing config untouched");
    return {
      applied: false, memory: false, webSearch: false, browser: false, timezone: false,
      note: "config-parse-fail",
    };
  }
  const wrote = /DEFAULTS_WROTE:(\S+)/.exec(res.stdout);
  if (wrote) {
    const webSearch = /tavily=on/.test(res.stdout);
    const browser = /browser=on/.test(res.stdout);
    const timezone = /TZ_SET:/.test(res.stdout);
    console.log("[instance-defaults:applied]", agentId, wrote[1], { webSearch, browser, timezone });
    if (opts.restart) await restartQuietly(agentId);
    const skipped = [
      ...(webSearch ? [] : ["TAVILY_API_KEY not set - web search left off"]),
      ...(browser ? [] : ["no Chrome on the box - browser tool left off"]),
    ];
    return {
      applied: true,
      memory: true,
      webSearch,
      browser,
      timezone,
      ...(skipped.length ? { note: skipped.join("; ") } : {}),
    };
  }
  console.error("[instance-defaults:failed]", agentId, "no confirmation after retries");
  return {
    applied: false, memory: false, webSearch: false, browser: false, timezone: false,
    note: "no-confirmation",
  };
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
    // The wrong path from the first backfill. Still removed, because the boxes that took it are
    // exactly the ones most likely to need this.
    'if(cfg.memory&&cfg.memory.search&&cfg.memory.search.provider==="local"){delete cfg.memory.search.provider;removed.push("memory.search.provider");if(Object.keys(cfg.memory.search).length===0)delete cfg.memory.search;if(cfg.memory&&Object.keys(cfg.memory).length===0)delete cfg.memory;}' +
    // The right path. Only ours if it still says "local" - a customer or a template that set a
    // different provider owns that value, and an undo is not a licence to take it.
    'if(cfg.agents&&cfg.agents.defaults&&cfg.agents.defaults.memorySearch&&cfg.agents.defaults.memorySearch.provider==="local"){delete cfg.agents.defaults.memorySearch;removed.push("agents.defaults.memorySearch");if(Object.keys(cfg.agents.defaults).length===0)delete cfg.agents.defaults;if(cfg.agents&&Object.keys(cfg.agents).length===0)delete cfg.agents;}' +
    'if(cfg.plugins&&cfg.plugins.entries&&cfg.plugins.entries.tavily){delete cfg.plugins.entries.tavily;removed.push("plugins.entries.tavily");if(Object.keys(cfg.plugins.entries).length===0)delete cfg.plugins.entries;if(cfg.plugins&&Object.keys(cfg.plugins).length===0)delete cfg.plugins;}' +
    // The browser, in both shapes we write it: the full block pointing at our "openclaw" profile,
    // and the bare enabled:false we leave on a box with no Chrome.
    'if(cfg.browser&&cfg.browser.defaultProfile==="openclaw"){delete cfg.browser;removed.push("browser");}' +
    'else if(cfg.browser&&cfg.browser.enabled===false&&Object.keys(cfg.browser).length===1){delete cfg.browser;removed.push("browser.enabled");}' +
    // And our tools.deny entry. Only "browser" and only that one string, so any other tool the
    // customer denied survives an undo. If they had independently denied the browser themselves,
    // this hands it back - the mildest thing that can go wrong here, since a browser with no Chrome
    // behind it cannot do anything either way.
    'if(cfg.tools&&Array.isArray(cfg.tools.deny)){const kept=cfg.tools.deny.filter(x=>!(typeof x==="string"&&x.toLowerCase()==="browser"));' +
    'if(kept.length!==cfg.tools.deny.length){removed.push("tools.deny[browser]");' +
    'if(kept.length){cfg.tools.deny=kept;}else{delete cfg.tools.deny;if(Object.keys(cfg.tools).length===0)delete cfg.tools;}}}' +
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
  /** What sits at the CORRECT path, agents.defaults.memorySearch.provider. */
  memoryProvider?: string | null;
  /** What sits at the path the first backfill wrote. Non-null means this box still carries it. */
  legacyMemoryProvider?: string | null;
  tavilyPresent?: boolean;
  tavilyEnabled?: boolean;
  browserEnabled?: boolean;
  /** True when "browser" is in tools.deny — the switch that stops the model being offered it. */
  browserDenied?: boolean;
  /** The whole deny list, so an unexpected entry is visible rather than inferred. */
  toolsDeny?: string[];
  /** Path to a Chrome binary on the box, or null. Decides whether the browser tool can work. */
  chrome?: string | null;
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
    'const ms=cfg.agents&&cfg.agents.defaults?cfg.agents.defaults.memorySearch:undefined;' +
    'const mp=ms?ms.provider:undefined;' +
    'const lm=cfg.memory&&cfg.memory.search?cfg.memory.search.provider:undefined;' +
    'const tav=cfg.plugins&&cfg.plugins.entries?cfg.plugins.entries.tavily:undefined;' +
    'const dn=cfg.tools&&Array.isArray(cfg.tools.deny)?cfg.tools.deny:[];' +
    'console.log("INSPECT:"+JSON.stringify({file:file,memoryProvider:mp===undefined?null:mp,legacyMemoryProvider:lm===undefined?null:lm,tavilyPresent:!!tav,tavilyEnabled:tav?!!tav.enabled:false,browserEnabled:cfg.browser?!!cfg.browser.enabled:false,browserDenied:dn.some(x=>typeof x==="string"&&x.toLowerCase()==="browser"),toolsDeny:dn}));';

  // The Chrome probe rides along: whether the browser tool CAN work is a fact about the image,
  // and it is the first thing anyone asks after reading browserEnabled:false.
  const cmd = GUARD + CHROME_PROBE + 'echo "CHROME:$CHROME"; ' + `node -e '${script}'`;
  const res = await runWithRetries(agentId, cmd);
  if (res.note) return { ok: false, note: res.note };
  if (/NO_CONFIG/.test(res.stdout)) return { ok: false, note: "no-config-file" };
  if (/CONFIG_PARSE_FAIL/.test(res.stdout)) return { ok: false, note: "config-parse-fail" };
  const m = /INSPECT:(\{.*\})/.exec(res.stdout);
  if (!m) return { ok: false, note: "no-output" };
  const chrome = /CHROME:(\S+)/.exec(res.stdout)?.[1] || null;
  try {
    const parsed = JSON.parse(m[1]) as {
      file: string;
      memoryProvider: string | null;
      legacyMemoryProvider: string | null;
      tavilyPresent: boolean;
      tavilyEnabled: boolean;
      browserEnabled: boolean;
      browserDenied: boolean;
      toolsDeny: string[];
    };
    return { ok: true, ...parsed, chrome };
  } catch {
    return { ok: false, note: "parse-output-failed" };
  }
}

export interface ConfigDumpResult {
  ok: boolean;
  file?: string;
  config?: unknown;
  note?: string;
}

/**
 * Read one instance's whole OpenClaw config back, with every secret-looking value redacted, so we
 * can see how a working provider (e.g. Anthropic) is registered and mirror that exact shape for a
 * new one — instead of guessing the schema, which is what took an instance's harness down. Values
 * under key names that look like credentials are replaced with a length-only marker, and any very
 * long string is truncated, so nothing sensitive leaves the box. Read-only; never writes.
 */
export async function dumpInstanceConfig(agentId: string): Promise<ConfigDumpResult> {
  const script =
    'const fs=require("fs");' +
    'const root=process.env.OPENCLAW_STATE_DIR||"/home/node/.openclaw";' +
    'const cands=["openclaw.json","config.json"].map(f=>root+"/"+f);' +
    'const file=cands.find(f=>fs.existsSync(f));' +
    'if(!file){console.log("NO_CONFIG");process.exit(0);}' +
    'let cfg;try{cfg=JSON.parse(fs.readFileSync(file,"utf8"));}catch(e){console.log("CONFIG_PARSE_FAIL");process.exit(0);}' +
    'const SECRET=/key|token|secret|password|apikey|authorization|bearer/i;' +
    'const redact=(o)=>{' +
    'if(Array.isArray(o))return o.map(redact);' +
    'if(o&&typeof o==="object"){const r={};for(const k of Object.keys(o)){const v=o[k];r[k]=(SECRET.test(k)&&typeof v==="string")?(v?"***REDACTED(len="+v.length+")***":""):redact(v);}return r;}' +
    'if(typeof o==="string"&&o.length>200)return o.slice(0,200)+"…(+"+(o.length-200)+" more)";' +
    'return o;};' +
    'console.log("CONFIG_DUMP:"+JSON.stringify({file:file,config:redact(cfg)}));';

  const cmd = GUARD + `node -e '${script}'`;
  const res = await runWithRetries(agentId, cmd);
  if (res.note) return { ok: false, note: res.note };
  if (/NO_CONFIG/.test(res.stdout)) return { ok: false, note: "no-config-file" };
  if (/CONFIG_PARSE_FAIL/.test(res.stdout)) return { ok: false, note: "config-parse-fail" };
  const m = /CONFIG_DUMP:(\{[\s\S]*\})\s*$/.exec(res.stdout);
  if (!m) return { ok: false, note: "no-output" };
  try {
    const parsed = JSON.parse(m[1]) as { file: string; config: unknown };
    return { ok: true, file: parsed.file, config: parsed.config };
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
