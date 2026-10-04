import { requireAgentAccess, requireEntitled } from "@/lib/auth";
import { gatewayFetch } from "@/lib/gateway-chat";
import { ApiError, readJson, route, upstreamErrorMessage } from "@/lib/http";
import { runtimeForTemplate } from "@/config/agents";

type Ctx = { params: Promise<{ id: string; agentId: string }> };

// POST /api/agents/{id}/agents/{agentId}/chat - one turn with one named agent on the instance,
// over the gateway's own chat endpoint, streamed back as the OpenAI-style SSE the gateway emits.
//
// This is the direct line the per-agent tabs use. It is deliberately plain: a message in, a
// streamed answer out, and the gateway keeps the conversation under a session derived from the
// `user` field (one per person, per agent, per instance), so follow-ups have context even though
// this route stores nothing. History, files and the thread rail stay with the main chat until
// Agent37's chat API can name an agent.
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

  let upstream: Response;
  try {
    upstream = await gatewayFetch(id, "/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({
        model: `openclaw/${agentId.toLowerCase()}`,
        user: `${id}:${agentId.toLowerCase()}:${user.id}`,
        stream: true,
        messages: [{ role: "user", content: input }],
      }),
    });
  } catch (e) {
    const code = (e as { code?: string }).code;
    throw new ApiError(502, code === "no_gateway_token" ? "no_gateway_token" : "upstream_error", (e as Error).message);
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    const message = upstreamErrorMessage(text, upstream.status, "agents/chat", "Chat request failed");
    throw new ApiError(upstream.status || 502, "upstream_error", message);
  }

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

// A turn with tool use can run for a while.
export const maxDuration = 300;
