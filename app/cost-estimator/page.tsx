import type { Metadata } from "next";
import CostEstimatorClient from "./CostEstimatorClient";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "AI API Cost Estimator",
  description:
    "Calculate your monthly AI agent costs with precision. Compare Claude, GPT, Gemini, DeepSeek, Grok and more across main agent, sub-agent, and heartbeat roles.",
};

export default function CostEstimatorPage() {
  return (
    <>
      <PageHero
        label="Cost Calculator"
        title="AI API"
        titleAccent="Cost Estimator"
        description="Calculate your monthly AI agent costs with precision."
      />

      <section className="bg-surface-alt py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <CostEstimatorClient />
        </div>
      </section>
    </>
  );
}
