import { agent37 } from "@/lib/agent37";
import { requireAgentAccess } from "@/lib/auth";
import { ApiError, json, readJson, route } from "@/lib/http";
import { channelDef, isChannelId } from "@/config/channels";

type Ctx = { params: Promise<{ id: string; channel: string }> };

// Connect a channel, or start its pairing.
//
// The body carries whatever credentials the channel's form collects — a bot token, a Slack pair
// — and they are forwarded to the runtime and never persisted here. WhatsApp sends no
// credentials at all: the POST starts a device pairing and comes back with a QR for the
// customer's phone to scan.
//
// Only the fields the channel actually declares are forwarded, and only strings. That keeps a
// hand-rolled request from stuffing arbitrary JSON through this route into the runtime, and
// means the shape the runtime receives is always the shape the form shows.
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
      // Named rather than generic: with two token fields on Slack, "a token is required" would
      // leave the customer guessing which one.
      throw new ApiError(400, "invalid_request", `${field.label} is required`);
    }
    credentials[field.key] = value.trim();
  }

  return json(await agent37.connectChannel(id, channel, credentials));
});

// Unlink a channel and forget its credentials. The agent stops answering there.
export const DELETE = route(async (_request: Request, { params }: Ctx) => {
  const { id, channel } = await params;
  if (!isChannelId(channel)) {
    throw new ApiError(404, "not_found", "Unknown channel");
  }
  await requireAgentAccess(id, "member");
  return json(await agent37.disconnectChannel(id, channel));
});
