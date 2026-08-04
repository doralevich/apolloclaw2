import { requireAgentAccess } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { channelDef, isChannelId } from "@/config/channels";
import { connectTelegram, disconnectChannel } from "@/lib/channels/connect";

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
  await requireAgentAccess(id, "member");

  const def = channelDef(channel)!;
  const body = await readJson<{ credentials?: Record<string, unknown> }>(request);
  const supplied = body.credentials ?? {};

  const credentials: Record<string, string> = {};
  for (const field of def.fields) {
    const value = supplied[field.key];
    if (typeof value !== "string" || !value.trim()) {
      // Named rather than generic: with three fields on the Telegram card, "a value is required"
      // would leave the customer guessing which one.
      throw new ApiError(400, "invalid_request", `${field.label} is required`);
    }
    credentials[field.key] = value.trim();
  }

  if (channel === "telegram") {
    return json(
      await connectTelegram(id, {
        botToken: credentials.botToken,
        subscription: credentials.subscription,
        signingSecret: credentials.signingSecret,
      })
    );
  }

  // Slack, Discord and WhatsApp have cards and copy but no implementation yet. Telegram went
  // first deliberately: it is the only one of the four that needs nothing but a webhook URL.
  throw new ApiError(
    501,
    "not_implemented",
    `${def.name} isn't connectable yet. Telegram is the only channel wired up so far.`
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
