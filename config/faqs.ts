// Every FAQ on the site, in one place (David, Sept 27 2026: "The FAQ page should have every single
// FAQ question we have on the entire site"). Each page imports its own list from here and /faq
// renders all of them, so a question edited here changes on both at once.
//
// The answers are the pages' own copy, moved here word for word.

import { PRICING_FAQ_ANSWER } from "@/config/agent-plans";

export type Faq = { q: string; a: string };

export const HOME_FAQS: Faq[] = [
  {
    q: "How is my data protected?",
    a: "Every agent is privately deployed for one client, on a dedicated private server or your own Mac Mini. Your data stays in your environment and your accounts.",
  },
  {
    q: "How quickly will my agent be up and running?",
    a: "Most agents are live within about two weeks, followed by 30 days of hands-on training so it fits the way you work.",
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
    a: "An AI agent is a software system that can take actions on your behalf - reading emails, scheduling meetings, updating your CRM, researching topics, and more. Unlike a chatbot, an agent actually does things; it doesn't just answer questions.",
  },
  {
    q: "Do I need any technical expertise to use this?",
    a: "No. We handle all the technical setup. You interact with your AI agent through Telegram or WhatsApp, the same way you'd text a team member.",
  },
  {
    q: "What tools does it connect to?",
    a: "Gmail, Google Calendar, common CRMs (HubSpot, Salesforce, Pipedrive), Slack, Notion, Google Drive, and dozens of other tools via API integrations. We tailor the integrations to what you actually use.",
  },
  {
    q: "How long does setup take?",
    a: "Most clients are live within 2-4 weeks. Simple setups can be live in a few days.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We build on your infrastructure wherever possible. Your data does not go through third-party servers we don't control. See our Security page for details.",
  },
  {
    q: "How much does it cost?",
    a: PRICING_FAQ_ANSWER,
  },
  {
    q: "What if I want to cancel?",
    a: "No long-term contracts required. Month-to-month arrangements are available after your initial setup period.",
  },
  {
    q: "How is Apollo[Claw] different from just using ChatGPT?",
    a: "ChatGPT is a conversation tool. Apollo[Claw] agents are connected to your actual business systems and take autonomous action. The difference is like having a calculator vs. having a bookkeeper.",
  },
];

export const CEO_AGENT_FAQS: Faq[] = [
  {
    q: "What exactly is an AI bot?",
    a: "An AI bot is a software system connected to your actual business tools that takes autonomous action on your behalf. It reads, prioritizes, drafts, tracks, and follows up, without being asked.",
  },
  {
    q: "How is this different from using ChatGPT or a generic AI tool?",
    a: "ChatGPT is a conversation tool. The CEO Bot is connected to your systems and configured for your workflows. It knows your voice, your priorities, your team. The difference is a calculator versus a chief of staff.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most clients are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and training.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We build on your infrastructure wherever possible. All connections use least-privilege access and your data does not pass through servers we do not control.",
  },
  {
    q: "What does it cost?",
    a: PRICING_FAQ_ANSWER,
  },
  {
    q: "Do I need a technical team to run this?",
    a: "No. We handle all technical setup. You interact with your bot through Telegram or email, the same way you would communicate with a team member.",
  },
];

