// Every FAQ on the site, in one place (David, Sept 27 2026: "The FAQ page should have every single
// FAQ question we have on the entire site"). Each page imports its own list from here and /faq
// renders all of them, so a question edited here changes on both at once.
//
// The answers follow the site's copy rules (positive framing, no em dashes, no "actually" or
// "new"); rewritten to them Oct 4 2026. Setup time is one answer everywhere: SETUP_TIME_ANSWER.

import { PRICING_FAQ_ANSWER } from "@/config/agent-plans";

export type Faq = { q: string; a: string };

/** The one answer to "how long does setup take?", everywhere (David, Oct 4 2026: the online
 *  build, custom agent included, takes about 15 minutes; hands-on training is an add-on, or part
 *  of a custom build, so it is kept out of this answer). */
export const SETUP_TIME_ANSWER =
  "About 15 minutes. Answer a short questionnaire and your custom agent is built for you online, running on a private virtual server and ready to connect to Telegram or Slack.";

export const HOME_FAQS: Faq[] = [
  {
    q: "How is my data protected?",
    a: "Every agent is built for one person or one department and runs on a Mac Mini on your network or a private virtual server. Your data stays in your environment and your accounts.",
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
    a: "Help is a message away: chat with our team on Telegram, or email support. Hands-on onboarding and 30 days of training are available as an add-on, and come with every custom build.",
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
    a: "Yes. Every agent is built for one person or one department and runs on a Mac Mini on your network or a private virtual server, and your data stays in your environment and your accounts. Our Security page has the details.",
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

// The three AIO question blocks (David, Oct 27 2026): real buyer questions, answered on the page
// that gets asked them, with matching FAQPage markup. Each list renders in full on its page and
// again on /faq. The data answer says where the data lives in one sentence everywhere.
const DATA_LIVES_ANSWER =
  "On a Mac Mini on your network or on a private virtual server reserved for you. Your agent connects to your own accounts, so your email, documents and records stay where they already are, and we see only what you grant it.";

/** /ai-agents, the fleet page. */
export const FLEET_FAQS: Faq[] = [
  {
    q: "How is a private AI agent different from ChatGPT Enterprise?",
    a: "ChatGPT Enterprise is a chat window your team opens and types into, shared with every other customer on the same platform. A private agent is built for one person or one department, holds its own memory of how you work, connects to your mail, calendar, documents and systems, and acts on its own, drafting, filing and following up, with your approval before anything goes out.",
  },
  {
    q: "Where does my data live?",
    a: DATA_LIVES_ANSWER,
  },
  {
    q: "How long does a build take?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "Which agent should I start with?",
    a: "The one pointed at the work that lands on your desk most. The CEO Agent for inbox, calendar and follow-ups, the CFO Agent for cash and invoices, the Law Agent for intake and deadlines. Book a discovery call and we will tell you which one covers it, or that none of them do yet.",
  },
  {
    q: "What happens after launch?",
    a: "Hosting, monitoring and updates are part of every plan, and hands-on training and support come with every custom build. The agent keeps learning your preferences, and you can add a second agent or a department when the first one has earned it.",
  },
];

/** /company, the about page. */
export const COMPANY_FAQS: Faq[] = [
  {
    q: "What does Apollo Claw do?",
    a: "Apollo Claw designs, builds and runs private AI agents for individuals and departments at businesses and law firms. We handle the infrastructure, workflows, training, deployment and ongoing support, so your team can focus on the work that needs human judgment.",
  },
  {
    q: "How is a private AI agent different from ChatGPT Enterprise?",
    a: "ChatGPT Enterprise gives your team a shared chat tool and leaves the work to them. A private agent is built around one person or one department, remembers their context, connects to the tools they already use, and does the work itself: triage, drafts, scheduling, follow-ups, reports. You approve; it acts.",
  },
  {
    q: "Where does my data live?",
    a: DATA_LIVES_ANSWER,
  },
  {
    q: "How long does a build take?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "Who builds and supports the agent?",
    a: "David Oralevich and the Apollo Claw team, from Roslyn Heights, New York. One firm, one point of contact, from the first discovery call through setup, training and the months after launch.",
  },
];

/** /ai-consulting-long-island. */
export const LONG_ISLAND_FAQS: Faq[] = [
  {
    q: "How is a private AI agent different from ChatGPT Enterprise?",
    a: "ChatGPT Enterprise is a shared chat tool. A private agent is yours: built for one person or one department at your business, connected to your email, calendar, documents and systems, and working on its own with your approval. It remembers your context from one day to the next and runs in an environment reserved for you.",
  },
  {
    q: "Where does my data live?",
    a: DATA_LIVES_ANSWER,
  },
  {
    q: "How long does a build take?",
    a: SETUP_TIME_ANSWER,
  },
  {
    q: "Do you work on site?",
    a: "Yes. We are based at 69 Roslyn Road in Roslyn Heights and serve businesses across Nassau and Suffolk counties. Discovery calls, setup and training can happen at your office, and a video call works too.",
  },
  {
    q: "Which Long Island businesses is this for?",
    a: "Owner-led companies and professional practices where one person or one team carries a load of repetitive work: law firms, medical and dental practices, insurance agencies, real estate teams, accounting firms and service businesses. The first agent goes where the most hours are lost.",
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
    a: "We connect to your ledger (QuickBooks Online, Xero, NetSuite, Sage, and most major ERP platforms), your banking and payroll feeds, and the email, calendar, and document tools your team already uses. QuickBooks Desktop connects through a secure connector on your machine or server. We also work with Excel and Google Sheets-based workflows. Every engagement is scoped individually, and we confirm how deep each connection goes before we build.",
  },
  {
    q: "Does the CFO Agent work for accounting and tax firms?",
    a: "Yes. For a firm, it takes the repetitive admin layer: document intake and classification, chasing clients for records, drafting routine communications, and keeping filing calendars with deadline alerts. Anything that needs professional judgment, like a tax position or client advice, goes to a person for review. It works around your tax and practice software rather than inside the return itself, and we confirm what that looks like for your platforms on the discovery call.",
  },
  {
    q: "Which AI model does it run on, and where does it live?",
    a: "You pick the model: Claude, GPT, Gemini, or Grok. The agent runs on a private server you control, either a private virtual server or a Mac mini on your own network, and it keeps a compounding memory of your context.",
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
    a: "Patient information stays on infrastructure you approve, a Mac Mini on your network or a private virtual server, with least-privilege access to the systems you connect. Before launch we agree what the agent may see and where it may write, and your practice keeps control of both.",
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
