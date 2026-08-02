import type { Metadata } from "next";
import CategoryIndex, { type CategoryIndexData } from "@/components/CategoryIndex";

export const metadata: Metadata = {
  title: { absolute: "AI Agents by Industry | Apollo Claw" },
  description:
    "Apollo Claw builds AI agents around the way your industry actually works, from law firms and medical practices to real estate, insurance, accounting, and more.",
  alternates: { canonical: "https://apolloclaw.ai/industries" },
  openGraph: {
    title: "AI Agents by Industry | Apollo Claw",
    description: "AI agents built around the way your industry actually works.",
    url: "https://apolloclaw.ai/industries",
    type: "website",
  },
};

const data: CategoryIndexData = {
  label: "By Industry",
  title: "Built for the way your",
  titleAccent: "industry works",
  description:
    "The same agent does not fit a law firm and a restaurant. Pick your world and see what the work looks like when an agent handles the first pass.",
  items: [
    { label: "Law Firms", to: "/industries/law-firms", description: "Client intake, deadline tracking, document summaries, and billing follow-up, so attorneys stay on billable work." },
    { label: "Medical Practices", to: "/industries/medical-practices", description: "Scheduling, reminders, and patient follow-up that cuts no-shows, HIPAA-aware from the ground up." },
    { label: "PE-Backed Portfolio Companies", to: "/industries/private-equity", description: "Standardized reporting and back-office automation that repeats across every company in the portfolio." },
    { label: "Real Estate", to: "/industries/real-estate", description: "Lead follow-up within minutes, showings scheduled, and listings drafted before someone else calls back." },
    { label: "Insurance", to: "/industries/insurance", description: "Quote follow-up, renewals, and claims chasing that runs consistently without a producer driving it." },
    { label: "Accounting Firms", to: "/industries/accounting-firms", description: "Client requests, document collection, and close support that hold up through every busy season." },
    { label: "Financial Services", to: "/industries/financial-services", description: "Client onboarding, review prep, and follow-up that stays inside your compliance requirements." },
    { label: "Professional Services", to: "/industries/professional-services", description: "Intake, project admin, and client follow-up, so billable people spend their time on billable work." },
    { label: "E-commerce", to: "/industries/ecommerce", description: "Order questions, returns, and post-purchase follow-up handled at volume without a bigger support team." },
    { label: "Construction & Trades", to: "/industries/construction", description: "Estimates, scheduling, and job follow-up coordinated while your crews stay on site." },
    { label: "Restaurants & Food", to: "/industries/restaurants", description: "Reservations, catering inquiries, and guest follow-up handled through every service." },
    { label: "Nonprofit", to: "/industries/nonprofit", description: "Donor stewardship, grant deadlines, and volunteer coordination on a team that is already stretched." },
    { label: "Academics", to: "/ai-consulting-education", description: "Admissions, student services, and campus operations supported without adding headcount." },
  ],
  closing: {
    heading: "Not sure where an agent helps",
    headingAccent: "first?",
    sub: "Book a free consultation. We will map your workflow and show you the highest-value place to start, with no obligation.",
    button: { label: "Schedule a Consultation", href: "/contact" },
  },
};

export default function IndustriesIndexPage() {
  return <CategoryIndex data={data} />;
}
