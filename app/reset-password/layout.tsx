import type { Metadata } from "next";

// Client component, so metadata has to live here. noindex for the same reason as /login: a
// password-reset screen is not a search result, and without a rule it inherited the root
// layout's canonical and pointed at the homepage.
export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
