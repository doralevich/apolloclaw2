import "server-only";
import { randomBytes } from "crypto";
import { ApiError } from "@/lib/http";
import { publicSiteOrigin } from "@/lib/site-url";
import * as telegram from "@/lib/channels/telegram";
import * as slack from "@/lib/channels/slack";
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
