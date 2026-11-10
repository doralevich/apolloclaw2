import listing from "@/docs/podcast-videos.json";

// The podcast pages are built from docs/podcast-videos.json, the channel listing read off
// youtube.com/@ApolloClaw (Nov 9 2026). Nothing here calls YouTube: the JSON is the record, and a
// new episode reaches the site by re-reading the channel into that file. Titles and descriptions
// are shown exactly as they are on YouTube.

export type PodcastVideo = {
  videoId: string;
  /** The page's address under /podcast, made from the title. */
  slug: string;
  url: string;
  title: string;
  /** The title without the " | David Oralevich" style suffix, for headings and cards. */
  shortTitle: string;
  description: string;
  durationSeconds: number;
  durationText: string;
  /** ISO timestamp the video went up on YouTube. */
  uploadDate: string;
  isShort: boolean;
  thumbnailUrl: string;
  /** A clip cut from the podcast (its YouTube title ends "| David Oralevich"), as opposed to a
   *  promo with someone on camera. Its card is drawn in code (components/podcast/PodcastParts.tsx
   *  ClipArt), because the clip's own frames crop the podcast's wide title card. */
  podcastClip: boolean;
  /** The clip's number on its own title card ("-episode 04"), when known. */
  clipNumber: number | null;
};

// Each podcast clip's number, as its own title card shows it ("-episode 04"). Read off the
// clips' frames on the live /podcast page (David's screenshot, Nov 10 2026); YouTube's listing
// does not carry it. A clip missing here simply has no number on its card.
const CLIP_NUMBERS: Record<string, number> = {
  EcwNb7GAPxc: 1, // Close Encounters moment
  r0BFn6qLVTU: 2, // The GoDaddy idea
  E9V3yEoozZE: 4, // Shakedown Street guardrail
  tfOBGW8FPx4: 7, // Jerry Maguire it
  TGa_8np9mRo: 8, // The student agent
};

const PODCAST_SUFFIX = /\s*\|\s*david oralevich\s*$/i;

// "Shakedown Street guardrail | David Oralevich" -> "Shakedown Street guardrail". The speaker is
// named on the page already; repeating it on every card is noise.
const TITLE_SUFFIX = /\s*\|\s*(david oralevich|apollo claw podcast)\s*$/i;

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type RawVideo = (typeof listing.videos)[number];

function toVideo(v: RawVideo): PodcastVideo {
  const shortTitle = v.title.replace(TITLE_SUFFIX, "").trim();
  return {
    videoId: v.videoId,
    slug: slugify(shortTitle),
    url: v.url,
    title: v.title,
    shortTitle,
    description: v.description,
    durationSeconds: v.durationSeconds ?? 0,
    durationText: v.durationText ?? "",
    uploadDate: v.uploadDate,
    isShort: v.isShort,
    thumbnailUrl: v.thumbnailUrl,
    podcastClip: v.isShort && PODCAST_SUFFIX.test(v.title),
    clipNumber: CLIP_NUMBERS[v.videoId] ?? null,
  };
}

/** Every video on the channel, newest first. */
export const PODCAST_VIDEOS: PodcastVideo[] = listing.videos
  .map(toVideo)
  .sort((a, b) => b.uploadDate.localeCompare(a.uploadDate));

// Two titles that slugify the same would make one page unreachable. Fail the build instead of
// shipping that silently.
{
  const seen = new Set<string>();
  for (const v of PODCAST_VIDEOS) {
    if (!v.slug || seen.has(v.slug)) {
      throw new Error(`lib/podcast.ts: duplicate or empty slug "${v.slug}" for ${v.videoId}`);
    }
    seen.add(v.slug);
  }
}

/** Full-length episodes, newest first. */
export const PODCAST_EPISODES = PODCAST_VIDEOS.filter((v) => !v.isShort);
/** Shorts (clips), newest first. */
export const PODCAST_CLIPS = PODCAST_VIDEOS.filter((v) => v.isShort);

export const PODCAST_CHANNEL = {
  title: listing.channel.title,
  url: listing.channel.url,
  subscribeUrl: `${listing.channel.url}?sub_confirmation=1`,
};

export function getPodcastVideo(slug: string): PodcastVideo | undefined {
  return PODCAST_VIDEOS.find((v) => v.slug === slug);
}

/** The privacy-enhanced player (no cookies until the visitor presses play). */
export function embedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/** Seconds as an ISO 8601 duration, for VideoObject structured data: 75 -> "PT1M15S". */
export function isoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s || (!h && !m) ? `${s}S` : ""}`;
}

/** "November 8, 2026", in New York time so a late-evening upload keeps its local date. */
export function videoDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

/** YYYY-MM-DD in New York time, for the sitemap. */
export function videoDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}
