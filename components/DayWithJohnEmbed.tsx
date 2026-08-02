"use client";
import { useState } from "react";

export default function DayWithJohnEmbed() {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src="/demo.html#1"
        title="Apollo[Claw] Demo Conversation: A Day with John"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: "none",
          background: "#0B1729",
        }}
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
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
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-body), Inter, sans-serif",
            fontSize: "clamp(28px, 3vw, 38px)",
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
  );
}
