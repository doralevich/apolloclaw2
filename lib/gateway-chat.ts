import "server-only";
import { agent37 } from "@/lib/agent37";
import { openclawDashboardToken } from "@/lib/openclaw-dashboard";

// The direct line to one agent on an instance: the OpenClaw gateway's own OpenAI-compatible
// chat endpoint, reached from the app through an Agent37 signed URL for the gateway's port and
// authenticated with the gateway token.
//
// Why it exists: Agent37's chat API cannot name an agent, and once an instance carries more than
// one, the gateway refuses to guess (proved on David's box, Oct 3 2026). This path names the
// agent in the model field ("openclaw/atlas"), which is what per-agent tabs need. Setup for a
// second agent switches the endpoint on (see lib/multi-agent-test.ts, httpChat).
//
// The gateway's port is read off the box, because the Agent37 image moves it: the default
// 18789 is taken by their dashboard relay and the gateway runs on 28789. The signed URL and the
// token are fetched together and cached for a few minutes per instance, so a conversation does
// not pay for two control-plane calls on every turn.

export interface GatewayAccess {
  base: string;
  port: number;
  token: string;
  expiresAt: number;
}

const cache = new Map<string, GatewayAccess>();
const CACHE_MS = 5 * 60 * 1000;

/** The gateway's port and, when the config has none, its token, read off the running box. */
const READ_GATEWAY_CMD =
  'node -e \'const fs=require("fs");let port=0,token="";' +
  'for(const d of fs.readdirSync("/proc")){if(!/^\\d+$/.test(d))continue;try{' +
  'const cmd=fs.readFileSync("/proc/"+d+"/cmdline","utf8").replace(/\\0/g," ").trim();' +
  'const env=fs.readFileSync("/proc/"+d+"/environ","utf8").split("\\0");' +
  'if(/(^|\\/|\\s)openclaw-gateway(\\s|$)/.test(cmd)){const p=env.find(e=>e.startsWith("OPENCLAW_GATEWAY_PORT="));if(p)port=Number(p.split("=")[1])||0;}' +
  'if(!token){const t=env.find(e=>e.startsWith("OPENCLAW_GATEWAY_TOKEN=")||e.startsWith("OPENCLAW_TOKEN="));if(t)token=t.split("=").slice(1).join("=");}' +
  "}catch(e){}}" +
  'if(!port){try{const c=JSON.parse(fs.readFileSync((process.env.OPENCLAW_STATE_DIR||"/home/node/.openclaw")+"/openclaw.json","utf8"));port=Number(c.gateway&&c.gateway.port)||0;}catch(e){}}' +
  'console.log("GW:"+JSON.stringify({port:port,token:token}));\'';

async function readGateway(id: string): Promise<{ port: number; token: string }> {
  try {
    const { stdout } = await agent37.exec(id, READ_GATEWAY_CMD);
    const m = /GW:(\{.*\})/.exec(stdout);
    if (m) {
      const parsed = JSON.parse(m[1]) as { port: number; token: string };
      return { port: parsed.port || 0, token: parsed.token || "" };
    }
  } catch (e) {
    console.error("[gateway-chat:read]", id, (e as Error).message);
  }
  return { port: 0, token: "" };
}

/** Signed URL plus token for the gateway of one instance, cached. */
export async function gatewayAccess(id: string, force = false): Promise<GatewayAccess> {
  const hit = cache.get(id);
  if (hit && !force && hit.expiresAt > Date.now()) return hit;

  const [box, configToken] = await Promise.all([readGateway(id), openclawDashboardToken(id)]);
  const port = box.port || 18789;
  const token = configToken || box.token;
  if (!token) {
    throw Object.assign(new Error("No gateway token found on the instance."), { code: "no_gateway_token" });
  }
  const signed = await agent37.signedUrl(id, port, 15 * 60);
  const access: GatewayAccess = {
    base: signed.url.replace(/\/+$/, ""),
    port,
    token,
    // The signed URL carries its own expiry (seconds); stay well inside it.
    expiresAt: Math.min(Date.now() + CACHE_MS, signed.expires_at * 1000 - 60_000),
  };
  cache.set(id, access);
  return access;
}

/** A request to the gateway's HTTP surface. Returns the raw Response so callers can stream. */
export async function gatewayFetch(id: string, path: string, init?: RequestInit): Promise<Response> {
  const access = await gatewayAccess(id);
  return fetch(`${access.base}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${access.token}`, ...(init?.headers || {}) },
    cache: "no-store",
  });
}

export interface GatewayProbe {
  ok: boolean;
  status: number;
  port: number;
  host: string;
  /** The agent targets the gateway lists (openclaw/<id>), when it answered. */
  models: string[];
  note?: string;
}

/** Can the app reach this instance's gateway through the signed URL? GET /v1/models says. */
export async function probeGateway(id: string): Promise<GatewayProbe> {
  let access: GatewayAccess;
  try {
    access = await gatewayAccess(id, true);
  } catch (e) {
    return { ok: false, status: 0, port: 0, host: "", models: [], note: (e as Error).message };
  }
  const host = new URL(access.base).host;
  try {
    const res = await fetch(`${access.base}/v1/models`, {
      headers: { Authorization: `Bearer ${access.token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const text = await res.text();
    let models: string[] = [];
    try {
      const j = JSON.parse(text) as { data?: { id?: string }[] };
      models = Array.isArray(j.data) ? j.data.map((m) => m.id ?? "").filter(Boolean) : [];
    } catch {
      // not JSON; the snippet below says what came back
    }
    const ok = res.status === 200 && models.length > 0;
    return { ok, status: res.status, port: access.port, host, models, ...(ok ? {} : { note: text.slice(0, 300) }) };
  } catch (e) {
    return { ok: false, status: 0, port: access.port, host, models: [], note: (e as Error).message };
  }
}
