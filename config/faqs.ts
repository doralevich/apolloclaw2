// Every FAQ on the site, in one place (David, Sept 27 2026: "The FAQ page should have every single
// FAQ question we have on the entire site"). Each page imports its own list from here and /faq
// renders all of them, so a question edited here changes on both at once.
//
// The answers follow the site's copy rules (positive framing, no em dashes, no "actually" or
// "new"); rewritten to them Oct 4 2026. Setup time is one answer everywhere: SETUP_TIME_ANSWER.

import { PRICING_FAQ_ANSWER } from "@/config/agent-plans";

export type Faq = { q: string; a: string };

/** The one answer to "how long does setup take?", everywhere (David, Oct 4 2026: the online
 *  build, custom agent included, takes about 15 minutes). */
export const SETUP_TIME_ANSWER =
  "About 15 minutes. Answer a short questionnaire and your custom agent is built for you online, running on its own private server. Then 30 days of hands-on training as it learns how you work.";

export const HOME_FAQS: Faq[] = [
  {
    q: "How is my data protected?",
    a: "Every agent is privately deployed for one client, on a dedicated private server or your own Mac Mini. Your data stays in your environment and your accounts.",
  },
  {
    q: "How quickly will my agent be up and running?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "Which tools does it work with?",
    a: "Google Workspace, Microsoft 365, Slack, Telegram, calendars, CRMs, and more. We connect your agent to the tools you already use.",
  },
  {
    q: "What does support look like after launch?",
    a: "Every build includes 30 days of hands-on training. After that, ongoing support plans keep your agent sharp as your business grows.",
  },
  {
    q: "Is this a fit for a business my size?",
    a: "Yes. We work with solo founders, growing teams, and established companies. Your agent scales right along with you.",
  },
  {
    q: "Do I need a technical team to run it?",
    a: "Our team handles the full setup and every connection. You work with your agent through email, Slack, or Telegram, the same way you'd message a trusted colleague.",
  },
];

export const GENERAL_FAQS: Faq[] = [
  {
    q: "What exactly is an AI agent?",
    a: "An AI agent is software that takes action on your behalf: reading email, scheduling meetings, updating your CRM, researching topics, and more. A chatbot answers questions; an agent gets the work done.",
  },
  {
    q: "Do I need any technical expertise to use this?",
    a: "Our team handles all the technical setup. You work with your agent through Telegram, Slack, or email, the same way you'd message a team member.",
  },
  {
    q: "What tools does it connect to?",
    a: "Gmail, Google Calendar, common CRMs (HubSpot, Salesforce, Pipedrive), Slack, Notion, Google Drive, and hundreds of other tools. We tailor the connections to the tools you use every day.",
  },
  {
    q: "How long does setup take?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "Is my data secure?",
    a: "Yes. Every agent is privately deployed for one client, on a dedicated private server or your own Mac Mini, and your data stays in your environment and your accounts. Our Security page has the details.",
  },
  {
    q: "How much does it cost?",
    a: PRICING_FAQ_ANSWER,
  },
  {
    q: "What if I want to cancel?",
    a: "Plans run month to month after your initial setup period, and you can change or cancel your plan from your billing settings at any time.",
  },
  {
    q: "How is Apollo[Claw] different from just using ChatGPT?",
    a: "ChatGPT is a conversation tool. Apollo[Claw] agents are connected to your business systems and take action on their own. The difference is like having a calculator versus having a bookkeeper.",
  },
];

export const CEO_AGENT_FAQS: Faq[] = [
  {
    q: "What exactly is an AI bot?",
    a: "An AI bot is software connected to your business tools that takes action on your behalf. It reads, prioritizes, drafts, tracks, and follows up on its own initiative.",
  },
  {
    q: "How is this different from using ChatGPT or a generic AI tool?",
    a: "ChatGPT is a conversation tool. The CEO Bot is connected to your systems and configured for your workflows. It knows your voice, your priorities, your team. The difference is a calculator versus a chief of staff.",
  },
  {
    q: "How long does it take to get up and running?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "Is my data secure?",
    a: "Yes. We build on your infrastructure wherever possible, every connection uses least-privilege access, and your data stays on servers you or we control.",
  },
  {
    q: "What does it cost?",
    a: PRICING_FAQ_ANSWER,
  },
  {
    q: "Do I need a technical team to run this?",
    a: "Our team handles all the technical setup. You work with your bot through Telegram, Slack, or email, the same way you would with a team member.",
  },
];

