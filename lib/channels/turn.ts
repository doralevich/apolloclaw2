import "server-only";
import { agent37 } from "@/lib/agent37";
import { DEFAULT_CHAT_MODEL_ID } from "@/config/chat-models";

// Running one turn on the instance, shared by every channel receiver.
//
// This is the part that is identical whichever chat app the message arrived from: text in, an
// answer out, on a session that persists so the conversation continues. Everything channel-
// specific — how the message is authenticated, how the reply is delivered — stays in the route.
//
// EVERY channel turn names the model, the same Sonnet 5 the web composer defaults to. A channel
// has no model picker, so left unspecified it fell to the instance's own default - the metered
// gateway's alias - which is the path that answered Russell "I couldn't finish that one" while
// the web chat (which does name a real model) worked. Naming it makes Sonnet 5 the default for
// everyone, web and chat apps alike, and takes the channels off the alias for good.

export interface TurnResult {
  session_id?: string;
  status?: string;
  output_text?: string;
  error?: { message?: string } | null;
}

// The running-response id out of a 409 session_busy body, so it can be cancelled. The field
// name isn't documented, so a few likely spellings are tried; a miss just means we fall back to
// a fresh session instead of reclaiming the wedged one.
function parseBusyResponseId(text: string): string | null {
  try {
    const body = JSON.parse(text) as { error?: Record<string, unknown> };
    const err = body.error ?? {};
    for (const key of ["response_id", "responseId", "response"]) {
      const v = err[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  } catch {
    // Not JSON, or not the shape we expected. No id to reclaim.
  }
  return null;
}

export async function runTurn(
  agentId: string,
  input: string,
  sessionId: string | null
): Promise<TurnResult> {
  // Prefer Sonnet 5, but not every instance's gateway accepts a vendor model id: the metered
  // OpenClaw build rejects one with 400 "Invalid `model`. Use `openclaw`...". Naming Sonnet 5
  // unconditionally broke exactly those instances (Russell's among them). So ask for Sonnet 5,
  // and if the instance refuses the id, resend WITHOUT a model so it runs its own default - the
  // channel gets the better model where it's available and a working answer everywhere else.
  const attempt = async (sid: string | null) => {
    const send = (withModel: boolean) =>
      agent37.createResponse(agentId, {
        input,
        ...(withModel ? { model: DEFAULT_CHAT_MODEL_ID } : {}),
        ...(sid ? { session_id: sid } : {}),
        stream: false,
      });

    let res = await send(true);
    let text = await res.text();
    if (res.status === 400 && /invalid/i.test(text) && /model/i.test(text)) {
      res = await send(false);
      text = await res.text();
    }
    return { res, text };
  };

  let { res, text } = await attempt(sessionId);

  // A reused channel session can WEDGE. If a turn is cut off with a response still running -
  // the function timeout fires mid-turn, the instance restarts - that session answers every
  // later message with 409 session_busy, forever. This is exactly what took Russell's Telegram
  // bot down: one stuck response, and every message after it got "something went wrong".
  //
  // Recover instead of handing the customer a permanent error. Cancel the stuck response and
  // retry the same session (which keeps the conversation history), and if it still won't run -
  // the cancel failed, or the body carried no id to cancel - abandon the session and start a
  // fresh one. runTurn returns the new session_id and the channel persists it, so the wedge is
  // left behind for good rather than retried on every message.
  if (res.status === 409 && sessionId && text.includes("session_busy")) {
    const busyId = parseBusyResponseId(text);
    if (busyId) {
      await agent37.cancelResponse(agentId, busyId).catch(() => {});
      ({ res, text } = await attempt(sessionId));
    }
    if (res.status === 409) {
      ({ res, text } = await attempt(null));
    }
  }

  if (!res.ok) throw new Error(`agent responded ${res.status}: ${text.slice(0, 200)}`);
  // A non-streaming turn arrives prefixed with the gateway's keep-alive whitespace. Leading
  // whitespace is valid JSON, so this parses unchanged.
  return JSON.parse(text) as TurnResult;
}

/**
 * What to say back, given a turn.
 *
 * A failed turn still returns 200 with status "failed", so this branches on status rather than on
 * HTTP — and it always produces something. Silence in a chat app is indistinguishable from a
 * broken product, and the customer cannot read our logs.
 */
export function answerFrom(result: TurnResult): string {
  if (result.status === "completed" && result.output_text?.trim()) return result.output_text;
  if (result.error?.message) return `Sorry - that didn't work: ${result.error.message}`;
  return "Sorry, I couldn't finish that one. Try again?";
}

/**
 * Why a turn produced no answer, in a few words, or empty string when it completed with text.
 *
 * The 200-but-no-answer case - status not "completed", or completed with empty output, and no
 * error message to explain it - is the one answerFrom papers over: the customer gets "I couldn't
 * finish that one" and our records get nothing. This is what a receiver stores on the channel so
 * the reason survives past the reply, the way the 409 session_busy did. A repeated reason across
 * every message (Russell's case) is then a fact in the row rather than a guess.
 */
export function incompleteReason(result: TurnResult): string {
  if (result.status === "completed" && result.output_text?.trim()) return "";
  if (result.error?.message) return result.error.message;
  return `status=${result.status ?? "unknown"}, no output text`;
}
