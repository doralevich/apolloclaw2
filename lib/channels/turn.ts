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

export async function runTurn(
  agentId: string,
  input: string,
  sessionId: string | null
): Promise<TurnResult> {
  const res = await agent37.createResponse(agentId, {
    input,
    ...(sessionId ? { session_id: sessionId } : {}),
    stream: false,
  });
  const text = await res.text();
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
  if (result.error?.message) return `Sorry — that didn't work: ${result.error.message}`;
  return "Sorry, I couldn't finish that one. Try again?";
}
