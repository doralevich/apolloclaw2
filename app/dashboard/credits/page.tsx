import { redirect } from "next/navigation";

// Moved under Settings. Kept as a redirect because this URL is in the wild: Stripe's
// success/cancel return, and the low-balance email's button.
export default function Page() {
  redirect("/dashboard/settings/billing");
}
