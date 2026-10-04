import "server-only";
import { agent37 } from "@/lib/agent37";
import { APP_ID } from "@/config/agents";
import { SECOND_AGENT, setupSecondAgent } from "@/lib/multi-agent-test";

// The two-agent lab: a throwaway box that proves several agents on one OpenClaw instance can
// each be reached and can message each other, with nothing else in the loop. No Telegram, no
// customer's agent. Three steps, each its own request so none outruns a route's time limit:
//
//   create  -> a Starter box with Atlas added and the gateway's chat endpoint switched on
//   ask     -> one question to one agent, over the gateway's own OpenAI-compatible endpoint,
//              run from inside the box ("openclaw/<agent>" is the model name). The questions
//              that matter: Atlas's planted fact (reaches the right agent), and Atlas asked to
//              message main (agent to agent).
//   delete  -> remove the box; refuses anything that is not a lab box
//
// Why the gateway's own endpoint: Agent37's chat path sends every turn without naming an
// agent, and the gateway refuses to guess once two exist (seen on David's box, Oct 3 2026).
// The gateway endpoint names the agent per request. It is also the path the per-agent chat
// tabs in the product would use.

export const LAB_TAG = "two-agent-lab";
const TEMPLATE = "agent37-openclaw";
/** The $4.32 Starter tier. */
const RESOURCES = { cpu: 1, memory: 4, disk: 8 };
/** $5 of model spend, plenty for a few questions. */
const BUDGET_MICROS = 5_000_000;

export interface LabBox {
  id: string;
  status: string;
  name: string | null;
  created: number | null;
}

export interface LabAnswer {
  agent: string;
  question: string;
  status: number;
  answer: string;
  ms: number;
}

function isLab(a: { metadata: Record<string, unknown> | null }): boolean {
  return a.metadata?.app === APP_ID && a.metadata?.lab === LAB_TAG;
}

