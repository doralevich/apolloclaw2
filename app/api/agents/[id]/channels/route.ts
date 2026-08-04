import { requireAgentAccess } from "@/lib/auth";
import { json, route } from "@/lib/http";
import { listChannelRows, toChannel } from "@/lib/channels/store";
import { refreshTelegram } from "@/lib/channels/connect";
import type { Channel } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// Every channel this agent has, and its state.
//
// State lives in our own table rather than the runtime, because the runtime has no channels API —
// what a channel IS here is a webhook we registered with a provider on the customer's behalf.
//
// Telegram is re-checked against Telegram on read, since our row only knows that a setWebhook
// succeeded once. Telegram knows whether deliveries are actually landing, and that is the thing
// worth showing on a card.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const rows = await listChannelRows(id);
  const channels: Channel[] = rows.map(toChannel);

  const refreshed = await refreshTelegram(id);
  if (refreshed) {
    const i = channels.findIndex((c) => c.channel === "telegram");
    if (i >= 0) channels[i] = refreshed;
  }

  return json({ channels });
});
