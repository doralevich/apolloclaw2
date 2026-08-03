"use client";

import { useState } from "react";
import { RED, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

// Posts to /api/subscribe, which is already wired to Mailchimp (list "weekly-claw"). This is
// the real signup, not a placeholder. Restored from the version that briefly lived in the
// footer: David pulled it for taking up too much room there, and it now has its own band
// above the footer instead.
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <p className="text-center text-sm font-semibold" style={{ color: TAN_INK }}>
        You&apos;re in. Look out for The Weekly Claw.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-lg flex-wrap items-center justify-center gap-3">
      <label htmlFor="weekly-claw-email" className="sr-only">
        Email address
      </label>
      <input
        id="weekly-claw-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === "loading"}
        className="min-w-0 flex-1 rounded-full border bg-white px-5 py-3.5 text-sm outline-none"
        style={{ borderColor: "rgba(11,23,41,0.12)", color: TAN_INK }}
      />
      <button
        type="submit"
        disabled={status === "loading" || !email}
        className="font-mono rounded-full px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:brightness-110 disabled:opacity-60"
        style={{ background: RED, boxShadow: "0 8px 24px rgba(215,43,43,0.3)" }}
      >
        {status === "loading" ? "Subscribing…" : "Subscribe →"}
      </button>
      {status === "error" && (
        <p className="w-full text-center text-xs" style={{ color: RED }}>
          {errorMsg}
        </p>
      )}
      {status === "idle" && (
        <p className="w-full text-center text-xs" style={{ color: TAN_INK_MUTED }}>
          No spam. Unsubscribe anytime.
        </p>
      )}
    </form>
  );
}
