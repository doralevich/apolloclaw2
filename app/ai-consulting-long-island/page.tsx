import type { Metadata } from "next";
import SeoLanding, { type SeoLandingData } from "@/components/SeoLanding";
import { OG_IMAGES } from "@/lib/seo";
import { SCHEDULE_CONSULT_URL } from "@/config/scheduling";

export const metadata: Metadata = {
  title: { absolute: "AI Consulting on Long Island | Apollo Claw" },
  description:
    "Apollo Claw is Long Island's AI consulting firm. We install custom AI agents into local businesses, no tech background required. Based in Roslyn Heights, NY.",
  alternates: { canonical: "https://apolloclaw.ai/ai-consulting-long-island" },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Consulting on Long Island | Apollo Claw",
    description:
      "Custom AI agents installed into Long Island businesses. Local, accountable, results-driven. Based in Roslyn Heights, NY.",
    url: "https://apolloclaw.ai/ai-consulting-long-island",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://apolloclaw.ai/ai-consulting-long-island#business",
  name: "Apollo[Claw] AI Consulting",
  description:
    "AI consulting for Long Island businesses. We install custom AI agents into local companies across Nassau and Suffolk counties.",
  url: "https://apolloclaw.ai/ai-consulting-long-island",
  telephone: "+1-917-363-5487",
  address: {
    "@type": "PostalAddress",
    streetAddress: "69 Roslyn Road",
    addressLocality: "Roslyn Heights",
    addressRegion: "NY",
    postalCode: "11577",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Nassau County, NY" },
    { "@type": "AdministrativeArea", name: "Suffolk County, NY" },
    { "@type": "Place", name: "Long Island, NY" },
  ],
  provider: { "@type": "Organization", name: "Apollo[Claw]", url: "https://apolloclaw.ai" },
};

const data: SeoLandingData = {
  hero: {
    label: "Nassau & Suffolk Counties",
    title: "AI Consulting for Long Island",
    titleAccent: "Businesses",
    description:
      "Apollo Claw is Long Island's AI consulting firm. We install custom AI agents into local businesses, no tech background required. Based in Roslyn Heights, NY.",
    cta: { label: "Book a Free Discovery Call", href: SCHEDULE_CONSULT_URL },
  },
  sections: [
    {
      type: "columns",
      kicker: "Why Now",
      heading: "Why Long Island Businesses Are Adopting AI",
      headingAccent: "Now",
      intro:
        "The businesses that move first are pulling ahead. The tools are finally good enough to do real work, and the gap between the owners who adopt and the ones who wait is widening every quarter.",
      items: [
        { title: "Labor Is Tight and Expensive", desc: "Hiring on Long Island is hard and getting harder. An agent takes the repetitive load off the team you already have." },
        { title: "The Tools Finally Work", desc: "AI has crossed from novelty to genuinely useful. The question is no longer if, but who sets it up right." },
        { title: "Your Competitors Are Moving", desc: "The local business next door is already testing this. First movers set the pace, and the pace is quickening." },
      ],
    },
    {
      type: "bullets",
      kicker: "Scope",
      heading: "What We Do (and What We",
      headingAccent: "Don't)",
      intro:
        "We are deliberate about the line. It is what keeps delivery fast and the quality consistent.",
      bullets: [
        "We do: install a dedicated AI agent trained on how your business runs",
        "We do: connect it to the software you already use",
        "We do: handle setup, integration, and training, so you don't need a tech background",
        "We do: tune and support it as your needs change",
        "We don't: sell you a generic chatbot and disappear",
        "We don't: require you to become a prompt engineer to get value",
      ],
    },
    {
      type: "columns",
      kicker: "The Difference",
      heading: "Local. Accountable.",
      headingAccent: "Results-Driven.",
      items: [
        { title: "Local", desc: "We are based in Roslyn Heights and serve businesses across Nassau and Suffolk. We can meet you in person, not just over a screen." },
        { title: "Accountable", desc: "One firm, one point of contact, standing behind the build. If something needs fixing, you know exactly who to call." },
        { title: "Results-Driven", desc: "We install agents to remove real work and give you real time back, not to check an innovation box." },
      ],
    },
    {
      type: "cta",
      heading: "Book a Free Discovery Call. We Come to",
      headingAccent: "You.",
      sub: "Serving Long Island from our office at 69 Roslyn Road, Roslyn Heights, NY. We will show you exactly where AI helps first in your business.",
      button: { label: "Book a Free Discovery Call", href: SCHEDULE_CONSULT_URL },
    },
  ],
};

export default function AiConsultingLongIslandPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoLanding data={data} />
    </>
  );
}
