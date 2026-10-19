import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";
import PageDates from "@/components/PageDates";
import { OG_IMAGES, ORG_REF } from "@/lib/seo";
import { faqEntities } from "@/config/faqs";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

// The question David gets on every call, answered on one page: where does the agent run? The
// security page lists the two options' controls; this one helps a buyer choose. Facts are the
// security page's (encryption, access, what we hold); the recommendation is the firm's.
// Part of the comparison group of the SEO brief's follow-up (Oct 19 2026). Copy approved by
// David before merge.

const URL = "https://apolloclaw.ai/compare/mac-mini-vs-private-virtual-server";
const UPDATED = "2026-10-19";

export const metadata: Metadata = {
  title: { absolute: "Mac Mini vs Private Virtual Server: AI Agents | Apollo Claw" },
  description:
    "Where should your AI agent run? A Mac Mini on your network compared with a private virtual server: setup, security, access and who should pick which.",
  alternates: { canonical: URL },
  openGraph: {
    images: OG_IMAGES,
    title: "Mac Mini vs Private Virtual Server: AI Agents | Apollo Claw",
    description: "Where should your AI agent run? The two options compared, and who should pick which.",
    url: URL,
    type: "website",
  },
};

const FAQS = [
  {
    q: "Can I start on a private virtual server and move to a Mac Mini later?",
    a: "Yes. The agent is the same on both: the same files, the same connections, the same models. Moving it is a scheduled job on our side, and the agent keeps its memory.",
  },
  {
    q: "Does a Mac Mini need an IT person on my side?",
    a: "It needs a desk, power and a network connection that stays on. We set it up in person or on a screen-share, and after that it runs on its own. A managed-device policy at your firm is the one thing to check with us first.",
  },
  {
    q: "Which one is faster to launch?",
    a: "The private virtual server. Answer the questionnaire and the agent is built in about 15 minutes online. A Mac Mini is a custom build: we configure the machine and schedule your first session within two business days.",
  },
  {
    q: "Which one do law firms and medical practices usually choose?",
    a: "Practices that have to keep client or patient data on premises lean to the Mac Mini, because the data stays in the building and the machine accepts no inbound connections. Firms whose data already lives in cloud tools are usually well served by the private virtual server.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${URL}#service`,
      name: "AI Agent Hosting: Mac Mini or Private Virtual Server",
      serviceType: "AI Agent Hosting and Deployment",
      description: "Every Apollo Claw agent runs on a Mac Mini on your network or a dedicated private virtual server. This page compares the two.",
      provider: ORG_REF,
      url: URL,
      areaServed: "United States",
    },
    { "@type": "FAQPage", "@id": `${URL}#faq`, mainEntity: faqEntities(FAQS) },
  ],
};

