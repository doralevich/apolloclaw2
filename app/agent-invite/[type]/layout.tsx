import type { Metadata } from "next";

// Unlisted by design, exactly like /legal-onboarding: an invite URL is handed to one person and
// must never surface in search or the sitemap. The passcode gate is the real protection; noindex
// keeps the door from being advertised.
export const metadata: Metadata = {
  title: "Your Agent | ApolloClaw",
  robots: { index: false, follow: false },
};

export default function AgentInviteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
