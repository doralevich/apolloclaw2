import Link from "next/link";
import { Fragment } from "react";
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
 * The thumbnail is YouTube's 4:3 frame. For a Short it is NOT the whole vertical video with black
 * bars either side, as first assumed: YouTube fills the 4:3 frame with a crop from the middle of the
 * vertical video. Cutting a 9:16 strip out of that crop again (the first version) kept only its
 * middle third, so "Apollo [Claw]" read as "o [Claw]" and on-screen captions lost both ends (David,
 * Nov 10 2026: "The images don't appear correct").
 *
 * So a Short shows YouTube's frame whole, centred and uncropped (object-contain), over the same
 * image blown up and blurred to fill the rest of the 16:9 card. i.ytimg.com is on the CSP img-src
 * list.
 */
export function VideoCard({ video }: { video: PodcastVideo }) {
  return (
    <Link
      href={`/podcast/${video.slug}`}
      className="group block h-full bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        {video.isShort ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail, no optimiser config needed */}
            <img
              src={video.thumbnailUrl}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover scale-[2.5] blur-2xl opacity-60"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail, no optimiser config needed */}
            <img
              src={video.thumbnailUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </>
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
          className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity"
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
