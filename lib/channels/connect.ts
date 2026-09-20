import "server-only";
import { randomBytes } from "crypto";
import { ApiError } from "@/lib/http";
import { publicSiteOrigin } from "@/lib/site-url";
import * as telegram from "@/lib/channels/telegram";
import * as slack from "@/lib/channels/slack";
import * as whatsapp from "@/lib/channels/whatsapp";
import { deleteChannel, getChannelToken, toChannel, upsertChannel } from "@/lib/channels/store";
import type { Channel, ChannelId } from "@/lib/types";

// Connecting and disconnecting a channel.
//
// THE SHAPE, AND WHY IT CHANGED. The first version pointed Telegram at a Hermes webhook
// subscription running on the instance, because that is the only inbound path Agent37 documents.
// It was built for the wrong runtime: the Apollo Agent provisions agent37-openclaw
// (config/agent-types.ts), and an OpenClaw box has no Hermes, nothing listening on 8644, and no
// dashboard on 9119 to create a subscription in.
//
// So Telegram delivers HERE instead — /api/channels/telegram/{agentId} — and that route runs a
// turn on the instance and sends the reply back. Both ends are ours, which removes every loose
// end the old design had: no public port to open, no subscription for the customer to create by
// hand, and no unproven handshake between two authentication schemes. The customer pastes a bot
// token and that is the whole setup.

/** Where Telegram posts updates for one agent. Absolute, because Telegram needs a real URL. */
export function telegramWebhookUrl(agentId: string): string {
  return `${publicSiteOrigin()}/api/channels/telegram/${encodeURIComponent(agentId)}`;
}

/**
 * Connect Telegram: validate the token, register our webhook, remember the credential.
 *
 * The URL is public and guessable — it has an agent id in it — so it is the `secret_token` that
 * actually protects the endpoint. Telegram echoes it on every delivery in a header, and the
 * receiver rejects anything without it. 32 random bytes, generated here and never shown to
 * anyone, including the customer.
 */
export async function connectTelegram(
  agentId: string,
  credentials: { botToken: string }
): Promise<Channel> {
  const { botToken } = credentials;

  // Validate first, so a typo'd token fails before anything is stored or registered.
  let me: { username?: string; first_name?: string };
  try {
    me = await telegram.getMe(botToken);
  } catch (e) {
    throw new ApiError(400, "invalid_token", (e as Error).message);
  }

  const secret = randomBytes(32).toString("hex");
  const url = telegramWebhookUrl(agentId);

  try {
    await telegram.setWebhook(botToken, url, { secret });
  } catch (e) {
    throw new ApiError(400, "webhook_failed", (e as Error).message);
  }

  const account = me.username ? `@${me.username}` : me.first_name || "Telegram bot";
  const row = await upsertChannel(agentId, "telegram", {
    botToken,
    secret,
    account,
    // Cleared on every fresh connect: reconnecting with a different bot must not inherit the
    // previous one's owner or its conversation.
    ownerChatId: null,
    sessionId: null,
    state: "connected",
    message: null,
  });
  return toChannel(row);
}

/**
 * Connect Slack: validate the bot token, store it with the signing secret.
 *
 * Nothing is registered with Slack here, and that is the asymmetry with Telegram. Slack has no
 * "point yourself at this URL" API — the customer pastes the Request URL into Event Subscriptions
 * themselves, and Slack verifies it on the spot with a challenge the receiver answers. So this
 * call is only the credential half; the card shows the URL for the other half.
 *
 * The signing secret goes in the same column Telegram's secret_token uses. Both are the thing
 * that authenticates an inbound delivery — one we generate, one the customer pastes.
 */
export async function connectSlack(
  agentId: string,
  credentials: { botToken: string; signingSecret: string }
): Promise<Channel> {
  const { botToken, signingSecret } = credentials;

  let me: { team?: string; user?: string };
  try {
    me = await slack.authTest(botToken);
  } catch (e) {
    throw new ApiError(400, "invalid_token", (e as Error).message);
  }

  const account = me.team && me.user ? `${me.user} in ${me.team}` : me.user || "Slack app";
  const row = await upsertChannel(agentId, "slack", {
    botToken,
    secret: signingSecret,
    account,
    ownerChatId: null,
    sessionId: null,
    state: "connected",
    message: null,
  });
  return toChannel(row);
}

