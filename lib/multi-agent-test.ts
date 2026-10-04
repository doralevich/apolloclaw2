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
//   tools.agentToAgent    -> enabled, allow: [main, atlas]
//
// The test is then: DM Atlas "what is our cash on hand" and expect $412,000, then ask the first
// agent "ask Atlas what our cash on hand is" and see whether the same number comes back, which it
// can only get by messaging the other agent.
//
// Setup backs the config up once (openclaw.json.pre-multiagent) before the first write, and
// revert restores that backup, removes the atlas workspace and the note setup appended to the
// main agent's AGENTS.md, then restarts. Both are idempotent.

export const SECOND_AGENT = {
  id: "atlas",
  name: "Atlas",
  role: "CFO",
  fact: "Cash on hand is $412,000 as of this morning.",
};

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

// Reads the config and prints the keys the test depends on, then asks the gateway itself.
// Printed between markers so the route can hand the readout back as JSON.
const VERIFY_SH =
  'echo "CONFIG:$CFG"; ' +
  'CFG="$CFG" node -e \'const fs=require("fs");const f=process.env.CFG;' +
  'if(!fs.existsSync(f)){console.log("VERIFY:"+JSON.stringify({file:f,missing:true}));process.exit(0);}' +
  'const c=JSON.parse(fs.readFileSync(f,"utf8"));' +
  "const out={file:f," +
  "agents:c.agents&&c.agents.entries?Object.keys(c.agents.entries):(c.agents===undefined?null:c.agents)," +
  // The ownership keys, so a readout shows which of them the box actually carries right now.
  "ownership:c.agents&&c.agents.ownership!==undefined?c.agents.ownership:null," +
  "defaultMarker:c.agents&&c.agents.entries?Object.keys(c.agents.entries).filter(k=>c.agents.entries[k]&&c.agents.entries[k].default===true):[]," +
  "owners:c.agents&&c.agents.defaults?{systemAgent:c.agents.defaults.systemAgent||null,heartbeat:c.agents.defaults.heartbeat||null,sessionStore:c.agents.defaults.sessionStore||null}:null," +
  "telegramAccounts:c.channels&&c.channels.telegram&&c.channels.telegram.accounts?Object.keys(c.channels.telegram.accounts):null," +
  "bindings:c.bindings===undefined?null:c.bindings," +
  "agentToAgent:c.tools&&c.tools.agentToAgent?c.tools.agentToAgent:null};" +
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
    /** Switch on the gateway's OpenAI-compatible chat endpoint, which takes the agent as part
     *  of the model name ("openclaw/atlas"). The way to reach one agent of several while
     *  Agent37's chat path names none. */
    httpChat?: boolean;
  }
): Promise<SecondAgentSetupResult> {
  const payload = {
    second: SECOND_AGENT,
    botB: input.botToken?.trim() || "",
    // Optional: a native Telegram bot for the FIRST agent too. The app's own chat cannot name
    // an agent (Agent37 sends an unprefixed session key, see the ownership note below), so on
    // a gateway release that refuses to guess, Telegram is the one door into the first agent
    // that still works, and the agent-to-agent test can run through it.
    botA: input.mainBotToken?.trim() || "",
    telegramUser: input.telegramUser?.trim() || "",
    httpChat: Boolean(input.httpChat),
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
    // The gateway's own chat endpoint, off by default. Serves on the gateway port, takes the
    // agent as "openclaw/<id>" in the model field, and authenticates with the gateway token.
    'if(o.httpChat){set(cfg,["gateway","http","endpoints","chatCompletions","enabled"],true);}' +
    // Agent-to-agent: on, and only between these two.
    'set(cfg,["tools","agentToAgent","enabled"],true);' +
    'set(cfg,["tools","agentToAgent","allow"],["main",o.second.id]);' +
    "fs.writeFileSync(file,JSON.stringify(cfg,null,2));" +
    // The second agent's persona and the planted fact.
    "fs.mkdirSync(secondWs,{recursive:true});" +
    'fs.writeFileSync(secondWs+"/IDENTITY.md","# Identity\\n\\nYour name is "+o.second.name+". You are the "+o.second.role+" agent.\\n");' +
    'fs.writeFileSync(secondWs+"/SOUL.md","# "+o.second.name+", "+o.second.role+" agent\\n\\nYou are the finance specialist on a small team of agents. Answer finance questions directly and briefly.\\n\\n## Facts you hold\\n\\n- "+o.second.fact+"\\n");' +
    'fs.writeFileSync(secondWs+"/AGENTS.md","# Working notes\\n\\nOther agents on this gateway may message you with sessions_send. Answer them the same way you would answer the owner.\\n");' +
    // The first agent needs to know the second one exists and how to reach it.
    "fs.mkdirSync(mainWs,{recursive:true});" +
    'const note="\\n\\n<!-- apollo:multi-agent-test:start -->\\n## Other agents on this gateway\\n\\n- "+o.second.name+" (agent id `"+o.second.id+"`) is the "+o.second.role+" agent. For any finance question, ask "+o.second.name+" with the sessions_send tool (agent id `"+o.second.id+"`), wait for the reply, and relay the answer.\\n<!-- apollo:multi-agent-test:end -->\\n";' +
    'const af=mainWs+"/AGENTS.md";' +
    'let cur=fs.existsSync(af)?fs.readFileSync(af,"utf8"):"";' +
    `cur=cur.replace(${NOTE_RE},"");` +
    "fs.writeFileSync(af,cur+note);" +
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
    'cp "$BAK" "$CFG" && rm -f "$BAK" && echo "RESTORED:$CFG"; ' +
    `rm -rf "$ROOT/workspace-${SECOND_AGENT.id}"; ` +
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
