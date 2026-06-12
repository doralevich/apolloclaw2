import type { Metadata } from "next";
import CostEstimatorClient from "./CostEstimatorClient";

export const metadata: Metadata = {
  title: "AI API Cost Estimator",
  description:
    "Calculate your monthly AI agent costs with precision. Compare Claude, GPT, Gemini, DeepSeek, Grok and more across main agent, sub-agent, and heartbeat roles.",
};

export default function CostEstimatorPage() {
  return (
    <>
      <section className="bg-background relative grid-pattern pt-6 hero-glow">
        <div className="container mx-auto px-4 md:px-8 py-12 text-center">
          <span className="pill-badge mb-5">Cost Calculator</span>
          <h1 className="font-display text-4xl md:text-6xl text-foreground leading-[1.08] max-w-4xl mx-auto opacity-0 animate-fade-up">
            AI API <span className="text-primary">Cost Estimator</span>
          </h1>
          <p className="font-body text-base md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto opacity-0 animate-fade-up-delay-1">
            Calculate your monthly AI agent costs with precision.
          </p>
        </div>
      </section>

      <div className="section-divider" />

      <section className="bg-surface-alt py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <CostEstimatorClient />
        </div>
      </section>
    </>
  );
}
