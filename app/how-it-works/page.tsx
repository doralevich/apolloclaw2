import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "How We Work | Apollo Claw AI Consulting",
  description:
    "Discovery. Strategy. Execution. Apollo Claw's process is designed for decision makers who need clarity fast and a partner who can actually build. Here's exactly how we do it.",
};

const steps = [
  {
    step: "01",
    title: "Discovery Call",
    desc: "We start with a free 45-minute conversation about your business, your biggest time drains, and what you&apos;d most like to automate. No pitch. Just listening.",
  },
  {
    step: "02",
    title: "Strategy & Scoping",
    desc: "We map out exactly which workflows to automate, which tools to connect, and what your AI agent will handle on day one versus month three.",
  },
  {
    step: "03",
    title: "Build & Deploy",
    desc: "We build your agent, connect it to your tools, and run it through real scenarios from your business before go-live. You test it. We tune it.",
  },
  {
    step: "04",
    title: "Ongoing Support",
    desc: "Your AI agent improves over time. We monitor it, adjust it as your needs change, and add new capabilities as the technology evolves.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-background min-h-[40vh] flex items-center relative grid-pattern pt-10 hero-glow">
        <div className="container mx-auto px-4 md:px-8 py-20 text-center">
          <h1 className="font-display text-5xl md:text-7xl text-foreground leading-[1.08] max-w-4xl mx-auto opacity-0 animate-fade-up">
            How It <span className="text-primary">Works</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto opacity-0 animate-fade-up-delay-1">
            From first conversation to fully operational AI agent - four steps, no technical
            expertise required on your end.
          </p>
        </div>
      </section>

      <div className="section-divider" />

      <section className="bg-surface-alt py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="flex flex-col gap-16">
            {steps.map((s, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-8 items-start">
                  <div className="font-mono text-6xl font-bold text-primary/20 leading-none">
                    {s.step}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                      {s.title}
                    </h2>
                    <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: s.desc }}
                    />
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px h-12 bg-primary/20 ml-14 mt-6 hidden md:block" />
                )}
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pt-[60px] pb-[60px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/5" />
        <div className="container mx-auto px-4 md:px-8 text-center relative">
          <ScrollReveal>
            <h2 className="font-display text-2xl md:text-4xl text-foreground">
              Start with a free discovery call
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="font-body text-lg text-muted-foreground mt-6 max-w-xl mx-auto">
              No commitment. Just a real conversation about your business.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={400}>
            <a
              href="https://calendly.com/therealdaveo/apolloai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-10"
            >
              <Button variant="cta" size="xl">
                Schedule Today
              </Button>
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
