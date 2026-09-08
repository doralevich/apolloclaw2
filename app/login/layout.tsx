import type { Metadata } from "next";

// The page itself is a client component and so cannot export metadata. Without this the sign-in
// screen inherited the root layout's, canonical included, which told Google that /login was
// apolloclaw.ai. Same reasoning as /onboard, /setup and the rest of the signed-in surface.
export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
