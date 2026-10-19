import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";
import PageDates from "@/components/PageDates";
import { OG_IMAGES, ORG_REF } from "@/lib/seo";
import { faqEntities } from "@/config/faqs";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

// The buy-versus-build question for an owner-led business: hire or assign somebody to set up
// AI agents, or bring in a consultant who has done it. Written to be fair to the in-house
// route, which is the right answer for a company with a real IT team. No dollar amounts: the
// comparison is in months, roles and what you keep. Part of the comparison group of the SEO
// brief's follow-up (Oct 19 2026). Copy approved by David before merge.

const URL = "https://apolloclaw.ai/compare/ai-consultant-vs-in-house";
const UPDATED = "2026-10-19";

export const metadata: Metadata = {
  title: { absolute: "AI Consultant vs In House: Which Is Right? | Apollo Claw" },
  description:
    "Hire a consultant to set up your AI agents, or build them in house? Time to value, what you keep, risk and the first 30 days, and when in house is right.",
  alternates: { canonical: URL },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Consultant vs In House: Which Is Right? | Apollo Claw",
    description: "Hire a consultant or build in house? Time to value, what you keep, and when each is right.",
    url: URL,
    type: "website",
  },
};

const FAQS = [
  {
    q: "If we hire you, do we end up dependent on you?",
    a: "The agent runs on hardware reserved for you, and every file that defines it is plain text you can read and change. If you leave, the agent stays. We would rather be the people you call for the next job than the people you cannot leave.",
  },
  {
    q: "Can our IT person work alongside you?",
    a: "Yes, and it goes faster when they do. They know the systems and the permissions; we know the runtime and the agent files. The 30 days of hands-on onboarding is where that handover happens.",
  },
  {
    q: "What if we already started in house and got stuck?",
    a: "Common, and fixable. Most stalled builds have a working runtime and a weak scope: the agent was asked to do everything and does each job poorly. A scoping call usually finds the one job to give it first.",
  },
  {
    q: "How long until an agent is useful?",
    a: "With a scoped first job, the first week. The online build takes about 15 minutes; the rehearsal with real scenarios and the team's first days with it are what make it useful, and that is what the first month is for.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": `${URL}#article`,
      headline: "AI Consultant vs Building In House: Which Is Right?",
      description: "Hire a consultant to set up your AI agents or build them in house? Time to value, what you keep, risk, and when each route is right.",
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
    title: "AI Consultant or Build It",
    titleAccent: "In House?",
    description:
      "Somebody has to scope the job, set up the runtime, write the agent's files, connect the tools, rehearse it and train the team. The question is whether that somebody already works for you. Here is how the two routes compare for an owner-led business.",
    cta: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
  },
  sections: [
    {
      type: "prose",
      kicker: "The Short Version",
      heading: "The Install Is the Easy",
      headingAccent: "Part",
      paragraphs: [
        "The runtime an Apollo Claw agent runs on is open source. A capable technical person can install it in an afternoon, and that is where most in-house projects start and stall. The hard parts are the ones that look soft: deciding which job the agent owns first, writing its persona and rules in your words, connecting the tools with the right permissions, running it through real situations before it touches a live inbox, and teaching the team what to trust.",
        "A consultant who has done this for a law firm, a medical practice and an insurance agency has made those decisions before and knows which ones bite. In-house staff know your business better than any consultant will. The right answer depends on which of those two kinds of knowledge you are short of.",
      ],
    },
    {
      type: "compare",
      kicker: "Side by Side",
      heading: "What Each Route",
      headingAccent: "Costs You",
      intro: "Measured in time, attention and what you keep, since those are the costs an owner feels first.",
      columns: ["Build in house", "Apollo Claw"],
      rows: [
        { label: "Who does the work", a: "Your IT person, a developer, or you, around the day job.", b: "A consultant who has set up agents for firms like yours, with your team in the room." },
        { label: "Time to a useful agent", a: "Weeks to months, most of it learning the runtime and deciding scope.", b: "The first week for a scoped job: about 15 minutes to build online, then rehearsal and training." },
        { label: "Scope", a: "Often everything at once, which is how an agent ends up doing each job poorly.", b: "One job first, named rules, then the second and third jobs on a schedule." },
        { label: "The agent's files", a: "Written by whoever installed it, in whatever shape they chose.", b: "Written from your intake in your words, and yours to read and change." },
        { label: "Where it runs", a: "Wherever your person put it. Often a laptop at first.", b: "A Mac Mini on your network or a private virtual server, encrypted and locked down from day one." },
        { label: "Permissions and rules", a: "Decided as you go, usually after something goes out that should have been a draft.", b: "Decided before anything is connected, written down, and enforced by the runtime." },
        { label: "The first 30 days", a: "Whatever time your person has left over.", b: "Hands-on onboarding and co-training with every custom build, with support a message away after." },
        { label: "When something breaks", a: "Your person reads the logs, if they still work for you.", b: "We read the logs; it is the job." },
        { label: "What you keep if you part ways", a: "Everything, and the knowledge in one person's head.", b: "Everything: the hardware or server, the files, the agent and its memory." },
      ],
    },
    {
      type: "columns",
      kicker: "When In House Is Right",
      heading: "Build It Yourself",
      headingAccent: "If",
      intro: "Some companies should keep this inside. These are the signs.",
      items: [
        { title: "You Have a Real IT Team", desc: "An engineering or IT group with time on the roadmap can own the runtime, the permissions and the rehearsals, and will know the systems better than we will." },
        { title: "The Agent Is the Product", desc: "If what you are building is something you will sell or run for thousands of users, that is software development, and it belongs with your developers." },
        { title: "Policy Rules Out Outsiders", desc: "Some organizations cannot let a third party near their systems during setup. The runtime is open source; we are happy to point you at it." },
      ],
    },
    {
      type: "columns",
      kicker: "When a Consultant Is Right",
      heading: "Bring Us In",
      headingAccent: "If",
      items: [
        { title: "The Owner Is the Bottleneck", desc: "You want an agent on your own inbox and calendar this month, and the person who would build it is you." },
        { title: "There Is No Technical Bench", desc: "A practice or firm with an outsourced IT vendor and no developer has nobody to learn a runtime on the side." },
        { title: "The Data Is Sensitive", desc: "Client files, patient records, financials. The permissions and the rules have to be right the first time, and that is experience rather than cleverness." },
        { title: "You Already Tried", desc: "A stalled build with a weak scope is the most common thing we are asked to look at, and the quickest to fix." },
      ],
    },
    {
      type: "faq",
      kicker: "FAQ",
      heading: "The Questions Owners",
      headingAccent: "Ask",
      items: FAQS,
    },
    {
      type: "cta",
      heading: "Unsure Which Route",
      headingAccent: "Fits?",
      sub: "A discovery call is a scoping session either way. If in house is the right answer for you, we will say so.",
      button: { label: "Book a Discovery Call", href: SCHEDULE_CONSULT_URL },
    },
  ],
};

export default function AiConsultantVsInHousePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageDates url={URL} name="AI Consultant vs Building In House" dateModified={UPDATED} />
      <SeoLanding data={data} />
    </>
  );
}
