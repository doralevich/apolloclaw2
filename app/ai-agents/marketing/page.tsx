import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: { absolute: "AI for Marketing Teams | Apollo[Claw]" },
  description:
    "The Marketing Agent drafts content, runs the campaign calendar, nurtures leads, and keeps reporting current, so a small team publishes like a bigger one.",
  alternates: { canonical: "https://apolloclaw.ai/ai-agents/marketing" },
  openGraph: {
    title: "The Marketing Agent | AI for Content, Campaigns & Nurture",
    description:
      "Drafts content, runs the campaign calendar, nurtures leads, and keeps reporting current.",
    url: "https://apolloclaw.ai/ai-agents/marketing",
    type: "website",
  },
};

const uc = {
  label: "Marketing",
  title: "AI for",
  subtitle: "Marketing Teams",
  description:
    "Marketing runs on a calendar that never stops. The Marketing Agent takes the production half, drafting, scheduling, nurturing, and reporting, so the people on your team spend their time on the ideas rather than the output.",
  challenges: [
    "A content calendar that slips the moment something urgent lands",
    "Social and email drafted from scratch every single week",
    "Leads sitting in the CRM with no nurture sequence running",
    "Campaign reporting pulled by hand at the end of the month",
    "Repurposing one good piece into every channel never happening",
    "One or two marketers covering what a full team normally does",
  ],
  solutions: [
    {
      title: "Content Drafting",
      desc: "Blog posts, emails, and social copy drafted in your voice from a brief, an outline, or a piece you already published, so the team edits instead of starting cold.",
    },
    {
      title: "Campaign Calendar",
      desc: "The calendar planned, scheduled, and actually posted on time across your channels, including the weeks when everyone is heads-down on something else.",
    },
    {
      title: "Lead Nurture",
      desc: "New leads sorted by where they came from and what they looked at, then moved through a nurture sequence that keeps running without a person driving it.",
    },
    {
      title: "Repurposing",
      desc: "One webinar, post, or case study turned into the social cuts, the email, and the newsletter section, so good work gets used more than once.",
    },
    {
      title: "Reporting That Is Ready",
      desc: "Channel performance, campaign results, and pipeline contribution pulled and written up on schedule, so the monthly review is a review and not a scramble.",
    },
    {
      title: "Approval Before It Ships",
      desc: "You decide what the agent publishes on its own and what comes to you first. Anything going out under your brand can wait for a human yes.",
    },
  ],
  results: [
    "A content calendar that holds through a busy month",
    "Every lead entering a nurture sequence, not just the ones someone remembered",
    "Reporting ready before the meeting instead of during it",
    "A small marketing team publishing at the volume of a larger one",
  ],
};

export default function MarketingAgentPage() {
  return <UseCaseTemplate uc={uc} />;
}
