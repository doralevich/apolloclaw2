import { agent37 } from "@/lib/agent37";
import { requireAgentAccess } from "@/lib/auth";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// Every channel and its state. Drives the four cards, and the poll that watches a WhatsApp QR
// until the customer's phone finishes the pairing.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");
  return json(await agent37.listChannels(id));
});