const data: SeoLandingData = {
  hero: {
    label: "Compare",
    title: "Mac Mini or Private Virtual Server:",
    titleAccent: "Where Should Your Agent Run?",
    description:
      "Every Apollo Claw agent runs in one of two places. One is a computer in your building that you own. The other is a dedicated server we provision for you alone. Same agent, same files, same rules. Here is how to choose.",
    cta: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
  },
  sections: [
    {
      type: "prose",
      kicker: "The Short Version",
      heading: "Two Homes for the Same",
      headingAccent: "Agent",
      paragraphs: [
        "A private virtual server is the fast path. You answer a short questionnaire, the agent is built on a server reserved for it in about 15 minutes, and you are talking to it on Telegram or Slack the same afternoon. We keep the server patched, monitored and backed up, and it is encrypted end to end.",
        "A Mac Mini on your network is the on-premises path. The machine is yours, it sits in your office, and the agent's files, memory and credentials stay on it. It accepts no inbound connections; it reaches out only to the services you approved. We set it up, hand it over, and hold no access afterwards.",
        "The agent itself is identical on both. What differs is where the data sits, who holds the keys, how quickly you start, and what your IT policy requires.",
      ],
    },
    {
      type: "compare",
      kicker: "Side by Side",
      heading: "What Each Option",
      headingAccent: "Gives You",
      intro: "Every claim below matches what our Security page says, line for line.",
      columns: ["Mac Mini on your network", "Private virtual server"],
      rows: [
        { label: "Where the data lives", a: "In your building, on a machine you own. Files, memory and credentials stay on the device.", b: "On a dedicated server reserved for your agent alone. One server per agent, yours only." },
        { label: "Time to launch", a: "A custom build. We configure the machine and schedule your first session within two business days.", b: "About 15 minutes online from the questionnaire, then connect your tools." },
        { label: "Who holds access", a: "You. We hold physical access during setup only; after hand-over the device is entirely yours.", b: "You and Apollo Claw. We keep the server patched and monitored; key-based access only, passwords disabled." },
        { label: "Encryption", a: "FileVault full-disk encryption.", b: "Full-volume disk encryption." },
        { label: "Network posture", a: "Firewall in stealth mode and outbound HTTPS only, to a named list of services. No inbound access, no VPN.", b: "Firewall closed to everything but the ports the agent needs. Public-facing for webhooks and hosted assets." },
        { label: "What you need on site", a: "A desk, power and a network connection that stays on. A managed-device policy is worth checking with us first.", b: "A browser and the chat app you prefer." },
        { label: "Several agents", a: "One machine can carry several agents for one firm, scoped at setup.", b: "Each plan's agents run on their own server, added from the dashboard." },
        { label: "If you cancel", a: "The machine and everything on it stay with you.", b: "The server is paused first, and everything on it is kept until the retention window closes, so a change of mind is reversible." },
        { label: "Best fit", a: "Firms that must keep client or patient data on premises, or whose IT policy rules out cloud hosting.", b: "Owners and departments that want the agent running this week, with their data already in cloud tools." },
      ],
    },
    {
      type: "columns",
      kicker: "How to Decide",
      heading: "Four Questions That Settle",
      headingAccent: "It",
      items: [
        { title: "Where Does Your Data Live Today?", desc: "If your matters, charts or client files already sit in Microsoft 365, Google Workspace or a cloud practice system, a private virtual server changes little about where your data already is. If they sit on a server in your closet, a Mac Mini keeps them there." },
        { title: "What Does Your IT Policy Say?", desc: "Some firms, and most that handle regulated data, have a written rule that processing happens only on hardware they own. That rule decides it: Mac Mini." },
        { title: "How Soon Do You Need It Running?", desc: "This week means the private virtual server. A Mac Mini needs a short visit or screen-share and a couple of days." },
        { title: "Who Looks After the Machine?", desc: "A private virtual server is ours to patch and watch. A Mac Mini runs on its own, with our support a message away, but it is your hardware and your power cord." },
      ],
    },
    {
      type: "bullets",
      kicker: "The Same on Both",
      heading: "What Stays the Same Either",
      headingAccent: "Way",
      bullets: [
        "The agent: the same persona, memory, tools and rules, written in files you can read",
        "The models: Claude, GPT, Gemini or Grok, switchable from a menu",
        "The connections: email, calendar, documents, CRM and practice systems through their own permissions",
        "Approval before anything goes out on your behalf, for as long as you want it",
        "Hands-on onboarding and training with every custom build, and support a Telegram message away",
      ],
    },
    {
      type: "faq",
      kicker: "FAQ",
      heading: "Questions We Hear on Every",
      headingAccent: "Call",
      items: FAQS,
    },
    {
      type: "cta",
      heading: "Still Weighing",
      headingAccent: "It?",
      sub: "Tell us where your data lives and what your IT policy says. We will tell you which one fits in one call.",
      button: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
    },
  ],
};

export default function MacMiniVsPrivateVirtualServerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageDates url={URL} name="Mac Mini vs Private Virtual Server for AI Agents" dateModified={UPDATED} />
      <SeoLanding data={data} />
    </>
  );
}
