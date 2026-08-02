"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// The demo used to play inside the small 9:16 slot in the WhatWeDo section, where the chat text
// was far too small to read (David's call). It now opens in a full-page lightbox instead: the
// inline box is only a poster with a play button, and the demo itself gets the viewport.
export default function DayWithJohnEmbed() {
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
        aria-label="Play the Apollo[Claw] demo conversation: A Day with John"
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
        <span
          style={{
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
        <div style={{ textAlign: "center", padding: "0 18px" }}>
          <p
            style={{
              fontFamily: "var(--font-body), Inter, sans-serif",
              fontSize: "clamp(26px, 2.6vw, 34px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.1,
              color: "#ffffff",
            }}
          >
            A day with <span style={{ color: "#D72B2B" }}>John.</span>
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
            Watch the agent in action
          </p>
        </div>
      </button>

      {open && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Apollo[Claw] demo conversation"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
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
            aria-label="Close demo"
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

          {/* Clicks inside the frame must not close the lightbox. */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(100%, 520px)",
              height: "min(92vh, 950px)",
              borderRadius: 18,
              overflow: "hidden",
              background: "#0B1729",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            }}
          >
            <iframe
              src="/demo.html#1"
              title="Apollo[Claw] Demo Conversation: A Day with John"
              style={{ width: "100%", height: "100%", border: "none", background: "#0B1729" }}
              allowFullScreen
            />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
