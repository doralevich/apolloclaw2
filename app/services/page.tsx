import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "AI Consulting Services | Apollo Claw - Business, Enterprise & University",
  description:
    "Apollo Claw delivers AI consulting services for small businesses, enterprise companies, and universities. AI strategy, agent implementation, and ongoing management.",
  alternates: {
    canonical: "https://apolloclaw.ai/services",
  },
  openGraph: {
    title: "AI Consulting Services | Apollo Claw - Business, Enterprise & University",
    description:
      "Apollo Claw delivers AI consulting services for small businesses, enterprise companies, and universities. AI strategy, agent implementation, and ongoing management.",
    url: "https://apolloclaw.ai/services",
    type: "website",
  },
};

const bots = [
  {
    name: "ATHENA",
    title: "The Collegiate Bot",
    desc: "Purpose-built for students, faculty, and academic institutions. Research assistance, writing support, campus operations automation, and study planning.",
    features: [
      "Research paper assistance",
      "Citation and bibliography management",
      "Study schedule automation",
      "Faculty administrative support",
    ],
  },
  {
    name: "IRIS",
    title: "The Personal Bot",
    desc: "Your first digital hire. Handles email, calendar, CRM, and daily tasks so you can focus on what matters most.",
    features: [
      "Email triage and responses",
      "Calendar management",
      "Task tracking",
      "Daily briefings via Telegram",
    ],
    featured: true,
  },
  {
    name: "HERMES",
    title: "The Executive Bot",
    desc: "Everything in the Personal Bot - plus proactive intelligence, pipeline monitoring, and cross-tool automation.",
    features: [
      "Pipeline and deal monitoring",
      "Team coordination",
      "Cross-tool integrations",
      "Proactive alerts and insights",
    ],
  },
  {
    name: "ACROPOLIS",
    title: "The Department Bot",
    desc: "Give every team its own AI - Marketing, Sales, Finance, Ops, HR - each trained on their exact workflows.",
    features: [
      "Department-specific workflows",
      "Team-wide automation",
      "Cross-department handoffs",
      "Custom training on your processes",
    ],
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "AI Consulting and Implementation",
  provider: {
    "@type": "Organization",
    name: "Apollo Claw",
    url: "https://apolloclaw.ai",
  },
  areaServed: "United States",
  description:
    "Custom AI agent design, deployment, and ongoing management for small businesses, mid-market companies, and enterprise organizations.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "AI Agent Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Personal Bot (IRIS)" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Executive Bot (HERMES)" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Department Bot (ACROPOLIS)" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Collegiate Bot (ATHENA)" } },
    ],
  },
};

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <PageHero
        label="Our AI Tiers"
        title="Built For Every"
        titleAccent="Business"
        description="Whether you're a solo operator or running a 200-person team, there's an Apollo[Claw] agent designed for your exact situation."
      />

      <section className="bg-surface-alt py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-10">
            <a href="/demo.html" target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-primary border border-primary/40 rounded-full px-5 py-2 hover:bg-primary/5 transition-colors">
              &#9654;&nbsp;Watch the Demo &mdash; A Day With John
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bots.map((bot, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div
                  className={`bauhaus-card p-8 h-full flex flex-col ${bot.featured ? "border-primary/40 ring-1 ring-primary/20" : ""}`}
                >
                  {bot.featured && (
                    <span className="inline-block text-xs font-mono text-primary border border-primary/30 rounded-full px-3 py-1 mb-4 w-fit">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-display text-xl md:text-2xl text-foreground leading-tight">
                    {bot.title}
                  </h3>
                  <p className="font-display text-[12px] font-bold text-primary tracking-tight -mt-0.5 mb-4">
                    {bot.name}
                  </p>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                    {bot.desc}
                  </p>
                  <ul className="space-y-2 mb-8">
                    {bot.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 font-body text-sm text-foreground">
                        <span className="text-primary mt-0.5">&#10003;</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://calendly.com/therealdaveo/apolloai"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant={bot.featured ? "cta" : "cta-outline"} size="default">
                      Get Started
                    </Button>
                  </a>
                </div>
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
              Not sure which tier is right for you?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="font-body text-lg text-muted-foreground mt-6 max-w-xl mx-auto">
              Book a free discovery call and we&apos;ll recommend the right fit.
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
