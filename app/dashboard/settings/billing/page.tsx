import { CreditsView } from "@/components/CreditsView";

// Credits: the active agent's wallet — what's left and how to top it up. Where that money went
// lives one sidebar row down, on Usage. The path stays /settings/billing because every
// low-credit surface (the header widget, the chat banner, the warning emails) points here.
export default function Page() {
  return <CreditsView />;
}
