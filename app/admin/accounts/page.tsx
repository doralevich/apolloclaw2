import { redirect } from "next/navigation";

// Accounts merged into the Customers tab (/admin). Kept as a redirect so old bookmarks and the
// former tab URL still land somewhere sensible.
export default function AdminAccountsPage() {
  redirect("/admin");
}
