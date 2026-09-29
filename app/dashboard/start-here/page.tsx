import { redirect } from "next/navigation";

// The Welcome page (Start Here) is gone, David's call (Sept 29, 2026): "I thought we got rid of
// this page." Sept 21 moved its greeting into Chat's empty state and pointed /dashboard at Chat,
// but the build screen, the login landing, the connect flow and the admin workspace view still
// linked here directly, so people kept arriving on it. Those now go to Chat, and this route
// forwards anything else (bookmarks, old emails) the same way, ?ws= included.
//
// The workspace-with-no-agent case it used to handle is covered by Chat's own empty state,
// which links to My Agents for the Create button. components/StartHereView.tsx is left in place;
// putting the page back is rendering it here again.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string }>;
}) {
  const { ws } = await searchParams;
  redirect(ws ? `/dashboard/chat?ws=${encodeURIComponent(ws)}` : "/dashboard/chat");
}
