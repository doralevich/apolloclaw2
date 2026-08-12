import "server-only";
import { agent37 } from "@/lib/agent37";

// Running one turn on the instance, shared by every channel receiver.
//
// This is the part that is identical whichever chat app the message arrived from: text in, an
// answer out, on a session that persists so the conversation continues. Everything channel-
// specific — how the message is authenticated, how the reply is delivered — stays in the route.

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
  const attempt = async (sid: string | null) => {
    const res = await agent37.createResponse(agentId, {
      input,
      ...(sid ? { session_id: sid } : {}),
      stream: false,
    });
    return { res, text: await res.text() };
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
