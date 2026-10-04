import { requireAgentAccess, requireEntitled } from "@/lib/auth";
import { askOnBox, gatewayFetch } from "@/lib/gateway-chat";
import { ApiError, readJson, route, upstreamErrorMessage } from "@/lib/http";
import { runtimeForTemplate } from "@/config/agents";

type Ctx = { params: Promise<{ id: string; agentId: string }> };

// POST /api/agents/{id}/agents/{agentId}/chat - one turn with one named agent on the instance,
// over the gateway's own chat endpoint, returned as the OpenAI-style SSE the gateway emits.
//
// This is the direct line the per-agent tabs use. It is deliberately plain: a message in, an
// answer out, and the gateway keeps the conversation under a session derived from the `user`
// field (one per person, per agent, per instance), so follow-ups have context even though this
// route stores nothing. History, files and the thread rail stay with the main chat until
// Agent37's chat API can name an agent.
//
// Two routes to the gateway, same session either way:
//   edge  through an Agent37 signed URL, streamed token by token
//   box   a script run inside the box (docker exec), whole answer at once, when no way through
//         the edge reaches the gateway. Sent as one SSE chunk so the page reads both the same.
// The X-Apollo-Chat-Via header says which one answered.
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { id, agentId } = await params;
  const { supabase, user, row } = await requireAgentAccess(id, "member");
  // Same spend gate as the main chat: a turn here drives model usage billed to the instance.
  await requireEntitled(supabase);

  if (runtimeForTemplate(row.template) !== "OpenClaw") {
    throw new ApiError(400, "invalid_request", "Only an OpenClaw instance can carry more than one agent.");
  }
  // Agent ids are what OpenClaw accepts in agents.entries: short, lowercase, no spaces.
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(agentId)) {
    throw new ApiError(400, "invalid_request", "That is not a valid agent id.");
  }

  const body = await readJson<{ input?: unknown }>(request);
  const input = typeof body.input === "string" ? body.input.trim() : "";
  if (!input) throw new ApiError(400, "invalid_request", "input is required");

  const agent = agentId.toLowerCase();
  const sessionUser = `${id}:${agent}:${user.id}`;
  const sseHeaders = (via: "edge" | "box") => ({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no",
    "X-Apollo-Chat-Via": via,
    Connection: "keep-alive",
  });

  let upstream: Response | null = null;
  try {
    upstream = await gatewayFetch(id, "/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({
        model: `openclaw/${agent}`,
        user: sessionUser,
        stream: true,
        messages: [{ role: "user", content: input }],
      }),
    });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "no_gateway_token") throw new ApiError(502, "no_gateway_token", (e as Error).message);
    if (code !== "no_edge_route") throw new ApiError(502, "upstream_error", (e as Error).message);
    // No way through the edge: ask from inside the box instead.
  }

  if (upstream) {
    if (upstream.ok && upstream.body) {
      return new Response(upstream.body, { status: 200, headers: sseHeaders("edge") });
    }
    const text = await upstream.text().catch(() => "");
    const message = upstreamErrorMessage(text, upstream.status, "agents/chat", "Chat request failed");
    throw new ApiError(upstream.status || 502, "upstream_error", message);
  }

  const answer = await askOnBox(id, { agent, text: input, user: sessionUser, timeoutMs: 240_000 });
  if (!answer) throw new ApiError(502, "upstream_error", "The instance did not answer.");
  if (answer.status !== 200) {
    throw new ApiError(502, "upstream_error", answer.answer || `The gateway answered ${answer.status}.`);
  }
  const chunk = JSON.stringify({ choices: [{ delta: { content: answer.answer }, index: 0 }] });
  return new Response(`data: ${chunk}\n\ndata: [DONE]\n\n`, { status: 200, headers: sseHeaders("box") });
});

// A turn with tool use can run for a while.
export const maxDuration = 300;
