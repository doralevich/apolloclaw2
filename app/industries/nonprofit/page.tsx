import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "AI for Nonprofits | Donor Outreach, Grant Research & Volunteer Coordination | Apollo[Claw]" },
  description:
    "AI agents for nonprofits. Automate donor communication, grant research, volunteer coordination, and board reporting so your team focuses on the mission, not the admin.",
  alternates: {
    canonical: "https://apolloclaw.ai/industries/nonprofit",
  },
  openGraph: {
    images: OG_IMAGES,
    title: "AI for Nonprofits | Donor Outreach, Grant Research & Volunteer Coordination",
    description:
      "Apollo[Claw] AI agents for nonprofits. Automate donor outreach, grant research, volunteer coordination, and board reporting so your team focuses on the mission.",
    url: "https://apolloclaw.ai/industries/nonprofit",
    type: "website",
  },
};

const uc = {
  label: "Nonprofit",
  title: "AI for",
  subtitle: "Nonprofits",
  description: "Apollo[Claw] helps mission-driven organizations do more with the team they have by automating the operational work that takes time away from the mission.",
  challenges: [
    "Donor outreach inconsistent and time-consuming",
    "Grant research and application management overwhelming",
    "Volunteer coordination handled by email and spreadsheet",
    "Event management requiring full-time attention",
    "Board reporting prepared manually each quarter",
    "Impact reporting taking weeks to compile",
  ],
  solutions: [
    { title: "Donor Engagement", desc: "Automated donor thank-you sequences, anniversary touches, and campaign follow-up so every donor feels seen without a full-time development officer." },
    { title: "Grant Research", desc: "AI researches matching grants, summarizes eligibility requirements, and tracks deadlines so your team applies to more opportunities." },
    { title: "Volunteer Coordination", desc: "Scheduling, reminders, and shift confirmations handled automatically; your volunteers show up because they were reminded, not forgotten." },
  ],
  results: [
    "Stronger donor retention with consistent outreach",
    "More grant applications submitted with research support",
    "Volunteer no-shows reduced with automated reminders",
    "Staff time freed for mission-critical work",
  ],
};

export default function NonprofitPage() {
  return <UseCaseTemplate uc={uc} />;
}
