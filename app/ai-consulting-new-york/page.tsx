import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";

export const metadata: Metadata = {
  title: { absolute: "AI Consulting New York | Long Island & NYC Metro | Apollo Claw" },
  description:
    "Apollo Claw is a New York AI consulting firm serving Long Island, NYC, and the greater metro area. Custom AI implementation for local businesses, in-person or remote.",
  alternates: { canonical: "https://apolloclaw.ai/ai-consulting-new-york" },
  openGraph: {
    title: "AI Consulting New York | Long Island & NYC Metro | Apollo Claw",
    description:
      "A New York AI consulting firm serving Long Island, NYC, and the greater metro area. Custom AI implementation for local businesses.",
    url: "https://apolloclaw.ai/ai-consulting-new-york",
    type: "website",
  },
};

const data: SeoLandingData = {
  hero: {
    label: "Long Island · NYC · Metro Area",
    title: "AI Consulting in",
    titleAccent: "New York",
    description:
      "Based at 69 Roslyn Road in Roslyn Heights, NY. Apollo Claw serves businesses across Long Island, Manhattan, Brooklyn, Queens, and the greater NYC metro, in person and remotely.",
    cta: { label: "Book a Local Discovery Call", href: "/contact" },
  },
  sections: [
    {
      type: "columns",
      kicker: "Why Local Matters",
      heading: "A New York Partner, Not a Faceless",
      headingAccent: "Vendor",
      items: [
        { title: "Face-to-Face Discovery", desc: "We can meet in person across Long Island and the NYC metro to understand your operation firsthand." },
        { title: "We Know the NY Landscape", desc: "From Nassau County practices to Manhattan firms, we understand how local businesses actually run." },
        { title: "Quick Response", desc: "Same time zone, same region. When something needs attention, you are not waiting on a coast three hours behind." },
      ],
    },
    {
      type: "bullets",
      kicker: "Businesses We Serve in NY",
      heading: "Local Verticals We",
      headingAccent: "Work With",
      intro: "Custom AI implementation for the industries that drive the New York metro economy.",
      bullets: [
        "Professional services firms",
        "Retail and e-commerce brands",
        "Finance and wealth management",
        "Healthcare and medical practices",
        "Real estate and brokerages",
        "Legal practices",
        "Hospitality and food service",
        "Construction and trades",
      ],
    },
    {
      type: "steps",
      kicker: "What We Build",
      heading: "The Same System, Built",
      headingAccent: "Around You",
      steps: [
        { title: "Discovery & Audit", desc: "We map your workflows and find where AI recovers the most time, on site or over a call." },
        { title: "Design & Build", desc: "We build a custom AI agent around your real processes and connect it to your tools." },
        { title: "Deploy & Train", desc: "We put the agent live and train your team to work with it day to day." },
        { title: "Optimize & Scale", desc: "We tune the system and expand it as your New York business grows." },
      ],
    },
    {
      type: "cta",
      heading: "Let's talk AI for your New York",
      headingAccent: "business.",
      sub: "Book a free discovery call. In-person meetings available across Long Island and the NYC metro.",
      button: { label: "Book a Local Discovery Call", href: "/contact" },
    },
  ],
};

export default function AiConsultingNewYorkPage() {
  return <SeoLanding data={data} />;
}
