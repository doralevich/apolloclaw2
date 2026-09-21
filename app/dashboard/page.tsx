import { redirect } from "next/navigation";

// My Agent moved into Settings — David's call: it is where you look at the agent itself, which
// is a settings question rather than a daily one.
//
// This route stays as a redirect rather than being deleted, because "/dashboard" is what every
// "back to the dashboard" link in the product points at.
//
// IT LANDS ON CHAT NOW, David's call. It used to land on Start Here, which was a launcher: a
// greeting and four tiles, each one a link to a surface that is also in the rail. So the first
// screen of the product was a menu of other screens, and the thing people actually come back
// for every day was one click behind it.
//
// Chat is that thing, and its empty state already does the launcher's job better - it greets
// you by name, offers the customer's own opening line from their questionnaire, and puts four
// things to say under the box you would say them in. The difference is that clicking one of
// those starts the work rather than navigating to where the work might start.
//
// Start Here itself is untouched and still renders: same treatment as Matters, What Needs You
// and the Checklist before it (see the rail in components/DashboardShell.tsx). The row goes and
// the landing moves; the page stays, so nothing that links to it breaks and putting it back is
// this line.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string }>;
}) {
  // Forward a ?ws= support-view param through the redirect, so a link to /dashboard?ws=<id>
  // (rather than straight to start-here) still lands the admin in that workspace instead of
  // silently dropping the param. A plain redirect() would strip the query string.
  const { ws } = await searchParams;
  redirect(ws ? `/dashboard/chat?ws=${encodeURIComponent(ws)}` : "/dashboard/chat");
}
