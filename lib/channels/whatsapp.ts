import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

// WhatsApp, through Meta's Cloud API.
//
// NOT DEVICE LINKING. The card used to promise Settings → Linked devices — scan a code and the
// agent answers on your own personal WhatsApp. That needs a process holding a socket open per
// customer, which Vercel cannot do, and it leans on unofficial libraries Meta bans accounts for
// using. The Cloud API is Meta's own, it delivers over a webhook like everything else here, and
// the trade is honest: this is a dedicated business number for the agent, not the customer's
// personal WhatsApp. David's call, made with that trade in front of him.

const GRAPH = "https://graph.facebook.com/v21.0";

class WhatsAppError extends Error {}

/**
 * Meta returns errors as { error: { message, type, code } } with a 4xx. The message is usually
 * written for a developer rather than a customer, but it is specific, and specific beats a
 * sentence we invented.
 */
async function graph<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${GRAPH}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new WhatsAppError("Couldn't reach WhatsApp. Try again in a moment.");
  }

  const data = (await res.json().catch(() => null)) as
    | ({ error?: { message?: string } } & T)
    | null;

  if (!res.ok || data?.error) {
    throw new WhatsAppError(
      data?.error?.message || `WhatsApp rejected the request (${res.status})`
    );
  }
  return data as T;
}

/**
 * Validates the token and the phone number id together, and tells us which number this is.
 *
 * Both have to be right for anything to work, and they fail in different ways — a bad token is a
 * 401, a phone number id from a different app is a 404. One call catches both at connect time
 * rather than at the first message.
 */
export async function getPhoneNumber(
  phoneNumberId: string,
  token: string
): Promise<{ display_phone_number?: string; verified_name?: string }> {
  return graph(
    `/${encodeURIComponent(phoneNumberId)}?fields=display_phone_number,verified_name`,
    token
  );
}

// ── Setting the channel up FOR the customer ───────────────────────────────────────────────────
//
// Everything below exists to delete steps from config/channels.ts. The setup used to end with
// "go back into Meta, paste this Callback URL, paste this Verify token, then tick the messages
// field" — a round trip into a developer console, after the part that felt like finishing. The
// comment above connectWhatsApp said Meta has no "deliver to this URL" API, the way Slack hasn't.
//
// That was wrong. Meta has two, and between them they do the whole job:
//   POST /{app-id}/subscriptions      sets the callback URL and the fields, app-wide
//   POST /{waba-id}/subscribed_apps   points one WhatsApp Business Account at that app
//
// NOT VERIFIED AGAINST META'S OWN DOCS. developers.facebook.com is blocked from the environment
// this was written in, so the endpoints and their response shapes come from secondary sources.
// That is why none of this is trusted to work: every call below is wrapped by the caller, and a
// failure falls back to the manual paste rather than breaking the connect. If Meta's shapes turn
// out to differ, the customer sees the old instructions and nothing is lost.

/** Meta accepts "{app-id}|{app-secret}" anywhere an app access token is wanted, which saves a
 *  round trip to /oauth/access_token for a value we can concatenate. */
function appAccessToken(appId: string, appSecret: string): string {
  return `${appId}|${appSecret}`;
}

export type DiscoveredNumber = {
  id: string;
  display_phone_number?: string;
  verified_name?: string;
};

/**
 * Which WhatsApp Business Accounts this token is allowed to act on.
 *
 * A system user token carries its WABAs in `granular_scopes` rather than anywhere obvious:
 * each entry is a permission plus the `target_ids` it was granted over. Reading them is what
 * lets the customer skip copying a Phone Number ID out of Meta's console by hand — we can ask
 * Meta which numbers the token they just pasted can actually reach.
 *
 * Debugged under the APP token, not the token being debugged. A token can describe itself, but
 * Meta is stricter about which caller may see granular scopes, and the app that minted it always
 * may.
 */
