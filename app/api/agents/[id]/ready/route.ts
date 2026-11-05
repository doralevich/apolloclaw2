import { requireAgentAccess } from "@/lib/auth";
import { instanceReady } from "@/lib/instance-ready";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/agents/{id}/ready - can this agent take a chat turn right now?
//
// "running" from Agent37 says the container is up; this says the agent's own chat host answers
// (lib/instance-ready.ts). The build screen polls it after "running" and enters Chat only on
// true, so a customer's first message lands on an agent that can answer it.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");
  return json({ ready: await instanceReady(id) });
});
