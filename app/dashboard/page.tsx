import { redirect } from "next/navigation";

// My Agent moved into Settings — David's call: it is where you look at the agent itself, which
// is a settings question rather than a daily one.
//
// This route stays as a redirect rather than being deleted, because "/dashboard" is what every
// "back to the dashboard" link in the product points at, and Start Here is where somebody
// arriving at the root should land anyway. It is the page written for exactly that moment.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string }>;
}) {
  // Forward a ?ws= support-view param through the redirect, so a link to /dashboard?ws=<id>
  // (rather than straight to start-here) still lands the admin in that workspace instead of
  // silently dropping the param. A plain redirect() would strip the query string.
  const { ws } = await searchParams;
  redirect(ws ? `/dashboard/start-here?ws=${encodeURIComponent(ws)}` : "/dashboard/start-here");
}
