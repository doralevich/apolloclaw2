import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "About Apollo Claw | AI Strategy Built by Operators",
  description:
    "Apollo Claw was built by people who have been in the trenches of business operations and technology. We don't sell software. We build AI strategy for the way your business actually works.",
};

const values = [
  {
    title: "Plain English Always",
    desc: "If we can't explain it without jargon, we haven't understood it well enough.",
  },
  {
    title: "Your Data, Your Property",
    desc: "We build on your hardware. Your data stays where you can see it.",
  },
  {
    title: "Show, Don't Just Sell",
    desc: "Every engagement starts with listening. We earn the sale by solving the problem first.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-background min-h-[calc(70vh-75px)] flex items-center relative grid-pattern pt-10 hero-glow">
        <div className="container mx-auto px-4 md:px-8 py-20 md:py-32 text-center">
          <h1 className="font-display text-5xl md:text-7xl lg:text-[88px] text-foreground leading-[1.08] max-w-4xl mx-auto opacity-0 animate-fade-up">
            Who We Are
          </h1>
          <p className="font-display text-3xl md:text-5xl text-primary mt-4 opacity-0 animate-fade-up-delay-1">
            Why We Do This
          </p>
          <p className="font-body text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto opacity-0 animate-fade-up-delay-1">
            We are a team of operators, technologists, and security specialists who got tired of
            watching businesses waste time on work that machines can do.
          </p>
        </div>
      </section>

      <div className="section-divider" />

      {/* Mission */}
      <section className="bg-surface-alt pt-6 md:pt-7 pb-24 md:pb-32">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-10 text-center">
              Our Mission
            </h2>
          </ScrollReveal>
          <div className="bauhaus-card max-w-3xl mx-auto p-8 md:p-12">
            <ScrollReveal>
              <p className="font-body text-lg text-foreground leading-relaxed mb-6 text-center">
                Our mission is simple: make powerful AI infrastructure accessible to every business -
                not just the ones that can afford an enterprise software contract.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="font-body text-lg text-foreground/80 leading-relaxed text-center">
                We believe your data should stay in your building. We believe AI should speak plain
                English, not developer jargon. And we believe the best digital employee is one that
                learns your way of doing things - not the other way around.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={300}>
            <div className="flex justify-center mt-12">
              <a
                href="https://calendly.com/therealdaveo/apolloai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="cta" size="xl">
                  Get in Touch
                </Button>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-divider" />

      {/* Founder Bio */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-start gap-10 md:gap-16 max-w-5xl mx-auto">
              <div className="w-full md:w-[280px] flex-shrink-0">
                <div className="w-full rounded-2xl bg-primary/10 aspect-square flex items-center justify-center">
                  <span className="font-mono text-primary text-6xl font-bold">D</span>
                </div>
                <div className="mt-5">
                  <h3 className="font-display text-xl text-foreground">David Oralevich</h3>
                  <p className="font-mono text-sm mt-1 text-primary">Co-founder, Apollo[Claw]</p>
                </div>
              </div>
              <div>
                <h3 className="font-display text-3xl md:text-4xl text-foreground mb-2">
                  Our Founder
                </h3>
                <div className="w-16 h-[3px] bg-primary mb-8 rounded-full" />
                <div className="font-body text-base leading-relaxed space-y-4 text-foreground/80">
                  <p>
                    David Oralevich has spent his career at the edge of what is next. He rode the
                    first wave of the Internet in the late 90s - managing divisions, sourcing
                    technology, watching a new world take shape in real time. When that chapter ended,
                    he built his own.
                  </p>
                  <p>
                    In 2007 he founded Designs By Dave O., a digital agency that has spent nearly two
                    decades helping businesses compete, grow, and adapt online.
                  </p>
                  <p>
                    Then came AI. Two years ago, David started working directly with senior engineers
                    at leading Israeli startups - watching the innovation happen before it hit the
                    headlines. By 2025, the world caught up. ChatGPT. OpenAI. The mainstream moment
                    everyone talks about. David had already been in the room.
                  </p>
                  <p>
                    What came next changed everything. Early 2026 - the personal AI agent. Not a
                    chatbot. Not a tool you open and close. A system that works inside your business,
                    learns your operation, and operates autonomously on your behalf.
                  </p>
                  <p>
                    That is why he co-founded Apollo[Claw]. Not to sell software. To sit across from
                    business owners and help them understand what is coming, what it means for them
                    specifically, and how to build it right.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-divider" />

      {/* Values */}
      <section className="bg-surface-alt py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-16 text-center">
              What We Believe
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bauhaus-card p-8 h-full">
                  <div className="w-10 h-[3px] bg-primary mb-5 rounded-full" />
                  <h3 className="font-display text-xl text-foreground mb-3">{v.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative pt-[60px] pb-[60px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/5" />
        <div className="container mx-auto px-4 md:px-8 text-center relative">
          <ScrollReveal>
            <h2 className="font-display text-2xl md:text-4xl lg:text-5xl text-foreground">
              Ready to build your AI strategy?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="font-body text-lg text-muted-foreground mt-6 max-w-xl mx-auto">
              Book a free 30-minute discovery call.
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
