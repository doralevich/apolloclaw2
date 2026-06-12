import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Common questions about Apollo[Claw] AI consulting, our bot tiers, pricing, and implementation process.",
};

const faqs = [
  {
    q: "What exactly is an AI agent?",
    a: "An AI agent is a software system that can take actions on your behalf - reading emails, scheduling meetings, updating your CRM, researching topics, and more. Unlike a chatbot, an agent actually does things; it doesn't just answer questions.",
  },
  {
    q: "Do I need any technical expertise to use this?",
    a: "No. We handle all the technical setup. You interact with your AI agent through Telegram or WhatsApp, the same way you'd text a team member.",
  },
  {
    q: "What tools does it connect to?",
    a: "Gmail, Google Calendar, common CRMs (HubSpot, Salesforce, Pipedrive), Slack, Notion, Google Drive, and dozens of other tools via API integrations. We tailor the integrations to what you actually use.",
  },
  {
    q: "How long does setup take?",
    a: "Most clients are live within 2-4 weeks. Simple setups can be live in a few days.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We build on your infrastructure wherever possible. Your data does not go through third-party servers we don't control. See our Security page for details.",
  },
  {
    q: "How much does it cost?",
    a: "Pricing depends on your setup and the tier you need. We don't publish rates publicly because every engagement is scoped differently. Book a discovery call and we'll give you a precise number.",
  },
  {
    q: "What if I want to cancel?",
    a: "No long-term contracts required. Month-to-month arrangements are available after your initial setup period.",
  },
  {
    q: "How is Apollo[Claw] different from just using ChatGPT?",
    a: "ChatGPT is a conversation tool. Apollo[Claw] agents are connected to your actual business systems and take autonomous action. The difference is like having a calculator vs. having a bookkeeper.",
  },
];

export default function FAQPage() {
  return (
    <>
      <PageHero
        label="FAQ"
        title="Frequently"
        titleAccent="Asked Questions"
        description="Everything you want to know before your first call."
      />
      <div className="bg-background py-16">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">

        <div className="flex flex-col gap-6">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 50}>
              <div className="bauhaus-card p-8">
                <h2 className="font-display text-lg md:text-xl text-foreground mb-3">{faq.q}</h2>
                <p className="font-body text-base text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="text-center mt-16">
            <p className="font-body text-muted-foreground mb-6">Still have questions?</p>
            <a
              href="https://calendly.com/therealdaveo/apolloai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="cta" size="lg">
                Book a Free Discovery Call
              </Button>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </div>
    </>
  );
}
