import "server-only";
import { agent37 } from "@/lib/agent37";

// Two agents on one OpenClaw instance, talking to each other. The server-side twin of
// scripts/multi-agent-test.mjs, so the test can be run from the admin Fleet page with one click
// instead of from a laptop with the Agent37 key in a terminal.
//
// What setup writes into openclaw.json (deep-merged, everything else untouched):
//   agents.entries.main.default -> true, the legacy marker that keeps main the fallback owner
//                            for sessions that name no agent (the app's chat, via Agent37)
//   agents.defaults.{heartbeat,systemAgent}.agentId -> main, the owners it had implicitly
//   agents.entries.main   -> the existing agent, on the existing workspace
//   agents.entries.atlas  -> the second agent, own workspace, a CFO persona with one planted
//                            fact ("cash on hand is $412,000") that only it knows
//   channels.telegram.accounts.atlas -> its own bot, DMs allow-listed to the tester
//   bindings              -> the atlas bot routed to the atlas agent, every other Telegram
//                            account to main (other bindings kept)
//   tools.agentToAgent    -> enabled, allow: main plus every other agent in the config
//   the shared company brain -> shared/COMPANY.md (seeded once from the main agent's USER.md),
//                            copied into each second agent's workspace USER.md so every agent
//                            reads it as loaded context. Not wired into memory.search: changing
//                            the indexed sources pauses OpenClaw's vector index, and loaded
//                            context needs no search anyway.
//
// The test is then: DM Atlas "what is our cash on hand" and expect $412,000, then ask the first
// agent "ask Atlas what our cash on hand is" and see whether the same number comes back, which it
// can only get by messaging the other agent.
//
// Setup is additive: each run adds (or rewrites) one agent and leaves every other one in place,
// and the agent-to-agent allow list and the main agent's note are rebuilt from the whole roster.
// removeSubAgent takes one agent off and keeps the rest; removing the last one reverts.
//
// Setup backs the config up once (openclaw.json.pre-multiagent) before the first write, and
// revert restores that backup, removes the atlas workspace and the note setup appended to the
// main agent's AGENTS.md, then restarts. Both are idempotent. Revert keeps the shared/ folder:
// the config no longer indexes it once the backup is restored, but a customer's company facts
// are their data, not ours to delete.

export const SECOND_AGENT = {
  id: "atlas",
  name: "Atlas",
  role: "CFO",
  persona: "You are the finance specialist on a small team of agents. Answer finance questions directly and briefly.",
  fact: "Cash on hand is $412,000 as of this morning.",
};

export interface AgentSpec {
  id: string;
  name: string;
  role: string;
  /** A few sentences on how the agent should act. Loaded into its SOUL.md. */
  persona: string;
  /** Public URL of the agent's avatar image, when one was uploaded. Recorded on the box so the
   *  roster and the chat tabs can show the agent's own face. */
  avatarUrl?: string;
  /** A planted fact, test-only. Real agents created from intake have none. */
  fact?: string;
}

/** An OpenClaw agent id from a display name: lowercase, letters/digits/hyphens, never "main". */
export function agentIdFromName(name: string): string {
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)
    .replace(/-+$/g, "");
  return id && id !== "main" ? id : "";
}

export interface SecondAgentVerify {
  /** The config file the box uses. */
  file?: string;
  /** Agent ids under agents.entries, or whatever sits at `agents` when the build spells it
   *  differently (older builds used agents.list). */
  agents?: unknown;
  /** agents.ownership as the file carries it right now, or null when absent. */
  ownership?: unknown;
  /** Agent ids carrying the legacy default:true marker. */
  defaultMarker?: string[];
  /** The per-surface owners under agents.defaults. */
  owners?: unknown;
  telegramAccounts?: string[] | null;
  bindings?: unknown;
  agentToAgent?: unknown;
  /** Memory search: on/off, the embedding provider (null is the default, semantic when a key is
   *  present and keyword otherwise), and the indexed extra paths including the shared folder. */
  memorySearch?: { enabled: boolean; provider: string | null; extraPaths: unknown } | null;
  /** Whether the shared company file (shared/COMPANY.md) exists on the box. */
  sharedBrain?: boolean;
  /** Whether the second agent loaded the company brain as context (workspace-atlas/USER.md). */
  secondBrain?: boolean;
  /** The gateway's own view: `openclaw agents list --bindings`, or a note when the CLI did not
   *  run. This is the line that settles whether the build accepted our keys. */
  cli?: string;
}

export interface SecondAgentSetupResult {
  ok: boolean;
  /** True when this run took the backup (the first setup on this box). */
  backedUp: boolean;
  restarted: boolean;
  verify?: SecondAgentVerify;
  note?: string;
}

export interface SecondAgentRevertResult {
  ok: boolean;
  /** False when there was no backup to restore, so nothing was changed. */
  restored: boolean;
  restarted: boolean;
  note?: string;
}

