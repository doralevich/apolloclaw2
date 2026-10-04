import "server-only";
import { agent37 } from "@/lib/agent37";
import { openclawDashboardToken } from "@/lib/openclaw-dashboard";
import { PORTS } from "@/config/agents";

// The direct line to one agent on an instance: the OpenClaw gateway's own OpenAI-compatible
// chat endpoint, which names the agent in the model field ("openclaw/atlas").
//
// Why it exists: Agent37's chat API cannot name an agent, and once an instance carries more than
// one, the gateway refuses to guess (proved on David's box, Oct 3 2026). Setup for a second
// agent switches the endpoint on (see lib/multi-agent-test.ts, httpChat).
//
// Two ways to reach it:
//
//   edge  The app, from Vercel, through an Agent37 signed URL for the gateway's port. Streams.
//         The edge in front of that port checks its own credential before passing a request
//         on, and the first attempt (gateway token in the Authorization header, Oct 4 2026)
//         came back as Agent37's "invalid_api_key": the edge read the gateway's token as one
//         of its API keys. So the edge is tried several ways (signed query kept on the request,
//         a cookie the signed URL may set, Agent37's own key in the header) and the first way
//         that reaches the gateway is remembered per instance.
//   box   A node script run inside the box with docker exec, calling the gateway on loopback.
//         Always works, does not stream, and pays the exec round trip. The fallback for chat,
//         and what the two-agent lab's questions use.
//
// The gateway's port is read off the box, because the Agent37 image moves it: the default
// 18789 is taken by their dashboard relay and the gateway runs on 28789.

/** One port of the box, as the edge exposes it: a signed URL and what the edge handed back. */
export interface EdgeRoute {
  port: number;
  /** The signed URL's origin, no path. */
  origin: string;
  /** The signed URL's query string ("?sig=..."), kept on every request; "" when it has none. */
  query: string;
  /** The signed URL as Agent37 returned it. Never logged. */
  signedUrl: string;
  /** Cookie header assembled from what the signed URL set, when the cookie way is in use. */
  cookie?: string;
}

export interface GatewayAccess {
  /** The gateway's own port on the box, as read off it. */
  port: number;
  /** The ports to try, dashboard port first. Proved on the lab box (Oct 4 2026): Agent37's
   *  relay on the dashboard port passes /v1/models and the chat endpoint straight through to
   *  the gateway, with the gateway token as a bearer, while the gateway's own port answers
   *  "container_unreachable" from the edge whatever the gateway's bind. The gateway's port
   *  stays as the second try in case a later image changes that. */
  routes: EdgeRoute[];
  /** The gateway's own token. Never logged. */
  token: string;
  expiresAt: number;
  /** The route and way that reached the gateway last time, or "none" when every one failed. */
  via?: { port: number; way: EdgeWay } | "none";
}

export type EdgeWay = "signed+bearer" | "signed" | "cookie+bearer" | "apikey";

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
  const ports = port === PORTS.dashboard ? [port] : [PORTS.dashboard, port];
  const signed = await Promise.all(ports.map((p) => agent37.signedUrl(id, p, 15 * 60)));
  const routes: EdgeRoute[] = signed.map((s, i) => {
    const u = new URL(s.url);
    return { port: ports[i], origin: u.origin, query: u.search, signedUrl: s.url };
  });
  const access: GatewayAccess = {
    port,
    routes,
    token,
    // The signed URLs carry their own expiry (seconds); stay well inside it.
    expiresAt: Math.min(Date.now() + CACHE_MS, ...signed.map((s) => s.expires_at * 1000 - 60_000)),
  };
  cache.set(id, access);
  return access;
}

// ---------------------------------------------------------------------------------------------
// The edge: which port, and which way through it, reaches the gateway?

type WayRequest = { url: string; headers: Record<string, string> };

/** The request shape for one way through the edge on one route. Null when the way does not apply. */
function shapeFor(way: EdgeWay, route: EdgeRoute, token: string, path: string): WayRequest | null {
  const apiKey = process.env.AGENT37_API_KEY || "";
  switch (way) {
    case "signed+bearer":
      return { url: `${route.origin}${path}${route.query}`, headers: { Authorization: `Bearer ${token}` } };
    case "signed":
      return { url: `${route.origin}${path}${route.query}`, headers: {} };
    case "cookie+bearer":
      if (!route.cookie) return null;
      return { url: `${route.origin}${path}`, headers: { Authorization: `Bearer ${token}`, Cookie: route.cookie } };
    case "apikey":
      if (!apiKey) return null;
      return { url: `${route.origin}${path}`, headers: { Authorization: `Bearer ${apiKey}` } };
  }
}

