import { CreditsView } from "@/components/CreditsView";
import { UsageView } from "@/components/UsageView";

// Credits: the active agent's wallet, and directly beneath it, where that wallet went.
//
// Usage was its own page one rail-entry down, repeating this page's headline number - "a child
// pretending to be a peer", in David's settings review. One agent's money is one page now. The
// path stays /settings/billing because every low-credit surface in the product (the header
// widget, the chat banner, the warning emails) already points here.
export default function Page() {
  return (
    <div className="space-y-10">
      <CreditsView />
      <UsageView />
    </div>
  );
}
