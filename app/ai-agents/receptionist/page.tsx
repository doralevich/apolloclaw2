import type { Metadata } from "next";
import UseCaseTemplate from "@/components/UseCaseTemplate";

export const metadata: Metadata = {
  title: "The Receptionist Agent | AI Phone & Front Desk Coverage | Apollo[Claw]",
  description:
    "The Receptionist Agent answers calls, routes messages, and books appointments so the front line stays covered without adding headcount or sending callers to voicemail.",
  alternates: { canonical: "https://apolloclaw.ai/ai-agents/receptionist" },
  openGraph: {
    title: "The Receptionist Agent | AI Phone & Front Desk Coverage",
    description:
      "Answers calls, routes messages, and books appointments so the front line stays covered.",
    url: "https://apolloclaw.ai/ai-agents/receptionist",
    type: "website",
  },
};

const uc = {
  label: "Receptionist",
  title: "AI for",
  subtitle: "Your Front Desk",
  description:
    "The Receptionist Agent picks up when your team cannot. It answers calls, takes the details that matter, routes what needs a person, and books what does not, so a missed call stops meaning a missed customer.",
  challenges: [
    "Calls going to voicemail during busy stretches and after hours",
    "Front desk staff pulled between the phone and the people in front of them",
    "The same handful of questions answered dozens of times a day",
    "Messages taken on paper and lost before they reach the right person",
    "Appointment booking that requires a callback to finish",
    "No coverage on evenings, weekends, or holidays",
  ],
  solutions: [
    {
      title: "Call Answering and Screening",
      desc: "Every call gets picked up, greeted in your voice, and screened for what it actually needs, so nothing lands in a voicemail box nobody checks.",
    },
    {
      title: "Message Routing",
      desc: "The agent captures the caller, the reason, and the urgency, then routes it to the right person by email, text, or Slack with the context already written up.",
    },
    {
      title: "Appointment Booking",
      desc: "Bookings, confirmations, reschedules, and cancellations handled against your live calendar, without a callback to finish the job.",
    },
    {
      title: "Common Questions Answered",
      desc: "Hours, location, pricing, insurance, parking, and the rest of the everyday questions answered on the spot from what you have told it.",
    },
    {
      title: "After-Hours Coverage",
      desc: "The line stays staffed on evenings, weekends, and holidays, with anything urgent escalated to whoever is on call.",
    },
    {
      title: "Escalation on Your Terms",
      desc: "You set what the agent handles alone and what goes straight to a person. Anything outside its lane gets handed off, not guessed at.",
    },
  ],
  results: [
    "Calls answered instead of sent to voicemail",
    "Front desk staff focused on the people in the room",
    "Messages that arrive with the context already captured",
    "Coverage outside business hours without paying for a night shift",
  ],
};

export default function ReceptionistAgentPage() {
  return <UseCaseTemplate uc={uc} />;
}
