import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isAdminEmail } from "@/config/admins";

// The demo section: walk any agent's real purchase journey without buying or provisioning one.
//
// Gated exactly like /admin and for the same reason - a logged-out visitor bounces to login, a
// logged-in non-admin gets notFound() so the route's existence never leaks. It is NOT under
// /admin though, and that is deliberate: the whole value of this thing is that it looks like
// what a customer sees, and AdminShell's chrome around a full-bleed onboarding flow would make
// it look like something else. Same gate, different frame.
export const metadata = { robots: { index: false, follow: false } };

export default async function DemoLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login?next=/demo");
  if (!isAdminEmail(user.email)) notFound();
  return <>{children}</>;
}
