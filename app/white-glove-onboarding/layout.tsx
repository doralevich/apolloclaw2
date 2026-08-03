import type { Metadata } from "next";

// Unlisted by design. This URL is handed out directly by David to clients whose commercial
// terms were agreed offline, so it must never surface in search or in the sitemap. noindex
// plus nofollow, matching /onboard and /setup.
export const metadata: Metadata = {
  title: "Onboarding | ApolloClaw",
  robots: { index: false, follow: false },
};

export default function WhiteGloveOnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
