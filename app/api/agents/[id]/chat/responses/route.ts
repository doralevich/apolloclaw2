import { agent37 } from "@/lib/agent37";
import { looksLikeModelRejection, modelFallbackFor } from "@/config/chat-models";
import { requireAgentAccess, requireEntitled } from "@/lib/auth";
import { ApiError, readJson, route, upstreamErrorMessage } from "@/lib/http";
import { STARTING_UP_MESSAGE, isWarmingUp, looksNotReady } from "@/lib/instance-ready";

// A young agent's chat host can lag Agent37's "running" by a couple of minutes
// (lib/instance-ready.ts). A turn that lands in that gap is retried on this schedule, about a
// minute in all, before the visitor hears "still starting up" instead of the edge's "Instance
// not found". Well inside maxDuration.
const WARMUP_RETRY_MS = [4_000, 6_000, 8_000, 10_000, 12_000, 15_000];

type Ctx = { params: Promise<{ id: string }> };

interface ResponsesBody {
  input?: string;
  session_id?: string;
  model?: string | null;
  provider?: string | null;
  reasoning_effort?: string | null;
  files?: string[];
}

// Run a chat turn and stream the agent's reply back as Server-Sent Events. We authorize +
// validate BEFORE the first byte (status/headers lock once streaming starts), then pipe the
// instance's SSE straight through; `route()` still turns any pre-stream throw into the canonical
// { error: { code, message } } shape so the client's apiFetch can read it.
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { supabase, row } = await requireAgentAccess(id, "member"); // SAME ownership gate as every per-agent route
  // A chat turn drives LLM/tool usage billed to the operator key — a spend-increasing action,
  // so it passes the same entitlement gate as create/start/resize (see requireEntitled's doc).
  await requireEntitled(supabase);

  const body = await readJson<ResponsesBody>(request);
  const input = (body.input ?? "").trim();
  const files = Array.isArray(body.files) ? body.files.filter(Boolean) : [];
  if (!input && files.length === 0) {
    throw new ApiError(400, "invalid_request", "input is required");
  }
  // The Agents API marks `input` required; for a files-only turn supply a sensible default
  // prompt so we always send a non-empty input rather than relying on "" being accepted.
  const finalInput = input || "Please review the attached file(s).";

  // Forward only what the Agents API expects; omit null/empty so the agent's own defaults
  // apply (model/provider/effort). provider only rides along when a model is chosen.
  const payload: Parameters<typeof agent37.createResponse>[1] = { input: finalInput, stream: true };
  if (body.session_id) payload.session_id = body.session_id;
  if (body.model) {
    payload.model = body.model;
    if (body.provider) payload.provider = body.provider;
  }
  if (body.reasoning_effort) payload.reasoning_effort = body.reasoning_effort;
  if (files.length) payload.files = files;

  // The turn, with the warm-up retries for a young agent. A network failure on the way to the
  // instance host counts the same as a not-ready reply: both mean the route is not there yet.
  const young = isWarmingUp(row.created_at);
  let upstream: Response | null = null;
  for (let attempt = 0; ; attempt++) {
    let notReady = false;
    let reason = "";
    try {
      upstream = await agent37.createResponse(id, payload);
      if (upstream.ok) break;
      const text = await upstream.clone().text().catch(() => "");
      notReady = looksNotReady(upstream.status, text);
      reason = `${upstream.status} ${text.slice(0, 120)}`;
      if (!notReady) break;
    } catch (e) {
      upstream = null;
      notReady = true;
      reason = (e as Error).message;
    }
    if (!young || attempt >= WARMUP_RETRY_MS.length) {
      if (upstream) break;
      throw new ApiError(502, "upstream_error", young ? STARTING_UP_MESSAGE : reason || "Chat request failed");
    }
    console.warn(`[chat/responses] ${id} not ready yet (${reason.replace(/\s+/g, " ")}), retry ${attempt + 1}`);
    await new Promise((r) => setTimeout(r, WARMUP_RETRY_MS[attempt]));
  }
  if (!upstream) throw new ApiError(502, "upstream_error", "Chat request failed");
  if (!upstream.ok && young) {
    // Every retry came back not-ready: say so in words a customer can act on.
    const text = await upstream.clone().text().catch(() => "");
    if (looksNotReady(upstream.status, text)) throw new ApiError(503, "starting_up", STARTING_UP_MESSAGE);
  }

  // Sonnet 5.5 is the default, and an instance whose gateway does not route it yet (or spells it
  // differently) refuses the id. Retry once on Sonnet 5 so the customer gets an answer rather
  // than an error. Only a refusal before streaming can be caught here.
  const fallback = modelFallbackFor(payload.model);
  if (fallback && !upstream.ok) {
    const text = await upstream.clone().text().catch(() => "");
    if (looksLikeModelRejection(text)) {
      console.warn("[chat/responses] model refused, retrying on fallback", payload.model, "->", fallback);
      upstream = await agent37.createResponse(id, { ...payload, model: fallback });
    }
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    const message = upstreamErrorMessage(text, upstream.status, "chat/responses", "Chat request failed");
    // The client softens the "busy" case by matching the message, not a code, and the 409 is
    // preserved in the status — so one code suffices.
    throw new ApiError(upstream.status || 502, "upstream_error", message);
  }

  // Pipe the SSE body straight through to the browser.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
});

// Chat turns (especially with tools) can run for a while; allow a generous ceiling.
export const maxDuration = 300;
