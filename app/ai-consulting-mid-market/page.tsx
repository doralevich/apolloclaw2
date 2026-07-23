import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";

export const metadata: Metadata = {
  title: { absolute: "AI Consulting for Medium-Sized Businesses | Apollo Claw" },
  description:
    "Apollo Claw helps growing mid-market companies wire AI into sales, operations, and finance, so headcount isn't the only way to do more. Free 30-min call.",
  alternates: { canonical: "https://apolloclaw.ai/ai-consulting-mid-market" },
  openGraph: {
    title: "AI Consulting for Medium-Sized Businesses | Apollo Claw",
    description:
      "Custom AI agents for growing mid-market companies, wired into sales, operations, and finance.",
    url: "https://apolloclaw.ai/ai-consulting-mid-market",
    type: "website",
  },
};

const data: SeoLandingData = {
  hero: {
    label: "For Growing Teams",
    title: "AI Consulting for",
    titleAccent: "Medium-Sized Businesses",
    description:
      "Apollo Claw helps growing companies wire AI into sales, operations, and finance, so headcount is not the only way to do more.",
    cta: { label: "Book a Free Discovery Call", href: "/contact" },
  },
  sections: [
    {
      type: "columns",
      kicker: "The Mid-Market Problem",
      heading: "Too Big for Duct Tape, Too Small for",
      headingAccent: "Enterprise Software",
      items: [
        { title: "Outgrown Manual Process", desc: "The systems that worked at 10 people break down at 50. Spreadsheets and tribal knowledge cannot keep up with the volume." },
        { title: "Between Two Budgets", desc: "Enterprise platforms are overbuilt and overpriced for your stage. Small-business tools do not scale with your complexity." },
        { title: "Leadership Still in the Weeds", desc: "Executives are still doing work that should have been delegated or automated years ago, because there was never time to fix it." },
      ],
    },
    {
      type: "steps",
      kicker: "What We Do",
      heading: "Built Around How You",
      headingAccent: "Actually Work",
      steps: [
        { title: "Cross-Functional Audit", desc: "We map workflows across sales, ops, and finance to find where AI returns the most time and money at your scale." },
        { title: "Build the Right Agents", desc: "Custom AI agents built around how your teams work today, not a generic template." },
        { title: "Deploy & Connect", desc: "Your agents plug into the systems you already run on and go live in weeks, not quarters." },
        { title: "Scale With You", desc: "As you add headcount and complexity, we expand the system rather than starting over." },
      ],
    },
    {
      type: "bullets",
      kicker: "Where Mid-Market Teams See the Fastest Wins",
      heading: "The Work Your Team",
      headingAccent: "Stops Doing by Hand",
      bullets: [
        "Sales follow-up and CRM hygiene across a growing pipeline",
        "Finance close, reporting, and AP/AR follow-up",
        "Customer support triage as ticket volume climbs",
        "Internal operations and cross-department handoffs",
        "Hiring and onboarding as headcount scales",
        "Vendor and contract management",
      ],
    },
    {
      type: "columns",
      kicker: "Why Apollo Claw",
      heading: "Right-Sized for Where You",
      headingAccent: "Are Now",
      items: [
        { title: "Right-Sized Engagement", desc: "No enterprise sales cycle, no bloated software licenses. A build that matches your actual size and budget." },
        { title: "Senior-Level Delivery", desc: "You work directly with the people building your system, not a rotating account team." },
        { title: "Room to Grow", desc: "The system we build today is the foundation for what you need at double the size, not a rebuild." },
      ],
    },
    {
      type: "cta",
      heading: "Ready to scale without scaling",
      headingAccent: "headcount?",
      sub: "Book a free discovery call. We will show you exactly where AI pays off first at your size.",
      button: { label: "Book a Free Discovery Call", href: "/contact" },
    },
  ],
};

export default function AiConsultingMidMarketPage() {
  return <SeoLanding data={data} />;
}
