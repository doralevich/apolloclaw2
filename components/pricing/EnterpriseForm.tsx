"use client";

import { useState } from "react";

// "Contact us" on the Enterprise strip of /pricing: a button that opens a short form in place.
// Posts to /api/enterprise-contact, which files the lead in Attio and pings David. Light, to sit
// on the white strip (David, Oct 4 2026: the dark strip "gets lost").

const INK = "#1A1A1A";
const RULE = "rgba(26,26,26,0.15)";
const FIELD =
  "font-body w-full rounded-[8px] border bg-white px-3.5 py-2.5 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-[#E12E30]/40";

export function EnterpriseContactButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="#enterprise-form"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById("enterprise-form")?.toggleAttribute("hidden");
        document.getElementById("enterprise-form")?.querySelector("input")?.focus();
      }}
      className={`font-body inline-flex items-center justify-center whitespace-nowrap rounded-[8px] px-6 py-3 text-[14px] font-bold transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
      style={{ border: `1px solid ${INK}`, color: INK }}
    >
      Contact us
    </a>
  );
}

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
      <p className="font-body text-[15px]" role="status" style={{ color: INK }}>
        Thanks. We will be in touch within one business day.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3" aria-label="Contact us about a custom build">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="font-body text-[13px] font-semibold">Name</span>
          <input name="name" required autoComplete="name" className={FIELD} style={{ borderColor: RULE }} />
        </label>
        <label className="grid gap-1.5">
          <span className="font-body text-[13px] font-semibold">Work email</span>
          <input name="email" type="email" required autoComplete="email" className={FIELD} style={{ borderColor: RULE }} />
        </label>
        <label className="grid gap-1.5">
          <span className="font-body text-[13px] font-semibold">Company</span>
          <input name="company" autoComplete="organization" className={FIELD} style={{ borderColor: RULE }} />
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className="font-body text-[13px] font-semibold">What do you want your agents to do?</span>
        <textarea name="message" rows={3} className={`${FIELD} resize-none`} style={{ borderColor: RULE }} />
      </label>
      {error && (
        <p className="font-body text-[13px] text-[#B42318]" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="font-body justify-self-start rounded-[8px] px-6 py-3 text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ background: "#E12E30" }}
      >
        {state === "sending" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
