import { BracketLabel, BodyLarge, H2, Section, SoftLink } from "@/components/home/ui";

// Security wording placed exactly as specified in the master brief / copy doc. Do not rephrase
// or add claims beyond this , "SOC 2 in progress" stays exactly that, never a seal.
export function TrustStrip() {
  return (
    <Section>
      <div className="mx-auto max-w-4xl text-center">
        <BracketLabel>Security First</BracketLabel>
        <H2>Security is how we built the whole thing, from the ground up.</H2>
        <div className="mt-6">
          <BodyLarge>
            Encrypted in transit and at rest. Isolated per client. Hosted in the US. SOC 2 in
            progress, and built to meet the bar your industry sets, HIPAA for medical, the
            standards finance and regulated buyers expect. We say what&apos;s true, and we back up
            every word.
          </BodyLarge>
        </div>
        <div className="mt-8">
          <SoftLink href="/security">Visit the Trust Center →</SoftLink>
        </div>
      </div>
    </Section>
  );
}
