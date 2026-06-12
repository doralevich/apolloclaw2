import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";

interface UseCase {
  label: string;
  title: string;
  subtitle: string;
  description: string;
  challenges: string[];
  solutions: { title: string; desc: string }[];
  results: string[];
}

export default function UseCaseTemplate({ uc }: { uc: UseCase }) {
  return (
    <>
      <section className="bg-background min-h-[40vh] flex items-center relative grid-pattern pt-10 hero-glow">
        <div className="container mx-auto px-4 md:px-8 py-20 text-center">
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-muted-foreground px-4 py-2 rounded-full bg-card/60 border border-border/50 mb-6 opacity-0 animate-fade-up">
            {uc.label}
          </span>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.08] max-w-4xl mx-auto opacity-0 animate-fade-up">
            {uc.title} <span className="text-primary">{uc.subtitle}</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto opacity-0 animate-fade-up-delay-1">
            {uc.description}
          </p>
          <div className="mt-10 opacity-0 animate-fade-up-delay-2">
            <a
              href="https://calendly.com/therealdaveo/apolloai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="cta" size="xl">
                Schedule Today
              </Button>
            </a>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Challenges */}
      <section className="bg-surface-alt py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-10 text-center">
              The Daily <span className="text-primary">Challenges</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uc.challenges.map((c, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div className="bauhaus-card p-6 flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5">&#8594;</span>
                  <p className="font-body text-base text-foreground">{c}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Solutions */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-10 text-center">
              How Apollo[Claw] <span className="text-primary">Helps</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {uc.solutions.map((s, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bauhaus-card p-8 h-full">
                  <div className="w-10 h-[3px] bg-primary mb-4 rounded-full" />
                  <h3 className="font-display text-lg text-foreground mb-3">{s.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Results */}
      <section className="bg-surface-teal py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-10 text-center">
              What You <span className="text-primary">Get Back</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uc.results.map((r, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div className="flex items-start gap-3 p-4">
                  <span className="text-primary font-bold text-lg mt-0.5">&#10003;</span>
                  <p className="font-body text-base text-foreground">{r}</p>
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
            <h2 className="font-display text-2xl md:text-4xl text-foreground">
              Ready to see what AI can do for your practice?
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
