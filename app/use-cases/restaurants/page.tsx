import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "AI for Restaurants & Food Businesses",
  description: "Apollo[Claw] AI agents for restaurant operators. Automate reservations, staff scheduling, supplier communication, and customer follow-up.",
};

const uc = {
  label: "Restaurants & Food Service",
  title: "AI for",
  subtitle: "Restaurants",
  description: "Apollo[Claw] helps restaurant operators automate the back-office work that never ends — so you can focus on the food and the floor.",
  challenges: [
    "Reservation management and no-show follow-up",
    "Staff scheduling communicated via text chains",
    "Supplier orders placed manually every week",
    "Customer reviews requiring individual responses",
    "Private event inquiries left unanswered",
    "Payroll and tip tracking labor-intensive",
  ],
  solutions: [
    { title: "Reservation Automation", desc: "AI handles reservation confirmations, reminders, and waitlist management — no more last-minute no-shows without warning." },
    { title: "Staff Coordination", desc: "Automated schedule distribution, shift swap facilitation, and daily briefings sent to your team through their preferred channels." },
    { title: "Customer Follow-Up", desc: "Post-visit thank-you messages, review requests, and loyalty touchpoints sent automatically after each service." },
  ],
  results: [
    "Fewer no-shows with automated reminders",
    "Hours saved each week on staff coordination",
    "Consistent customer follow-up without manual effort",
    "Private event inquiries responded to same day",
  ],
};

export default function RestaurantsPage() {
  return <UseCaseTemplate uc={uc} />;
}