/** Shared shell preamble: find the config file the way lib/instance-defaults.ts does, bail
 *  cleanly on a non-OpenClaw image, require node for the JSON work. */
const GUARD =
  'ROOT="${OPENCLAW_STATE_DIR:-/home/node/.openclaw}"; ' +
  '[ -d "$ROOT" ] || { echo NOT_OPENCLAW; exit 0; }; ' +
  'command -v node >/dev/null 2>&1 || { echo NO_NODE; exit 1; }; ' +
  'CFG=""; for f in "$ROOT/openclaw.json" "$ROOT/config.json"; do [ -f "$f" ] && { CFG="$f"; break; }; done; ' +
  '[ -n "$CFG" ] || CFG="$ROOT/openclaw.json"; ';

/** The fenced note setup appends to the main agent's AGENTS.md, as a regex source the on-box
 *  node script uses to strip an earlier copy. Kept here so setup and revert agree. */
// Exactly the two newlines setup adds in front of the note, so the file's own trailing newline survives a revert.
const NOTE_RE = "/\\n{0,2}<!-- apollo:multi-agent-test:start -->[\\s\\S]*?<!-- apollo:multi-agent-test:end -->\\n?/";

// The team, as the config has it, written where it matters: agent-to-agent allowed between every
// agent on the box, and the main agent's AGENTS.md listing each of the others with its role and
// how to reach it. Run by setup and by single-agent removal, so the list is always rebuilt from
// the live config rather than patched, and adding a third agent never drops the second.
// Expects fs, cfg, root and set in scope. Single quotes avoided: it rides inside node -e '...'.
const TEAM_JS =
  'const teamIds=Object.keys((cfg.agents&&cfg.agents.entries)||{}).filter(k=>k!=="main");' +
  'set(cfg,["tools","agentToAgent","enabled"],true);' +
  'set(cfg,["tools","agentToAgent","allow"],["main"].concat(teamIds));' +
  'const teamLines=teamIds.map(k=>{let role="";try{role=JSON.parse(fs.readFileSync(root+"/workspace-"+k+"/.apollo-agent.json","utf8")).role||"";}catch(e){}' +
  'const nm=(cfg.agents.entries[k]&&cfg.agents.entries[k].name)||k;' +
  'return "- "+nm+" (agent id `"+k+"`)"+(role?" is the "+(/agent$/i.test(role)?role:role+" agent"):"")+". For anything in its area, ask "+nm+" with the sessions_send tool (agent id `"+k+"`), wait for the reply, and relay the answer.";});' +
  'const teamNote=teamLines.length?"\\n\\n<!-- apollo:multi-agent-test:start -->\\n## Other agents on this gateway\\n\\n"+teamLines.join("\\n")+"\\n<!-- apollo:multi-agent-test:end -->\\n":"";' +
  'fs.mkdirSync(root+"/workspace",{recursive:true});' +
  'const teamAf=root+"/workspace/AGENTS.md";' +
  'let teamCur=fs.existsSync(teamAf)?fs.readFileSync(teamAf,"utf8"):"";' +
  `teamCur=teamCur.replace(${NOTE_RE},"");` +
  "fs.writeFileSync(teamAf,teamCur+teamNote);";

