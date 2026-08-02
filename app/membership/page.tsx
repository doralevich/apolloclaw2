import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: { absolute: "SkillsDrop AI Membership | Apollo[Claw]" },
  description:
    "Monthly AI updates, priority support, and quarterly performance reviews. SkillsDrop keeps your Apollo Claw agent improving as your business grows.",
  alternates: { canonical: "https://apolloclaw.ai/membership" },
  openGraph: {
    title: "SkillsDrop AI Membership | Ongoing AI Optimization & Support | Apollo Claw",
    description:
      "Monthly AI updates, priority support, and quarterly performance reviews for your Apollo Claw agent.",
    url: "https://apolloclaw.ai/membership",
    type: "website",
  },
};

export default function MembershipPage() {
  return (
    <>
      <PageHero
        label="Ongoing Support"
        title="Skills"
        titleAccent="Drop"
        description="Ongoing AI support, updates, and optimization so your agent keeps getting smarter as your business grows."
        cta={{ label: "Learn More", href: "https://calendly.com/therealdaveo/apolloai" }}
      />

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
