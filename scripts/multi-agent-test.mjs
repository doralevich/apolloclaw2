#!/usr/bin/env node
// Two agents on one OpenClaw instance, talking to each other. A proof for the Command Center
// plan (several agents per server, each with its own Telegram bot, able to ask each other
// questions) before any product code depends on it.
//
// Runs from a laptop against the Agent37 control plane; the Vercel sandbox has no key and no
// route to api.agent37.com. Needs AGENT37_API_KEY in the environment (same key as .env).
// The same setup/verify/revert is available with one click from the admin Fleet page ("Second
// agent" on an OpenClaw card), backed by lib/multi-agent-test.ts. This script adds --create for
// building a fresh box and teardown for deleting one.
//
//   Add a second agent to an instance you already have:
//     node scripts/multi-agent-test.mjs setup --instance <id> --bot-b <token> --telegram-user <id>
//
//   Or build a fresh Starter box with both agents (adds --bot-a for the first bot):
//     node scripts/multi-agent-test.mjs setup --create --bot-a <token> --bot-b <token> --telegram-user <id>
//
//   Check what the gateway thinks it has:
//     node scripts/multi-agent-test.mjs verify --instance <id>
//
//   Put the config back the way it was (the backup setup took):
//     node scripts/multi-agent-test.mjs revert --instance <id>
//
//   Delete a box this script created:
//     node scripts/multi-agent-test.mjs teardown --instance <id>
//
// --bot-a / --bot-b are Telegram bot tokens from @BotFather (one bot per agent).
// --telegram-user is your numeric Telegram user id (@userinfobot tells you), so only you can DM
// the bots. On an existing instance --bot-a is optional: leave it out and your first agent keeps
// its current Telegram wiring through the app; only the second agent gets a native bot.
//
// What setup writes into openclaw.json (deep-merged, everything else untouched):
//   agents.entries.main   -> the existing agent, on the existing workspace
//   agents.entries.atlas  -> the second agent, own workspace, a CFO persona with one planted
//                            fact ("cash on hand is $412,000") that only it knows
//   channels.telegram.accounts.{main,atlas} -> one bot each, DMs allow-listed to you
//   bindings              -> each bot routed to its agent
//   tools.agentToAgent    -> enabled, allow: [main, atlas]
// so the test is: DM the first agent "ask Atlas what our cash on hand is" and see whether the
// answer comes back as $412,000, which it can only get by messaging the other agent.

const BASE = (process.env.AGENT37_API_BASE_URL || "https://api.agent37.com").replace(/\/$/, "");
const KEY = process.env.AGENT37_API_KEY;

// The API's smallest accepted combination. 1 vCPU is refused ("Unsupported resource
// combination"; the floor is 2 vCPU / 4 GB / 2-12 GB disk).
const STARTER = { cpu: 2, memory: 4, disk: 6 };
const TEMPLATE = "agent37-openclaw";
const TEST_TAG = "apolloclaw-multi-agent-test";

const SECOND = {
  id: "atlas",
  name: "Atlas",
  role: "CFO",
  fact: "Cash on hand is $412,000 as of this morning.",
};

// ─── CLI ─────────────────────────────────────────────────────────────────────

const [, , mode, ...rest] = process.argv;
const flags = {};
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith("--")) {
    const k = rest[i].slice(2);
    const next = rest[i + 1];
    if (next === undefined || next.startsWith("--")) flags[k] = true;
    else {
      flags[k] = next;
      i++;
    }
  }
}

function usage(msg) {
  if (msg) console.error(`\n${msg}\n`);
  console.error("Usage:");
  console.error("  setup    --instance <id> --bot-b <token> --telegram-user <id> [--bot-a <token>]");
  console.error("  setup    --create --bot-a <token> --bot-b <token> --telegram-user <id>");
  console.error("  verify   --instance <id>");
  console.error("  revert   --instance <id>");
  console.error("  teardown --instance <id>");
  process.exit(1);
}

if (!KEY) usage("AGENT37_API_KEY is not set.");
if (!["setup", "verify", "revert", "teardown"].includes(mode)) usage();

// ─── Agent37 control plane (mirrors lib/agent37.ts) ──────────────────────────

