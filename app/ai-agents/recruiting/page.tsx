import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "AI for Recruiting & Staffing Agencies | Apollo Claw" },
  description:
    "AI agents for recruiters and staffing agencies. Automate resume screening, interview scheduling, and candidate follow-up so your team fills roles faster.",
  alternates: {
    canonical: "https://apolloclaw.ai/ai-agents/recruiting",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "AI for Recruiting & Staffing Agencies | Apollo Claw",
    description: "Automate resume screening, interview scheduling, and candidate follow-up so your team fills roles faster.",
    url: "https://apolloclaw.ai/ai-agents/recruiting",
    type: "website",
  },
};

const uc = {
  label: "Recruiting & Staffing",
  logo: { name: "Recruiting", accent: "#D72B2B" },
  title: "AI for",
  subtitle: "Recruiting",
  description: "Apollo[Claw] helps recruiters and talent teams move candidates through the pipeline faster without adding headcount.",
  challenges: [
    "Resume screening piling up across every open role",
    "Candidate follow-up falling off after the first outreach",
    "Interview scheduling bouncing between calendars all day",
    "Job postings not reaching the right candidates fast enough",
    "Client and hiring manager updates slipping between searches",
    "ATS data entry eating hours every week",
  ],
  solutions: [
    { title: "Candidate Screening", desc: "AI reviews incoming resumes against role requirements and surfaces qualified candidates first, so recruiters spend time interviewing, not sorting." },
    { title: "Interview Coordination", desc: "Automated scheduling and confirmation across candidates, hiring managers, and recruiters, with reminders that cut no-shows." },
    { title: "Pipeline Follow-Up", desc: "Every candidate gets consistent follow-up, from first outreach to offer, so strong candidates never go cold from a missed touch." },
  ],
  results: [
    "Faster time-to-interview on every open role",
    "Fewer qualified candidates lost to slow follow-up",
    "Hours back from manual screening and scheduling",
    "Cleaner, more current ATS data",
  ],
};

export default function RecruitingPage() {
  return <UseCaseTemplate uc={uc} />;
}
