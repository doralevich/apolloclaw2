"use client";

import { useState } from "react";
import { RED, TAN_INK } from "@/components/home/ui";

// Posts to /api/subscribe, which is already wired to Mailchimp (list "weekly-claw"). This is
// the real signup, not a placeholder. Lives in the footer as one compact row (David's call: the
// full-width band it had above the footer took too much space on every page), hence the
// dark-background styling.
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
      <p className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
        You&apos;re in. Look out for The Weekly Claw.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-wrap items-center gap-2.5">
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
        className="min-w-0 flex-1 rounded-full border bg-white px-4 py-2.5 text-sm outline-none"
        style={{ borderColor: "rgba(255,255,255,0.2)", color: TAN_INK }}
      />
      <button
        type="submit"
        disabled={status === "loading" || !email}
        className="font-mono rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:brightness-110 disabled:opacity-60"
        style={{ background: RED }}
      >
        {status === "loading" ? "Subscribing…" : "Subscribe →"}
      </button>
      {status === "error" && (
        <p className="w-full text-xs" style={{ color: "#FF8A8B" }}>
          {errorMsg}
        </p>
      )}
    </form>
  );
}
