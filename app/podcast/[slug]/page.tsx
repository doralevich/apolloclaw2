import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoCard, VideoDescription, VideoPlayer } from "@/components/podcast/PodcastParts";
import {
  PODCAST_CHANNEL,
  PODCAST_CLIPS,
  PODCAST_VIDEOS,
  embedUrl,
  getPodcastVideo,
  isoDuration,
  videoDate,
} from "@/lib/podcast";
import { PERSON_REF, ORG_REF, breadcrumbJsonLd } from "@/lib/seo";

// Every video is known at build time from docs/podcast-videos.json, so every page is prerendered
// and any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return PODCAST_VIDEOS.map((v) => ({ slug: v.slug }));
}

// The description's first sentence, for meta tags. YouTube descriptions end with a "Learn more"
// link that reads badly in a search result.
function summary(description: string, fallback: string): string {
  const text = description.replace(/\s*Learn more at \S+\s*$/i, "").trim();
  return text || fallback;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = getPodcastVideo(slug);
  if (!video) return { title: "Episode Not Found" };
  const url = `https://apolloclaw.ai/podcast/${slug}`;
  const description = summary(video.description, `${video.shortTitle}, from the Apollo Claw podcast.`);
  return {
    title: { absolute: `${video.shortTitle} | Apollo Claw Podcast` },
    description,
    alternates: { canonical: url },
    // The video's own thumbnail for link previews, the way a blog post uses its featured image.
    openGraph: {
      type: "video.other",
      title: video.shortTitle,
      description,
      url,
      images: [{ url: video.thumbnailUrl, width: 480, height: 360, alt: video.shortTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: video.shortTitle,
      description,
      images: [video.thumbnailUrl],
    },
  };
}

export default async function PodcastVideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = getPodcastVideo(slug);
  if (!video) notFound();

  const pageUrl = `https://apolloclaw.ai/podcast/${slug}`;
  // Clips only, three of them: one row of 16:9 cards under any page.
  const more = PODCAST_CLIPS.filter((v) => v.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoObject",
        "@id": `${pageUrl}#video`,
        name: video.title,
        description: video.description || video.title,
        thumbnailUrl: [video.thumbnailUrl],
        uploadDate: video.uploadDate,
        duration: isoDuration(video.durationSeconds),
        embedUrl: embedUrl(video.videoId),
        url: pageUrl,
        sameAs: video.url,
        actor: PERSON_REF,
        publisher: ORG_REF,
        inLanguage: "en-US",
      },
      breadcrumbJsonLd([
        { name: "Home", url: "https://apolloclaw.ai/" },
        { name: "Podcast", url: "https://apolloclaw.ai/podcast" },
        { name: video.shortTitle, url: pageUrl },
      ]),
    ],
  };

  return (
    <div className="min-h-screen bg-background py-10 pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <Link
          href="/podcast"
          className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          &larr; All episodes
        </Link>

        <div
          className={
            video.isShort
              ? "grid grid-cols-1 md:grid-cols-[minmax(0,360px)_1fr] gap-8 md:gap-12 items-start"
              : "space-y-8"
          }
        >
          <VideoPlayer video={video} />

          <div>
            <span className="inline-block text-xs font-mono border border-border rounded-full px-3 py-1 mb-4 text-foreground">
              {video.isShort ? "Clip" : "Episode"}
            </span>
            <h1 className="font-display text-3xl md:text-5xl text-foreground leading-tight mb-4">
              {video.shortTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground mb-6 pb-6 border-b border-border/40">
              <span>With David Oralevich</span>
              <span>{videoDate(video.uploadDate)}</span>
              <span>{video.durationText}</span>
            </div>
            <VideoDescription text={video.description} />
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-body text-sm">
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Watch on YouTube &rarr;
              </a>
              <a
                href={PODCAST_CHANNEL.subscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Subscribe to the channel &rarr;
              </a>
            </div>
          </div>
        </div>

        {more.length > 0 && (
          <section aria-labelledby="more" className="mt-20">
            <h2 id="more" className="font-display text-2xl md:text-3xl text-foreground mb-8">
              More from the podcast
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {more.map((v) => (
                <VideoCard key={v.videoId} video={v} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