// Reads the config and prints the keys the test depends on, then asks the gateway itself.
// Printed between markers so the route can hand the readout back as JSON.
const VERIFY_SH =
  'echo "CONFIG:$CFG"; ' +
  'CFG="$CFG" node -e \'const fs=require("fs");const f=process.env.CFG;' +
  'if(!fs.existsSync(f)){console.log("VERIFY:"+JSON.stringify({file:f,missing:true}));process.exit(0);}' +
  'const c=JSON.parse(fs.readFileSync(f,"utf8"));' +
  'const root=require("path").dirname(f);' +
  "const out={file:f," +
  "agents:c.agents&&c.agents.entries?Object.keys(c.agents.entries):(c.agents===undefined?null:c.agents)," +
  // The ownership keys, so a readout shows which of them the box actually carries right now.
  "ownership:c.agents&&c.agents.ownership!==undefined?c.agents.ownership:null," +
  "defaultMarker:c.agents&&c.agents.entries?Object.keys(c.agents.entries).filter(k=>c.agents.entries[k]&&c.agents.entries[k].default===true):[]," +
  "owners:c.agents&&c.agents.defaults?{systemAgent:c.agents.defaults.systemAgent||null,heartbeat:c.agents.defaults.heartbeat||null,sessionStore:c.agents.defaults.sessionStore||null}:null," +
  "telegramAccounts:c.channels&&c.channels.telegram&&c.channels.telegram.accounts?Object.keys(c.channels.telegram.accounts):null," +
  "bindings:c.bindings===undefined?null:c.bindings," +
  "agentToAgent:c.tools&&c.tools.agentToAgent?c.tools.agentToAgent:null," +
  // The direct-line keys: the chat endpoint switch and where the gateway listens.
  "httpChat:c.gateway&&c.gateway.http&&c.gateway.http.endpoints&&c.gateway.http.endpoints.chatCompletions?c.gateway.http.endpoints.chatCompletions.enabled===true:false," +
  "bind:c.gateway&&c.gateway.bind!==undefined?c.gateway.bind:null," +
  // The shared company brain and memory search: whether search is on, which embedding provider
  // (null means the default, which gives semantic when a key is present and keyword search
  // otherwise), the shared folder among the indexed paths, and whether the company file is there.
  "memorySearch:c.memory&&c.memory.search?{enabled:c.memory.search.enabled!==false,provider:c.memory.search.provider||null,extraPaths:c.memory.search.extraPaths||null}:{enabled:true,provider:null,extraPaths:null}," +
  'sharedBrain:fs.existsSync(root+"/shared/COMPANY.md"),' +
  // Whether the second agent loaded the company brain as context (workspace-<id>/USER.md).
  'secondBrain:(function(){var e=c.agents&&c.agents.entries?Object.keys(c.agents.entries).filter(function(k){return k!=="main";}):[];return e.length>0&&e.every(function(id){return fs.existsSync(root+"/workspace-"+id+"/USER.md");});})()};' +
  'console.log("VERIFY:"+JSON.stringify(out));\'; ' +
  'echo "CLI_START"; echo "openclaw version: $(openclaw --version 2>&1 | head -n 1)"; openclaw agents list --bindings 2>&1 || echo "(openclaw CLI did not run; the gateway may spell these keys differently on this build)"; ' +
  // The Agent37 image runs the gateway on a port of its own (28789 on David's box) behind its
  // wrapper, so the CLI's default port reaches the wrong service. Read the port off the running
  // gateway process and hand it to every CLI call that talks to the gateway.
  'GWPORT=$(node -e \'const fs=require("fs");for(const d of fs.readdirSync("/proc")){if(!/^\\d+$/.test(d))continue;try{const cmd=fs.readFileSync("/proc/"+d+"/cmdline","utf8").replace(/\\0/g," ").trim();if(!/(^|\\/|\\s)openclaw-gateway(\\s|$)/.test(cmd))continue;const env=fs.readFileSync("/proc/"+d+"/environ","utf8").split("\\0");const p=env.find(e=>e.startsWith("OPENCLAW_GATEWAY_PORT="));if(p){console.log(p.split("=")[1]);process.exit(0);}}catch(e){}}\' 2>/dev/null); ' +
  'echo; echo "gateway port from the running process: ${GWPORT:-unknown}"; ' +
  'if [ -n "$GWPORT" ]; then export OPENCLAW_GATEWAY_PORT="$GWPORT"; PORTFLAG="--port $GWPORT"; else PORTFLAG=""; fi; ' +
  // "configured" in the list above only means the token is in the file. The probe asks the
  // gateway and Telegram, which is the difference between a bot that is set up and one that
  // answers. channels status is tried with the port flag first, then without.
  'echo; echo "openclaw channels status --probe:"; (timeout 60 openclaw channels status --probe $PORTFLAG 2>&1 || timeout 60 openclaw channels status --probe 2>&1) | head -60; ' +
  // And the gateway's own recent words about Telegram, for the errors the probe summarises away.
  'echo; echo "recent gateway log lines mentioning telegram:"; (timeout 30 openclaw logs $PORTFLAG --limit 400 --plain --no-color 2>&1 | grep -i telegram | tail -n 25) || echo "(logs did not run)"; ' +
  // Then ask Telegram directly about each bot in the config. getWebhookInfo is the decisive one:
  // a webhook URL on the Atlas bot means something else (the app's Connections card) claimed its
  // updates and OpenClaw's polling is refused; an empty URL with a growing pending count means
  // nobody is polling at all; an empty URL with zero pending means the gateway is reading it.
  'echo; echo "telegram api, per bot in the config:"; CFG="$CFG" timeout 40 node -e \'' +
  'const fs=require("fs");const c=JSON.parse(fs.readFileSync(process.env.CFG,"utf8"));' +
  'const tg=c.channels&&c.channels.telegram||{};const bots=[];' +
  'if(typeof tg.botToken==="string"&&tg.botToken)bots.push(["default",tg.botToken]);' +
  'for(const [id,a] of Object.entries(tg.accounts||{}))if(a&&typeof a.botToken==="string"&&a.botToken)bots.push([id,a.botToken]);' +
  'const get=async(tok,m)=>{try{const r=await fetch("https://api.telegram.org/bot"+tok+"/"+m,{signal:AbortSignal.timeout(8000)});return await r.json();}catch(e){return {ok:false,description:String(e&&e.message||e)};}};' +
  '(async()=>{if(!bots.length)console.log("  (no bot tokens in the config)");' +
  'for(const [id,tok] of bots){const me=await get(tok,"getMe");const wh=await get(tok,"getWebhookInfo");' +
  'const who=me.ok?"@"+(me.result.username||"?"):"getMe failed: "+(me.description||"?");' +
  'const w=wh.ok?wh.result:null;' +
  'console.log("  "+id+": "+who+(w?" | webhook url: "+(w.url||"(none, polling allowed)")+" | pending updates: "+w.pending_update_count+(w.last_error_message?" | last error: "+w.last_error_date+" "+w.last_error_message:""):" | getWebhookInfo failed: "+(wh.description||"?")));}' +
  '})();\' 2>&1 | sed "s/[0-9]\\{8,\\}:[A-Za-z0-9_-]\\{30,\\}/***token***/g"; ' +
  // The CLI could not reach the gateway on David's box (a different service answered on the
  // default port), which raises the question of whether the gateway even reads the file we
  // write. Read-only facts that settle it: which processes run, with the OpenClaw-related
  // environment they were started with (secrets masked), which ports are listened on, and
  // every openclaw.json on the box.
  'echo; echo "processes, environment and ports:"; node -e \'' +
  'const fs=require("fs");const out=[];' +
  'for(const d of fs.readdirSync("/proc")){if(!/^\\d+$/.test(d))continue;try{' +
  'const cmd=fs.readFileSync("/proc/"+d+"/cmdline","utf8").replace(/\\0/g," ").trim();' +
  // Skip the shell running this very command: its text holds the guard markers below.
  'if(!cmd||!/openclaw|gateway|node|agent/i.test(cmd)||cmd.includes("OPENCLAW_STATE_DIR:-"))continue;' +
  'let env="";try{env=fs.readFileSync("/proc/"+d+"/environ","utf8").split("\\0").filter(e=>/^(OPENCLAW|CLAWDBOT|GATEWAY|TELEGRAM|PORT|HOME|NODE_ENV|AGENT37)/i.test(e)).map(e=>e.replace(/^([^=]*(TOKEN|KEY|SECRET|PASSWORD)[^=]*)=.*/i,"$1=***")).join("  ");}catch(e){}' +
  'out.push("  pid "+d+": "+cmd.slice(0,220)+(env?"\\n      env: "+env:""));}catch(e){}}' +
  'console.log(out.join("\\n")||"  (no matching processes visible)");' +
  'const ports=new Set();for(const f of ["/proc/net/tcp","/proc/net/tcp6"]){try{for(const line of fs.readFileSync(f,"utf8").split("\\n").slice(1)){const p=line.trim().split(/\\s+/);if(p[3]==="0A")ports.add(parseInt(p[1].split(":").pop(),16));}}catch(e){}}' +
  'console.log("  listening ports: "+[...ports].sort((a,b)=>a-b).join(", "));' +
  "'; " +
  // Agent37's wrapper sits between the app and the gateway and builds the session key the
  // gateway rejects on a two-agent box ("openresponses-user:<id>"). The gateway's chat.send
  // accepts an agentId, so what matters is whether the wrapper can be told to pass one. These
  // are the lines of its bundle that mention the session key, the agent id, or chat.send.
  'echo; echo "agent37 wrapper, lines about session keys and agent selection:"; ' +
  'for f in $(timeout 20 grep -rl -E "openresponses-user|chat\\.send" /usr/local/lib/agent37-gateway/dist 2>/dev/null | grep -v node_modules | head -n 8); do ' +
  'grep -o -E ".{0,160}(openresponses-user|chat\\.send|agentId|agent_id|x-openclaw-agent|openclaw/[a-z]).{0,160}" "$f" 2>/dev/null | grep -v -i "token\\|secret\\|password" | head -n 40 | sed "s#^#  ${f#/usr/local/lib/agent37-gateway/}: #"; done; ' +
  'echo; echo "openclaw.json files on the box:"; timeout 20 find /home /root /opt /app /srv /etc /var /data -maxdepth 6 -name openclaw.json -not -path "*/node_modules/*" 2>/dev/null | head -n 10 | sed "s/^/  /"; ' +
  'echo; echo "state dir listing:"; ls -la "$ROOT" 2>&1 | head -n 40 | sed "s/^/  /"; ' +
  'echo "CLI_END"';

