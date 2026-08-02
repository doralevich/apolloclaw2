"use client";

import { useState } from "react";
import { HAIRLINE, INK, INK_MUTED, RED } from "@/components/home/ui";

// Reuses the existing /api/subscribe route (already wired to Mailchimp, list "weekly-claw") ,
// not a placeholder, this is the real signup. Styled fresh for the new design system; the
// separate Footer newsletter box (components/layout/Footer.tsx) is untouched/out of Phase 1
// scope, so it still appears further down the page , flagged for David as a known overlap.
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
      <p className="text-sm font-semibold" style={{ color: INK }}>
        You&apos;re in. Look out for The Weekly Claw.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-wrap justify-center gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        required
        disabled={status === "loading"}
        className="min-w-0 flex-1 rounded-[8px] border px-4 py-3 text-sm outline-none"
        style={{ borderColor: HAIRLINE, color: INK, background: "rgba(245,246,248,0.05)" }}
      />
      <button
        type="submit"
        disabled={status === "loading" || !email}
        className="rounded-[8px] px-6 py-3 text-[13px] font-bold tracking-[0.02em] text-white disabled:opacity-60"
        style={{ background: RED }}
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="w-full text-center text-xs" style={{ color: RED }}>
          {errorMsg}
        </p>
      )}
      <p className="w-full text-center text-xs" style={{ color: INK_MUTED }}>
        The Weekly Claw, what&apos;s working in AI agents, once a week.
      </p>
    </form>
  );
}