export const CFO_AGENT_FAQS: Faq[] = [
  {
    q: "What financial systems does the CFO Agent connect to?",
    a: "We connect to QuickBooks, NetSuite, Sage, Xero, and most major ERP platforms. We also work with Excel and Google Sheets-based workflows. Every engagement is scoped individually.",
  },
  {
    q: "How long does it take to get up and running?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "Will it replace my finance team?",
    a: "It frees them up. It takes on the production work, such as report generation, data pulls, and reconciliation tracking, so your team can focus on analysis, interpretation, and strategic advice.",
  },
  {
    q: "Is our financial data secure?",
    a: "Yes. We connect with read-only credentials wherever possible and least-privilege access throughout, and your data stays on servers you or we control.",
  },
  {
    q: "What does it cost?",
    a: PRICING_FAQ_ANSWER,
  },
  {
    q: "Can it handle multi-entity reporting?",
    a: "Yes. Multi-entity consolidation is one of the most common use cases. We configure the agent to handle intercompany eliminations and consolidated reporting.",
  },
];

export const LAW_AGENT_FAQS: Faq[] = [
  {
    q: "Is the Law Agent a substitute for a lawyer?",
    a: "It supports your lawyers. It is a drafting and review tool that takes on the production work so your team or your counsel can focus on judgment. Legal advice comes from a licensed attorney, and the agent recommends that a qualified attorney review anything binding before you sign or file.",
  },
  {
    q: "What tools does the Law Agent work with?",
    a: "It works where your documents already live: Microsoft Word, Google Docs, DocuSign, common contract-management platforms, and your storage in SharePoint, OneDrive, Google Drive, or Box. Every engagement is scoped to your setup.",
  },
  {
    q: "How long does it take to get up and running?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "Can it draft from our own templates and playbook?",
    a: "Yes, and it should. The agent works from your template library and standard positions, so first drafts and redlines start from your language rather than a generic form.",
  },
  {
    q: "Is our data confidential?",
    a: "Yes. We use least-privilege access throughout and honor the confidentiality rules you set, including keeping privileged material on systems you approve. Your data stays on servers you or we control.",
  },
  {
    q: "What does it cost?",
    a: PRICING_FAQ_ANSWER,
  },
];

export const INSURANCE_FAQS: Faq[] = [
  {
    q: "What agency management systems does the Insurance Agent connect to?",
    a: "We connect to Applied Epic, Hawksoft, AMS360, EZLynx, and most major AMS platforms. We also work with spreadsheet-based systems. Every engagement is scoped individually.",
  },
  {
    q: "How does it handle renewal outreach?",
    a: "The agent identifies policies approaching renewal, starts outreach at your chosen lead time (typically 90 days), follows up until it hears back, and brings in your producers when a decision is needed.",
  },
  {
    q: "Will it replace my service team?",
    a: "It works alongside them. The agent handles first-touch communication, follow-up sequences, and status updates, and your team handles coverage decisions, complex questions, and relationship conversations.",
  },
  {
    q: "Is client data secure?",
    a: "Yes. We connect with least-privilege credentials, every connection is encrypted, and your data stays on servers you or we control.",
  },
  {
    q: "How long does it take to get up and running?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "What does it cost?",
    a: PRICING_FAQ_ANSWER,
  },
];

