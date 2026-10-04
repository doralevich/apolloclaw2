import "server-only";
import { agent37 } from "@/lib/agent37";
import { APP_ID } from "@/config/agents";
import { SECOND_AGENT, setupSecondAgent } from "@/lib/multi-agent-test";
import { askOnBox } from "@/lib/gateway-chat";

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
/** The smallest combination the API accepts. 1 vCPU is refused ("Unsupported resource
 *  combination", Oct 4 2026): the API's floor is 2 vCPU / 4 GB / 2-12 GB disk, the same tier
 *  the app provisions customers on. */
const RESOURCES = { cpu: 2, memory: 4, disk: 6 };
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
  /** Which port answered as the gateway and what the probe saw, for the readout. */
  note?: string;
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

/** Ask one agent one question over the gateway's chat endpoint, from inside the box (see
 *  askOnBox in lib/gateway-chat.ts, which the per-agent chat falls back to as well). */
export async function askLab(id: string, key: string): Promise<LabAnswer> {
  const q = LAB_QUESTIONS.find((x) => x.key === key);
  if (!q) throw Object.assign(new Error(`Unknown question "${key}".`), { code: "bad_question" });

  // The box may still be restarting from create; a few tries, spaced out.
  const parsed = await askOnBox(id, { agent: q.agent, text: q.text, user: `apollo-lab-${q.agent}` }, 4);
  if (!parsed) {
    return { agent: q.agent, question: q.text, status: 0, answer: "The box did not answer the exec call.", ms: 0 };
  }
  const notes = [
    parsed.port ? `gateway port ${parsed.port}` : "no gateway port",
    parsed.tried ? `probed ${parsed.tried}` : "",
    parsed.tokenFound ? "" : "no gateway token found on the box",
  ].filter(Boolean);
  return { agent: q.agent, question: q.text, status: parsed.status, answer: parsed.answer, ms: parsed.ms, note: notes.join("; ") };
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
