import type { Metadata } from "next";
import PracticeAreaPage, { type PracticeAreaData } from "@/components/PracticeAreaPage";
import { agentOgImages } from "@/lib/seo";

// Immigration, in the legal cluster (Oct 19 2026). Copy approved by David before merge.

const URL = "https://apolloclaw.ai/industries/law-firms/immigration";

export const metadata: Metadata = {
  title: { absolute: "AI Agent for Immigration Law Firms | Apollo Claw" },
  description:
    "An AI agent for immigration law firms: intake in the client's language, document checklists that chase themselves, RFE and filing deadlines tracked.",
  alternates: { canonical: URL },
  openGraph: {
    images: agentOgImages("legal"),
    title: "AI Agent for Immigration Law Firms | Apollo Claw",
    description: "Intake in the client's language, document checklists, RFE and filing deadlines tracked, status updates clients understand.",
    url: URL,
    type: "website",
  },
};

const data: PracticeAreaData = {
  slug: "immigration",
  name: "Immigration",
  updated: "2026-10-19",
  badge: "Apollo[Claw] Immigration Edition",
  title: <>Every Deadline Tracked.<br />Every Client Informed.</>,
  punch: "The Law Agent, set up for family, employment and humanitarian immigration practice.",
  sub: "Apollo Claw's Law Agent for immigration answers inquiries in the client's language, builds and chases the document checklist for each case type, tracks every filing window and RFE deadline, and sends status updates clients can understand.",
  painsKicker: "The Immigration Problem",
  painsHeading: "Immigration Practice Is a Thousand Deadlines and a Thousand Questions",
  painsIntro:
    "Every case is a stack of documents from two countries, a filing window set by someone else, and a client who checks the status daily. The firm that keeps the checklist complete and the client calm handles twice the caseload with the same staff.",
  pains: [
    { title: "Intake Comes in Many Languages", desc: "The first call is often in Spanish, Mandarin, Portuguese or Haitian Creole, from a relative, after hours. The firm that answers in the caller's language signs the case." },
    { title: "Checklists Are Long and Always One Item Short", desc: "Passports, birth and marriage certificates, translations, employment letters, tax transcripts, photos to specification. One missing item delays a filing by a month." },
    { title: "RFEs and Filing Windows Set the Pace", desc: "Request-for-evidence deadlines, H-1B cap season, visa bulletin movement, status expirations and I-9 reverification dates, tracked across dozens of open cases." },
    { title: "Clients Ask for Status Every Day", desc: "Receipt notices, biometrics, interview dates, approvals. Clients call and text for updates the firm already has in the file, and every call takes a paralegal off a filing." },
  ],
  featuresHeading: "A Law Agent Built for Immigration Practice",
  featuresIntro: "Set up for your case types, your checklists and your filing calendar, and connected to the case management system you already run.",
  features: [
    { title: "Intake in the Caller's Language", desc: "Every call, form and message answered the moment it arrives, in the language the client uses. The agent gathers the basics, identifies the case type, screens against your criteria, and books the consultation." },
    { title: "Checklists Per Case Type That Chase Themselves", desc: "A document checklist from your templates for each petition or application, sent to the client in their language, tracked as items arrive, with translations and specifications explained, and chased on a schedule you set." },
    { title: "Every Window and Deadline in One Brief", desc: "RFE response dates, status expirations, priority dates against the visa bulletin, cap season and reverification dates read from your case system into one morning brief per attorney, with alerts early enough to act." },
    { title: "First Drafts for Attorney Review", desc: "Support letters, cover letters and RFE response outlines assembled from the file and your prior work, flagged where the attorney's judgment is needed, and delivered for review rather than sent." },
    { title: "Status Updates Clients Understand", desc: "When a receipt, biometrics notice, interview date or decision lands, the agent drafts a plain-language update in the client's language for a paralegal to approve. Clients hear from you first." },
    { title: "Time Captured on Every Case", desc: "An end-of-day prompt listing the cases each timekeeper touched, so flat-fee and hourly work alike are tracked and the firm sees where the hours go." },
  ],
  faqs: [
    { q: "Which languages can the agent handle?", a: "Any language the firm serves clients in. It is set up with the languages you choose at intake, and it keeps the client's language through checklists and updates. A paralegal who reads the language approves anything that goes out." },
    { q: "Does it fill USCIS forms?", a: "It prepares first drafts and supporting letters from the file for the attorney to review, and it keeps the checklist that feeds them. Filing, signatures and anything submitted to USCIS or a court stay with a licensed attorney." },
    { q: "Which case management systems does it connect to?", a: "Clio, MyCase, PracticePanther, Filevine and the major immigration platforms, plus Outlook or Google Workspace for email and calendar. Every engagement is scoped to your stack." },
    { q: "Where does client information live?", a: "On a Mac Mini on your network or a private virtual server reserved for your firm, with least-privilege access to the systems you connect. Privilege is protected on every build, and your confidentiality rules sit on top." },
  ],
  ctaHeading: "Built for Firms That Want the Checklist Complete and the Client Calm",
  ctaSub: "Bring your case types and your intake volume to a discovery call. We will show you which job the agent takes first.",
};

export default function ImmigrationPage() {
  return <PracticeAreaPage data={data} />;
}
