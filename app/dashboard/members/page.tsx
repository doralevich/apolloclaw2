import { redirect } from "next/navigation";

// Moved under Settings; redirect kept for anyone holding the old link.
export default function Page() {
  redirect("/dashboard/settings/members");
}
