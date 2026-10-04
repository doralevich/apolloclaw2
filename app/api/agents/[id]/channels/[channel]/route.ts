import { requireAgentAccess } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { channelDef, isChannelId } from "@/config/channels";
import { PLANS_ON_SALE } from "@/config/agent-plans";
import { getWorkspaceAgentPlan } from "@/lib/agent-plan";
import {
  connectSlack,
  connectTelegram,
  connectWhatsApp,
  disconnectChannel,
} from "@/lib/channels/connect";

type Ctx = { params: Promise<{ id: string; channel: string }> };

// Connect a channel.
//
// The body carries the credentials the channel's form collects. Only the fields that channel
// declares are read, and only strings, so a hand-rolled request can't smuggle extra JSON through
// this route. Credentials reach the provider and the encrypted column; they are never echoed
// back, and the response is the browser-safe Channel view.
export const POST = route(async (request: Request, { params }: Ctx) => {
  const { id, channel } = await params;
  if (!isChannelId(channel)) {
    throw new ApiError(404, "not_found", "Unknown channel");
  }
  const { row } = await requireAgentAccess(id, "member");

  const def = channelDef(channel)!;

  // The plan decides which channels it connects (config/agent-plans.ts): Team has Telegram and
  // Slack, Executive every channel. Legacy customers keep every channel they had.
  const { tier } = await getWorkspaceAgentPlan(row.workspace_id);
  if (tier.id !== "legacy" && !tier.channels.includes(channel)) {
    const needs = PLANS_ON_SALE.find((p) => p.channels.includes(channel));
    throw new ApiError(
      403,
      "plan_channel",
      `${def.name} is not part of your ${tier.label} plan${needs ? `. It comes with ${needs.label}.` : "."}`
    );
  }
  const body = await readJson<{ credentials?: Record<string, unknown> }>(request);
  const supplied = body.credentials ?? {};

  const credentials: Record<string, string> = {};
  for (const field of def.fields) {
    const value = supplied[field.key];
    if (typeof value !== "string" || !value.trim()) {
      // An optional field is allowed to arrive blank or not at all — WhatsApp's Phone Number ID
      // is worked out from the token in the ordinary case, and connectWhatsApp asks for it by
      // name on the one path where it cannot be.
      if (field.optional) continue;
      // Named rather than generic: with three fields on the Telegram card, "a value is required"
      // would leave the customer guessing which one.
      throw new ApiError(400, "invalid_request", `${field.label} is required`);
    }
    credentials[field.key] = value.trim();
  }

  if (channel === "telegram") {
    return json(await connectTelegram(id, { botToken: credentials.botToken }));
  }

  if (channel === "slack") {
    return json(
      await connectSlack(id, {
        botToken: credentials.botToken,
        signingSecret: credentials.signingSecret,
      })
    );
  }

  if (channel === "whatsapp") {
    return json(
      await connectWhatsApp(id, {
        accessToken: credentials.accessToken,
        appId: credentials.appId,
        appSecret: credentials.appSecret,
        phoneNumberId: credentials.phoneNumberId,
      })
    );
  }

  // Unreachable while every channel in CHANNELS is built — the branches above cover all of them.
  // Kept as the backstop for the next channel added to config before its connect path exists, so
  // that gap is a clear 501 rather than a silent success.
  throw new ApiError(
    501,
    "not_implemented",
    `${def.name} isn't connectable yet.`
  );
});

// Stop delivery and forget the credential.
export const DELETE = route(async (_request: Request, { params }: Ctx) => {
  const { id, channel } = await params;
  if (!isChannelId(channel)) {
    throw new ApiError(404, "not_found", "Unknown channel");
  }
  await requireAgentAccess(id, "member");
  await disconnectChannel(id, channel);
  return json({ channel, deleted: true });
});