export const CFO_AGENT_FAQS: Faq[] = [
  {
    q: "What financial systems does the CFO Agent connect to?",
    a: "We connect to QuickBooks, NetSuite, Sage, Xero, and most major ERP platforms. We also work with Excel and Google Sheets-based workflows. Every engagement is scoped individually.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most clients are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing.",
  },
  {
    q: "Will it replace my finance team?",
    a: "No. It removes the production work, report generation, data pulls, reconciliation tracking, so your team can focus on analysis, interpretation, and strategic advice.",
  },
  {
    q: "Is our financial data secure?",
    a: "Yes. We connect using read-only API credentials wherever possible and use least-privilege access throughout. Your data does not pass through servers we do not control.",
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
    a: "No. It is a drafting and review tool, not a licensed attorney, and it does not provide legal advice. It removes the production work so your team or your counsel can focus on judgment. A qualified attorney should review anything binding before you sign or file, and the agent recommends exactly that.",
  },
  {
    q: "What tools does the Law Agent work with?",
    a: "It works where your documents already live: Microsoft Word, Google Docs, DocuSign, common contract-management platforms, and your storage in SharePoint, OneDrive, Google Drive, or Box. Every engagement is scoped to your setup.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most clients are live within two weeks. We onboard the agent on your templates and standard positions, connect your tools, and configure how it drafts, reviews, and escalates.",
  },
  {
    q: "Can it draft from our own templates and playbook?",
    a: "Yes, and it should. The agent works from your template library and standard positions, so first drafts and redlines start from your language rather than a generic form.",
  },
  {
    q: "Is our data confidential?",
    a: "Yes. We use least-privilege access throughout and honor the confidentiality rules you set, including keeping privileged material off shared systems. Your data does not pass through servers we do not control.",
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
    a: "The agent identifies policies approaching renewal, initiates outreach at your configured lead time (typically 90 days), follows up on non-responses, and escalates to your producers when a decision is needed.",
  },
  {
    q: "Will it replace my service team?",
    a: "No. It handles the first-touch communication, follow-up sequences, and status updates. Your team handles coverage decisions, complex questions, and relationship conversations.",
  },
  {
    q: "Is client data secure?",
    a: "Yes. We connect using least-privilege API credentials and your data does not pass through servers we do not control. All connections are encrypted.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most agencies are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing.",
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
    q: "Is client data secure and ethically compliant?",
    a: "Yes. We build on your infrastructure and use least-privilege access throughout. All data handling is reviewed against applicable bar rules in your jurisdiction. We do not store client communications on third-party servers without explicit authorization.",
  },
  {
    q: "Will it replace my paralegals?",
    a: "No. It removes the first-touch admin work: intake, scheduling, status updates, document routing, so your paralegals focus on substantive legal support instead of coordination.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most firms are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing.",
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
    q: "Is this HIPAA compliant?",
    a: "Yes. We execute a Business Associate Agreement with every healthcare client. All data handling follows HIPAA requirements and we do not store protected health information on systems outside your approved infrastructure.",
  },
  {
    q: "Will it replace my front desk staff?",
    a: "No. It removes the high-volume repetitive work, reminders, intake collection, follow-up sequences, so your staff can focus on the patients in front of them.",
  },
  {
    q: "How does the scheduling integration work?",
    a: "We connect to your existing scheduling system. The agent reads availability and books, confirms, and reschedules appointments based on rules you define. No double-booking, no overrides.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most practices are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing.",
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
    a: "We train the agent on your communication style during onboarding. Most clients tell us their prospects cannot tell the difference, and some prefer it because it is always prompt and professional.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most clients are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing.",
  },
  {
    q: "What does it cost?",
    a: PRICING_FAQ_ANSWER,
  },
  {
    q: "Do I need a technical team to run this?",
    a: "No. We handle all technical setup. You interact with your agent through the same tools you already use: email, text, or your CRM.",
  },
];

export const PERSONAL_INJURY_FAQS: Faq[] = [
  {
    q: "What case management systems does the agent connect to?",
    a: "We connect to Filevine, CASEpeer, Litify, Clio, MyCase, and most major personal injury practice platforms. Firms running on Outlook and shared drives work too - every engagement is scoped individually.",
  },
  {
    q: "Does the AI give legal advice to potential clients?",
    a: "No. The agent is an intake specialist and case companion, not a lawyer. It collects the facts of the injury, screens against your case criteria, schedules the consultation, and keeps clients informed - attorneys make every legal judgment.",
  },
  {
    q: "How fast does it respond to a new injury inquiry?",
    a: "Within minutes, at any hour. Injured people call whoever answers first - the agent responds immediately, collects the incident details, and gets a consultation on the calendar before a competing firm picks up the phone.",
  },
  {
    q: "How long does it take to get up and running?",
    a: "Most firms are live within two weeks. The first session is a 90-minute onboarding call. We handle all configuration, integration, and testing.",
  },
];
