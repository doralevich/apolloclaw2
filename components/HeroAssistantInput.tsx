"use client";
import { useState } from "react";

export default function HeroAssistantInput({ placeholder = "Type your message…" }: { placeholder?: string }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    window.dispatchEvent(new CustomEvent("hero-chat-open", { detail: { message: text } }));
    setValue("");
  };

  return (
    <div
      style={{
        background: "#070F1C",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: "auto",
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#ffffff",
          fontSize: 13.5,
          fontFamily: "inherit",
        }}
      />
      <button
        type="button"
        onClick={submit}
        aria-label="Send"
        style={{
          background: "#D72B2B",
          color: "#fff",
          border: "none",
          width: 30,
          height: 30,
          borderRadius: 6,
          fontSize: 13,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: value.trim() ? 1 : 0.6,
          transition: "opacity 0.15s",
        }}
      >
        →
      </button>
    </div>
  );
}
