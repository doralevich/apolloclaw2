import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Skills Drop Membership",
  description:
    "Apollo[Claw] Skills Drop membership — ongoing AI support, updates, and optimization for your business.",
};

export default function MembershipPage() {
  return (
    <>
      <section className="bg-background min-h-[40vh] flex items-center relative grid-pattern pt-10 hero-glow">
        <div className="container mx-auto px-4 md:px-8 py-20 text-center">
          <h1 className="font-display text-5xl md:text-7xl text-foreground leading-[1.08] max-w-4xl mx-auto opacity-0 animate-fade-up">
            Skills <span className="text-primary">Drop</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto opacity-0 animate-fade-up-delay-1">
            Ongoing AI support, updates, and optimization so your agent keeps getting smarter as
            your business grows.
          </p>
          <div className="mt-10 opacity-0 animate-fade-up-delay-2">
            <a
              href="https://calendly.com/therealdaveo/apolloai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="cta" size="xl">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="bg-surface-alt py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Monthly Updates",
                desc: "Your agent&apos;s skills expand each month as we add new capabilities, integrations, and workflow improvements.",
              },
              {
                title: "Priority Support",
                desc: "Members get same-day response time. If something isn&apos;t working right, we&apos;re on it.",
              },
              {
                title: "Quarterly Reviews",
                desc: "We review your agent&apos;s performance, identify new automation opportunities, and roadmap the next quarter.",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bauhaus-card p-8 h-full">
                  <div className="w-10 h-[3px] bg-primary mb-4 rounded-full" />
                  <h3
                    className="font-display text-lg text-foreground mb-3"
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  />
                  <p
                    className="font-body text-sm text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.desc }}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <div className="text-center mt-16">
              <p className="font-body text-muted-foreground mb-6">
                Membership pricing is included in your engagement quote.
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
      </section>
    </>
  );
}
