// /llms.txt: the site in plain text for AI crawlers and assistants (the llmstxt.org
// convention), the way robots.txt is for search crawlers. One screen of what Apollo Claw is,
// who an agent is for, where it runs, and which pages answer what. Kept to facts the pages
// themselves state. No prices (they live on /pricing and change), no client names.
//
// A route rather than a file in public/ so it reads from one place and cannot drift from the
// app's robots and sitemap routes beside it.
import { USE_CASES } from "@/config/useCases";

const SITE = "https://apolloclaw.ai";

const PAGES: [string, string][] = [
  ["/", "Custom AI agents built for your business: what Apollo Claw does and who it is for."],
  ["/ai-agent-for-business", "The category guide: what an AI agent for a business is, who it is for, where it runs and what it does on day one."],
  ["/compare/mac-mini-vs-private-virtual-server", "Where the agent runs: a Mac Mini on your network compared with a private virtual server."],
  ["/compare/ai-agent-vs-chatbot", "A chatbot answers questions; an agent does the work. When each is the right buy."],
  ["/compare/ai-consultant-vs-in-house", "Hire a consultant or build in house: time to value, what you keep, and when each is right."],
  ["/how-it-works", "The four steps from a discovery call to an agent in production."],
  ["/ai-agents", "Every agent Apollo Claw builds: CEO, CFO, Sales, Recruiting, Law, Insurance, Medical, Real Estate, HR, Receptionist and Personal."],
  ["/ai-agents/ceo", "The CEO Agent: an AI chief of staff for inbox, calendar, follow-ups and a morning brief."],
  ["/ai-agents/cfo", "The CFO Agent: a daily cash view, invoice follow-up and flagged exceptions."],
  ["/ai-agents/legal", "The Law Agent: contract drafting and review, summaries, obligations and renewal dates."],
  ["/industries/law-firms", "AI for law firms: client intake, case follow-ups, deadline tracking and billing reminders."],
  ["/industries/personal-injury-law", "An AI intake agent for personal injury law firms."],
  ["/industries/medical-practices", "AI for medical and dental practices: intake, reminders and follow-ups."],
  ["/industries/insurance", "AI for insurance agencies and brokers: renewals, quotes and claims status."],
  ["/industries/real-estate", "AI for realtors and property managers: listing inquiries, leads and showings."],
  ["/industries/accounting-firms", "AI for accounting firms and CPAs: document collection and deadline reminders."],
  ["/use-cases", "Client results grouped by industry, and one page per job an agent does."],
  ["/pricing", "Plans for one agent, a team or an executive bench, month to month, with hosting and updates included."],
  ["/security", "How an agent runs: a dedicated private virtual server, or a Mac Mini on your network. Encryption, access and what we never see."],
  ["/ai-consulting-long-island", "AI consulting for Long Island businesses, from Roslyn Heights, NY."],
  ["/ai-consulting-nyc", "AI consulting for New York City businesses."],
  ["/company", "David Oralevich and Apollo Claw."],
  ["/faq", "Every question the site answers, in one place."],
  ["/blog", "Guides on what AI agents do for law firms, medical practices, insurance agencies and real estate teams."],
  ["/contact", "Book a discovery call."],
];

export function GET() {
  const lines = [
    "# Apollo Claw",
    "",
    "> Apollo Claw designs, builds and runs private AI agents for individuals and departments at businesses and law firms. Each one runs on a Mac Mini on your network or a private virtual server, working across the tools you already use.",
    "",
    "Apollo Claw is an AI consulting and implementation firm in Roslyn Heights, New York, founded by David Oralevich. It serves Long Island, New York City and businesses across the United States.",
    "",
    "An agent is built for one person or one department from a short questionnaire about the business, its people, its tools and its voice. It connects to email, calendar, documents, CRM and practice-management systems the customer already uses, and it drafts for approval before anything is sent on the customer's behalf. Setup, hosting, monitoring and updates are part of every plan; hands-on onboarding and training come with every custom build.",
    "",
    "## Pages",
    "",
    ...PAGES.map(([path, what]) => `- [${path}](${SITE}${path}): ${what}`),
    "",
    "## Use cases",
    "",
    ...USE_CASES.map((u) => `- [${u.label}](${SITE}/use-cases/${u.slug}): ${u.summary}`),
    "",
    "## Policies",
    "",
    `- [Privacy Policy](${SITE}/privacy)`,
    `- [Terms of Service](${SITE}/terms)`,
    `- [Cookie Policy](${SITE}/cookies)`,
    `- [Accessibility Statement](${SITE}/accessibility)`,
    "",
    "## Contact",
    "",
    "- Email: hello@apolloclaw.ai",
    "- Phone: +1 917 363 5487",
    "- Address: 69 Roslyn Road, Roslyn Heights, NY 11577",
    `- Sitemap: ${SITE}/sitemap.xml`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
