import { requireAgentAccess } from "@/lib/auth";
import { readInstanceRoster } from "@/lib/instance-roster";
import { json, route } from "@/lib/http";
import { runtimeForTemplate } from "@/config/agents";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/agents/{id}/roster - the agents living on this instance, read from the box.
//
// The app's record is one agent per instance. OpenClaw can run several on one gateway, and the
// two-agent test (admin Fleet page, "Second agent") puts a second one there. This is how the
// customer-facing My Agent(s) page shows it: the card lists every agent the box reports, so an
// agent added on the server is never a secret the page keeps from its owner.
//
// A Hermes box has no roster to read and is answered without touching it.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { row } = await requireAgentAccess(id, "member");
  if (runtimeForTemplate(row.template) !== "OpenClaw") {
    return json({ ok: true, agents: [], note: "not-openclaw" });
  }
  return json(await readInstanceRoster(id));
});