function parseVerify(stdout: string): SecondAgentVerify {
  const out: SecondAgentVerify = {};
  const m = /VERIFY:(\{.*\})/.exec(stdout);
  if (m) {
    try {
      const parsed = JSON.parse(m[1]) as SecondAgentVerify & { missing?: boolean };
      out.file = parsed.file;
      if (!parsed.missing) {
        out.agents = parsed.agents;
        out.ownership = parsed.ownership;
        out.defaultMarker = parsed.defaultMarker;
        out.owners = parsed.owners;
        out.telegramAccounts = parsed.telegramAccounts;
        out.bindings = parsed.bindings;
        out.agentToAgent = parsed.agentToAgent;
        out.memorySearch = parsed.memorySearch;
        out.sharedBrain = parsed.sharedBrain;
        out.secondBrain = parsed.secondBrain;
      }
    } catch {
      // Leave the fields empty; the CLI readout below still carries the useful part.
    }
  }
  const cli = /CLI_START\n?([\s\S]*?)\n?CLI_END/.exec(stdout);
  if (cli) out.cli = cli[1].trim();
  return out;
}

/** Add the second agent, its bot and the agent-to-agent allow list, then restart so the
 *  gateway loads it. `botToken` is the second bot's token from @BotFather; `telegramUser` is the
 *  tester's numeric Telegram id, the only account allowed to DM the bot. */
