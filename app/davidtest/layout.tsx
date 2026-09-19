import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isAdminEmail } from "@/config/admins";

// David's walkthrough area: the screens a new owner meets AFTER the agent is built, rendered from
// the real components against fabricated API answers.
//
// /davidtest/purchase is the other half - the purchase journey, up to the moment the agent
// exists. It stops there because everything past it needed a real licence, a real payment, a real
// VPS and a real Google account to look at. The rest of this section is that half, with none of
// those. Both used to be separate top-level routes; the purchase one lived at /demo until /demo
// was given to Donna's chat, which clients are sent to and which is not gated at all.
//
// Gated exactly like /admin: logged out bounces to login, a logged-in non-admin gets notFound()
// so the route's existence never leaks. Not under /admin though - the whole value of these
// screens is that they look like what a customer sees, and AdminShell's chrome around a
// full-bleed onboarding flow would make them look like something else.
export const metadata = { robots: { index: false, follow: false } };

export default async function DavidTestLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login?next=/davidtest");
  if (!isAdminEmail(user.email)) notFound();
  return <>{children}</>;
}
