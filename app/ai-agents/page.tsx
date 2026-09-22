import type { Metadata } from "next";
import { FleetGrid } from "@/components/agents/FleetGrid";
import { AGENTS } from "@/config/navigation";
import { OG_IMAGES } from "@/lib/seo";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";
import {
  BodyLarge,
  BracketLabel,
  H2,
  NAVY,
  NAVY_ELEVATED,
  PAPER,
  PAPER_MUTED,
  PrimaryButton,
  RED,
  Section,
  SecondaryButton,
  TAN,
  TAN_INK,
  TAN_INK_MUTED,
  TextureBackground,
} from "@/components/home/ui";

// THE FLEET PAGE. David: "The main Agent link should have our Fleet of Agents." The Agents tab
// was a <button> with no destination, so the fleet existed only as a hover menu and as a band
// halfway down the homepage - nothing you could link somebody to.
//
// THIS REVIVES A PAGE DAVID PREVIOUSLY HAD REMOVED, and that is worth saying plainly rather
// than leaving for somebody to rediscover. The note in app/page.tsx records it: there was an
// /ai-agents hub, it was taken down on his call, and the homepage's title and canonical were
// then re-pointed at "ai agents for business" because they no longer had to avoid competing
// with it. His newer instruction asks for the page back, so it is back - but deliberately NOT
// aimed at the term the homepage now holds.
//
// This page targets the fleet as a fleet: "our agents", the roster, which one to pick. The
// homepage keeps "AI agents for business" and /ai-agent-for-business keeps "AI agent for
// business". Three pages, three intents, no two of them bidding for the same query. If that
// separation ever blurs, this is the page to retire again - it is the newest of the three and
// the only one that is a directory rather than an argument.
export const metadata: Metadata = {
  title: { absolute: "Our Fleet of AI Agents | Apollo[Claw]" },
  description:
    "Every agent Apollo[Claw] builds, in one place. The CEO, CFO, Sales, Recruiting, Law, Insurance, Medical, Real Estate, Personal, and College Agents, each scoped to a job and connected to your tools.",
  alternates: { canonical: "https://apolloclaw.ai/ai-agents" },
  openGraph: {
    // The house card, not an agent's. This page is the whole fleet, so sharing it should show
    // Apollo[Claw] rather than picking one agent's art to stand for the other nine.
    images: OG_IMAGES,
    title: "Our Fleet of AI Agents | Apollo[Claw]",
    description:
      "The full roster of Apollo[Claw] agents. Each one is scoped to a job, connected to your tools, and ships work with your approval.",
    url: "https://apolloclaw.ai/ai-agents",
    type: "website",
  },
};

// Built from AGENTS rather than retyped, so the structured data cannot list a different fleet
// from the one the page renders.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": "https://apolloclaw.ai/ai-agents#fleet",
  name: "Apollo[Claw] AI Agents",
  description: "The full roster of AI agents Apollo[Claw] builds and deploys.",
  numberOfItems: AGENTS.length,
  itemListElement: AGENTS.map((agent, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: agent.label,
    description: agent.description,
    url: agent.external ? agent.to : `https://apolloclaw.ai${agent.to}`,
  })),
};

// What every agent shares, and every line here is already a claim the site makes elsewhere
// (the homepage description and components/home/TwoFoldModel.tsx). A directory page is the
// easiest place in a site to start inventing capabilities, so these were taken from copy that
// is live rather than written fresh.
const SHARED = [
  {
    title: "It runs on its own machine.",
    body: "Your agent is provisioned onto its own virtual private server, or built inside your own infrastructure if that is where it belongs. It is not a seat on something shared.",
  },
  {
    title: "It connects to your tools.",
    body: "Mail, calendar, documents, the systems the work already lives in. An agent that cannot reach your tools can only give advice, which is the thing you already had.",
  },
  {
    title: "It works where you already are.",
    body: "A dashboard on the web, and the same agent reachable from WhatsApp, Telegram, or Slack. Nowhere extra to remember to check.",
  },
  {
    title: "It ships with your approval.",
    body: "Drafted, prepared, queued, and held. You stay the one who decides what actually goes out.",
  },
];

export default function FleetPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section style={{ background: NAVY }} className="relative overflow-hidden">
        <TextureBackground />
        <div className="container relative z-20 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-3xl">
            <span
              className="font-mono mb-5 inline-block text-[12px] font-bold uppercase tracking-[0.16em]"
              style={{ color: RED }}
            >
              The Fleet
            </span>
            <h1
              className="font-heading text-[clamp(1.875rem,3.4vw,3rem)] font-extrabold leading-[1.12] tracking-tight"
              style={{ color: PAPER, textWrap: "balance" }}
            >
              Every Agent We Build, in One Place
            </h1>
            <p className="font-body mt-6 text-[1.125rem] leading-[1.65]" style={{ color: PAPER_MUTED, maxWidth: 620 }}>
              {AGENTS.length} agents, each one scoped to a job somebody is currently doing by hand.
              Same platform underneath, same connection to your tools, same approval before
              anything leaves the building. What changes is what it is pointed at.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <PrimaryButton href={SCHEDULE_CONSULT_URL} external>
                Book a Discovery Call
              </PrimaryButton>
              <SecondaryButton href="/how-it-works">How It Works</SecondaryButton>
            </div>
          </div>
        </div>
      </section>

      <Section bg={NAVY_ELEVATED}>
        <FleetGrid />
        <p className="mt-10 text-center text-[14px] leading-[1.7]" style={{ color: PAPER_MUTED }}>
          Not sure which one?{" "}
          <a
            href={SCHEDULE_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold transition-opacity hover:opacity-70"
            style={{ color: PAPER }}
          >
            Tell us what keeps landing on your desk
          </a>{" "}
          and we will tell you which agent covers it, or that none of them do.
        </p>
      </Section>

      <Section bg={TAN}>
        <div className="mx-auto max-w-2xl text-center">
          <BracketLabel light>The Same Underneath</BracketLabel>
          {/* Not "Ten names, one build" - a headline carrying the roster count is a headline
              that goes quietly wrong the first time an agent is added. The count appears once,
              in the hero, where it is interpolated from AGENTS.length. */}
          <H2 light>Different jobs, one build.</H2>
          <div className="mx-auto mt-4 max-w-xl">
            <BodyLarge light>
              The differences between these agents are scope and training, not architecture.
              Whichever you start with, this is what you get.
            </BodyLarge>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {SHARED.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border p-7"
              style={{ borderColor: "rgba(11,23,41,0.12)", background: "rgba(255,255,255,0.5)" }}
            >
              <h3 className="font-heading text-[1.25rem] font-semibold leading-[1.25]" style={{ color: TAN_INK }}>
                {point.title}
              </h3>
              <p className="font-body mt-3 text-[1rem] leading-[1.7]" style={{ color: TAN_INK_MUTED }}>
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* NO CLOSING CTA HERE. components/layout/PreFooter.tsx already appends one sitewide
          ("Ready to move from AI curiosity to AI Implemented?"), so a closing band of my own
          put two consultation pitches back to back, which reads as the page asking twice. */}
    </>
  );
}
