import { curateModelsResponse } from "@/config/chat-models";
import { agent37 } from "@/lib/agent37";
import { requireAgentAccess } from "@/lib/auth";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// List the models the agent can run, for the composer's model switcher.
//
// Curated here rather than in the component: the gateway offers hundreds, we sell six, and a
// filter living only in the UI still puts every id on the wire for anything else that calls
// this. See config/chat-models.ts for what survives and why.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");
  return json(curateModelsResponse(await agent37.listModels(id)));
});
