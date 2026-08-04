import "server-only";
import { agent37, Agent37Error } from "@/lib/agent37";
import { ApiError } from "@/lib/http";
import * as telegram from "@/lib/channels/telegram";
import { deleteChannel, getChannelToken, upsertChannel } from "@/lib/channels/store";
import type { Channel, ChannelId } from "@/lib/types";
import { toChannel } from "@/lib/channels/store";

// Connecting and disconnecting a channel for real.
//
// The shape of it, per Agent37's docs: Hermes receives webhooks on port 8644, that port gets a
// permanent credential-free URL via a public port, and the provider is told to deliver there.
// Nothing about this is an Agent37 "channels" feature — there isn't one — it's public ports plus
// each provider's own API.

// Hermes's webhook receiver. Not configurable: it's where Hermes listens.
const HERMES_WEBHOOK_PORT = 8644;
// Readable and stable across delete/re-create, which matters because the URL is registered with
// Telegram and we'd rather not re-register it every time something is rebuilt. Guessable by
// design — reachability isn't the security boundary here, the signature is.
const PUBLIC_PORT_PREFIX = "webhooks";

/**
 * The instance's public webhook origin, creating it if this is the first channel.
 *
 * Creating a second entry for a port that already has one is a 409, which is not an error from
 * where we stand — it means somebody already did this — so that path reads the existing entry
 * instead of failing.
 */
async function ensureWebhookOrigin(agentId: string): Promise<string> {
  try {
    const created = await agent37.createPublicPort(agentId, {
      port: HERMES_WEBHOOK_PORT,
      prefix: PUBLIC_PORT_PREFIX,
    });
    return created.url;
  } catch (e) {
    if (e instanceof Agent37Error && e.status === 409) {
      const { data } = await agent37.listPublicPorts(agentId);
      const existing = data?.find((p) => p.port === HERMES_WEBHOOK_PORT);
      if (existing?.url) return existing.url;
    }
    throw e;
  }
}

/**
 * Connect Telegram.
 *
 * The customer supplies three things, all of which they created themselves: a bot token from
 * BotFather, and the name and signing secret of a Hermes webhook subscription. The subscription
 * is theirs to create because Hermes only offers it through its own dashboard on port 9119 —
 * there is no API for it, so there is nothing here to automate it with.
 *
 * ⚠️ THE ONE UNPROVEN LINK. Telegram authenticates its deliveries with a `secret_token` it echoes
 * in an `X-Telegram-Bot-Api-Secret-Token` header. Hermes authenticates deliveries with its own
 * subscription signature. Those are not obviously the same scheme, and if Hermes wants an HMAC
 * over the body rather than a shared secret in a header, it will reject everything Telegram
 * sends. Passing the Hermes secret as Telegram's secret_token is the closest the two APIs get
 * without something in the middle to translate. Whether it's enough can only be settled by
 * sending a real message — see the note in the PR.
 */
export async function connectTelegram(
  agentId: string,
  credentials: { botToken: string; subscription: string; signingSecret: string }
): Promise<Channel> {
  const { botToken, subscription, signingSecret } = credentials;

  // Validate the token first. A bad token should fail before we've created any infrastructure,
  // and getMe is the cheapest possible way to find out.
  let me: { username?: string; first_name?: string };
  try {
    me = await telegram.getMe(botToken);
  } catch (e) {
    throw new ApiError(400, "invalid_token", (e as Error).message);
  }

  const origin = await ensureWebhookOrigin(agentId);
  // Hermes serves each subscription at /webhooks/<name>; the docs are explicit that this path is
  // Hermes's and only the origin is ours to replace.
  const url = `${origin.replace(/\/$/, "")}/webhooks/${encodeURIComponent(subscription)}`;

  try {
    await telegram.setWebhook(botToken, url, { secret: signingSecret });
  } catch (e) {
    throw new ApiError(400, "webhook_failed", (e as Error).message);
  }

  const account = me.username ? `@${me.username}` : me.first_name || "Telegram bot";
  const row = await upsertChannel(agentId, "telegram", {
    botToken,
    account,
    subscription,
    webhookUrl: url,
    state: "connected",
    message: null,
  });
  return toChannel(row);
}

/**
 * Disconnect a channel: tell the provider to stop delivering, then forget the credential.
 *
 * The provider call is best-effort. If the token has already been revoked in BotFather, Telegram
 * refuses and there is nothing to undo anyway — failing the disconnect there would leave a row
 * the customer cannot get rid of, which is worse than a webhook pointed at a dead subscription.
 *
 * The public port is deliberately left alone. It is per-instance rather than per-channel, so
 * deleting it on one disconnect would break every other channel on the same instance.
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
 * Our row says "connected" because a setWebhook succeeded once. Telegram knows whether deliveries
 * are actually landing, and `last_error_message` is where a rejected delivery shows up — which is
 * exactly where the unproven link above would surface if it turns out Hermes refuses them.
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
