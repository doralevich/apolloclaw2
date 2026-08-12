import { BillingTabs } from "@/components/BillingTabs";

// Credits: the active agent's wallet, and — one tab over — where that wallet went.
//
// Credits and Usage were stacked on one scroll; David asked to split them so each is its own
// tab. The path stays /settings/billing because every low-credit surface in the product (the
// header widget, the chat banner, the warning emails) already points here.
export default function Page() {
  return <BillingTabs />;
}