/** Does this reply come from the gateway (any status) or from Agent37's edge in front of it? */
function fromGateway(status: number, text: string): boolean {
  if (status === 200) return true;
  // Agent37's own wording: {"error":"invalid_api_key"...}, "signed URL", "No route for ...",
  // {"error":"container_unreachable"} (the edge got in but could not connect to the port).
  if (/invalid_api_key|signed URL|No route for|container_unreachable|agent37/i.test(text)) return false;
  // A 5xx is the edge failing to reach something. A 401/403 without Agent37 wording is the
  // gateway's own refusal of the token, which still proves the request got through the edge.
  return status === 401 || status === 403 || status === 400 || status === 404 || status === 405;
}

export interface EdgeAttempt {
  port: number;
  way: EdgeWay | "visit";
  status: number;
  /** "ok" reached the gateway and it answered; "gateway" it refused the token; "edge" Agent37 stopped it. */
  verdict: "ok" | "gateway" | "edge" | "error";
  note: string;
}

/**
 * Visit the signed URL once, as a browser would, to learn whether it sets a cookie that later
 * requests ride on. Fills route.cookie when it does. Never records the URL or cookie values.
 */
async function visitSignedUrl(route: EdgeRoute): Promise<EdgeAttempt> {
  try {
    const res = await fetch(route.signedUrl, { redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const text = await res.text().catch(() => "");
    const setCookies: string[] = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
    const names = setCookies.map((c) => c.split("=")[0].trim()).filter(Boolean);
    if (setCookies.length) {
      route.cookie = setCookies.map((c) => c.split(";")[0].trim()).join("; ");
    }
    const location = res.headers.get("location");
    const parts = [
      `status ${res.status}`,
      names.length ? `sets cookie ${names.join(", ")}` : "sets no cookie",
      location ? `redirects to ${safeLocation(location, route.origin)}` : "",
      text ? `body: ${text.replace(/\s+/g, " ").slice(0, 120)}` : "",
    ].filter(Boolean);
    const verdict: EdgeAttempt["verdict"] = res.status < 400 ? "ok" : fromGateway(res.status, text) ? "gateway" : "edge";
    return { port: route.port, way: "visit", status: res.status, verdict, note: parts.join(" · ") };
  } catch (e) {
    return { port: route.port, way: "visit", status: 0, verdict: "error", note: (e as Error).message };
  }
}

/** A redirect target with its query (where a signature would be) removed. */
function safeLocation(location: string, origin: string): string {
  try {
    const u = new URL(location, origin);
    return `${u.origin}${u.pathname}${u.search ? "?…" : ""}`;
  } catch {
    return "(unparseable)";
  }
}

const WAYS: EdgeWay[] = ["signed+bearer", "signed", "cookie+bearer", "apikey"];

type Found = { via: { port: number; way: EdgeWay } | "none"; models: string[]; attempts: EdgeAttempt[] };

/**
 * Try every route and every way through the edge with GET /v1/models, in order, and remember
 * the first that the gateway answers. Returns every attempt for the readout.
 */
async function findEdgeWay(access: GatewayAccess): Promise<Found> {
  const attempts: EdgeAttempt[] = [];
  for (const route of access.routes) {
    attempts.push(await visitSignedUrl(route));
    for (const way of WAYS) {
      const shape = shapeFor(way, route, access.token, "/v1/models");
      if (!shape) {
        attempts.push({ port: route.port, way, status: 0, verdict: "error", note: way === "cookie+bearer" ? "skipped: the signed URL set no cookie" : "skipped: no AGENT37_API_KEY on the server" });
        continue;
      }
      try {
        const res = await fetch(shape.url, { headers: shape.headers, cache: "no-store", signal: AbortSignal.timeout(20_000) });
        const text = await res.text();
        let list: string[] = [];
        try {
          const j = JSON.parse(text) as { data?: { id?: string }[] };
          list = Array.isArray(j.data) ? j.data.map((m) => m.id ?? "").filter(Boolean) : [];
        } catch {
          // not JSON; the note carries the start of it
        }
        const ok = res.status === 200 && list.length > 0;
        const verdict: EdgeAttempt["verdict"] = ok ? "ok" : fromGateway(res.status, text) ? "gateway" : "edge";
        attempts.push({ port: route.port, way, status: res.status, verdict, note: ok ? `lists ${list.join(", ")}` : text.replace(/\s+/g, " ").slice(0, 160) });
        if (ok) {
          access.via = { port: route.port, way };
          return { via: access.via, models: list, attempts };
        }
      } catch (e) {
        attempts.push({ port: route.port, way, status: 0, verdict: "error", note: (e as Error).message });
      }
    }
  }
  access.via = "none";
  return { via: "none", models: [], attempts };
}

/**
 * A request to the gateway's HTTP surface through the edge. Returns the raw Response so callers
 * can stream. Throws with code "no_edge_route" when no way through the edge reaches the gateway;
 * callers fall back to askOnBox.
 */
export async function gatewayFetch(id: string, path: string, init?: RequestInit): Promise<Response> {
  const access = await gatewayAccess(id);
  const via = access.via ?? (await findEdgeWay(access)).via;
  const route = via === "none" ? null : access.routes.find((r) => r.port === via.port);
  const shape = via === "none" || !route ? null : shapeFor(via.way, route, access.token, path);
  if (!shape) {
    throw Object.assign(new Error("No way through the Agent37 edge reached the gateway."), { code: "no_edge_route" });
  }
  return fetch(shape.url, {
    ...init,
    headers: { ...shape.headers, ...(init?.headers || {}) },
    cache: "no-store",
  });
}

export interface GatewayProbe {
  ok: boolean;
  status: number;
  /** The gateway's own port on the box. */
  port: number;
  host: string;
  /** The agent targets the gateway lists (openclaw/<id>), when it answered. */
  models: string[];
  /** The port and way that worked ("28789 signed+bearer"), or "none". */
  via: string;
  attempts: EdgeAttempt[];
  note?: string;
}

/** Can the app reach this instance's gateway through the edge, and which way? */
export async function probeGateway(id: string): Promise<GatewayProbe> {
  let access: GatewayAccess;
  try {
    access = await gatewayAccess(id, true);
  } catch (e) {
    return { ok: false, status: 0, port: 0, host: "", models: [], via: "none", attempts: [], note: (e as Error).message };
  }
  const host = new URL(access.routes[0].origin).host;
  const found = await findEdgeWay(access);
  const winner = found.attempts.find((a) => a.verdict === "ok" && a.way !== "visit");
  const last = found.attempts.filter((a) => a.way !== "visit").pop();
  return {
    ok: found.via !== "none",
    status: winner?.status ?? last?.status ?? 0,
    port: access.port,
    host,
    models: found.models,
    via: found.via === "none" ? "none" : `${found.via.port} ${found.via.way}`,
    attempts: found.attempts,
    ...(found.via === "none" ? { note: "No port and way through the edge reached the gateway. Chat falls back to running inside the box." } : {}),
  };
}

// ---------------------------------------------------------------------------------------------
// The box: ask the gateway from inside, over loopback.

export interface BoxAnswer {
  status: number;
  answer: string;
  ms: number;
  port: number;
  tried: string;
  tokenFound: boolean;
}

/**
 * One turn with one agent, run inside the box with docker exec: a node script that finds the
 * gateway's port and token on the box and POSTs to /v1/chat/completions on loopback. Whole
 * answer, no streaming. `user` picks the gateway session, so the same value as the edge path
 * keeps one conversation across both.
 */
export async function askOnBox(
  id: string,
  q: { agent: string; text: string; user: string; timeoutMs?: number },
  attempts = 1
): Promise<BoxAnswer | null> {
  const payload = Buffer.from(
    JSON.stringify({ agent: q.agent, text: q.text, user: q.user, timeoutMs: q.timeoutMs ?? 150_000 }),
    "utf8"
  ).toString("base64");
  // Token and port come from the box itself: the gateway's auth token from its config, or
  // the wrapper's OPENCLAW_TOKEN, and the port from the openclaw-gateway process. No single
  // quotes in the script because it rides inside node -e '...'.
  const script =
    'const fs=require("fs");const q=JSON.parse(fs.readFileSync("/tmp/apollo-lab-q.json","utf8"));' +
    'const root=process.env.OPENCLAW_STATE_DIR||"/home/node/.openclaw";' +
    'let cfg={};try{cfg=JSON.parse(fs.readFileSync(root+"/openclaw.json","utf8"));}catch(e){}' +
    'let token=cfg.gateway&&cfg.gateway.auth&&typeof cfg.gateway.auth.token==="string"?cfg.gateway.auth.token:"";' +
    // Candidate ports, best guess first: the openclaw-gateway process's own port, the config's,
    // then every port the box listens on. Agent37 runs helpers on several ports (its wrapper,
    // a dashboard relay, a file browser, a terminal) and the first lab run hit one of those: a
    // 404 "No route for POST /v1/chat/completions", which is their wording, not the gateway's.
    "const cands=[];const push=(p)=>{p=Number(p);if(p>0&&!cands.includes(p))cands.push(p);};" +
    'for(const d of fs.readdirSync("/proc")){if(!/^\\d+$/.test(d))continue;try{' +
    'const cmd=fs.readFileSync("/proc/"+d+"/cmdline","utf8").replace(/\\0/g," ").trim();' +
    'if(!/(^|\\/|\\s)openclaw-gateway(\\s|$)/.test(cmd))continue;' +
    'const env=fs.readFileSync("/proc/"+d+"/environ","utf8").split("\\0");' +
    'const p=env.find(e=>e.startsWith("OPENCLAW_GATEWAY_PORT="));if(p)push(p.split("=")[1]);' +
    'if(!token){const t=env.find(e=>e.startsWith("OPENCLAW_GATEWAY_TOKEN=")||e.startsWith("OPENCLAW_TOKEN="));if(t)token=t.split("=").slice(1).join("=");}' +
    "}catch(e){}}" +
    "if(cfg.gateway&&cfg.gateway.port)push(cfg.gateway.port);" +
    'for(const f of ["/proc/net/tcp","/proc/net/tcp6"]){try{for(const line of fs.readFileSync(f,"utf8").split("\\n").slice(1)){const p=line.trim().split(/\\s+/);if(p[3]==="0A")push(parseInt(p[1].split(":").pop(),16));}}catch(e){}}' +
    // Plain http.request rather than fetch: immune to any proxy a runtime might hang on
    // loopback calls, and the box's gateway is loopback.
    'const http=require("http");' +
    "const call=(port,method,path,body,timeoutMs)=>new Promise((resolve)=>{" +
    'const req=http.request({host:"127.0.0.1",port:port,path:path,method:method,headers:Object.assign({authorization:"Bearer "+token},body?{"content-type":"application/json","content-length":Buffer.byteLength(body)}:{}),timeout:timeoutMs},(r)=>{' +
    'let txt="";r.on("data",(c)=>{txt+=c;});r.on("end",()=>resolve({status:r.statusCode,text:txt}));});' +
    'req.on("timeout",()=>{req.destroy(new Error("timed out after "+timeoutMs+"ms"));});' +
    'req.on("error",(e)=>resolve({status:0,text:"error: "+(e&&e.message||String(e))}));' +
    "req.end(body||undefined);});" +
    "(async()=>{const t0=Date.now();const tried=[];let port=0;" +
    // The gateway is the port whose /v1/models answers with an OpenAI-style list (200 and a
    // data array) or at least with the gateway's own auth refusal, never with Agent37's 404.
    'for(const p of cands){const r=await call(p,"GET","/v1/models",null,8000);let ok=false,gw=false;try{const j=JSON.parse(r.text);ok=r.status===200&&Array.isArray(j.data);gw=ok||((r.status===401||r.status===403)&&!/No route for/.test(r.text));}catch(e){}' +
    'tried.push(p+":"+r.status);if(ok){port=p;break;}if(gw&&!port){port=p;}}' +
    'const done=(out)=>{console.log("LAB:"+JSON.stringify(Object.assign(out,{ms:Date.now()-t0,port:port,tried:tried.join(" "),tokenFound:!!token})));};' +
    'if(!port){done({status:0,answer:"no port on the box answered /v1/models like the gateway (tried "+tried.join(", ")+")"});return;}' +
    'const body=JSON.stringify({model:"openclaw/"+q.agent,user:q.user,messages:[{role:"user",content:q.text}]});' +
    'const r=await call(port,"POST","/v1/chat/completions",body,q.timeoutMs);' +
    "let ans=r.text.slice(0,1200);" +
    "try{const j=JSON.parse(r.text);const c=j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;if(typeof c===\"string\")ans=c;else if(j.error)ans=JSON.stringify(j.error).slice(0,600);}catch(e){}" +
    "done({status:r.status,answer:ans});})();";

  const cmd =
    'ROOT="${OPENCLAW_STATE_DIR:-/home/node/.openclaw}"; [ -d "$ROOT" ] || { echo NOT_OPENCLAW; exit 0; }; ' +
    `printf '%s' '${payload}' | base64 -d > /tmp/apollo-lab-q.json; ` +
    `node -e '${script}'; rm -f /tmp/apollo-lab-q.json`;

  // The box may still be restarting; a few tries, spaced out, when the caller allows.
  let stdout = "";
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      ({ stdout } = await agent37.exec(id, cmd));
      if (/^LAB:/m.test(stdout)) break;
    } catch {
      // not up yet
    }
    if (attempt < attempts) await new Promise((r) => setTimeout(r, 10_000));
  }
  if (/^NOT_OPENCLAW\s*$/m.test(stdout)) {
    return { status: 0, answer: "This is not an OpenClaw box.", ms: 0, port: 0, tried: "", tokenFound: false };
  }
  const m = /LAB:(\{.*\})/.exec(stdout);
  if (!m) return null;
  return JSON.parse(m[1]) as BoxAnswer;
}
