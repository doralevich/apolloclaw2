import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "How Apollo[Claw] AI agents have helped real businesses reclaim time and grow.",
};

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-background py-10 pt-8">
      <div className="container mx-auto max-w-5xl px-4 md:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="w-10 h-[3px] bg-primary mb-5 mx-auto" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Case <span className="text-primary">Studies</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
              Real businesses. Real results. No fluff.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bauhaus-card p-12 text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl text-foreground mb-4">
              Case studies coming soon
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              We&apos;re documenting our current client work. In the meantime, book a discovery call
              and we&apos;ll walk you through relevant examples for your industry.
            </p>
            <a
              href="https://calendly.com/therealdaveo/apolloai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="cta" size="lg">
                Schedule a Discovery Call
              </Button>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
