import { notFound } from "next/navigation";
import { CHANNELS_ENABLED } from "@/config/channels";
import { ChannelsView } from "@/components/ChannelsView";

// 404s rather than rendering while the feature is dark, so the page can't be reached by typing
// the URL either. Flip NEXT_PUBLIC_CHANNELS_ENABLED once a real bot has been connected and
// answered; the nav entry in DashboardShell reads the same flag.
//
// The flag gates this page, the nav entry and the chat strip — not the API. The Telegram receiver
// at /api/channels/telegram/{agentId} is deliberately live either way: it has to be reachable for
// Telegram to deliver to it, and it authenticates every delivery on its own.
export default function Page() {
  if (!CHANNELS_ENABLED) notFound();
  return <ChannelsView />;
}
