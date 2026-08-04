import { requireAgentAccess } from "@/lib/auth";
import { ApiError, route } from "@/lib/http";
import { isChannelId } from "@/config/channels";

type Ctx = { params: Promise<{ id: string; channel: string }> };

// Connect / disconnect a channel.
//
// Both used to forward credentials to an invented Agent37 endpoint. There is no channels API, so
// they answer 501 instead — see lib/agent37.ts for what the real route looks like and what is
// still unknown about it.
//
// The channel-id guard and the access check stay: when this is implemented for real, the shape of
// the request is already settled and only the body of the handler changes.
async function notImplemented(params: Ctx["params"]): Promise<never> {
  const { id, channel } = await params;
  if (!isChannelId(channel)) {
    throw new ApiError(404, "not_found", "Unknown channel");
  }
  await requireAgentAccess(id, "member");
  throw new ApiError(
    501,
    "not_implemented",
    "Channels aren't connected yet. The runtime has no channels API; this needs a Hermes webhook subscription plus a public port."
  );
}

export const POST = route(async (_request: Request, { params }: Ctx) => notImplemented(params));

export const DELETE = route(async (_request: Request, { params }: Ctx) => notImplemented(params));
