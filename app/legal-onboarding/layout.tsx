import type { Metadata } from "next";

// Unlisted by design. This URL is handed out directly by David to legal prospects; it must never
// surface in search or in the sitemap. noindex plus nofollow, matching /cfo-onboarding.
export const metadata: Metadata = {
  title: "Law Agent Onboarding | ApolloClaw",
  robots: { index: false, follow: false },
};

export default function LegalOnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
