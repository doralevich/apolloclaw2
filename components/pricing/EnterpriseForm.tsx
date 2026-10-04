"use client";

import { useState } from "react";

// The "Contact us" form in the Enterprise strip on /pricing. Posts to /api/enterprise-contact,
// which files the lead in Attio and pings David. Styled for the dark strip it sits on.

const FIELD =
  "w-full rounded-[8px] border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-[15px] text-white placeholder:text-white/45 outline-none focus-visible:border-white/50 focus-visible:ring-2 focus-visible:ring-white/30";

export function EnterpriseForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    setState("sending");
    try {
      const res = await fetch("/api/enterprise-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || "That did not send. Please try again.");
      }
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not send. Please try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-[12px] border border-white/15 bg-white/[0.06] p-6" role="status">
        <p className="font-heading text-[1.25rem] font-bold text-white">Thanks. We will be in touch within one business day.</p>
        <p className="font-body mt-2 text-[15px] text-white/70">
          If it is easier to talk it through, book a call and pick a time that suits you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3" aria-label="Contact us about a custom build">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="font-body text-[13px] font-semibold text-white/80">Name</span>
          <input name="name" required autoComplete="name" className={FIELD} />
        </label>
        <label className="grid gap-1.5">
          <span className="font-body text-[13px] font-semibold text-white/80">Work email</span>
          <input name="email" type="email" required autoComplete="email" className={FIELD} />
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className="font-body text-[13px] font-semibold text-white/80">Company</span>
        <input name="company" autoComplete="organization" className={FIELD} />
      </label>
      <label className="grid gap-1.5">
        <span className="font-body text-[13px] font-semibold text-white/80">What do you want your agents to do?</span>
        <textarea name="message" rows={3} className={`${FIELD} resize-none`} />
      </label>
      {error && (
        <p className="font-body text-[13px] text-[#FFB4B4]" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="font-body mt-1 inline-flex items-center justify-center rounded-[8px] bg-white px-6 py-3 text-[14px] font-bold text-[#1A1A1A] transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        {state === "sending" ? "Sending..." : "Contact us"}
      </button>
    </form>
  );
}
