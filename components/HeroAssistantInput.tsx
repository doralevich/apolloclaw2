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
        background: "#FFFFFF",
        border: "1px solid rgba(26,26,26,0.14)",
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
          color: "#1A1A1A",
          fontSize: 13.5,
          fontFamily: "inherit",
        }}
      />
      <button
        type="button"
        onClick={submit}
        aria-label="Send"
        style={{
          background: "#E12E30",
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
