import { after } from "next/server";
import { timingSafeEqual } from "crypto";
import { agent37 } from "@/lib/agent37";
import * as telegram from "@/lib/channels/telegram";
import { getTelegramConfig, upsertChannel } from "@/lib/channels/store";

type Ctx = { params: Promise<{ agentId: string }> };

// Telegram delivers here. One agent per URL.
//
// This is the whole channel: Telegram POSTs an update, we run a turn on the instance, and we
// send the answer back. Nothing runs on the instance to make this work, which is the point — the
// agents we sell run OpenClaw, which has no webhook receiver of its own.
//
// PUBLIC BY NECESSITY. Telegram will not attach a credential, and this path is outside the
// proxy's auth matcher on purpose. Three things stand in for authentication:
//
//   1. The `secret_token` Telegram echoes in X-Telegram-Bot-Api-Secret-Token, compared in
//      constant time against the one generated at connect. Anyone can POST here; only Telegram
//      knows this.
//   2. The agent id in the URL has to name a channel that exists.
//   3. The first message binds an owner, and every later message from anyone else is dropped.
//
// Telegram is answered IMMEDIATELY and the turn runs in `after`. Telegram retries a delivery it
// considers failed, and an agent turn takes far longer than it is willing to wait — without this
// a slow answer becomes three copies of the same question.

// An agent turn is not a web request. Vercel caps this by plan; the work is in `after`, so the
// worst case of a lower cap is a truncated turn rather than a duplicated one.
export const maxDuration = 300;

function secretMatches(sent: string | null, expected: string | null): boolean {
  if (!expected) return false;
  if (!sent) return false;
  const a = Buffer.from(sent);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, which is itself a leak of length — check it
  // first and return the same false either way.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Pull the parts we care about out of a Telegram update. Anything else is ignored. */
function readUpdate(body: unknown): { chatId: string; text: string } | null {
  const message = (body as { message?: Record<string, unknown> } | null)?.message;
  if (!message) return null;
  const chat = message.chat as { id?: number | string } | undefined;
  const text = message.text;
  if (!chat?.id || typeof text !== "string" || !text.trim()) return null;
  return { chatId: String(chat.id), text: text.trim() };
}

/** Run one turn on the instance and return its answer. */
async function runTurn(agentId: string, input: string, sessionId: string | null) {
  const res = await agent37.createResponse(agentId, {
    input,
    ...(sessionId ? { session_id: sessionId } : {}),
    stream: false,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`agent responded ${res.status}: ${text.slice(0, 200)}`);
  // A non-streaming turn arrives prefixed with the gateway's keep-alive whitespace. Leading
  // whitespace is valid JSON, so this parses unchanged.
  return JSON.parse(text) as {
    session_id?: string;
    status?: string;
    output_text?: string;
    error?: { message?: string } | null;
  };
}

export async function POST(request: Request, { params }: Ctx) {
  const { agentId } = await params;

  // Everything below answers 200 regardless. Telegram treats a non-2xx as a failed delivery and
  // retries it, and there is nothing here worth retrying — a wrong secret stays wrong.
  const ok = () => new Response("ok", { status: 200 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ok();
  }

  const config = await getTelegramConfig(agentId).catch(() => null);
  if (!config) return ok();

  if (!secretMatches(request.headers.get("x-telegram-bot-api-secret-token"), config.secret)) {
    console.warn("[channels:telegram] rejected delivery with bad secret", { agentId });
    return ok();
  }

  const update = readUpdate(body);
  if (!update) return ok();

  // First message binds the owner. After that this agent answers one person and nobody else,
  // which is what the card promises. A bot added to a group, or found by a stranger, gets
  // silence rather than someone else's assistant.
  if (config.ownerChatId && config.ownerChatId !== update.chatId) {
    return ok();
  }

  after(async () => {
    try {
      if (!config.ownerChatId) {
        await upsertChannel(agentId, "telegram", {
          ownerChatId: update.chatId,
          state: "connected",
          message: null,
        });
      }

      await telegram.sendTyping(config.token, update.chatId);

      const result = await runTurn(agentId, update.text, config.sessionId);

      // Remember the session so the next message continues the same conversation instead of
      // starting a fresh one that knows nothing about the last.
      if (result.session_id && result.session_id !== config.sessionId) {
        await upsertChannel(agentId, "telegram", {
          sessionId: result.session_id,
          state: "connected",
          message: null,
        });
      }

      // A failed turn still returns 200 with status: "failed" — branch on status, not on HTTP.
      const answer =
        result.status === "completed" && result.output_text?.trim()
          ? result.output_text
          : result.error?.message
            ? `Sorry — that didn't work: ${result.error.message}`
            : "Sorry, I couldn't finish that one. Try again?";

      await telegram.sendMessage(config.token, update.chatId, answer);
    } catch (e) {
      const message = (e as Error).message;
      console.error("[channels:telegram] turn failed", { agentId, message });
      // Say something rather than going quiet. Silence from a chat app is indistinguishable from
      // a broken product, and the customer can't see our logs.
      await telegram
        .sendMessage(config.token, update.chatId, "Sorry — something went wrong on my end.")
        .catch(() => {});
      await upsertChannel(agentId, "telegram", { state: "error", message }).catch(() => {});
    }
  });

  return ok();
}