/** The lab box that exists right now, if any. One at a time is plenty. */
export async function findLabBox(): Promise<LabBox | null> {
  const { data } = await agent37.listAgents();
  const box = data.find(isLab);
  return box ? { id: box.id, status: box.status, name: box.name, created: box.created } : null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitRunning(id: string, attempts = 20): Promise<string> {
  let status = "unknown";
  for (let i = 0; i < attempts; i++) {
    const { data } = await agent37.listAgents();
    status = data.find((a) => a.id === id)?.status ?? "unknown";
    if (status === "running") return status;
    await sleep(5_000);
  }
  return status;
}

/** Create the box, add Atlas, switch on the chat endpoint, restart. */
export async function createLabBox(): Promise<{ box: LabBox; setup: { ok: boolean; note?: string } }> {
  const existing = await findLabBox();
  if (existing) {
    throw Object.assign(new Error(`A lab box already exists (${existing.id}). Delete it first.`), { code: "lab_exists" });
  }
  const made = await agent37.createAgent({
    template: TEMPLATE,
    resources: RESOURCES,
    name: "Two-agent lab",
    metadata: { app: APP_ID, lab: LAB_TAG },
    budget: { monthly_cap_micros: BUDGET_MICROS },
  });
  const status = await waitRunning(made.id);
  if (status !== "running") {
    return { box: { id: made.id, status, name: made.name, created: made.created }, setup: { ok: false, note: `box is ${status}` } };
  }
  // setupSecondAgent retries while OpenClaw finishes booting, then restarts the box.
  const setup = await setupSecondAgent(made.id, { httpChat: true });
  return {
    box: { id: made.id, status: "restarting", name: made.name, created: made.created },
    setup: { ok: setup.ok, note: setup.note },
  };
}

/** The questions the proof is made of, in the order to ask them. */
export const LAB_QUESTIONS: { key: string; agent: string; text: string; expect: string }[] = [
  {
    key: "fact",
    agent: SECOND_AGENT.id,
    text: "What is our cash on hand? Answer in one sentence.",
    expect: "$412,000, the fact only Atlas holds. Proves the request reached Atlas and not main.",
  },
  {
    key: "main",
    agent: "main",
    text: "In one sentence: what is your agent id, and do you know our cash on hand? If you do not know, say so.",
    expect: "Main should say it does not know the number. Proves the two agents are separate.",
  },
  {
    key: "relay",
    agent: "main",
    text:
      "Use your sessions_send tool to ask the agent with id \"atlas\" what our cash on hand is. " +
      "Wait for its reply, then tell me exactly what it said. If the tool is missing or fails, say exactly what went wrong.",
    expect: "$412,000 relayed by main, which can only get it by messaging Atlas. The agent-to-agent proof.",
  },
];

/** Ask one agent one question over the gateway's chat endpoint, from inside the box. */
export async function askLab(id: string, key: string): Promise<LabAnswer> {
  const q = LAB_QUESTIONS.find((x) => x.key === key);
  if (!q) throw Object.assign(new Error(`Unknown question "${key}".`), { code: "bad_question" });

  const payload = Buffer.from(JSON.stringify({ agent: q.agent, text: q.text, timeoutMs: 150_000 }), "utf8").toString("base64");
  // Token and port come from the box itself: the gateway's auth token from its config, or
  // the wrapper's OPENCLAW_TOKEN, and the port from the openclaw-gateway process. No single
  // quotes in the script because it rides inside node -e '...'.
  const script =
    'const fs=require("fs");const q=JSON.parse(fs.readFileSync("/tmp/apollo-lab-q.json","utf8"));' +
    'const root=process.env.OPENCLAW_STATE_DIR||"/home/node/.openclaw";' +
    'let cfg={};try{cfg=JSON.parse(fs.readFileSync(root+"/openclaw.json","utf8"));}catch(e){}' +
    'let token=cfg.gateway&&cfg.gateway.auth&&typeof cfg.gateway.auth.token==="string"?cfg.gateway.auth.token:"";' +
    "let port=cfg.gateway&&Number(cfg.gateway.port)||0;" +
    'for(const d of fs.readdirSync("/proc")){if(!/^\\d+$/.test(d))continue;try{' +
    'const cmd=fs.readFileSync("/proc/"+d+"/cmdline","utf8");const env=fs.readFileSync("/proc/"+d+"/environ","utf8").split("\\0");' +
    'if(/openclaw-gateway/.test(cmd)){const p=env.find(e=>e.startsWith("OPENCLAW_GATEWAY_PORT="));if(p)port=Number(p.split("=")[1])||port;}' +
    'if(!token){const t=env.find(e=>e.startsWith("OPENCLAW_GATEWAY_TOKEN=")||e.startsWith("OPENCLAW_TOKEN="));if(t)token=t.split("=").slice(1).join("=");}' +
    "}catch(e){}}" +
    "port=port||18789;" +
    // Plain http.request rather than fetch: immune to any proxy a runtime might hang on
    // loopback calls, and the box's gateway is loopback.
    'const http=require("http");const t0=Date.now();' +
    'const body=JSON.stringify({model:"openclaw/"+q.agent,user:"apollo-lab-"+q.agent,messages:[{role:"user",content:q.text}]});' +
    'const done=(out)=>{console.log("LAB:"+JSON.stringify(Object.assign(out,{ms:Date.now()-t0,port:port,tokenFound:!!token})));};' +
    'const req=http.request({host:"127.0.0.1",port:port,path:"/v1/chat/completions",method:"POST",headers:{"content-type":"application/json","content-length":Buffer.byteLength(body),authorization:"Bearer "+token},timeout:q.timeoutMs},(r)=>{' +
    'let txt="";r.on("data",(c)=>{txt+=c;});r.on("end",()=>{let ans=txt.slice(0,1200);' +
    "try{const j=JSON.parse(txt);const c=j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;if(typeof c===\"string\")ans=c;else if(j.error)ans=JSON.stringify(j.error).slice(0,600);}catch(e){}" +
    "done({status:r.statusCode,answer:ans});});});" +
    'req.on("timeout",()=>{req.destroy(new Error("timed out after "+q.timeoutMs+"ms"));});' +
    'req.on("error",(e)=>{done({status:0,answer:"error: "+(e&&e.message||String(e))});});' +
    "req.end(body);";

  const cmd =
    'ROOT="${OPENCLAW_STATE_DIR:-/home/node/.openclaw}"; [ -d "$ROOT" ] || { echo NOT_OPENCLAW; exit 0; }; ' +
    `printf '%s' '${payload}' | base64 -d > /tmp/apollo-lab-q.json; ` +
    `node -e '${script}'; rm -f /tmp/apollo-lab-q.json`;

  // The box may still be restarting from create; a few tries, spaced out.
  let stdout = "";
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      ({ stdout } = await agent37.exec(id, cmd));
      if (/^LAB:/m.test(stdout)) break;
    } catch {
      // not up yet
    }
    if (attempt < 4) await sleep(10_000);
  }
  const m = /LAB:(\{.*\})/.exec(stdout);
  if (!m) {
    return { agent: q.agent, question: q.text, status: 0, answer: /NOT_OPENCLAW/.test(stdout) ? "This is not an OpenClaw box." : "The box did not answer the exec call.", ms: 0 };
  }
  const parsed = JSON.parse(m[1]) as { status: number; answer: string; ms: number; port: number; tokenFound: boolean };
  const answer = parsed.tokenFound ? parsed.answer : `${parsed.answer} (no gateway token found on the box)`;
  return { agent: q.agent, question: q.text, status: parsed.status, answer, ms: parsed.ms };
}

/** Delete the lab box. Only a box carrying the lab stamp; anything else is refused. */
export async function deleteLabBox(id: string): Promise<{ deleted: boolean }> {
  const { data } = await agent37.listAgents();
  const box = data.find((a) => a.id === id);
  if (!box) return { deleted: false };
  if (!isLab(box)) {
    throw Object.assign(new Error(`${id} is not a lab box; refusing to delete it.`), { code: "not_lab" });
  }
  await agent37.deleteAgent(id);
  return { deleted: true };
}
