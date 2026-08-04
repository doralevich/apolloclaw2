import { agent37 } from "@/lib/agent37";
import { requireAgentAccess } from "@/lib/auth";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// A short-lived link into the agent's own Hermes dashboard.
//
// Setting up a channel needs a Hermes webhook subscription, and Hermes only offers that through
// its dashboard on port 9119 — there is no API to create one, so the customer has to go there
// themselves. Without this they'd have no way in at all: the port is credential-protected, and
// the credential is our sk_live_ key, which obviously isn't theirs to hold.
//
// A signed URL is exactly the right shape for it. It expires, so it can't be pasted into a
// bookmark and become a permanent hole, and it's minted per click behind requireAgentAccess.
const TTL_SECONDS = 600;
const HERMES_DASHBOARD_PORT = 9119;

export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");
  const { url } = await agent37.signedUrl(id, HERMES_DASHBOARD_PORT, TTL_SECONDS);
  return json({ url });
});
