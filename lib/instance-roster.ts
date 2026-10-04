import "server-only";
import { agent37 } from "@/lib/agent37";

// Which agents live on one OpenClaw instance, read from its config. The product's data model
// is one agent per instance, so a second agent added on the box (the two-agent test today, the
// Command Center plan later) is invisible to the app unless something reads the box. This does,
// read-only, in one attempt: a sleeping box means "no roster right now", not a 90-second wait
// on a page somebody opened to glance at a status badge.

export interface InstanceRosterAgent {
  /** OpenClaw agent id ("main" is the gateway's default). */
  id: string;
  /** The name the config gives it, if any. The app names "main" itself. */
  name: string | null;
  /** The agent's role, from the app metadata beside its workspace. */
  role: string | null;
  /** The agent's avatar image URL, from the app metadata. The app names main's avatar itself. */
  avatarUrl: string | null;
  /** True when a Telegram account is bound to this agent, so it has a bot of its own. */
  telegram: boolean;
}

export interface InstanceRosterResult {
  ok: boolean;
  agents: InstanceRosterAgent[];
  note?: string;
}

const SCRIPT =
  'const fs=require("fs");' +
  'const root=process.env.OPENCLAW_STATE_DIR||"/home/node/.openclaw";' +
  'const file=["openclaw.json","config.json"].map(f=>root+"/"+f).find(f=>fs.existsSync(f));' +
  'if(!file){console.log("ROSTER:"+JSON.stringify({agents:[]}));process.exit(0);}' +
  'let c;try{c=JSON.parse(fs.readFileSync(file,"utf8"));}catch(e){console.log("CONFIG_PARSE_FAIL");process.exit(0);}' +
  // Keyed entries on current builds; a list on older ones. Either way "main" is always present
  // even when the config never names it.
  'const entries=c.agents&&c.agents.entries&&typeof c.agents.entries==="object"?c.agents.entries:{};' +
  'const list=c.agents&&Array.isArray(c.agents.list)?c.agents.list:[];' +
  'const ids=new Set(["main"]);' +
  "for(const k of Object.keys(entries))ids.add(k);" +
  "for(const a of list)if(a&&typeof a.id===\"string\")ids.add(a.id);" +
  'const bound=new Set((Array.isArray(c.bindings)?c.bindings:[]).filter(b=>b&&b.match&&b.match.channel==="telegram"&&typeof b.agentId==="string").map(b=>b.agentId));' +
  // The app metadata beside each non-main agent's workspace: role and avatar URL.
  'const meta=function(id){if(id==="main")return{};try{return JSON.parse(fs.readFileSync(root+"/workspace-"+id+"/.apollo-agent.json","utf8"))||{};}catch(e){return{};}};' +
  'const agents=[...ids].map(id=>{const e=entries[id]||list.find(a=>a&&a.id===id)||{};const m=meta(id);return {id,name:typeof e.name==="string"?e.name:null,role:typeof m.role==="string"&&m.role?m.role:null,avatarUrl:typeof m.avatarUrl==="string"&&m.avatarUrl?m.avatarUrl:null,telegram:bound.has(id)};});' +
  'console.log("ROSTER:"+JSON.stringify({agents}));';

const CMD =
  'ROOT="${OPENCLAW_STATE_DIR:-/home/node/.openclaw}"; ' +
  '[ -d "$ROOT" ] || { echo NOT_OPENCLAW; exit 0; }; ' +
  'command -v node >/dev/null 2>&1 || { echo NO_NODE; exit 1; }; ' +
  `node -e '${SCRIPT}'`;

export async function readInstanceRoster(agentId: string): Promise<InstanceRosterResult> {
  let stdout = "";
  try {
    ({ stdout } = await agent37.exec(agentId, CMD));
  } catch {
    return { ok: false, agents: [], note: "unreachable" };
  }
  if (stdout.includes("NOT_OPENCLAW")) return { ok: false, agents: [], note: "not-openclaw" };
  if (stdout.includes("NO_NODE")) return { ok: false, agents: [], note: "no-node-on-box" };
  if (stdout.includes("CONFIG_PARSE_FAIL")) return { ok: false, agents: [], note: "config-parse-fail" };
  const m = /ROSTER:(\{.*\})/.exec(stdout);
  if (!m) return { ok: false, agents: [], note: "no-output" };
  try {
    const parsed = JSON.parse(m[1]) as { agents: InstanceRosterAgent[] };
    return { ok: true, agents: parsed.agents };
  } catch {
    return { ok: false, agents: [], note: "parse-output-failed" };
  }
}
