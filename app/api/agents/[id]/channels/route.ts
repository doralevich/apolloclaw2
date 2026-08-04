import { requireAgentAccess } from "@/lib/auth";
import { ApiError, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// Channel states, once there is somewhere to read them from.
//
// This used to forward to an invented Agent37 endpoint. There is no channels API — the published
// docs index has no such page — so the call is gone rather than left to fail confusingly. See the
// note in lib/agent37.ts for the route that does exist (public ports plus a Hermes webhook
// subscription) and the two questions still open on it.
//
// The page that calls this is dark behind NEXT_PUBLIC_CHANNELS_ENABLED, so in practice nothing
// reaches here. It answers honestly rather than 404ing, so if the flag is ever flipped early the
// message says what's actually true.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");
  throw new ApiError(
    501,
    "not_implemented",
    "Channels aren't connected yet. The runtime has no channels API; this needs a Hermes webhook subscription plus a public port."
  );
});
