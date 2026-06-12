"use client";
import { useState } from "react";

export default function HeroInput() {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    // Fire a custom event that ChatWidget listens for
    window.dispatchEvent(new CustomEvent("hero-chat-open", { detail: { message: text } }));
    setValue("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 mb-2 opacity-0 animate-fade-up-delay-1">
      <div
        style={{
          border: "0.5px solid #E8342A",
          borderRadius: "8px",
          backgroundColor: "rgba(255,255,255,0.85)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: "10px",
        }}
      >
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="How can we help you today?"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            padding: "18px 0",
            fontSize: "15px",
            fontFamily: "Inter, Arial, sans-serif",
            color: "#E8342A",
          }}
        />
        <button
          onClick={submit}
          aria-label="Send"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            color: "#E8342A",
            opacity: value.trim() ? 1 : 0.4,
            transition: "opacity 0.2s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8342A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
