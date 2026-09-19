import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isAdminEmail } from "@/config/admins";

// David's walkthrough area: the screens a new owner meets AFTER the agent is built, rendered from
// the real components against fabricated API answers.
//
// /demo is the other half - the purchase journey, up to the moment the agent exists. It stops
// there because everything past it needed a real licence, a real payment, a real VPS and a real
// Google account to look at. This is that half, with none of those.
//
// Gated exactly like /demo and /admin: logged out bounces to login, a logged-in non-admin gets
// notFound() so the route's existence never leaks. Not under /admin, for the same reason /demo
// is not - the whole value is that it looks like what a customer sees.
export const metadata = { robots: { index: false, follow: false } };

export default async function DavidTestLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login?next=/davidtest");
  if (!isAdminEmail(user.email)) notFound();
  return <>{children}</>;
}
