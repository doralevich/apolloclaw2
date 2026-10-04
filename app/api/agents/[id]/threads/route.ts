import { requireAgentAccess } from "@/lib/auth";
import { listThreads } from "@/lib/agent-threads";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/agents/{id}/threads - the signed-in person's direct-line conversations on this
// instance, every agent's, most recent first. The Chats list merges these with the main chat's
// own threads. Empty, not an error, when none are saved (or the table is not there yet).
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  const { user } = await requireAgentAccess(id, "member");
  return json({ threads: await listThreads(id, user.id) });
});
