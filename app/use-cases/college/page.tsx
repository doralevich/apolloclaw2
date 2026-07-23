import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "AI for Colleges & Universities | Apollo Claw",
  description: "Apollo Claw builds AI agents for college and university offices. Admissions, financial aid, and registrar support that reduces routine inquiry volume without adding staff.",
  alternates: {
    canonical: "https://apolloclaw.ai/use-cases/college",
  },
  openGraph: {
    title: "AI for Colleges & Universities | Apollo Claw",
    description: "Admissions, financial aid, and registrar support that reduces routine inquiry volume without adding staff.",
    url: "https://apolloclaw.ai/use-cases/college",
    type: "website",
  },
};

const uc = {
  label: "Higher Education",
  logo: { name: "College", accent: "#16A34A" },
  title: "AI for",
  subtitle: "Colleges & Universities",
  description: "Apollo[Claw] helps college and university offices manage the volume of student and family inquiries without adding headcount.",
  challenges: [
    "Admissions inquiries piling up during peak application season",
    "Financial aid questions repeated hundreds of times each semester",
    "Registrar requests for transcripts and enrollment verification",
    "Prospective student follow-up falling through the cracks",
    "Faculty and staff drowning in routine administrative requests",
    "Orientation and onboarding communication scattered across departments",
  ],
  solutions: [
    { title: "Admissions Support", desc: "AI answers routine applicant questions, tracks application status, and follows up with prospective students so nobody falls out of the funnel." },
    { title: "Financial Aid & Registrar Assistance", desc: "Handles common financial aid and registrar questions, transcript requests, and enrollment verification, freeing staff for complex cases." },
    { title: "Student & Family Communication", desc: "Consistent, timely responses to students and families across admissions, aid, and registrar questions, day or night." },
  ],
  results: [
    "Faster response time for prospective students and families",
    "Less repetitive work for admissions, aid, and registrar staff",
    "Fewer students lost to slow follow-up",
    "Staff time redirected to complex, high-touch cases",
  ],
};

export default function CollegePage() {
  return <UseCaseTemplate uc={uc} />;
}