export const LAW_FIRMS_FAQS: Faq[] = [
  {
    q: "What case management systems does the Law Agent connect to?",
    a: "We connect to Clio, MyCase, PracticePanther, Filevine, and most major legal practice management platforms. We also work with firms using Outlook and shared drives. Every engagement is scoped individually.",
  },
  {
    q: "How does client intake work?",
    a: "The agent receives inquiries through your intake form, website, or email. It pre-screens for your practice areas, collects key facts, and routes qualified prospects to the right attorney with a summary already written.",
  },
  {
    q: "Is client data secure?",
    a: "Yes. We build on your infrastructure and use least-privilege access throughout, and client communications stay on your systems unless you authorize otherwise.",
  },
  {
    q: "Will it replace my paralegals?",
    a: "It gives them time back. It takes on the first-touch admin work, such as intake, scheduling, status updates, and document routing, so your paralegals can focus on substantive legal support.",
  },
  {
    q: "How long does it take to get up and running?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "What does it cost?",
    a: PRICING_FAQ_ANSWER,
  },
];

export const MEDICAL_FAQS: Faq[] = [
  {
    q: "What EHR and practice management systems does the Medical Agent connect to?",
    a: "We connect to athenahealth, Epic, DrChrono, Kareo, Jane App, and most major EHR and practice management platforms. Every engagement is scoped individually.",
  },
  {
    q: "How is patient information handled?",
    a: "Patient information stays on infrastructure you approve, a dedicated private server or your own Mac Mini, with least-privilege access to the systems you connect. Before launch we agree what the agent may see and where it may write, and your practice keeps control of both.",
  },
  {
    q: "Will it replace my front desk staff?",
    a: "It supports them. It takes on the high-volume repetitive work, such as reminders, intake collection, and follow-up sequences, so your staff can focus on the patients in front of them.",
  },
  {
    q: "How does the scheduling integration work?",
    a: "We connect to the scheduling system you already use. The agent reads availability and books, confirms, and reschedules appointments by the rules you define, so every booking fits your calendar.",
  },
  {
    q: "How long does it take to get up and running?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "What does it cost?",
    a: PRICING_FAQ_ANSWER,
  },
];

export const REAL_ESTATE_FAQS: Faq[] = [
  {
    q: "What CRM systems does the Real Estate Agent connect to?",
    a: "We connect to Follow Up Boss, kvCORE, BoomTown, HubSpot, Salesforce, and most major real estate CRMs. We also work with spreadsheet-based systems. Every engagement is scoped individually.",
  },
  {
    q: "How fast does it follow up with a lead?",
    a: "Within two minutes of a lead coming in, regardless of time of day. Speed to lead is one of the highest-leverage improvements most agents see immediately.",
  },
  {
    q: "Will it sound like me or like a robot?",
    a: "We train the agent on your communication style during onboarding. Most clients tell us their prospects hear the same voice they know, and many prefer it because every reply is prompt and professional.",
  },
  {
    q: "How long does it take to get up and running?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "What does it cost?",
    a: PRICING_FAQ_ANSWER,
  },
  {
    q: "Do I need a technical team to run this?",
    a: "Our team handles all the technical setup. You work with your agent through the tools you already use: email, text, or your CRM.",
  },
];

export const PERSONAL_INJURY_FAQS: Faq[] = [
  {
    q: "What case management systems does the agent connect to?",
    a: "We connect to Filevine, CASEpeer, Litify, Clio, MyCase, and most major personal injury practice platforms. Firms running on Outlook and shared drives are covered too, and every engagement is scoped individually.",
  },
  {
    q: "Does the AI give legal advice to potential clients?",
    a: "Legal advice stays with your attorneys. The agent is an intake specialist and case companion: it collects the facts of the injury, screens against your case criteria, schedules the consultation, and keeps clients informed, while your attorneys make every legal judgment.",
  },
  {
    q: "How fast does it respond to an injury inquiry?",
    a: "Within minutes, at any hour. Injured people call whoever answers first, so the agent responds right away, collects the incident details, and books the consultation while the inquiry is fresh.",
  },
  {
    q: "How long does it take to get up and running?",
    a: SETUP_TIME_ANSWER,
  },
];

/** A page's FAQs as schema.org Question entities, so a page's structured data always says what
 *  its accordion says. Pages used to carry their own copy of every answer as JSON-LD text, which
 *  drifted the first time an answer here was edited. */
export function faqEntities(faqs: Faq[]) {
  return faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  }));
}
