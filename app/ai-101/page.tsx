import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "AI 101: What Business Owners Need to Know",
  description:
    "A plain-English guide to AI for business owners. What AI agents are, what they can do, and how to get started without the hype.",
};

const topics = [
  {
    q: "What is AI, really?",
    a: "AI is software that learns from patterns in data and can generate responses, make decisions, and take actions, unlike traditional software which only does exactly what it's programmed to do. The breakthrough of 2022-2024 is that AI now works in plain English: you describe what you want, and it does it.",
  },
  {
    q: "What&apos;s the difference between ChatGPT and an AI agent?",
    a: "ChatGPT is a conversation tool. You ask questions, it answers. An AI agent is connected to your actual systems and can take actions: send emails, update your CRM, schedule meetings, pull data. The difference is like a calculator versus a bookkeeper.",
  },
  {
    q: "What can AI actually do for my business today?",
    a: "Email triage and responses. Calendar management. CRM updates. Research and summarization. Lead follow-up. Document prep. Status reporting. Anything that currently requires you to read something, decide something routine, and type something back: AI can handle it.",
  },
  {
    q: "What can&apos;t AI do?",
    a: "AI cannot replace human judgment on complex decisions, relationship-building, creative strategy, or anything that requires deep domain expertise combined with novel situations. The goal is not to replace you; it&apos;s to handle the 40% of your day that doesn&apos;t require you.",
  },
  {
    q: "Is it safe to give AI access to my business systems?",
    a: "When implemented correctly, yes. Apollo[Claw] builds on your infrastructure with least-privilege access; your agent only has access to what it needs. We document every integration and require your explicit approval for each connection.",
  },
  {
    q: "How long does it take to see results?",
    a: "Most clients notice a meaningful change within the first 2-4 weeks. The agent handles its assigned tasks immediately. The bigger gains compound over time as we tune it to your specific workflows.",
  },
];

export default function AI101Page() {
  return (
    <>
      <PageHero
        label="AI 101"
        title="What Business Owners"
        titleAccent="Need to Know"
        description="No hype, no jargon. Just what matters for your business."
      />
      <div className="bg-background py-16">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">

        <div className="flex flex-col gap-6 mb-16">
          {topics.map((t, i) => (
            <ScrollReveal key={i} delay={i * 50}>
              <div className="bauhaus-card p-8">
                <h2
                  className="font-display text-lg md:text-xl text-foreground mb-3"
                  dangerouslySetInnerHTML={{ __html: t.q }}
                />
                <p
                  className="font-body text-base text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: t.a }}
                />
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="bauhaus-card p-8 text-center">
            <h2 className="font-display text-2xl text-foreground mb-3">
              Ready to see what AI can do for your business specifically?
            </h2>
            <p className="font-body text-muted-foreground mb-6">
              Book a free 30-minute call and we&apos;ll walk through your exact situation.
            </p>
            <a
              href="https://calendly.com/therealdaveo/apolloai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="cta" size="lg">
                Schedule Today
              </Button>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </div>
    </>
  );
}
