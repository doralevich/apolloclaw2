import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talk to Apollo Claw | Executive AI Consultation",
  description:
    "Ready to build a real AI strategy for your organization? Schedule a consultation with Apollo Claw. We work with C-suite executives and senior decision makers across all industries.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
