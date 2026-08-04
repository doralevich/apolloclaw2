import { notFound } from "next/navigation";
import { CHANNELS_ENABLED } from "@/config/channels";
import { ChannelsView } from "@/components/ChannelsView";

// 404s rather than rendering while the feature is dark, so the page can't be reached by typing
// the URL either. Flip NEXT_PUBLIC_CHANNELS_ENABLED once the runtime endpoints in lib/agent37.ts
// are confirmed; the nav entry in DashboardShell reads the same flag.
export default function Page() {
  if (!CHANNELS_ENABLED) notFound();
  return <ChannelsView />;
}
