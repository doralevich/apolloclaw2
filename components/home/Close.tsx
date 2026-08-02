import { NewsletterForm } from "@/components/home/NewsletterForm";
import { BracketLabel, NAVY_ELEVATED, PrimaryButton, Section, SecondaryButton } from "@/components/home/ui";

const GET_STARTED_URL = "/agents"; // see TODO(GET_STARTED_URL) in components/layout/Navbar.tsx
const CONSULT_URL = "https://calendly.com/therealdaveo/apolloai";

export function Close() {
  return (
    <Section bg={NAVY_ELEVATED}>
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <BracketLabel>Get Started</BracketLabel>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <PrimaryButton href={GET_STARTED_URL}>Get Started</PrimaryButton>
          <SecondaryButton href={CONSULT_URL} external>
            Schedule a Consultation
          </SecondaryButton>
        </div>

        <div className="mt-16 w-full border-t pt-12" style={{ borderColor: "rgba(245,246,248,0.1)" }}>
          <NewsletterForm />
        </div>
      </div>
    </Section>
  );
}
