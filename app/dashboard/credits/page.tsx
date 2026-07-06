import { CreditsView } from "@/components/CreditsView";

// Read-only credits tab for the active agent (balance, monthly cap, usage breakdown).
// All agent/workspace state is client-side context, so the page is just the view.
export default function CreditsPage() {
  return <CreditsView />;
}
