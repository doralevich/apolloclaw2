import type { Metadata } from "next";

// Unlisted by design. This URL is handed out directly by David to recruiting prospects (staffing
// firms, in-house talent teams, sports agencies); it must never surface in search or in the
// sitemap. noindex plus nofollow, matching /cfo-onboarding and /legal-onboarding.
export const metadata: Metadata = {
  title: "Recruiting Agent Onboarding",
  robots: { index: false, follow: false },
};

export default function RecruitingOnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