async function api(path, init = {}) {
  const res = await fetch(`${BASE}/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${init.method || "GET"} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  }
  return body;
}

const getInstance = (id) => api(`/instances/${id}`);
const exec = (id, command) => api(`/instances/${id}/exec`, { method: "POST", body: JSON.stringify({ command }) });
const restart = (id) => api(`/instances/${id}/restart`, { method: "POST" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitRunning(id, label) {
  for (let i = 0; i < 40; i++) {
    const a = await getInstance(id);
    if (a.status === "running") return a;
    process.stdout.write(`\r${label}: ${a.status}${" ".repeat(12)}`);
    await sleep(6_000);
  }
  throw new Error(`${id} did not reach "running" in time`);
}

// The container reports running before OpenClaw is up; retry the first exec like
// lib/instance-defaults.ts does.
async function execWhenReady(id, command) {
  let last;
  for (let i = 0; i < 8; i++) {
    try {
      return await exec(id, command);
    } catch (e) {
      last = e;
      await sleep(10_000);
    }
  }
  throw last;
}

const CONFIG_SH =
  'ROOT="${OPENCLAW_STATE_DIR:-/home/node/.openclaw}"; ' +
  'CFG=""; for f in "$ROOT/openclaw.json" "$ROOT/config.json"; do [ -f "$f" ] && { CFG="$f"; break; }; done; ' +
  '[ -n "$CFG" ] || CFG="$ROOT/openclaw.json"; ';

// ─── setup ───────────────────────────────────────────────────────────────────

async function setup() {
  const telegramUser = String(flags["telegram-user"] || "").trim();
  const botA = flags["bot-a"] ? String(flags["bot-a"]).trim() : "";
  const botB = String(flags["bot-b"] || "").trim();
  if (!botB) usage("--bot-b <token> is required (the second agent's Telegram bot).");
  if (!/^\d+$/.test(telegramUser)) usage("--telegram-user must be your numeric Telegram user id.");
  if (flags.create && !botA) usage("--create needs --bot-a as well, so both agents get a bot.");

  let id = flags.instance;
  if (flags.create) {
    console.log("Creating a Starter instance (1 CPU / 4 GB / 8 GB)...");
    const made = await api("/instances", {
      method: "POST",
      body: JSON.stringify({
        template: TEMPLATE,
        resources: STARTER,
        name: "Multi-agent test",
        metadata: { app: TEST_TAG },
        budget: { monthly_cap_micros: 5_000_000 }, // $5, plenty for a test
      }),
    });
    id = made.id;
    console.log(`Created ${id}`);
  } else if (!id) {
    usage("--instance <id> is required, or pass --create.");
  }

  await waitRunning(id, "instance");
  console.log(`\n${id} is running.`);

  // Everything the box needs, shipped as one JSON blob and merged by node inside the container.
  const payload = {
    second: SECOND,
    botA,
    botB,
    telegramUser,
  };
  const b64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");

  const merge =
    'const fs=require("fs");' +
    'const o=JSON.parse(fs.readFileSync("/tmp/apollo-ma.json","utf8"));' +
    'const root=process.env.OPENCLAW_STATE_DIR||"/home/node/.openclaw";' +
    'const file=process.env.CFG;' +
    "let cfg={};" +
    'if(fs.existsSync(file)){try{cfg=JSON.parse(fs.readFileSync(file,"utf8"));}catch(e){console.log("CONFIG_PARSE_FAIL:"+file);process.exit(2);}}' +
    // Back up before the first write, and only once, so revert always has the pre-test file.
    'const bak=file+".pre-multiagent";' +
    "if(fs.existsSync(file)&&!fs.existsSync(bak)){fs.copyFileSync(file,bak);console.log(\"BACKUP:\"+bak);}" +
    'const set=(obj,keys,val)=>{let c=obj;for(let i=0;i<keys.length-1;i++){if(typeof c[keys[i]]!=="object"||c[keys[i]]===null)c[keys[i]]={};c=c[keys[i]];}c[keys[keys.length-1]]=val;};' +
    // Agents. "main" is OpenClaw's default agent id, kept on the workspace the box already uses so
    // the existing agent carries on exactly as before. The second agent gets its own workspace.
    'const mainWs=root+"/workspace";' +
    'const secondWs=root+"/workspace-"+o.second.id;' +
    'set(cfg,["agents","entries","main","workspace"],mainWs);' +
    'set(cfg,["agents","entries",o.second.id,"name"],o.second.name);' +
    'set(cfg,["agents","entries",o.second.id,"workspace"],secondWs);' +
    // Telegram: one bot per agent, DMs only from the tester.
    'const acct=(tok)=>({botToken:tok,dmPolicy:"allowlist",allowFrom:[o.telegramUser]});' +
    'set(cfg,["channels","telegram","enabled"],true);' +
    'if(o.botA)set(cfg,["channels","telegram","accounts","main"],acct(o.botA));' +
    'set(cfg,["channels","telegram","accounts",o.second.id],acct(o.botB));' +
    // Bindings: each bot to its agent. Replace any binding we wrote before; keep others.
    'const ours=new Set(["main",o.second.id]);' +
    'const keep=(cfg.bindings||[]).filter(b=>!(b&&b.match&&b.match.channel==="telegram"&&ours.has(b.match.accountId)));' +
    'const add=[];' +
    'if(o.botA)add.push({agentId:"main",match:{channel:"telegram",accountId:"main"}});' +
    'add.push({agentId:o.second.id,match:{channel:"telegram",accountId:o.second.id}});' +
    "cfg.bindings=keep.concat(add);" +
    // Agent-to-agent: on, and only between these two.
    'set(cfg,["tools","agentToAgent","enabled"],true);' +
    'set(cfg,["tools","agentToAgent","allow"],["main",o.second.id]);' +
    "fs.writeFileSync(file,JSON.stringify(cfg,null,2));" +
    // The second agent's persona and the planted fact. IDENTITY.md names it; SOUL.md gives it
    // the role and the one thing only it knows.
    "fs.mkdirSync(secondWs,{recursive:true});" +
    'fs.writeFileSync(secondWs+"/IDENTITY.md","# Identity\\n\\nYour name is "+o.second.name+". You are the "+o.second.role+" agent.\\n");' +
    'fs.writeFileSync(secondWs+"/SOUL.md","# "+o.second.name+", "+o.second.role+" agent\\n\\nYou are the finance specialist on a small team of agents. Answer finance questions directly and briefly.\\n\\n## Facts you hold\\n\\n- "+o.second.fact+"\\n");' +
    'fs.writeFileSync(secondWs+"/AGENTS.md","# Working notes\\n\\nOther agents on this gateway may message you with sessions_send. Answer them the same way you would answer the owner.\\n");' +
    // The first agent needs to know the second one exists and how to reach it.
    "fs.mkdirSync(mainWs,{recursive:true});" +
    'const note="\\n\\n<!-- apollo:multi-agent-test:start -->\\n## Other agents on this gateway\\n\\n- "+o.second.name+" (agent id `"+o.second.id+"`) is the "+o.second.role+" agent. For any finance question, ask "+o.second.name+" with the sessions_send tool (agent id `"+o.second.id+"`), wait for the reply, and relay the answer.\\n<!-- apollo:multi-agent-test:end -->\\n";' +
    'const af=mainWs+"/AGENTS.md";' +
    'let cur=fs.existsSync(af)?fs.readFileSync(af,"utf8"):"";' +
    'cur=cur.replace(/\\n*<!-- apollo:multi-agent-test:start -->[\\s\\S]*?<!-- apollo:multi-agent-test:end -->\\n?/,"");' +
    "fs.writeFileSync(af,cur+note);" +
    'console.log("WROTE:"+file);';

  const cmd =
    CONFIG_SH +
    'command -v node >/dev/null 2>&1 || { echo NO_NODE; exit 1; }; ' +
    `printf '%s' '${b64}' | base64 -d > /tmp/apollo-ma.json; ` +
    `CFG="$CFG" node -e '${merge}'; rm -f /tmp/apollo-ma.json; ` +
    '(openclaw --version 2>/dev/null || echo "openclaw --version unavailable")';

  console.log("Writing agents, bots, bindings and the agent-to-agent allow list...");
  const r = await execWhenReady(id, cmd);
  process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (!/WROTE:/.test(r.stdout)) {
    console.error("\nThe config write did not confirm. Nothing was restarted. Check the output above.");
    process.exit(2);
  }

  console.log("\nRestarting so the gateway loads the config...");
  await restart(id);
  await sleep(8_000);
  await waitRunning(id, "instance");
  console.log("\nBack up.");

  await verify(id);

  console.log(`
Test it:
  1. In Telegram, open the bot for ${SECOND.name} and send: "What is our cash on hand?"
     Expect: $412,000. That proves the second agent and its own persona.
  2. Open your first agent's chat (the app, or its bot if you passed --bot-a) and send:
     "Ask Atlas what our cash on hand is and tell me."
     Expect: $412,000 relayed back. The first agent has no way to know it except by messaging Atlas.
  3. Ask the first agent: "What did Atlas say to you just now?" to confirm it kept the exchange.

When you're done:
  node scripts/multi-agent-test.mjs revert --instance ${id}      (existing box: restore the old config)
  node scripts/multi-agent-test.mjs teardown --instance ${id}    (a box this script created)
`);
}

// ─── verify ──────────────────────────────────────────────────────────────────

async function verify(id = flags.instance) {
  if (!id) usage("--instance <id> is required.");
  const cmd =
    CONFIG_SH +
    'echo "CONFIG:$CFG"; ' +
    'CFG="$CFG" node -e \'const c=JSON.parse(require("fs").readFileSync(process.env.CFG,"utf8"));' +
    'console.log("agents:",JSON.stringify(c.agents&&c.agents.entries?Object.keys(c.agents.entries):c.agents));' +
    'console.log("telegram accounts:",JSON.stringify(c.channels&&c.channels.telegram&&c.channels.telegram.accounts?Object.keys(c.channels.telegram.accounts):null));' +
    'console.log("bindings:",JSON.stringify(c.bindings||null));' +
    'console.log("agentToAgent:",JSON.stringify(c.tools&&c.tools.agentToAgent||null));\'; ' +
    'echo "--- openclaw agents list --bindings"; openclaw agents list --bindings 2>&1 || echo "(openclaw CLI did not run; the gateway may spell these keys differently on this build - send me the lines above)"';
  const r = await execWhenReady(id, cmd);
  console.log(r.stdout);
  if (r.stderr) console.error(r.stderr);
}

// ─── revert ──────────────────────────────────────────────────────────────────

async function revert() {
  const id = flags.instance;
  if (!id) usage("--instance <id> is required.");
  const cmd =
    CONFIG_SH +
    'BAK="$CFG.pre-multiagent"; ' +
    '[ -f "$BAK" ] || { echo "NO_BACKUP:$BAK"; exit 0; }; ' +
    'cp "$BAK" "$CFG" && rm -f "$BAK" && echo "RESTORED:$CFG"; ' +
    `rm -rf "$ROOT/workspace-${SECOND.id}"; ` +
    'ROOT="$ROOT" node -e \'const fs=require("fs");const f=process.env.ROOT+"/workspace/AGENTS.md";if(fs.existsSync(f)){let s=fs.readFileSync(f,"utf8");s=s.replace(/\\n*<!-- apollo:multi-agent-test:start -->[\\s\\S]*?<!-- apollo:multi-agent-test:end -->\\n?/,"");fs.writeFileSync(f,s);console.log("NOTE_REMOVED");}\'';
  const r = await execWhenReady(id, cmd);
  console.log(r.stdout);
  if (/NO_BACKUP/.test(r.stdout)) {
    console.log("No backup found, so nothing was changed.");
    return;
  }
  console.log("Restarting...");
  await restart(id);
  await sleep(8_000);
  await waitRunning(id, "instance");
  console.log("\nReverted.");
}

// ─── teardown ────────────────────────────────────────────────────────────────

async function teardown() {
  const id = flags.instance;
  if (!id) usage("--instance <id> is required.");
  const a = await getInstance(id);
  if (a.metadata?.app !== TEST_TAG) {
    console.error(`${id} was not created by this script (metadata.app is ${JSON.stringify(a.metadata?.app)}). Refusing to delete it.`);
    console.error("For an existing box, use revert instead.");
    process.exit(1);
  }
  await api(`/instances/${id}`, { method: "DELETE" });
  console.log(`Deleted ${id}.`);
}

const run = { setup, verify, revert, teardown }[mode];
run().catch((e) => {
  console.error(`\n${e.message}`);
  process.exit(1);
});
