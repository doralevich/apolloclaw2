import { after } from "next/server";
import { requireAgentAccess, requireEntitled } from "@/lib/auth";
import { appendMessage, createThread, getThread } from "@/lib/agent-threads";
import { recordAnswer } from "@/lib/sse-record";
import { askOnBox, gatewayFetch } from "@/lib/gateway-chat";
import { ApiError, readJson, route, upstreamErrorMessage } from "@/lib/http";
import { runtimeForTemplate } from "@/config/agents";

type Ctx = { params: Promise<{ id: string; agentId: string }> };

// POST /api/agents/{id}/agents/{agentId}/chat - one turn with one named agent on the instance,
// over the gateway's own chat endpoint, returned as the OpenAI-style SSE the gateway emits.
//
// This is the direct line the sidebar's agents use on an instance with more than one. A message
// in, an answer out, and each turn saved to a thread (lib/agent-threads.ts) so the conversation
// shows in the Chats list and reopens later. The gateway keeps the model's context under a session
// derived from the `user` field (one per person, per agent, per thread), so a reopened thread
// carries on where it stopped.
//
// `threadId` continues a conversation; without one this starts a fresh one, and the id comes back
// in X-Apollo-Thread-Id. The thread is saved only once the agent has answered, so a first message
// that fails leaves nothing behind in the list. Saving is best effort throughout: a database that
// cannot be reached means an unsaved conversation, never a refused one.
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

  const body = await readJson<{ input?: unknown; threadId?: unknown }>(request);
  const input = typeof body.input === "string" ? body.input.trim() : "";
  if (!input) throw new ApiError(400, "invalid_request", "input is required");

  const agent = agentId.toLowerCase();
  // An existing thread must be this person's, on this instance, with this agent.
  const asked = typeof body.threadId === "string" && body.threadId ? body.threadId : null;
  if (asked) {
    const found = await getThread(id, user.id, asked);
    if (!found || found.agent_key !== agent) throw new ApiError(404, "not_found", "That conversation is not here.");
  }
  const threadId = asked ?? crypto.randomUUID();
  const sessionUser = `${id}:${agent}:${user.id}:${threadId}`;

  // Save the question once the agent is answering: the thread row first for a fresh one, then
  // the message. True when the thread exists to save into.
  const saveQuestion = async (): Promise<boolean> => {
    if (!asked && !(await createThread(threadId, id, user.id, agent, input))) return false;
    await appendMessage(threadId, "user", input);
    return true;
  };

  // Whether this turn landed in a saved thread; the response names the thread only then.
  let saved = false;
  const sseHeaders = (via: "edge" | "box") => ({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no",
    "X-Apollo-Chat-Via": via,
    Connection: "keep-alive",
    ...(saved ? { "X-Apollo-Thread-Id": threadId } : {}),
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
      saved = await saveQuestion();
      if (!saved) return new Response(upstream.body, { status: 200, headers: sseHeaders("edge") });
      // Keep the function alive until the answer is saved, however the stream ends.
      let answered!: () => void;
      const done = new Promise<void>((resolve) => (answered = resolve));
      after(() => done);
      const stream = recordAnswer(upstream.body, async (text) => {
        try {
          await appendMessage(threadId, "assistant", text);
        } finally {
          answered();
        }
      });
      return new Response(stream, { status: 200, headers: sseHeaders("edge") });
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
  saved = await saveQuestion();
  if (saved) await appendMessage(threadId, "assistant", answer.answer);
  const chunk = JSON.stringify({ choices: [{ delta: { content: answer.answer }, index: 0 }] });
  return new Response(`data: ${chunk}\n\ndata: [DONE]\n\n`, { status: 200, headers: sseHeaders("box") });
});

// A turn with tool use can run for a while.
export const maxDuration = 300;
