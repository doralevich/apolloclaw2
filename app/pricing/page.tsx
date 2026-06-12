import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "AI Consulting Investment | Apollo Claw",
  description:
    "Apollo Claw engagements are scoped to your organization's complexity and goals. Enterprise AI strategy starts with a discovery call — no published rates, no surprises.",
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        label="Pricing"
        title="Honest"
        titleAccent="Pricing"
        description="We don't publish dollar amounts publicly because every engagement is different. What we will tell you: it's accessible for small businesses, and it pays for itself."
      />

      <section className="bg-surface-alt py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                tier: "Starter",
                desc: "For solo operators and small businesses ready to automate their first workflows.",
                includes: ["1 AI agent", "Up to 3 integrations", "Email and calendar automation", "Monthly check-in"],
              },
              {
                tier: "Pro",
                desc: "For growing businesses that need more depth, more integrations, and faster response.",
                includes: ["1-2 AI agents", "Unlimited integrations", "CRM, calendar, email, research", "Bi-weekly optimization", "Priority support"],
                featured: true,
              },
              {
                tier: "Enterprise",
                desc: "For teams and departments that need multi-agent systems and custom workflows.",
                includes: ["Multiple agents", "Custom workflow design", "Department-level automation", "Dedicated success manager", "SLA guarantee"],
              },
            ].map((t, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className={`bauhaus-card p-8 h-full flex flex-col ${t.featured ? "border-primary/40 ring-1 ring-primary/20" : ""}`}>
                  {t.featured && (
                    <span className="inline-block text-xs font-mono text-primary border border-primary/30 rounded-full px-3 py-1 mb-4 w-fit">
                      Most Popular
                    </span>
                  )}
                  <h2 className="font-display text-2xl text-foreground mb-3">{t.tier}</h2>
                  <p className="font-body text-sm text-muted-foreground mb-6 flex-1">{t.desc}</p>
                  <ul className="space-y-2 mb-8">
                    {t.includes.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 font-body text-sm text-foreground">
                        <span className="text-primary mt-0.5">&#10003;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a href="https://calendly.com/therealdaveo/apolloai" target="_blank" rel="noopener noreferrer">
                    <Button variant={t.featured ? "cta" : "cta-outline"} size="default" className="w-full">
                      Get a Quote
                    </Button>
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="bauhaus-card p-8 text-center">
              <h2 className="font-display text-2xl text-foreground mb-3">
                Pricing is scoped to your engagement
              </h2>
              <p className="font-body text-muted-foreground max-w-xl mx-auto mb-6">
                Book a 30-minute discovery call. We&apos;ll understand your needs and give you a precise quote before any commitment.
              </p>
              <a href="https://calendly.com/therealdaveo/apolloai" target="_blank" rel="noopener noreferrer">
                <Button variant="cta" size="lg">Schedule Today</Button>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
