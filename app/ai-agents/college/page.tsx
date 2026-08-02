import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "AI for College Students | Apollo Claw",
  description: "Apollo Claw's College Agent guides students from sophomore year of high school through college graduation: deadlines, coursework, applications, financial aid, and everything in between.",
  alternates: {
    canonical: "https://apolloclaw.ai/ai-agents/college",
  },
  openGraph: {
    title: "AI for College Students | Apollo Claw",
    description: "One agent that guides students through every year of school, from sophomore year of high school through college graduation.",
    url: "https://apolloclaw.ai/ai-agents/college",
    type: "website",
  },
};

const uc = {
  label: "High School Through College",
  logo: { name: "College", accent: "#16A34A" },
  title: "AI for",
  subtitle: "College Students",
  description: "Apollo[Claw] gives students one agent that guides them through every year of school, from sophomore year of high school through college graduation.",
  challenges: [
    "Assignments, deadlines, and exams piling up across every class",
    "College applications, essays, and financial aid forms all due at once senior year",
    "Losing track of which classes and credits are actually needed to graduate",
    "Professor and advisor emails going unanswered until it's too late",
    "Choosing majors, courses, and extracurriculars with no clear long-term plan",
    "Internship and career prep falling by the wayside during the school year",
  ],
  solutions: [
    { title: "Deadline & Coursework Tracking", desc: "AI keeps every assignment, exam, and deadline organized across every class, from freshman year to senior year." },
    { title: "Applications & Financial Aid", desc: "From college applications and essays to financial aid forms, the agent helps students stay ahead of every deadline and requirement." },
    { title: "Guidance Through Every Year", desc: "One agent that carries context from sophomore year of high school through college graduation, helping students plan courses, credits, and next steps." },
  ],
  results: [
    "Fewer missed deadlines and forgotten assignments",
    "Smoother transitions from high school to college and year to year",
    "Less stress around applications, financial aid, and course planning",
    "More time for the things that actually matter to a student's future",
  ],
};

export default function CollegePage() {
  return <UseCaseTemplate uc={uc} />;
}
