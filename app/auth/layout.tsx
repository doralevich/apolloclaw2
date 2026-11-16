import type { Metadata } from "next";

// Pages under /auth (the dead-link landing, today) are a client component with no metadata of
// their own, so they inherited the root layout's index, follow (audit, Nov 14 2026).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
