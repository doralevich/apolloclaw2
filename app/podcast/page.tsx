import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ScrollReveal from "@/components/ScrollReveal";
import { VideoCard, VideoDescription, VideoPlayer } from "@/components/podcast/PodcastParts";
import {
  PODCAST_CHANNEL,
  PODCAST_CLIPS,
  PODCAST_EPISODES,
  PODCAST_VIDEOS,
  videoDate,
} from "@/lib/podcast";
import { OG_IMAGES, ORG_REF, breadcrumbJsonLd } from "@/lib/seo";

const PAGE_URL = "https://apolloclaw.ai/podcast";
const DESCRIPTION =
  "David Oralevich on AI agents for real businesses, with short clips on guardrails, agents for college students and why agents are a platform play.";

export const metadata: Metadata = {
  title: { absolute: "The Apollo Claw Podcast | AI Agents for Real Businesses" },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    images: OG_IMAGES,
    title: "The Apollo Claw Podcast",
    description: DESCRIPTION,
    url: PAGE_URL,
  },
};

export default function PodcastPage() {
  const [latest, ...olderEpisodes] = PODCAST_EPISODES;

  // The page as a list of the videos on it, each pointing at its own page, where the full
  // VideoObject lives.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: "The Apollo Claw Podcast",
        description: DESCRIPTION,
        publisher: ORG_REF,
        isPartOf: { "@id": "https://apolloclaw.ai/#website" },
        inLanguage: "en-US",
        mainEntity: {
          "@type": "ItemList",
          itemListElement: PODCAST_VIDEOS.map((v, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${PAGE_URL}/${v.slug}`,
            name: v.title,
          })),
        },
      },
      breadcrumbJsonLd([
        { name: "Home", url: "https://apolloclaw.ai/" },
        { name: "Podcast", url: PAGE_URL },
      ]),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        title="The Apollo Claw"
        titleAccent="Podcast"
        description="David Oralevich on putting AI agents to work in real businesses: what they do, where the guardrails go, and where it is all heading."
        cta={{ label: "Subscribe on YouTube", href: PODCAST_CHANNEL.subscribeUrl }}
      />

      <div className="bg-background py-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-8 space-y-20">
          {PODCAST_VIDEOS.length === 0 && (
            <p className="text-center font-body text-muted-foreground text-lg py-20">
              Episodes coming soon.
            </p>
          )}

          {latest && (
            <section aria-labelledby="latest-episode">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
                Latest episode
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 items-start">
                <VideoPlayer video={latest} />
                <div>
                  <h3 id="latest-episode" className="font-display text-2xl md:text-3xl text-foreground leading-tight">
                    <Link href={`/podcast/${latest.slug}`} className="hover:text-primary transition-colors">
                      {latest.shortTitle}
                    </Link>
                  </h3>
                  <p className="mt-2 mb-5 font-mono text-xs text-muted-foreground">
                    {videoDate(latest.uploadDate)} · {latest.durationText}
                  </p>
                  <VideoDescription text={latest.description} />
                  <Link
                    href={`/podcast/${latest.slug}`}
                    className="inline-block mt-5 font-body text-sm text-primary hover:underline"
                  >
                    Episode page &rarr;
                  </Link>
                </div>
              </div>
            </section>
          )}

          {olderEpisodes.length > 0 && (
            <section aria-labelledby="episodes">
              <h2 id="episodes" className="font-display text-2xl md:text-3xl text-foreground mb-8">
                More episodes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {olderEpisodes.map((v, i) => (
                  <ScrollReveal key={v.videoId} delay={i * 50}>
                    <VideoCard video={v} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          {PODCAST_CLIPS.length > 0 && (
            <section aria-labelledby="clips">
              <h2 id="clips" className="font-display text-2xl md:text-3xl text-foreground mb-2">
                Clips
              </h2>
              <p className="font-body text-muted-foreground mb-8">
                One idea each, under a minute.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {PODCAST_CLIPS.map((v, i) => (
                  <ScrollReveal key={v.videoId} delay={i * 50}>
                    <VideoCard video={v} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
