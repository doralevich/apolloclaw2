import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";
import PageDates from "@/components/PageDates";
import { OG_IMAGES, ORG_REF } from "@/lib/seo";
import { faqEntities } from "@/config/faqs";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

// "Is this a chatbot?" is the first question from half the people who land on the site. The
// answer deserves its own page, with the honest cases where a chatbot is the right buy. Part of
// the comparison group of the SEO brief's follow-up (Oct 19 2026). Copy approved by David
// before merge.

const URL = "https://apolloclaw.ai/compare/ai-agent-vs-chatbot";
const UPDATED = "2026-10-19";

export const metadata: Metadata = {
  title: { absolute: "AI Agent vs Chatbot: What Is the Difference? | Apollo Claw" },
  description:
    "A chatbot answers questions. An AI agent does the work: inbox, calendar, follow-ups and documents for one person or one department. Which one you need, and why.",
  alternates: { canonical: URL },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Agent vs Chatbot: What Is the Difference? | Apollo Claw",
    description: "A chatbot answers questions. An AI agent does the work. Which one you need, and why.",
    url: URL,
    type: "website",
  },
};

const FAQS = [
  {
    q: "Can an agent also answer questions on my website?",
    a: "Yes, and the agent on our own home page does exactly that. The difference is what sits behind the chat window: an agent that knows your business and can book, draft and follow up, rather than a script that matches keywords.",
  },
  {
    q: "Is an AI agent the same as ChatGPT?",
    a: "ChatGPT is a model you type into. An agent is that kind of model given a job, a memory, a set of tools and rules, running on a server for one person or one department. You can switch the model under an Apollo Claw agent between Claude, GPT, Gemini and Grok from a menu.",
  },
  {
    q: "Does an agent send email on its own?",
    a: "Only where you have said it may. The default is that it drafts and you approve, and the rules live in files you can read. Many owners widen the agent's leash after a month of reading its drafts.",
  },
  {
    q: "Which one is right for a two-person business?",
    a: "If the pain is visitors asking the same five questions, a chatbot. If the pain is your own inbox, calendar and follow-ups, an agent, because that is the work a chatbot cannot touch.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": `${URL}#article`,
      headline: "AI Agent vs Chatbot: What Is the Difference?",
      description: "A chatbot answers questions on your website. An AI agent does the work for one person or one department. How they differ, and which one you need.",
      url: URL,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${URL}#page` },
      datePublished: UPDATED,
      dateModified: UPDATED,
      author: ORG_REF,
      publisher: ORG_REF,
      image: "https://apolloclaw.ai/og-image.png",
    },
    { "@type": "FAQPage", "@id": `${URL}#faq`, mainEntity: faqEntities(FAQS) },
  ],
};

const data: SeoLandingData = {
  hero: {
    label: "Compare",
    title: "AI Agent vs Chatbot:",
    titleAccent: "What Is the Difference?",
    description:
      "A chatbot waits on your website for a visitor to type. An AI agent works inside your business all day: reading the inbox, keeping the calendar, chasing the follow-ups, drafting the documents. They share a chat window and little else.",
    cta: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
  },
  sections: [
    {
      type: "prose",
      kicker: "The Short Version",
      heading: "One Answers. The Other",
      headingAccent: "Acts.",
      paragraphs: [
        "A chatbot is a front door. A visitor asks about your hours, your services or your prices, and it answers from a script or a page of facts. It is useful, cheap and narrow. It knows what you told it and it talks to strangers.",
        "An AI agent is a member of staff. It is built for one person or one department, it has a memory of your business, and it has hands: it reads your email, drafts the replies, puts meetings on the calendar, chases the invoice, files the document, and sends you a brief each morning. It works across the tools you already use, and it drafts for your approval until you tell it otherwise.",
        "Apollo Claw builds the second kind. The agent on our own home page shows the difference: ask it what an agent could do for your business and it can put a call in the diary while you are there.",
      ],
    },
    {
      type: "compare",
      kicker: "Side by Side",
      heading: "Where They",
      headingAccent: "Differ",
      columns: ["Chatbot", "AI agent"],
      rows: [
        { label: "Who it serves", a: "Strangers who visit your website.", b: "One person or one department inside your business." },
        { label: "What it does", a: "Answers questions from a script or a knowledge page.", b: "Does work: triage, drafts, scheduling, follow-ups, documents, reports." },
        { label: "Memory", a: "Forgets the visitor when the window closes.", b: "Keeps a compounding memory of your business, your people and your preferences." },
        { label: "Tools", a: "Usually none. At most a form or a booking link.", b: "Email, calendar, documents, CRM, practice and accounting systems, through their own permissions." },
        { label: "Where it runs", a: "On the chatbot vendor's servers, shared with their other customers.", b: "On a Mac Mini on your network or a private virtual server reserved for your agent." },
        { label: "Rules", a: "A list of canned answers.", b: "Files you can read: who it is, what it may send on its own, what it drafts for approval, what it leaves alone." },
        { label: "The model underneath", a: "Whatever the vendor chose.", b: "Claude, GPT, Gemini or Grok, switchable from a menu as better ones arrive." },
        { label: "Setup", a: "Paste a script into your site.", b: "A short questionnaire, a build in about 15 minutes online or a custom build, then connections and a rehearsal with real scenarios." },
        { label: "Best fit", a: "A busy website with the same questions all day.", b: "An owner, partner or department head whose own work is the bottleneck." },
      ],
    },
    {
      type: "columns",
      kicker: "When a Chatbot Is Enough",
      heading: "Buy the Chatbot",
      headingAccent: "If",
      intro: "We would rather you buy the right thing than buy from us. These are the cases where a chatbot wins.",
      items: [
        { title: "The Questions Are the Problem", desc: "Visitors ask about hours, parking, pricing tiers and whether you take their insurance, all day. A chatbot with a good knowledge page clears that queue." },
        { title: "Nobody Needs to Act", desc: "If every conversation ends with a link or a phone number, there is no follow-up to automate and an agent would be idle." },
        { title: "The Data Is Public Anyway", desc: "A chatbot on a vendor's shared servers is fine when everything it knows is already on your website." },
      ],
    },
    {
      type: "columns",
      kicker: "When You Need an Agent",
      heading: "Get an Agent",
      headingAccent: "If",
      items: [
        { title: "Your Inbox Is the Bottleneck", desc: "Replies wait days because drafting them takes focus you are out of at 6 pm. An agent drafts them in your voice for a morning approval." },
        { title: "Follow-Ups Slip", desc: "Lost deals, late invoices and stalled matters come down to a nudge nobody sent. An agent tracks every open thread and sends it on schedule." },
        { title: "The Work Touches Private Data", desc: "Client files, patient records, financials. An agent runs on hardware reserved for you, with rules you can read and approval before anything leaves." },
        { title: "You Want It to Grow", desc: "Inbox triage this month, deadline tracking next month, billing prompts after that. An agent takes on a second job; a chatbot stays a chatbot." },
      ],
    },
    {
      type: "faq",
      kicker: "FAQ",
      heading: "Common",
      headingAccent: "Questions",
      items: FAQS,
    },
    {
      type: "cta",
      heading: "Which One Do",
      headingAccent: "You Need?",
      sub: "Bring the three things that eat your week. We will tell you whether a chatbot covers it or an agent should take the first one.",
      button: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
    },
  ],
};

export default function AiAgentVsChatbotPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageDates url={URL} name="AI Agent vs Chatbot" dateModified={UPDATED} />
      <SeoLanding data={data} />
    </>
  );
}
