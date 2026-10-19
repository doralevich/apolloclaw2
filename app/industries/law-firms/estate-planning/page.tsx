import type { Metadata } from "next";
import PracticeAreaPage, { type PracticeAreaData } from "@/components/PracticeAreaPage";
import { agentOgImages } from "@/lib/seo";

// Estate planning and trusts and estates, in the legal cluster (Oct 19 2026). Copy approved by
// David before merge.

const URL = "https://apolloclaw.ai/industries/law-firms/estate-planning";

export const metadata: Metadata = {
  title: { absolute: "AI Agent for Estate Planning Firms | Apollo Claw" },
  description:
    "An AI agent for estate planning and probate firms: intake questionnaires, first drafts from your templates, signings scheduled and probate deadlines tracked.",
  alternates: { canonical: URL },
  openGraph: {
    images: agentOgImages("legal"),
    title: "AI Agent for Estate Planning Firms | Apollo Claw",
    description: "Intake questionnaires, first drafts from your templates, signings scheduled, review reminders sent.",
    url: URL,
    type: "website",
  },
};

const data: PracticeAreaData = {
  slug: "estate-planning",
  name: "Estate Planning",
  updated: "2026-10-19",
  badge: "Apollo[Claw] Trusts & Estates Edition",
  title: <>From First Call<br />to Signed Plan, Faster.</>,
  punch: "The Law Agent, set up for wills, trusts, probate and administration.",
  sub: "Apollo Claw's Law Agent for estate planning collects the intake questionnaire, assembles first drafts from your templates for attorney review, schedules the signing, tracks every probate deadline, and reminds clients when life changes call for a review.",
  painsKicker: "The Estate Planning Problem",
  painsHeading: "The Work Is Routine Until the One Detail That Is Missing",
  painsIntro:
    "Most estate plans follow a pattern your firm has drafted a thousand times. The hours go to collecting what the client forgot to bring, assembling documents from templates, chasing the signing, and a probate calendar that holds every date to the day.",
  pains: [
    { title: "Intake Questionnaires Come Back Half Done", desc: "Beneficiaries, assets, account titles, prior documents, fiduciary choices. The questionnaire goes out, half returns, and the first meeting is spent collecting the rest." },
    { title: "Drafting Is Assembly, Done by Hand", desc: "A will, a revocable trust, powers of attorney and a health care proxy from templates and a fact pattern, with one changed name that has to be right in every place it appears." },
    { title: "Signings Slip for Weeks", desc: "Witnesses, a notary, the client and the attorney in one room. The plan is drafted and unsigned for a month because nobody owned the scheduling." },
    { title: "Probate Deadlines Hold to the Day", desc: "Creditor claim periods, inventory and accounting due dates, tax elections, court returns. A missed date is the firm's problem, and the executor's." },
  ],
  featuresHeading: "A Law Agent Built for Trusts and Estates",
  featuresIntro: "Set up for your document set, your intake questionnaire and your probate practice, and connected to the systems you already run.",
  features: [
    { title: "Intake That Comes Back Complete", desc: "The agent sends your questionnaire, answers the client's questions about what each item means, chases the blanks on a schedule, and hands the attorney a complete fact pattern before the first meeting." },
    { title: "First Drafts From Your Templates", desc: "Will, trust, powers of attorney and health care documents assembled from your own templates and the intake facts, flagged where a choice needs the attorney, and delivered for review rather than sent." },
    { title: "Signings That Get Scheduled", desc: "The agent finds a slot that works for the client, the attorney and your witnesses, sends the confirmations and the what-to-bring list, and reminds everyone the day before." },
    { title: "The Probate Calendar, Kept", desc: "Claim periods, inventory and accounting dates, tax elections and court returns read from your practice system into one brief per matter, with alerts early enough to act." },
    { title: "Review Reminders on Life Events", desc: "Three years on, or when a client mentions a marriage, a birth, a sale or a move, the agent drafts the review invitation in your voice for approval. Plans stay current and the firm stays in touch." },
    { title: "Beneficiary and Executor Communication", desc: "Status updates during administration, drafted for approval, so the executor hears from you before the beneficiaries call." },
  ],
  faqs: [
    { q: "Does the agent draft legal documents on its own?", a: "It assembles first drafts from your templates and the intake facts, and it flags every place a judgment call belongs to the attorney. Every document reaches a client or a court only after a licensed attorney reviews and signs it." },
    { q: "Can it work from our existing document templates?", a: "Yes. During setup we load your templates and standard positions; the agent fills them from intake and keeps your clause choices. If you use a drafting system such as WealthCounsel or a document assembly tool, we connect to it rather than replace it." },
    { q: "How does it handle probate deadlines?", a: "It reads the matter data from your practice system, keeps one list of every claim period, filing and return date, and sends each attorney a morning brief with what is due in the next two weeks. The court calendar stays in human hands; the agent reminds, early." },
    { q: "Where does client information live?", a: "On a Mac Mini on your network or a private virtual server reserved for your firm, with least-privilege access to the systems you connect. Privilege is protected on every build, and your confidentiality rules sit on top." },
  ],
  ctaHeading: "Built for Firms That Want Every Plan Signed and Filed",
  ctaSub: "Bring your questionnaire and your templates to a discovery call. We will show you what the agent takes off the desk first.",
};

export default function EstatePlanningPage() {
  return <PracticeAreaPage data={data} />;
}
