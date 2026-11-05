import "server-only";
import { instanceFetch } from "@/lib/agent37";

// Is a freshly built agent ready to chat?
//
// Agent37 reports an instance "running" the moment its container is up. The agent's own chat
// endpoint lives on a separate per-instance host (https://{id}.agent37.app, lib/agent37.ts) that
// Agent37 wires up after that, and for a fresh agent the route lags "running" by anywhere from
// seconds to a couple of minutes. In that window the edge answers "Instance not found" to every
// chat call: the same words the admin fleet page uses for an agent whose instance is gone, which
// is how a demo at /onboard read as "there is no instance" on the first message (David, Nov 5
// 2026). A minute later the same message went through.
//
// So "running" is necessary and this probe is sufficient: the instance host answers /v1/models.
// The build screen waits for it before entering Chat, and the chat route retries through it
// for a young agent instead of surfacing the edge's wording.
//
// "Answers" is read generously. The first version of this insisted on a 200 carrying a model
// list, so any other reply from a live host (a 401 while the gateway finishes its own setup, a
// model list in a different shape) kept the build screen on "Warming up" for the whole six
// minutes it allows. What matters is only that the reply came from the agent's host rather
// than from the edge saying there is no route yet (looksNotReady below).

export async function instanceReady(id: string): Promise<boolean> {
  try {
    const res = await instanceFetch(id, "/v1/models", { signal: AbortSignal.timeout(8_000) });
    if (res.ok) return true;
    const text = await res.text().catch(() => "");
    return !looksNotReady(res.status, text);
  } catch {
    // A network failure on the way to the host is the one case that is not an answer.
    return false;
  }
}

/** How long after its row is created an agent counts as young: a failure in this window is
 *  read as "still starting up" and retried, rather than as the instance being gone. */
export const WARMUP_WINDOW_MS = 15 * 60 * 1000;

export function isWarmingUp(createdAt: string | number | null | undefined): boolean {
  if (createdAt === null || createdAt === undefined) return false;
  const t = typeof createdAt === "number" ? createdAt : Date.parse(createdAt);
  return Number.isFinite(t) && Date.now() - t < WARMUP_WINDOW_MS;
}

/** Does this reply from the instance host say the agent is not reachable yet, as opposed to a
 *  real answer or a real refusal? The edge's wording for a route that does not exist yet
 *  ("Instance not found", not_found), and the gateway-side failures that precede readiness. */
export function looksNotReady(status: number, text: string): boolean {
  if (status === 404 && /instance not found|not_found/i.test(text)) return true;
  if (status === 502 || status === 503 || status === 504) return true;
  return /container_unreachable|No route for|ECONNREFUSED|ECONNRESET|fetch failed/i.test(text);
}

/** The message the chat shows while the agent is still coming up. */
export const STARTING_UP_MESSAGE = "Your agent is still starting up. Give it a minute and send that again.";
