import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Security & Privacy",
  description:
    "Apollo[Claw] security practices. How we protect your data, where it lives, and what we won't do with it.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background py-10 pt-8">
      <div className="container mx-auto max-w-3xl px-4 md:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="w-10 h-[3px] bg-primary mb-5 mx-auto" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Security &amp; <span className="text-primary">Privacy</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
              Your data stays yours. Here&apos;s exactly how we protect it.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-8">
          {[
            {
              title: "Your Data, Your Infrastructure",
              body: "Apollo[Claw] agents are built on your infrastructure wherever possible. Your data does not pass through servers we own or control unless it&apos;s a requirement of a specific integration you&apos;ve approved.",
            },
            {
              title: "No Data Resale. Ever.",
              body: "We do not sell, share, or monetize your data. Full stop. Your business information, client data, and operational details belong to you.",
            },
            {
              title: "Encrypted Transit and Rest",
              body: "All data in transit is encrypted using TLS 1.3. Data at rest is encrypted using AES-256 where applicable. API keys and credentials are stored in encrypted vaults, never in plaintext.",
            },
            {
              title: "Third-Party Integrations",
              body: "When your AI agent connects to third-party tools (Gmail, CRMs, calendars), those connections are made using official API protocols with the minimum required permissions. We document every integration and require your explicit approval.",
            },
            {
              title: "Access Controls",
              body: "Apollo[Claw] operates on a least-privilege model. Your agent only has access to the specific tools and data it needs to perform its defined tasks. Access is reviewed when scope changes.",
            },
            {
              title: "Questions?",
              body: "Email us at <a href='mailto:hello@apolloclaw.ai' class='text-primary underline hover:no-underline'>hello@apolloclaw.ai</a> with any security questions. We respond to security inquiries within one business day.",
            },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 50}>
              <div className="bauhaus-card p-8">
                <h2 className="font-display text-xl text-foreground mb-3">{item.title}</h2>
                <p
                  className="font-body text-base text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.body }}
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
