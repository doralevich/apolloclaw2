import Link from "next/link";
import { Fragment } from "react";
import ApolloClawLogo from "@/components/ApolloClawLogo";
import { embedUrl, videoDate, type PodcastVideo } from "@/lib/podcast";

// Shared pieces of /podcast and /podcast/[slug]. All server components: the player is a plain
// YouTube iframe, so nothing here needs client JavaScript.

/**
 * The YouTube player. Shorts are vertical, so they get a 9:16 frame capped in width; full
 * episodes get 16:9 across the column. The frame host is on the CSP frame-src list in
 * next.config.ts.
 */
export function VideoPlayer({ video, title }: { video: PodcastVideo; title?: string }) {
  return (
    <div
      className={
        video.isShort
          ? "relative w-full max-w-[360px] mx-auto aspect-[9/16]"
          : "relative w-full aspect-video"
      }
    >
      <iframe
        src={embedUrl(video.videoId)}
        title={title ?? video.title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 h-full w-full rounded-2xl border border-border bg-black"
      />
    </div>
  );
}

/**
 * A card linking to a video's page. Every card is 16:9, Shorts included, so the grids stay one
 * shape (David, Nov 10 2026: the tall 9:16 cards did not look good).
 *
 * WHAT THE PICTURE IS depends on the video:
 *
 *   A podcast clip gets artwork drawn here (ClipArt): the podcast's title card, laid out for a
 *   wide card. YouTube's thumbnail for these is a faithful frame of the clip, and the clip itself
 *   was cut vertically from a title card laid out wide, so every frame reads "o [Claw] st".
 *   No framing of that image can show words the clip never had. Two attempts to frame it
 *   differently (Nov 10 2026) both came back from David as "still not correct".
 *
 *   Any other Short (the college promos, someone on camera) shows its vertical frame in a centred
 *   9:16 strip on a dark ground. YouTube's 4:3 thumbnail holds that frame with black bars either
 *   side, and object-cover in the strip trims the bars.
 *
 *   A full-length video shows its thumbnail across the card.
 *
 * i.ytimg.com is on the CSP img-src list.
 */
export function VideoCard({ video }: { video: PodcastVideo }) {
  return (
    <Link
      href={`/podcast/${video.slug}`}
      className="group block h-full bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-video overflow-hidden bg-[#0B111C]">
        {video.podcastClip ? (
          <ClipArt video={video} />
        ) : video.isShort ? (
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 aspect-[9/16] h-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail, no optimiser config needed */}
            <img
              src={video.thumbnailUrl}
              alt=""
              loading="lazy"
              decoding="async"
              // 4% in, because the picture inside YouTube's frame is a fraction under 9:16 and
              // object-cover alone leaves a hairline of the black bar along one edge.
              className="h-full w-full object-cover scale-[1.04] transition-transform duration-300 group-hover:scale-[1.08]"
            />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail, no optimiser config needed
          <img
            src={video.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[11px] text-white">
          {video.durationText}
        </span>
        <span
          aria-hidden
          className={`absolute flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity ${video.podcastClip ? "right-4 top-4" : "inset-0"}`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D72B2B] shadow-lg shadow-black/30">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden>
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-base text-foreground group-hover:text-primary transition-colors leading-snug">
          {video.shortTitle}
        </h3>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{videoDate(video.uploadDate)}</p>
      </div>
    </Link>
  );
}


/**
 * A podcast clip's card picture: the podcast's own title card ("-episode 04", the wordmark,
 * "Podcast", the clip's title with a red cursor, a red waveform), laid out for a wide card.
 * Drawn rather than fetched, so it is sharp at any size and every clip card matches.
 *
 * The waveform is seeded from the video id, so each clip has its own shape and keeps it.
 */
function waveform(id: string, count = 48): number[] {
  let seed = 0;
  for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const n = ((seed >>> 8) % 1000) / 1000;
    // Taller in the middle, like a voice, never flat.
    const envelope = 0.35 + 0.65 * Math.sin((Math.PI * (i + 0.5)) / count);
    bars.push(Math.max(0.12, n * envelope));
  }
  return bars;
}

function ClipArt({ video }: { video: PodcastVideo }) {
  const bars = waveform(video.videoId);
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-[6%] text-white">
      <div className="font-mono text-[11px] tracking-wide text-white/50">
        -episode{video.clipNumber !== null && <span className="ml-1.5 text-[#E12E30]">{String(video.clipNumber).padStart(2, "0")}</span>}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline gap-2">
          <ApolloClawLogo ink="#FFFFFF" height={20} />
          <span className="font-mono text-[15px] font-bold leading-none">Podcast</span>
        </div>
        <p className="font-mono text-[13px] leading-snug text-white/80 line-clamp-2">
          {video.shortTitle.toLowerCase()}
          <span aria-hidden className="ml-0.5 inline-block h-[0.9em] w-[0.45em] translate-y-[0.12em] bg-[#E12E30]" />
        </p>
      </div>
      <svg viewBox="0 0 96 20" preserveAspectRatio="none" className="h-[18%] w-full" aria-hidden>
        {bars.map((h, i) => (
          <rect key={i} x={i * 2 + 0.4} y={10 - h * 10} width="1.2" height={h * 20} rx="0.6" fill="#E12E30" />
        ))}
      </svg>
    </div>
  );
}

const URL_RE = /(https?:\/\/[^\s)]+)/g;

/**
 * A YouTube description as written: line breaks kept, bare URLs made into links. Links to our own
 * site stay in the tab; anything else opens a new one.
 */
export function VideoDescription({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="font-body text-base text-foreground/80 leading-relaxed whitespace-pre-line">
      {text.split(URL_RE).map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        const own = /^https?:\/\/(www\.)?apolloclaw\.ai(\/|$)/i.test(part);
        return (
          <a
            key={i}
            href={part}
            {...(own ? {} : { target: "_blank", rel: "noopener noreferrer" })}
            className="text-primary underline hover:no-underline break-words"
          >
            {part.replace(/^https?:\/\//, "")}
          </a>
        );
      })}
    </div>
  );
}
