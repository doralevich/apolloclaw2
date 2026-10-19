import type { Metadata } from "next";
import PracticeAreaPage, { type PracticeAreaData } from "@/components/PracticeAreaPage";
import { agentOgImages } from "@/lib/seo";

// Commercial litigation, in the legal cluster (Oct 19 2026). Copy approved by David before merge.

const URL = "https://apolloclaw.ai/industries/law-firms/commercial-litigation";

export const metadata: Metadata = {
  title: { absolute: "AI Agent for Commercial Litigation Firms | Apollo Claw" },
  description:
    "An AI agent for commercial litigation firms: docket and deadline tracking, discovery organized and summarized, matter briefs and billing narratives.",
  alternates: { canonical: URL },
  openGraph: {
    images: agentOgImages("legal"),
    title: "AI Agent for Commercial Litigation Firms | Apollo Claw",
    description: "Docket and deadline tracking, discovery organized, matter briefs, client reporting and billing narratives.",
    url: URL,
    type: "website",
  },
};

const data: PracticeAreaData = {
  slug: "commercial-litigation",
  name: "Commercial Litigation",
  updated: "2026-10-19",
  badge: "Apollo[Claw] Litigation Edition",
  title: <>The Docket Kept.<br />The Discovery Organized.</>,
  punch: "The Law Agent, set up for business disputes from demand letter to judgment.",
  sub: "Apollo Claw's Law Agent for commercial litigation keeps one docket across every matter, organizes and summarizes discovery as it arrives, prepares a brief before every meeting, drafts client reports for approval, and writes the billing narrative at the end of the day.",
  painsKicker: "The Litigation Problem",
  painsHeading: "Litigation Is Lost in the Gaps Between Deadlines",
  painsIntro:
    "A commercial dispute is months of filings, productions and conferences, each with a date someone else set. The matters that go wrong rarely turn on the law. They turn on the response deadline nobody calendared, the production nobody indexed, and the client who stopped hearing from the firm.",
  pains: [
    { title: "The Docket Lives in Too Many Places", desc: "Court rules, scheduling orders, discovery deadlines, motion returns and statute dates across the practice system, Outlook and a paralegal's spreadsheet. One of them is wrong." },
    { title: "Discovery Arrives Faster Than It Can Be Read", desc: "Productions by the thousand pages, deposition transcripts, expert reports. The associate who summarizes them is the associate who is also drafting the motion." },
    { title: "Every Meeting Starts With Catching Up", desc: "Who is the opposing counsel, what moved since last week, what is due next. Twenty minutes of reconstruction before every call with the client or the court." },
    { title: "Clients Want Reports and Narratives Want Writing", desc: "In-house counsel expects a monthly status report and a bill with narratives that survive their guidelines. Both get written late, from memory, at month end." },
  ],
  featuresHeading: "A Law Agent Built for Litigation Practice",
  featuresIntro: "Set up for your courts, your matter types and your reporting cadence, and connected to the practice and document systems you already run.",
  features: [
    { title: "One Docket, Every Matter", desc: "Scheduling orders, discovery deadlines, motion returns, conference dates and statutes read from your practice system into one list, with a morning brief per attorney and alerts early enough to act. The court calendar stays in human hands; the agent reminds." },
    { title: "Discovery Organized as It Arrives", desc: "Incoming productions categorized, named by matter and filed where you keep them, with plain-language summaries of transcripts, reports and key documents delivered for attorney review." },
    { title: "A Brief Before Every Meeting", desc: "A one-pager on the matter before each client call, deposition or court appearance: who is on the other side, what changed since last time, what is due next and what to push on." },
    { title: "Client Reports, Drafted for Approval", desc: "A status report per matter on the cadence in-house counsel expects, in your voice, from what changed in the file. The responsible attorney approves each one." },
    { title: "Conflict Checks on Incoming Matters", desc: "Before a consultation is booked, the agent collects the parties and prompts the conflict check in your practice system." },
    { title: "Billing Narratives Written Daily", desc: "An end-of-day prompt listing the matters each timekeeper touched, with draft narratives written to the client's guidelines, so month end is a review rather than a reconstruction." },
  ],
  faqs: [
    { q: "Does the agent replace our docketing software?", a: "It reads from it. If you run a dedicated docketing or conflicts system, the agent reads deadlines from that and the practice system into one brief. If deadlines live in calendars and spreadsheets today, the agent becomes the one list, with a human still entering every court date." },
    { q: "Can it summarize privileged documents safely?", a: "It runs on a Mac Mini on your network or a private virtual server reserved for your firm, with access only to the systems you connect. Summaries stay inside the firm, with attorneys the only readers, and your confidentiality rules, such as ethical walls between matters, sit on top of the standard privilege protection." },
    { q: "Will it write billing narratives our clients will accept?", a: "It drafts them from the day's activity and the client's billing guidelines you load at setup, and the timekeeper edits and approves. Firms use it to catch the unbilled hours and to retire the month-end rewrite, with every entry still the attorney's." },
    { q: "Which systems does it connect to?", a: "Clio, MyCase, PracticePanther, Filevine, NetDocuments, iManage and the document and e-discovery platforms your firm already runs, plus Outlook or Google Workspace. Every engagement is scoped to your stack." },
  ],
  ctaHeading: "Built for Firms That Want the Docket Right and the Associates Drafting",
  ctaSub: "Bring your open matter count and your reporting cadence to a discovery call. We will show you where the agent takes the first job.",
};

export default function CommercialLitigationPage() {
  return <PracticeAreaPage data={data} />;
}
