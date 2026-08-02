import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";

export const metadata: Metadata = {
  title: { absolute: "AI Consulting for Education | Apollo Claw" },
  description:
    "Apollo Claw partners with schools, colleges, and universities to deploy AI across admissions, student services, and campus operations, without adding headcount.",
  alternates: { canonical: "https://apolloclaw.ai/ai-consulting-education" },
  openGraph: {
    title: "AI Consulting for Education | Apollo Claw",
    description:
      "AI for admissions, student services, and campus operations at schools, colleges, and universities.",
    url: "https://apolloclaw.ai/ai-consulting-education",
    type: "website",
  },
};

const data: SeoLandingData = {
  hero: {
    label: "For Schools & Institutions",
    title: "AI Consulting for",
    titleAccent: "Education",
    description:
      "Apollo Claw partners with schools, colleges, and universities to deploy AI across admissions, student services, and campus operations, without adding headcount.",
    cta: { label: "Book a Free Discovery Call", href: "/contact" },
  },
  sections: [
    {
      type: "columns",
      kicker: "The Education Problem",
      heading: "More Demand, Not More",
      headingAccent: "Staff",
      items: [
        { title: "Inquiry Volume Outpaces Staff", desc: "Admissions, financial aid, and registrar offices field the same questions hundreds of times a semester with no more staff to answer them." },
        { title: "Fragmented Systems", desc: "Student information systems, LMS platforms, and communication tools rarely talk to each other, so staff do the connecting by hand." },
        { title: "Budgets Under Pressure", desc: "Enrollment and funding pressure means new headcount is rarely the answer, even as demand for support keeps growing." },
      ],
    },
    {
      type: "steps",
      kicker: "How We Deploy in Education",
      heading: "From Audit to",
      headingAccent: "Go-Live",
      steps: [
        { title: "Discovery & Audit", desc: "We map your admissions, student services, and operational workflows to find where AI has the clearest impact." },
        { title: "Build & Integrate", desc: "We connect the agent to your SIS, LMS, and communication tools so it works inside systems you already run." },
        { title: "Deploy & Train", desc: "Staff are trained to work alongside the agent from day one. No technical background required." },
        { title: "Support & Expand", desc: "We tune the system through each enrollment cycle and expand it to new departments as it proves out." },
      ],
    },
    {
      type: "bullets",
      kicker: "Where Institutions Put AI to Work",
      heading: "Support Across the",
      headingAccent: "Institution",
      bullets: [
        "Admissions inquiry response and applicant follow-up",
        "Financial aid and registrar question handling",
        "Student services and advising support",
        "Faculty and staff administrative support",
        "Campus communications and event logistics",
        "Alumni and donor engagement",
      ],
    },
    {
      type: "prose",
      kicker: "Data Governance",
      heading: "Built for the Way Institutions",
      headingAccent: "Operate",
      paragraphs: [
        "Higher education runs on trust with students, families, and regulators. Apollo Claw is FERPA-aware and will execute a data-processing agreement for institutional clients, the same standard we hold across every education engagement.",
      ],
    },
    {
      type: "bullets",
      kicker: "Security & Compliance",
      heading: "Every Protection We",
      headingAccent: "Apply",
      bullets: [
        "Encrypted in transit and at rest, TLS 1.3 with AES-256",
        "Least-privilege access, multi-factor authentication enforced on every administrative account",
        "No data resale, ever, institutional data belongs to the institution",
        "SOC 2 Type I compliant, Type II on track for completion by the end of September 2026",
        "GDPR compliant, with consent-based analytics and deletion on request",
        "FERPA-aware for education clients, completed HECVAT responses, and a data-processing agreement on execution",
        "Full detail, infrastructure, governance, and documentation for IT and procurement, on our security and compliance page",
      ],
    },
    {
      type: "cta",
      heading: "Ready to bring AI into your",
      headingAccent: "institution?",
      sub: "Book a free discovery call. We will show you exactly where AI helps first on your campus.",
      button: { label: "Book a Free Discovery Call", href: "/contact" },
    },
  ],
};

export default function AiConsultingEducationPage() {
  return <SeoLanding data={data} />;
}
