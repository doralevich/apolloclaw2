import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Sales AI Agent | AI-Powered Sales Assistant | Apollo[Claw]" },
  description:
    "An AI agent that qualifies leads, follows up with prospects, and keeps your sales pipeline moving — 24/7.",
  alternates: {
    canonical: "https://apolloclaw.ai/ai-agents/sales",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Sales Agent | Automate Outreach, Follow-Up & Pipeline Management",
    description:
      "Apollo[Claw] AI agents for sales teams. Automate outreach, follow-up sequences, and pipeline hygiene so your reps close more deals with less busywork.",
    url: "https://apolloclaw.ai/ai-agents/sales",
    type: "website",
  },
};

const uc = {
  label: "Sales",
  title: "AI for",
  subtitle: "Sales Teams",
  description: "The Sales Agent handles the repetitive, time-consuming parts of your sales process, prospecting, follow-up, and pipeline hygiene, so your team spends its time closing, not chasing.",
  challenges: [
    "Reps spending more time on admin than selling",
    "Follow-up sequences not running consistently",
    "Cold outreach taking hours to personalize at scale",
    "Pipeline data going stale between CRM updates",
    "Leads going cold while reps are tied up elsewhere",
    "No bandwidth to run outbound while managing inbound",
  ],
  solutions: [
    { title: "Outreach Automation", desc: "Personalized cold-to-warm sequences drafted and sent on schedule so your pipeline keeps moving without manual effort." },
    { title: "Follow-Up Sequences", desc: "Every lead gets followed up with the right message at the right time, no manual reminders, no deals falling silent." },
    { title: "CRM & Pipeline Hygiene", desc: "Deal stages updated, contact records enriched, and stale opportunities flagged automatically so your data stays clean." },
  ],
  results: [
    "More conversations started without adding headcount",
    "No leads going cold from missed follow-up",
    "Reps focused on closing, not data entry",
    "Consistent pipeline velocity regardless of team bandwidth",
  ],
};

export default function SalesPage() {
  return <UseCaseTemplate uc={uc} />;
}
