import { NewsletterForm } from "@/components/home/NewsletterForm";
import { BracketLabel, BodyLarge, H2, PrimaryButton, Section, SecondaryButton } from "@/components/home/ui";

const GET_STARTED_URL = "/agents"; // see TODO(GET_STARTED_URL) in components/layout/Navbar.tsx
const CONSULT_URL = "https://calendly.com/therealdaveo/apolloai";

export function Close() {
  return (
    <Section bg="#F2F0EB">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <BracketLabel>Get Started</BracketLabel>
        <H2>Put an AI employee to work this week.</H2>
        <div className="mt-6">
          <BodyLarge>Start on your own in minutes, or book a call and we&apos;ll map it out with you.</BodyLarge>
        </div>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <PrimaryButton href={GET_STARTED_URL}>Get Started</PrimaryButton>
          <SecondaryButton href={CONSULT_URL} external>
            Schedule a Consultation
          </SecondaryButton>
        </div>

        <div className="mt-16 w-full border-t pt-12" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
          <NewsletterForm />
        </div>
      </div>
    </Section>
  );
}
