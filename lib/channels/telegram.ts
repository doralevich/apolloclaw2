import "server-only";

// Telegram's Bot API, the four calls a channel needs.
//
// Not to be confused with lib/telegram.ts, which is our own ops notifier posting to David's chat
// with our own bot. This one acts on behalf of a CUSTOMER's bot, with a token they created in
// BotFather and pasted into their dashboard.
//
// Every call is `https://api.telegram.org/bot{token}/{method}` and every response is
// `{ ok, result }` or `{ ok: false, description }`. The token IS the URL here, which is worth
// knowing when reading logs: never log a request URL from this file.

const BASE = "https://api.telegram.org";

class TelegramError extends Error {}

async function callBot<T>(token: string, method: string, body?: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });
  } catch {
    // Telegram unreachable is a different problem from Telegram saying no, and the customer can
    // act on one of them.
    throw new TelegramError("Couldn't reach Telegram. Try again in a moment.");
  }

  const data = (await res.json().catch(() => null)) as
    | { ok: boolean; result?: T; description?: string }
    | null;

  if (!data?.ok) {
    // Telegram's own words are better than ours here — "Unauthorized" tells a customer their
    // token is wrong far more precisely than "connection failed" does.
    throw new TelegramError(data?.description || `Telegram rejected the request (${res.status})`);
  }
  return data.result as T;
}

/** Validates the token and tells us who the bot is. The first call any connect should make. */
export async function getMe(token: string): Promise<{ id: number; username?: string; first_name?: string }> {
  return callBot(token, "getMe");
}

/**
 * Point the bot at a URL. Telegram then POSTs every incoming message there.
 *
 * `secret_token` makes Telegram send an X-Telegram-Bot-Api-Secret-Token header on each delivery,
 * which is the only way the receiver can tell a real delivery from anyone who found the URL — a
 * public port is credential-free by design. Passed through when the caller has one.
 */
export async function setWebhook(
  token: string,
  url: string,
  opts: { secret?: string } = {}
): Promise<boolean> {
  return callBot(token, "setWebhook", {
    url,
    ...(opts.secret ? { secret_token: opts.secret } : {}),
    // Messages only. Without this Telegram sends every update type it has, and the rest are noise
    // the agent would have to ignore.
    allowed_updates: ["message"],
    // A bot that was pointed somewhere else keeps that queue; dropping it stops a backlog of
    // messages from before the connection arriving all at once.
    drop_pending_updates: true,
  });
}

/** Stop delivery. What disconnect calls, and why the token has to be stored to begin with. */
export async function deleteWebhook(token: string): Promise<boolean> {
  return callBot(token, "deleteWebhook", { drop_pending_updates: true });
}

/** What Telegram thinks the current wiring is — the truth to check our stored state against. */
export async function getWebhookInfo(
  token: string
): Promise<{ url: string; pending_update_count?: number; last_error_message?: string }> {
  return callBot(token, "getWebhookInfo");
}

export { TelegramError };
