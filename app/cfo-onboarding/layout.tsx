import type { Metadata } from "next";

// Unlisted by design. This URL is handed out directly by David to CFO prospects; it must never
// surface in search or in the sitemap. noindex plus nofollow, matching /white-glove-onboarding.
export const metadata: Metadata = {
  title: "CFO Agent Onboarding | ApolloClaw",
  robots: { index: false, follow: false },
};

export default function CfoOnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
