import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "AI for E-Commerce Businesses",
  description: "Apollo[Claw] AI agents for e-commerce operators. Automate customer service, order management, inventory alerts, and marketing follow-up.",
};

const uc = {
  label: "E-Commerce",
  title: "AI for",
  subtitle: "E-Commerce",
  description: "Apollo[Claw] helps online retailers automate customer service, order workflows, and marketing so you can scale without scaling your headcount.",
  challenges: [
    "Customer support tickets piling up",
    "Order status questions sent to support instead of checking the site",
    "Abandoned cart follow-up not happening fast enough",
    "Returns and refund requests requiring manual handling",
    "Inventory alerts not reaching the right people in time",
    "Product review outreach sent inconsistently",
  ],
  solutions: [
    { title: "Support Automation", desc: "AI handles tier-1 support questions automatically, order status, return policies, shipping updates, escalating only what requires a human." },
    { title: "Abandoned Cart Recovery", desc: "Automated, personalized follow-up sequences triggered the moment a cart is abandoned. Timing and tone calibrated for conversion." },
    { title: "Inventory & Ops", desc: "Low stock alerts, supplier notification drafts, and inventory reconciliation reports delivered to your inbox on your schedule." },
  ],
  results: [
    "Support ticket volume reduced by automating common questions",
    "Higher cart recovery rates with immediate follow-up",
    "No inventory stockouts from delayed alerts",
    "Review and loyalty outreach sent consistently",
  ],
};

export default function EcommercePage() {
  return <UseCaseTemplate uc={uc} />;
}