export async function setupSecondAgent(
  agentId: string,
  input: {
    /** The second agent's Telegram bot. Leave empty for a box that is driven over the gateway's
     *  own chat endpoint instead (the lab), and no Telegram config is touched. */
    botToken?: string;
    telegramUser?: string;
    mainBotToken?: string;
    /** The agent to create, from intake (name, role, persona). When omitted, the Atlas test
     *  agent is used, which is what the two-agent lab and the original proof run. */
    agent?: AgentSpec;
  }
): Promise<SecondAgentSetupResult> {
  const second = input.agent ?? SECOND_AGENT;
  const payload = {
    second,
    botB: input.botToken?.trim() || "",
    // Optional: a native Telegram bot for the FIRST agent too. The app's own chat cannot name
    // an agent (Agent37 sends an unprefixed session key, see the ownership note below), so on
    // a gateway release that refuses to guess, Telegram is the one door into the first agent
    // that still works, and the agent-to-agent test can run through it.
    botA: input.mainBotToken?.trim() || "",
    telegramUser: input.telegramUser?.trim() || "",
  };
  const b64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");

  // Node does the merge on the box: read the config (and bail on a parse error rather than
  // clobber a working one), back it up once, deep-set our keys, write it back, then write the
  // second agent's persona files and the note that tells the first agent how to reach it.
  // Single quotes are avoided throughout because the whole script rides inside node -e '...'.
  const merge =
    'const fs=require("fs");' +
    'const o=JSON.parse(fs.readFileSync("/tmp/apollo-ma.json","utf8"));' +
    'const root=process.env.OPENCLAW_STATE_DIR||"/home/node/.openclaw";' +
    "const file=process.env.CFG;" +
    "let cfg={};" +
    'if(fs.existsSync(file)){try{cfg=JSON.parse(fs.readFileSync(file,"utf8"));}catch(e){console.log("CONFIG_PARSE_FAIL:"+file);process.exit(0);}}' +
    'const bak=file+".pre-multiagent";' +
    'if(fs.existsSync(file)&&!fs.existsSync(bak)){fs.copyFileSync(file,bak);console.log("BACKUP:"+bak);}' +
    'const set=(obj,keys,val)=>{let c=obj;for(let i=0;i<keys.length-1;i++){if(typeof c[keys[i]]!=="object"||c[keys[i]]===null)c[keys[i]]={};c=c[keys[i]];}c[keys[keys.length-1]]=val;};' +
    // "main" is OpenClaw's default agent id, kept on the workspace the box already uses so the
    // existing agent carries on exactly as before. The second agent gets its own workspace.
    'const mainWs=root+"/workspace";' +
    'const secondWs=root+"/workspace-"+o.second.id;' +
    // The gateway rejects a multi-agent roster without one of two things (seen on David's box,
    // Oct 3 2026): agents.ownership="explicit", or one agent carrying the legacy default=true
    // marker. The first was tried and it broke the app's own chat: Agent37 sends every chat turn
    // with an unprefixed session key, and under explicit ownership the gateway refuses to guess
    // the owner ("session key has no explicit owner"). The marker keeps "main" as the fallback
    // owner for exactly those sessions, which is what a box with one app-facing agent needs. The
    // two cannot coexist, so an ownership stamp from the earlier run is removed. Heartbeat and
    // the system agent are still named explicitly, and the Telegram fallback binding below
    // keeps every other Telegram account on main.
    'if(cfg.agents&&cfg.agents.ownership!==undefined)delete cfg.agents.ownership;' +
    'set(cfg,["agents","entries","main","default"],true);' +
    'set(cfg,["agents","defaults","heartbeat","agentId"],"main");' +
    'set(cfg,["agents","defaults","systemAgent","agentId"],"main");' +
    'set(cfg,["agents","entries","main","workspace"],mainWs);' +
    'set(cfg,["agents","entries",o.second.id,"name"],o.second.name);' +
    'set(cfg,["agents","entries",o.second.id,"workspace"],secondWs);' +
    // One bot for the second agent, DMs only from the tester. The first agent keeps whatever
    // Telegram wiring the app already gave it.
    // Telegram, only when a bot was given. The lab drives the box over HTTP and skips this.
    "if(o.botB){" +
    'set(cfg,["channels","telegram","enabled"],true);' +
    'const acct=(tok)=>({botToken:tok,dmPolicy:"allowlist",allowFrom:[o.telegramUser]});' +
    'set(cfg,["channels","telegram","accounts",o.second.id],acct(o.botB));' +
    // The first agent's own bot, when one was given; without one, an account we wrote on an
    // earlier run is removed so the box does not keep a bot nobody asked for.
    'if(o.botA){set(cfg,["channels","telegram","accounts","main"],acct(o.botA));}' +
    'else if(cfg.channels.telegram.accounts&&cfg.channels.telegram.accounts.main&&cfg.channels.telegram.accounts.main.dmPolicy==="allowlist"){delete cfg.channels.telegram.accounts.main;}' +
    // Route each bot to its agent, and every other Telegram account to the first agent.
    // Most-specific binding wins, so an account match beats the "*" fallback. Replace the ones
    // we wrote before; keep every other binding.
    'const ours=(b)=>b&&b.match&&b.match.channel==="telegram"&&(b.match.accountId===o.second.id||(b.agentId==="main"&&(b.match.accountId==="*"||b.match.accountId==="main")));' +
    'const keep=(Array.isArray(cfg.bindings)?cfg.bindings:[]).filter(b=>!ours(b));' +
    'const add=[{agentId:o.second.id,match:{channel:"telegram",accountId:o.second.id}}];' +
    'if(o.botA)add.push({agentId:"main",match:{channel:"telegram",accountId:"main"}});' +
    'add.push({agentId:"main",match:{channel:"telegram",accountId:"*"}});' +
    "cfg.bindings=keep.concat(add);" +
    "}" +
    // The gateway's own chat endpoint, always on for a multi-agent box: it is the only way to
    // reach a named agent (the per-agent chat tabs, and the direct line the channels fall back
    // to), so there is no case where a second agent should have it off. The app reaches it
    // through the dashboard port, where Agent37's relay passes the request to the gateway. The
    // gateway's own port is not reachable from their edge whatever the gateway's bind
    // ("container_unreachable" with loopback and with "lan", Oct 4 2026), so the bind is left
    // alone; a "lan" bind an earlier run wrote is taken back.
    'set(cfg,["gateway","http","endpoints","chatCompletions","enabled"],true);' +
    'if(cfg.gateway&&cfg.gateway.bind==="lan")delete cfg.gateway.bind;' +
    // Memory search left at its default (on). We do NOT add the shared folder to
    // memory.search.extraPaths: changing the indexed sources makes OpenClaw pause its vector
    // index until a manual rebuild, which showed up as a second agent answering "memory search
    // is paused because its index scope changed" (Oct 4 2026). The company brain reaches every
    // agent through its loaded workspace context instead (USER.md below), which needs no search
    // and never pauses an index. A sharedDir entry an earlier build added is stripped so we stop
    // disturbing the index; the shared file itself stays as the editable master.
    'const sharedDir=root+"/shared";' +
    "if(cfg.memory&&cfg.memory.search&&Array.isArray(cfg.memory.search.extraPaths)){" +
    "cfg.memory.search.extraPaths=cfg.memory.search.extraPaths.filter(e=>!(e===sharedDir||(e&&e.path===sharedDir)));" +
    "if(cfg.memory.search.extraPaths.length===0)delete cfg.memory.search.extraPaths;}" +
    // The second agent's persona and the planted fact.
    "fs.mkdirSync(secondWs,{recursive:true});" +
    // The app-facing metadata for this agent, beside its workspace: the role, persona, and the
    // avatar image URL the app uploaded. The roster reads it so the agent shows its own face and
    // role; the box stays the source of truth for the agent itself.
    'fs.writeFileSync(secondWs+"/.apollo-agent.json",JSON.stringify({role:o.second.role||"",persona:o.second.persona||"",avatarUrl:o.second.avatarUrl||""}));' +
    // A role typed as "SEO Agent" reads as itself, not "SEO Agent agent".
    'const roleLabel=/agent$/i.test(o.second.role||"")?o.second.role:o.second.role+" agent";' +
    'fs.writeFileSync(secondWs+"/IDENTITY.md","# Identity\\n\\nYour name is "+o.second.name+". You are the "+roleLabel+".\\n");' +
    'fs.writeFileSync(secondWs+"/SOUL.md","# "+o.second.name+", "+roleLabel+"\\n\\n"+(o.second.persona||("You are the "+o.second.role+" on a small team of agents. Answer in your area directly and briefly."))+(o.second.fact?"\\n\\n## Facts you hold\\n\\n- "+o.second.fact+"\\n":"\\n"));' +
    'fs.writeFileSync(secondWs+"/AGENTS.md","# Working notes\\n\\nOther agents on this gateway may message you with sessions_send. Answer them the same way you would answer the owner.\\n\\nYour USER.md holds the shared company brain: who the company is and who the owner is, the same facts every agent here shares. Treat it as established fact and use it directly; you do not need to search for it.\\n");' +
    // The shared company brain, seeded once. Start it from what the main agent already records
    // about the owner (USER.md) when that file exists, so a second agent knows the company from
    // the first message; otherwise a short template to fill in. Never overwrite an existing
    // COMPANY.md, so a customer's edits and a re-run of setup both survive.
    "fs.mkdirSync(sharedDir,{recursive:true});" +
    'const companyFile=sharedDir+"/COMPANY.md";' +
    "if(!fs.existsSync(companyFile)){" +
    'let seed="# Company\\n\\nShared knowledge every agent on this workspace can use. Edit this file to say who the company is, what it does, and the facts all agents should know.\\n";' +
    'const userFile=mainWs+"/USER.md";' +
    'if(fs.existsSync(userFile)){try{const u=fs.readFileSync(userFile,"utf8").trim();if(u)seed+="\\n## About the owner\\n\\n"+u+"\\n";}catch(e){}}' +
    "fs.writeFileSync(companyFile,seed);" +
    "}" +
    // Load the company brain into the second agent as context it reads every turn. USER.md is
    // the workspace file OpenClaw treats as who the owner is, so the agent knows the company and
    // the owner from the first message, with no search involved. Rewritten on every setup from
    // the current COMPANY.md, so an edit to the master flows to the agent on the next run.
    'try{fs.writeFileSync(secondWs+"/USER.md",fs.readFileSync(companyFile,"utf8"));}catch(e){}' +
    // Every agent on the box may message every other, and the first agent learns each one that
    // exists and how to reach it. Rebuilt from the whole roster, so this agent joins the others
    // rather than replacing them. The config is written last, once the allow list is complete.
    TEAM_JS +
    "fs.writeFileSync(file,JSON.stringify(cfg,null,2));" +
    'console.log("WROTE:"+file);';

  const cmd =
    GUARD +
    `printf '%s' '${b64}' | base64 -d > /tmp/apollo-ma.json; ` +
    `CFG="$CFG" node -e '${merge}'; rm -f /tmp/apollo-ma.json; ` +
    VERIFY_SH;

  const res = await runWithRetries(agentId, cmd);
  if (res.note) return { ok: false, backedUp: false, restarted: false, note: res.note };
  if (/CONFIG_PARSE_FAIL/.test(res.stdout)) {
    return { ok: false, backedUp: false, restarted: false, note: "config-parse-fail" };
  }
  if (!/WROTE:/.test(res.stdout)) {
    console.error("[multi-agent-test:setup-failed]", agentId, res.stdout.slice(0, 500));
    return { ok: false, backedUp: false, restarted: false, note: "no-confirmation" };
  }
  const backedUp = /BACKUP:/.test(res.stdout);
  const verify = parseVerify(res.stdout);
  console.log("[multi-agent-test:setup]", agentId, { backedUp, agents: verify.agents });
  const restarted = await restartQuietly(agentId);
  return { ok: true, backedUp, restarted, verify };
}

