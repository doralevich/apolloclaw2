import type { Metadata } from "next";

// A workspace invitation link carries a one-time token in its path. It was the one account route
// with no robots tag (audit, Nov 14 2026); same treatment as /login and /onboard.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
