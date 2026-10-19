import type { Metadata } from "next";
import PracticeAreaPage, { type PracticeAreaData } from "@/components/PracticeAreaPage";
import { agentOgImages } from "@/lib/seo";

// Family law, in the legal cluster (Oct 19 2026). Copy approved by David before merge.

const URL = "https://apolloclaw.ai/industries/law-firms/family-law";

export const metadata: Metadata = {
  title: { absolute: "AI Agent for Family Law Firms | Apollo Claw" },
  description:
    "An AI agent for family law firms: sensitive intake screened within minutes, financial disclosures chased, hearing dates tracked and clients kept informed.",
  alternates: { canonical: URL },
  openGraph: {
    images: agentOgImages("legal"),
    title: "AI Agent for Family Law Firms | Apollo Claw",
    description: "Sensitive intake screened within minutes, disclosures chased, hearing dates tracked, clients kept informed.",
    url: URL,
    type: "website",
  },
};

const data: PracticeAreaData = {
  slug: "family-law",
  name: "Family Law",
  updated: "2026-10-19",
  badge: "Apollo[Claw] Family Law Edition",
  title: <>Every Call Answered.<br />Every Date Kept.</>,
  punch: "The Law Agent, set up for divorce, custody and support matters.",
  sub: "Apollo Claw's Law Agent for family law answers every inquiry with care the moment it arrives, screens it against your criteria, collects the disclosures, tracks every hearing and mediation date, and keeps anxious clients informed between them.",
  painsKicker: "The Family Law Problem",
  painsHeading: "Family Law Is Won on Responsiveness and Lost in the Paperwork",
  painsIntro:
    "The people who call a family lawyer are calling on one of the worst weeks of their lives. The firm that answers first and keeps answering wins the matter. The firm that lets a disclosure deadline or a client's question slip loses it, and the review that goes with it.",
  pains: [
    { title: "First Calls Come at the Worst Hours", desc: "A parent who decides at 10 pm on a Sunday calls until someone picks up. By Monday morning the matter is with the firm that answered." },
    { title: "Disclosures Arrive Late and Incomplete", desc: "Statements of net worth, tax returns, pay stubs, account statements: chased by email, tracked in heads, missing when the deadline is Friday." },
    { title: "Hearings, Conferences and Custody Schedules Collide", desc: "Preliminary conferences, mediation sessions, motion returns and parenting-time changes live in three calendars and one paralegal's memory." },
    { title: "Clients Need to Hear From You Weekly", desc: "A custody matter runs for months. A client who hears silence assumes the worst, calls daily, and tells friends. Nobody has the hours to write every update." },
  ],
  featuresHeading: "A Law Agent Built for Family Practice",
  featuresIntro: "Set up for your matter types, your intake questions and your calendar, and connected to the practice system you already run.",
  features: [
    { title: "Sensitive Intake, Day or Night", desc: "Every call, form and message answered the moment it arrives, in a tone set by you. The agent gathers the basics, flags urgency such as an order of protection, screens against your criteria, and books the consultation with the right attorney." },
    { title: "Conflict Check Prompts", desc: "Before a consultation is booked, the agent collects the names on both sides and prompts the conflict check in your practice system, so every consultation is cleared before it lands on a calendar." },
    { title: "Disclosure Checklists That Chase Themselves", desc: "A checklist per matter from your templates, sent to the client, tracked as items arrive, and chased on a schedule you set. Your paralegal sees what is outstanding on every matter in one view." },
    { title: "One Calendar for Every Date", desc: "Hearings, conferences, mediation, response deadlines and parenting-time changes read from your practice system into one morning brief per attorney, with alerts early enough to act." },
    { title: "Client Updates, Drafted for Approval", desc: "A status update per active matter on the cadence you choose, in your voice, from what changed in the file. A paralegal approves each one; clients hear from you before they have to ask." },
    { title: "Time Captured Before It Fades", desc: "An end-of-day prompt listing the matters each timekeeper touched, so the calls and emails of a custody week are billed rather than forgotten." },
  ],
  faqs: [
    { q: "Can the agent handle a caller who is upset or in danger?", a: "It is set up to recognize urgency, such as a request for an order of protection, and to route that caller to a person at once. For everything else it listens, gathers the basics in a calm tone you approve, and books a consultation. It gives no advice." },
    { q: "Does it see the whole file?", a: "Only what you connect it to and only with the permissions you grant. Many family firms start with intake and the calendar, and connect the document system once they have watched it work for a month." },
    { q: "Which practice systems does it connect to?", a: "Clio, MyCase, PracticePanther, Filevine, Smokeball and most major platforms, plus Outlook or Google Workspace for email and calendar. Every engagement is scoped to your stack." },
    { q: "How do we keep privilege and confidentiality?", a: "Privilege is protected on every Law Agent build, and your own rules sit on top: initials in place of client names in summaries, ethical walls between matters, client consent before AI touches a file. The agent runs on a Mac Mini on your network or a private virtual server reserved for your firm." },
  ],
  ctaHeading: "Built for Family Firms Whose Phones Ring at Night",
  ctaSub: "Bring your intake numbers and your calendar to a discovery call. We will show you where the agent takes the first job.",
};

export default function FamilyLawPage() {
  return <PracticeAreaPage data={data} />;
}