/** Read back what the box has, config keys and the gateway's own agent list. Read-only. */
export async function verifySecondAgent(agentId: string): Promise<{ ok: boolean; verify?: SecondAgentVerify; note?: string }> {
  const res = await runWithRetries(agentId, GUARD + VERIFY_SH);
  if (res.note) return { ok: false, note: res.note };
  return { ok: true, verify: parseVerify(res.stdout) };
}

/** Put the config back the way setup found it, drop the second agent's workspace and the note in
 *  the main agent's AGENTS.md, and restart. A box setup never touched reports restored:false and
 *  is left alone. */
export async function revertSecondAgent(agentId: string): Promise<SecondAgentRevertResult> {
  const cmd =
    GUARD +
    'BAK="$CFG.pre-multiagent"; ' +
    '[ -f "$BAK" ] || { echo "NO_BACKUP:$BAK"; exit 0; }; ' +
    // Remove every non-main agent's workspace, read from the live config before it is restored.
    'CFG="$CFG" ROOT="$ROOT" node -e \'const fs=require("fs");try{const c=JSON.parse(fs.readFileSync(process.env.CFG,"utf8"));const e=c.agents&&c.agents.entries?Object.keys(c.agents.entries):[];for(const id of e){if(id==="main")continue;try{fs.rmSync(process.env.ROOT+"/workspace-"+id,{recursive:true,force:true});}catch(x){}}}catch(x){}\'; ' +
    'cp "$BAK" "$CFG" && rm -f "$BAK" && echo "RESTORED:$CFG"; ' +
    'ROOT="$ROOT" node -e \'const fs=require("fs");const f=process.env.ROOT+"/workspace/AGENTS.md";' +
    `if(fs.existsSync(f)){let s=fs.readFileSync(f,"utf8");s=s.replace(${NOTE_RE},"");fs.writeFileSync(f,s);console.log("NOTE_REMOVED");}'`;

  const res = await runWithRetries(agentId, cmd);
  if (res.note) return { ok: false, restored: false, restarted: false, note: res.note };
  if (/NO_BACKUP/.test(res.stdout)) return { ok: true, restored: false, restarted: false, note: "no-backup" };
  if (!/RESTORED:/.test(res.stdout)) {
    console.error("[multi-agent-test:revert-failed]", agentId, res.stdout.slice(0, 500));
    return { ok: false, restored: false, restarted: false, note: "no-confirmation" };
  }
  console.log("[multi-agent-test:reverted]", agentId);
  const restarted = await restartQuietly(agentId);
  return { ok: true, restored: true, restarted };
}

