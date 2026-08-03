import "server-only";
import type {
  Agent,
  Budget,
  IntegrationConnectionsResult,
  IntegrationConnectResult,
  IntegrationToolkitsResult,
  ModelsResponse,
  SessionDetail,
  SessionListResponse,
  Template,
  Usage,
} from "@/lib/types";

const BASE = (process.env.AGENT37_API_BASE_URL || "https://api.agent37.com").replace(/\/$/, "");

// The per-instance Agents API (chat: /v1/responses, /v1/models, /v1/sessions, /v1/files) is
// served on the INSTANCE host — the bare instance URL `https://{id}.agent37.app`, default port
// 3737 — NOT the control-plane BASE above (which owns instance lifecycle: start/stop/exec/etc).
// Overridable via env in case the apex domain ever differs by environment.
const INSTANCE_DOMAIN = process.env.AGENT37_INSTANCE_DOMAIN || "agent37.app";

function instanceBaseUrl(id: string): string {
  return `https://${id}.${INSTANCE_DOMAIN}`;
}

export class Agent37Error extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "Agent37Error";
    this.status = status;
    this.code = code;
  }
}

// Read a JSON response from either Agent37 surface (control-plane or instance) and throw a
// typed Agent37Error on non-2xx. Errors come back nested ({"error":{...}}) or flat; unwrap so
// the real message survives. `augment402` adds the billing hint that only create/start hits.
async function parseAgent37<T>(res: Response, augment402 = false): Promise<T> {
  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const raw = (data ?? {}) as {
      code?: string;
      message?: string;
      error?: { code?: string; message?: string };
    };
    const err = raw.error ?? raw;
    let message = err.message || res.statusText;
    if (augment402 && res.status === 402) {
      // Almost always an unfunded wallet at create/start time — point the operator at billing.
      message = `${message} (Agent37 payment required — fund your wallet under Cloud → Billing in the dashboard, then retry.)`;
    }
    if (res.status === 405) {
      // Surface which verbs the endpoint DOES accept — diagnosis gold when the
      // write contract is undocumented.
      const allow = res.headers.get("allow");
      if (allow) message = `${message} (allow: ${allow})`;
    }
    throw new Agent37Error(res.status, err.code || "error", message);
  }

  return data as T;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.AGENT37_API_KEY;
  if (!key) {
    throw new Agent37Error(500, "config_error", "AGENT37_API_KEY is not set on the server");
  }

  const res = await fetch(`${BASE}/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  return parseAgent37<T>(res, true);
}

// Raw fetch against an instance's Agents API with the shared bearer. Returns the raw Response
// so callers can stream SSE, upload bytes, or stream a download — things the JSON-parsing
// `call` helper above can't. Only throws for missing server config; HTTP status is the
// caller's to handle (e.g. a 409 session_busy is surfaced, not thrown here).
//
// A ReadableStream request body is buffered to an ArrayBuffer first: a stream has no known length,
// so undici would send `Transfer-Encoding: chunked`, and the instance-host proxy in front of the
// gateway drops chunked request bodies — the write would land as a 0-byte file. Buffering gives it a
// known length so undici sets Content-Length and the proxy frames it correctly. Sized bodies
// (Blob/string/ArrayBuffer) already carry a length and pass straight through. Forwarded uploads are
// bounded by the edge's upload envelope, so the buffer stays small.
export async function instanceFetch(id: string, path: string, init?: RequestInit): Promise<Response> {
  const key = process.env.AGENT37_API_KEY;
  if (!key) {
    throw new Agent37Error(500, "config_error", "AGENT37_API_KEY is not set on the server");
  }
  const body = init?.body instanceof ReadableStream ? await new Response(init.body).arrayBuffer() : init?.body;
  return fetch(`${instanceBaseUrl(id)}${path}`, {
    ...init,
    body,
    headers: { Authorization: `Bearer ${key}`, ...(init?.headers || {}) },
    cache: "no-store",
  });
}

// JSON helper against an instance's Agents API — same parse + Agent37Error semantics as `call`.
async function instanceCall<T>(id: string, path: string, init?: RequestInit): Promise<T> {
  const res = await instanceFetch(id, path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });

  return parseAgent37<T>(res);
}

export interface CreateAgentInput {
  template?: string;
  resources?: { cpu?: number; memory?: number; disk?: number };
  user?: string;
  name?: string;
  metadata?: Record<string, unknown>;
  budget?: { monthly_cap_micros?: number; topup_micros?: number };
}

export interface ResizeInput {
  cpu?: number;
  memory?: number;
  disk?: number;
}

// The chat turn payload forwarded to POST /v1/responses. Omit null/empty fields so the
// agent's own defaults apply (model/provider/effort); `stream: true` requests SSE.
export interface CreateResponseInput {
  input: string;
  stream?: boolean;
  session_id?: string;
  model?: string;
  provider?: string;
  reasoning_effort?: string;
  files?: string[];
}

export const agent37 = {
  listAgents: () => call<{ data: Agent[] }>("/instances"),
  createAgent: (body: CreateAgentInput) =>
    call<Agent>("/instances", { method: "POST", body: JSON.stringify(body) }),
  deleteAgent: (id: string) =>
    call<{ id: string; deleted: boolean }>(`/instances/${id}`, { method: "DELETE" }),

  start: (id: string) => call<{ id: string; status: string }>(`/instances/${id}/start`, { method: "POST" }),
  stop: (id: string) => call<{ id: string; status: string }>(`/instances/${id}/stop`, { method: "POST" }),
  restart: (id: string) => call<{ id: string; status: string }>(`/instances/${id}/restart`, { method: "POST" }),
  update: (id: string) =>
    call<{ id: string; status: string; image_ref: string }>(`/instances/${id}/update`, { method: "POST" }),
  resize: (id: string, body: ResizeInput) =>
    call<{ id: string; status: string; resources: { cpu: number; memory: number; disk: number } }>(
      `/instances/${id}/resize`,
      { method: "POST", body: JSON.stringify(body) }
    ),

  signedUrl: (id: string, port: number, ttlSeconds?: number) =>
    call<{ url: string; port: number; expires_at: number }>(`/instances/${id}/signed-url`, {
      method: "POST",
      body: JSON.stringify({ port, ...(ttlSeconds ? { ttl_seconds: ttlSeconds } : {}) }),
    }),

  // Run a shell command inside the running instance (docker exec, server-side only).
  exec: (id: string, command: string) =>
    call<{ exit_code: number; stdout: string; stderr: string; truncated: boolean }>(
      `/instances/${id}/exec`,
      { method: "POST", body: JSON.stringify({ command }) }
    ),

  getBudget: (id: string) => call<Budget>(`/instances/${id}/budget`),

  // Add one-time credit to a running instance, in micros (1 USD = 1_000_000).
  //
  // UNVERIFIED CONTRACT. createAgent takes `budget: { monthly_cap_micros, topup_micros }`, so
  // the budget resource is known to speak `topup_micros` — but nothing in this codebase has
  // ever mutated the budget of an instance that already exists, and the Agent37 API reference
  // isn't in this repo. This is the shape that follows from create; confirm it before the
  // first real sale. If it turns out to be PATCH, or /budget/credit, or `credit_micros`, this
  // one function is the only thing that changes.
  //
  // Callers must treat a throw as "not delivered, retry later" rather than "money lost" —
  // lib/credits.ts records the purchase before this runs, precisely so a wrong guess here is
  // recoverable (see deliverPendingCredits).
  addCredit: (id: string, micros: number) =>
    call<Budget>(`/instances/${id}/budget`, {
      method: "POST",
      body: JSON.stringify({ topup_micros: micros }),
    }),
  getUsage: (id: string, month?: string) =>
    call<Usage>(`/instances/${id}/usage${month ? `?month=${encodeURIComponent(month)}` : ""}`),

  listTemplates: () => call<{ data: Template[] }>("/templates"),

  // ---- Per-instance Agents API (web chat) — served on the instance host, see instanceFetch ----
  listModels: (id: string) => instanceCall<ModelsResponse>(id, "/v1/models"),
  // The thread rail: every session on the instance, newest first. Items carry `title`, a
  // `preview` of the first message, and `last_active` — the sessions route turns these into the
  // rail's label + ordering (no per-session fetch needed).
  listSessions: (id: string) => instanceCall<SessionListResponse>(id, "/v1/sessions"),
  getSession: (id: string, sessionId: string) =>
    instanceCall<SessionDetail>(id, `/v1/sessions/${encodeURIComponent(sessionId)}`),
  deleteSession: (id: string, sessionId: string) =>
    instanceCall<{ id: string; deleted: boolean }>(
      id,
      `/v1/sessions/${encodeURIComponent(sessionId)}`,
      { method: "DELETE" }
    ),
  // Set a session's title. Supported on newer Hermes builds; older ones answer 404/405 (the
  // PATCH route maps that to a friendly "not supported yet" so the rail degrades gracefully).
  renameSession: (id: string, sessionId: string, title: string) =>
    instanceCall<{ id: string; agent: string; renamed: boolean }>(
      id,
      `/v1/sessions/${encodeURIComponent(sessionId)}`,
      { method: "PATCH", body: JSON.stringify({ title }) }
    ),
  // Run a chat turn. Returns the RAW upstream Response so the route can pipe the SSE body
  // straight through to the browser — the JSON helpers above can't stream. HTTP status is
  // the caller's to handle (e.g. a 409 session_busy is surfaced, not thrown).
  createResponse: (id: string, body: CreateResponseInput) =>
    instanceFetch(id, "/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(body),
    }),
  cancelResponse: (id: string, responseId: string) =>
    instanceCall<{ id: string; status: string }>(
      id,
      `/v1/responses/${encodeURIComponent(responseId)}/cancel`,
      { method: "POST" }
    ),
  // Write raw bytes to a path on the instance (chat attachments land under ~/uploads). Uses
  // PUT /v1/files/content — the Agents API's multipart POST /v1/files was removed. Returns the
  // RAW upstream Response (2xx body is the resolved FileEntry JSON carrying `path`); a streamed
  // body is buffered by instanceFetch so the instance-host proxy frames it correctly.
  uploadFileContent: (id: string, path: string, body: BodyInit, contentType?: string) =>
    instanceFetch(id, `/v1/files/content?path=${encodeURIComponent(path)}`, {
      method: "PUT",
      headers: { "Content-Type": contentType || "application/octet-stream" },
      body,
    }),

  // ---- App integrations (managed Composio) — CONTROL PLANE (`call`), not the instance host:
  // one Composio entity per instance. Management only; connecting an app is free (the agent's
  // later tool calls bill as usage). ----
  // Search or browse the app catalog. Omit `search` for the default popularity-ranked page; a
  // `search` must be >= 3 chars (the v1 route 400s a shorter query) and `limit` clamps to 24.
  // `cursor` (from a previous response's nextCursor) pages through the un-searched catalog.
  listIntegrationToolkits: (id: string, opts: { search?: string; limit?: number; cursor?: string } = {}) => {
    const params = new URLSearchParams();
    if (opts.search) params.set("search", opts.search);
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.cursor) params.set("cursor", opts.cursor);
    const qs = params.toString();
    return call<IntegrationToolkitsResult>(`/instances/${id}/integrations/toolkits${qs ? `?${qs}` : ""}`);
  },
  // Start an OAuth connection; returns a `redirectUrl` to send the user to. `callbackUrl`
  // (absolute https) is where Composio returns them once they finish authorizing.
  connectIntegration: (id: string, body: { toolkit: string; callbackUrl?: string }) =>
    call<IntegrationConnectResult>(`/instances/${id}/integrations/connect`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  // The agent's connected accounts — drives the Connected list and the per-toolkit badges.
  listIntegrationConnections: (id: string) =>
    call<IntegrationConnectionsResult>(`/instances/${id}/integrations/connections`),
  // Revoke one connected account; the v1 endpoint verifies it belongs to this instance first.
  disconnectIntegration: (id: string, connectedAccountId: string) =>
    call<{ id: string; deleted: boolean }>(
      `/instances/${id}/integrations/connections/${encodeURIComponent(connectedAccountId)}`,
      { method: "DELETE" }
    ),
};