export async function wabaIdsForToken(opts: {
  token: string;
  appId: string;
  appSecret: string;
}): Promise<string[]> {
  const data = await graph<{
    data?: { granular_scopes?: Array<{ scope?: string; target_ids?: string[] }> };
  }>(
    `/debug_token?input_token=${encodeURIComponent(opts.token)}`,
    appAccessToken(opts.appId, opts.appSecret)
  );

  const ids = new Set<string>();
  for (const scope of data.data?.granular_scopes ?? []) {
    if (
      scope.scope === "whatsapp_business_messaging" ||
      scope.scope === "whatsapp_business_management"
    ) {
      for (const id of scope.target_ids ?? []) ids.add(id);
    }
  }
  return [...ids];
}

/** The numbers on one WhatsApp Business Account, with the ids replies get addressed through. */
export async function listPhoneNumbers(
  wabaId: string,
  token: string
): Promise<DiscoveredNumber[]> {
  const data = await graph<{ data?: DiscoveredNumber[] }>(
    `/${encodeURIComponent(wabaId)}/phone_numbers?fields=id,display_phone_number,verified_name`,
    token
  );
  return (data.data ?? []).filter((n) => typeof n?.id === "string" && n.id.length > 0);
}

/**
 * Point the customer's Meta app at our receiver.
 *
 * Meta verifies the URL the moment this is called: it GETs the callback with hub.verify_token
 * and expects hub.challenge echoed back. So the verify token MUST already be stored against the
 * agent before this runs — see the ordering note in connectWhatsApp. Get that backwards and Meta
 * rejects its own subscription, which looks exactly like a bad app secret.
 *
 * Form-encoded rather than JSON: this endpoint is one of the older ones and is documented with
 * query parameters, so it is sent the way it is documented.
 */
export async function setAppCallbackUrl(opts: {
  appId: string;
  appSecret: string;
  callbackUrl: string;
  verifyToken: string;
}): Promise<void> {
  const body = new URLSearchParams({
    object: "whatsapp_business_account",
    callback_url: opts.callbackUrl,
    verify_token: opts.verifyToken,
    fields: "messages",
  });

  await graph(
    `/${encodeURIComponent(opts.appId)}/subscriptions`,
    appAccessToken(opts.appId, opts.appSecret),
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }
  );
}

/**
 * Subscribe the app to one WABA's webhooks — the "tick the messages field" step, done for them.
 *
 * Needs whatsapp_business_management on the token, which is why the instructions now ask for two
 * permissions where they used to ask for one. A token with only whatsapp_business_messaging can
 * send perfectly well and will fail here, so this is the call most likely to drop a customer onto
 * the manual fallback.
 */
export async function subscribeAppToWaba(wabaId: string, token: string): Promise<void> {
  await graph(`/${encodeURIComponent(wabaId)}/subscribed_apps`, token, { method: "POST" });
}

/**
 * Send the agent's answer back.
 *
 * Free-form text is only allowed inside 24 hours of the customer's last message — outside that
 * window Meta requires a pre-approved template. Every send here is a reply to a message that just
 * arrived, so we are always inside the window. Worth knowing before anyone adds a "notify me
 * later" feature on top of this.
 */
export async function sendMessage(
  phoneNumberId: string,
  token: string,
  to: string,
  text: string
): Promise<void> {
  // Meta's limit is 4096 characters for a text body.
  const chunks = text.match(/[\s\S]{1,3900}/g) ?? [];
  for (const chunk of chunks) {
    await graph(`/${encodeURIComponent(phoneNumberId)}/messages`, token, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: chunk },
      }),
    });
  }
}

/**
 * Is this delivery really from Meta?
 *
 * X-Hub-Signature-256 is `sha256=` plus an HMAC of the RAW body under the app secret. As with
 * Slack, the bytes have to be the ones received — parse after verifying, never before.
 */
export function verifySignature(opts: {
  appSecret: string;
  signature: string | null;
  rawBody: string;
}): boolean {
  const { appSecret, signature, rawBody } = opts;
  if (!signature) return false;

  const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export { WhatsAppError };