export interface SubAgentRemoveResult {
  ok: boolean;
  restarted: boolean;
  /** "not-found" when the box has no such agent, "reverted" when it was the last one and the
   *  whole multi-agent setup was taken back instead, or a failure note. */
  note?: string;
}

/** Take one agent off the box and leave the others as they are: its config entry, its Telegram
 *  account and binding, and its workspace go; the allow list and the main agent's note are
 *  rebuilt from who remains. Removing the last one reverts the box to a single agent, through
 *  the same restore the admin lab has always used. */
export async function removeSubAgent(agentId: string, subId: string): Promise<SubAgentRemoveResult> {
  if (subId === "main" || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(subId)) {
    return { ok: false, restarted: false, note: "not-found" };
  }
  const script =
    'const fs=require("fs");' +
    "const file=process.env.CFG;const root=process.env.ROOT;const id=process.env.SUB;" +
    'let cfg;try{cfg=JSON.parse(fs.readFileSync(file,"utf8"));}catch(e){console.log("CONFIG_PARSE_FAIL");process.exit(0);}' +
    'const set=(obj,keys,val)=>{let c=obj;for(let i=0;i<keys.length-1;i++){if(typeof c[keys[i]]!=="object"||c[keys[i]]===null)c[keys[i]]={};c=c[keys[i]];}c[keys[keys.length-1]]=val;};' +
    'const entries=(cfg.agents&&cfg.agents.entries)||{};' +
    'if(!entries[id]){console.log("NOT_FOUND");process.exit(0);}' +
    'if(Object.keys(entries).filter(k=>k!=="main"&&k!==id).length===0){console.log("LAST");process.exit(0);}' +
    "delete entries[id];" +
    "const tg=cfg.channels&&cfg.channels.telegram;" +
    "if(tg&&tg.accounts&&tg.accounts[id])delete tg.accounts[id];" +
    "if(Array.isArray(cfg.bindings))cfg.bindings=cfg.bindings.filter(b=>!(b&&b.agentId===id));" +
    'try{fs.rmSync(root+"/workspace-"+id,{recursive:true,force:true});}catch(e){}' +
    TEAM_JS +
    "fs.writeFileSync(file,JSON.stringify(cfg,null,2));" +
    'console.log("REMOVED:"+id);';
  const cmd = GUARD + `CFG="$CFG" ROOT="$ROOT" SUB="${subId}" node -e '${script}'`;

  const res = await runWithRetries(agentId, cmd);
  if (res.note) return { ok: false, restarted: false, note: res.note };
  if (/CONFIG_PARSE_FAIL/.test(res.stdout)) return { ok: false, restarted: false, note: "config-parse-fail" };
  if (/NOT_FOUND/.test(res.stdout)) return { ok: false, restarted: false, note: "not-found" };
  if (/LAST/.test(res.stdout)) {
    const reverted = await revertSecondAgent(agentId);
    return { ok: reverted.ok, restarted: reverted.restarted, note: reverted.ok ? "reverted" : reverted.note };
  }
  if (!/REMOVED:/.test(res.stdout)) {
    console.error("[multi-agent-test:remove-failed]", agentId, subId, res.stdout.slice(0, 500));
    return { ok: false, restarted: false, note: "no-confirmation" };
  }
  console.log("[multi-agent-test:removed]", agentId, subId);
  const restarted = await restartQuietly(agentId);
  return { ok: true, restarted };
}

/** Run one guarded command against a box, retrying while it wakes. Same cadence as
 *  lib/instance-defaults.ts, which the admin routes' maxDuration is sized for. */
async function runWithRetries(agentId: string, cmd: string): Promise<{ stdout: string; note?: string }> {
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const { stdout } = await agent37.exec(agentId, cmd);
      // Whole lines only: the readout now lists processes, and a command line that quotes the
      // guard would otherwise read as the guard firing.
      if (/^NOT_OPENCLAW\s*$/m.test(stdout)) return { stdout, note: "not-openclaw" };
      if (/^NO_NODE\s*$/m.test(stdout)) return { stdout, note: "no-node-on-box" };
      return { stdout };
    } catch {
      // Still booting. Wait and retry.
    }
    if (attempt < 6) await new Promise((r) => setTimeout(r, 15_000));
  }
  return { stdout: "", note: "no-confirmation" };
}

/** Reload the box so the config takes effect. Best-effort: the config is already written either
 *  way, so a failed restart is reported, not thrown. */
async function restartQuietly(agentId: string): Promise<boolean> {
  try {
    await agent37.restart(agentId);
    return true;
  } catch (err) {
    console.error("[multi-agent-test:restart-failed]", agentId, (err as Error).message);
    return false;
  }
}
