import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "Apollo[Claw] accessibility statement and our commitment to inclusive design.",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background py-10 pt-8">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="w-10 h-[3px] bg-primary mb-5 mx-auto" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Accessibility <span className="text-primary">Statement</span>
            </h1>
          </div>
        </ScrollReveal>

        <div className="bauhaus-card p-8 md:p-12 space-y-6">
          <ScrollReveal>
            <p className="font-body text-base text-foreground/80 leading-relaxed">
              Apollo[Claw] is committed to ensuring digital accessibility for people with disabilities.
              We are continually improving the user experience for everyone and applying the relevant
              accessibility standards.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <h2 className="font-display text-xl text-foreground">Conformance Status</h2>
            <p className="font-body text-base text-muted-foreground leading-relaxed mt-2">
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA.
              These guidelines explain how to make web content more accessible to people with
              disabilities.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <h2 className="font-display text-xl text-foreground">Technical Specifications</h2>
            <p className="font-body text-base text-muted-foreground leading-relaxed mt-2">
              This site relies on the following technologies for conformance: HTML, CSS, JavaScript,
              and WAI-ARIA where appropriate.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <h2 className="font-display text-xl text-foreground">Feedback</h2>
            <p className="font-body text-base text-muted-foreground leading-relaxed mt-2">
              We welcome feedback on the accessibility of this site. Please contact us at{" "}
              <a
                href="mailto:hello@apolloclaw.ai"
                className="text-primary underline hover:no-underline"
              >
                hello@apolloclaw.ai
              </a>{" "}
              if you experience any barriers.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