/** Where Meta posts messages for one agent. Absolute, because Meta needs a real URL. */
export function whatsappWebhookUrl(agentId: string): string {
  return `${publicSiteOrigin()}/api/channels/whatsapp/${encodeURIComponent(agentId)}`;
}

/** How a discovered number is written on screen. */
function describeNumber(n: { display_phone_number?: string; verified_name?: string }): string {
  return n.display_phone_number
    ? `${n.display_phone_number}${n.verified_name ? ` (${n.verified_name})` : ""}`
    : "WhatsApp business number";
}

/**
 * Connect WhatsApp, through Meta's Cloud API.
 *
 * WHAT CHANGED, AND WHY IT IS WORTH THE EXTRA CODE. This used to be the Slack shape: validate a
 * credential, store it, and leave the customer to go back into Meta and paste a callback URL, a
 * verify token, and tick a field. Seven steps, the last three of them after the part that feels
 * like finishing, in a developer console. It was the longest setup in the product by a distance.
 *
 * The comment that justified it said Meta has no "deliver to this URL" API. That was wrong, and
 * checking it is the whole of this change: /{app-id}/subscriptions sets the callback, and
 * /{waba-id}/subscribed_apps turns delivery on. So we do it, and those three steps are gone.
 *
 * The Phone Number ID goes too. debug_token names the WABAs the pasted token can reach, and each
 * WABA lists its numbers, so in the ordinary case — one app, one number — there is nothing to
 * copy. It stays as an OPTIONAL field for the case discovery cannot resolve on its own: more than
 * one number on the app, where guessing would silently point the agent at the wrong line.
 *
 * NOTHING HERE IS TRUSTED TO WORK. Meta's docs are unreachable from where this was written (see
 * lib/channels/whatsapp.ts), and a customer's token may simply lack the management permission. So
 * every automated call is best-effort: if any of it fails the credential is still stored, the row
 * carries the reason, and the card falls back to showing the URL and the verify token to paste by
 * hand. The worst case is the setup we had before, with an explanation attached.
 */
export async function connectWhatsApp(
  agentId: string,
  credentials: {
    accessToken: string;
    appId: string;
    appSecret: string;
    /** Only needed when the app has more than one number on it. */
    phoneNumberId?: string;
  }
): Promise<Channel> {
  const { accessToken, appId, appSecret } = credentials;
  const askedFor = credentials.phoneNumberId?.trim() || null;

  // ── Work out which number the agent answers on ────────────────────────────────────────────
  let picked: { id: string; account: string; wabaId: string | null } | null = null;
  // Set when discovery could not run. Not fatal on its own: a customer who pasted a Phone Number
  // ID can still be connected the old way, just without the automatic half.
  let autoFailed: string | null = null;

  try {
    const wabaIds = await whatsapp.wabaIdsForToken({ token: accessToken, appId, appSecret });

    const found: Array<whatsapp.DiscoveredNumber & { wabaId: string }> = [];
    for (const wabaId of wabaIds) {
      for (const n of await whatsapp.listPhoneNumbers(wabaId, accessToken)) {
        found.push({ ...n, wabaId });
      }
    }

    if (askedFor) {
      const match = found.find((n) => n.id === askedFor);
      // Not an error if it is missing — the token may only carry messaging permission, which
      // lists nothing. Falls through to validating the id directly below.
      if (match) picked = { id: match.id, account: describeNumber(match), wabaId: match.wabaId };
    } else if (found.length === 1) {
      picked = { id: found[0].id, account: describeNumber(found[0]), wabaId: found[0].wabaId };
    } else if (found.length === 0) {
      throw new ApiError(
        400,
        "no_number",
        "This app has no WhatsApp number on it yet. Add one under WhatsApp → API Setup in Meta, then connect again."
      );
    } else {
      // Guessing here would point the agent at the wrong line and look like it worked, so it
      // asks — and names them, because the ids are not something anyone knows by heart.
      throw new ApiError(
        400,
        "many_numbers",
        `This app has ${found.length} WhatsApp numbers on it. Paste the ID of the one the agent should answer on into the last field: ${found
          .map((n) => `${describeNumber(n)} — ${n.id}`)
          .join(", ")}`
      );
    }
  } catch (e) {
    // A question for the customer is not a failure to work around.
    if (e instanceof ApiError) throw e;
    autoFailed = (e as Error).message;
  }

  if (!picked) {
    if (!askedFor) {
      throw new ApiError(
        400,
        "invalid_token",
        autoFailed ?? "Couldn't read this app's WhatsApp numbers with that token."
      );
    }
    // The old path: trust the pasted id, and validate it against the token so a typo fails here
    // rather than at the first message.
    try {
      const number = await whatsapp.getPhoneNumber(askedFor, accessToken);
      picked = { id: askedFor, account: describeNumber(number), wabaId: null };
    } catch (e) {
      throw new ApiError(400, "invalid_token", (e as Error).message);
    }
  }

  // ── Store, THEN register ──────────────────────────────────────────────────────────────────
  //
  // This order is load-bearing. Meta verifies the callback the instant the subscription is
  // created, by GETting it with the verify token and expecting the challenge echoed back — and
  // the receiver reads that token from this row. Register first and Meta rejects its own
  // subscription, with an error that reads exactly like a bad app secret.
  const verifyToken = randomBytes(24).toString("hex");
  await upsertChannel(agentId, "whatsapp", {
    botToken: accessToken,
    secret: appSecret,
    externalId: picked.id,
    verifyToken,
    account: picked.account,
    ownerChatId: null,
    sessionId: null,
    state: "connected",
    message: null,
  });

  if (!autoFailed) {
    try {
      await whatsapp.setAppCallbackUrl({
        appId,
        appSecret,
        callbackUrl: whatsappWebhookUrl(agentId),
        verifyToken,
      });
      if (picked.wabaId) {
        await whatsapp.subscribeAppToWaba(picked.wabaId, accessToken);
      } else {
        autoFailed = "We couldn't tell which WhatsApp Business Account this number belongs to.";
      }
    } catch (e) {
      autoFailed = (e as Error).message;
    }
  }

  const row = await upsertChannel(
    agentId,
    "whatsapp",
    autoFailed
      ? {
          // "error" rather than "connected", because it is the truth: the credential is good and
          // nothing will be delivered to it. The card shows this sentence and the two values to
          // paste, which together are the setup we shipped before this change.
          state: "error",
          message: `Almost there - the credentials work, but WhatsApp isn't delivering yet: ${autoFailed} Finish it by hand with the two values below, or regenerate the token with the whatsapp_business_management permission and connect again.`,
        }
      : { state: "connected", message: null }
  );
  return toChannel(row);
}

