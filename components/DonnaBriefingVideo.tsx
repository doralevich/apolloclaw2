"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// The home page demo: Harvey's morning briefing from Donna on Telegram, a 46-second phone
// recording (David, Oct 4 2026; it replaced the "A Day with John" slide demo). The inline box is
// only a poster with a play button, and the video opens in a full-page lightbox so the chat is
// big enough to read. public/video/ holds it re-encoded from David's original for the web: an
// H.264 MP4 (faststart, so it plays before it finishes downloading) and a VP9 WebM, no audio.
export default function DonnaBriefingVideo() {
  // Only ever rendered after a click, so document.body is guaranteed to exist by then
  // and no mounted-guard is needed. The portal is required because Section wraps its content
  // in `relative z-10`, which traps a fixed overlay below the z-50 nav.
  const [open, setOpen] = useState(false);
  // Lock background scroll while the lightbox is up, and close on Escape.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Play the video: Donna's morning briefing for Harvey"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          color: "#ffffff",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textDecoration: "none",
          padding: 0,
          fontFamily: "inherit",
        }}
      >
        {/* A frame from the video itself, mid-briefing, so the poster always matches what plays.
            eslint-disable: next/image would need a loader config for no benefit on a single
            local asset that is never resized. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/video/donna-briefing-poster.jpg"
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
        />
        {/* Darkened so the play button and title stay legible over the chat bubbles. */}
        <span
          aria-hidden
          style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,15,28,0.72) 0%, rgba(7,15,28,0.88) 100%)" }}
        />
        {/* position: relative on the play button and the caption, not just a wrapper: the
            poster and its scrim are absolutely positioned, and positioned elements paint above
            static in-flow siblings regardless of source order. Without this they cover the
            controls entirely. A display:contents wrapper cannot fix it, since it generates no
            box for position to apply to. */}
        <span
          style={{
            position: "relative",
            width: 78,
            height: 78,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.95)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            transition: "transform 0.15s",
          }}
        >
          <svg
            width="22"
            height="26"
            viewBox="0 0 22 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginLeft: 4 }}
          >
            <path d="M21 13L1 25.124V0.876L21 13Z" fill="#D72B2B" />
          </svg>
        </span>
        <div style={{ position: "relative", textAlign: "center", padding: "0 18px" }}>
          <p
            style={{
              fontFamily: "var(--font-body), Inter, sans-serif",
              fontSize: "clamp(22px, 2vw, 28px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.1,
              color: "#ffffff",
            }}
          >
            Meet <span style={{ color: "#D72B2B" }}>Donna.</span>
          </p>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              marginTop: 10,
            }}
          >
            Watch the morning briefing
          </p>
        </div>
      </button>

      {open && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Donna's morning briefing"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000, // above the chat widget (ChatWidget.tsx, 9999)
            background: "rgba(4,9,18,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(12px, 3vw, 40px)",
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close video"
            style={{
              position: "absolute",
              top: "clamp(12px, 2vw, 28px)",
              right: "clamp(12px, 2vw, 28px)",
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
              color: "#ffffff",
              fontSize: 22,
              lineHeight: 1,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &times;
          </button>

          {/* Clicks inside the frame must not close the lightbox. The frame is the video's own
              9:16, as tall as the viewport allows, narrower on a phone held upright. */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              height: "min(90vh, calc(92vw * 16 / 9))",
              aspectRatio: "9 / 16",
              borderRadius: 14,
              overflow: "hidden",
              background: "#0B1729",
              boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            }}
          >
            {/* MP4 first (Safari, Chrome, Edge); the WebM copy is for browsers without an H.264
                decoder, such as some Linux and Chromium builds. */}
            <video
              poster="/video/donna-briefing-poster.jpg"
              autoPlay
              muted
              playsInline
              controls
              aria-label="Donna, an Apollo[Claw] agent, gives Harvey his morning briefing on Telegram"
              style={{ width: "100%", height: "100%", display: "block", objectFit: "contain", background: "#0B1729" }}
            >
              <source src="/video/donna-briefing.mp4" type="video/mp4" />
              <source src="/video/donna-briefing.webm" type="video/webm" />
            </video>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
