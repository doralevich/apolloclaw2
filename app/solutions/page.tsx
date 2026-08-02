import type { Metadata } from "next";
import CategoryIndex, { type CategoryIndexData } from "@/components/CategoryIndex";

export const metadata: Metadata = {
  title: { absolute: "AI Solutions by Company Size | Apollo Claw" },
  description:
    "AI implementation right-sized for where you are, from small businesses and mid-market companies to enterprise rollouts and institutions.",
  alternates: { canonical: "https://apolloclaw.ai/solutions" },
  openGraph: {
    title: "AI Solutions by Company Size | Apollo Claw",
    description: "AI implementation right-sized for where you are, startup through enterprise.",
    url: "https://apolloclaw.ai/solutions",
    type: "website",
  },
};

const data: CategoryIndexData = {
  label: "By Size",
  title: "Right-sized for",
  titleAccent: "where you are",
  description:
    "A five-person shop and a five-hundred-person company need different things from the same technology. Start from the one that sounds like you.",
  items: [
    { label: "Small Business", to: "/ai-consulting-small-business", description: "Cover the seats you cannot afford to hire for yet, without a technical team to run it." },
    { label: "Mid-Market", to: "/ai-consulting-mid-market", description: "Standardize the manual work that has grown across departments as the company scaled." },
    { label: "Enterprise", to: "/ai-consulting-enterprise", description: "Deploy inside existing security, compliance, and procurement requirements." },
    { label: "Education & Institutions", to: "/ai-consulting-education", description: "Admissions, student services, and campus operations supported without adding headcount." },
    { label: "AI Implementation", to: "/ai-implementation", description: "How a deployment actually runs, from discovery through go-live and ongoing tuning." },
    { label: "New York", to: "/ai-consulting-new-york", description: "Local AI consulting for New York businesses, same region and same time zone." },
  ],
  closing: {
    heading: "Not sure which one fits",
    headingAccent: "you?",
    sub: "Book a free consultation. We will look at how your team works today and tell you where an agent earns its keep first.",
    button: { label: "Schedule a Consultation", href: "/contact" },
  },
};

export default function SolutionsIndexPage() {
  return <CategoryIndex data={data} />;
}