/**
 * Disconnect: stop delivery, then forget the credential.
 *
 * The Telegram call is best-effort. If the token was already revoked in BotFather, Telegram
 * refuses and there is nothing left to undo anyway — failing here would leave a row the customer
 * cannot get rid of, which is worse than a webhook pointed at a bot that no longer exists.
 *
 * Slack has no branch here on purpose: nothing was ever registered with Slack, so there is nothing
 * to undo. Deleting the row is enough — the receiver stops recognising deliveries the moment the
 * signing secret is gone.
 */
export async function disconnectChannel(agentId: string, channel: ChannelId): Promise<void> {
  if (channel === "telegram") {
    const token = await getChannelToken(agentId, channel);
    if (token) {
      try {
        await telegram.deleteWebhook(token);
      } catch (e) {
        console.warn("[channels] telegram deleteWebhook failed:", (e as Error).message);
      }
    }
  }
  await deleteChannel(agentId, channel);
}

/**
 * Re-check a connected Telegram against what Telegram itself believes.
 *
 * Our row says "connected" because a setWebhook succeeded once. Telegram knows whether
 * deliveries are actually landing, and `last_error_message` is where a failing endpoint shows
 * up — a deploy that changed the site URL, say, which would otherwise be invisible until someone
 * noticed their agent had gone quiet.
 */
export async function refreshTelegram(agentId: string): Promise<Channel | null> {
  const token = await getChannelToken(agentId, "telegram");
  if (!token) return null;

  try {
    const info = await telegram.getWebhookInfo(token);
    if (!info.url) {
      const row = await upsertChannel(agentId, "telegram", {
        state: "error",
        message: "Telegram isn't delivering to this agent any more. Reconnect to fix it.",
      });
      return toChannel(row);
    }
    const row = await upsertChannel(agentId, "telegram", {
      state: info.last_error_message ? "error" : "connected",
      message: info.last_error_message
        ? `Telegram's last delivery failed: ${info.last_error_message}`
        : null,
    });
    return toChannel(row);
  } catch (e) {
    // Telegram being unreachable says nothing about whether the channel is set up, so the stored
    // state stands rather than being downgraded on a network blip.
    console.warn("[channels] telegram getWebhookInfo failed:", (e as Error).message);
    return null;
  }
}
