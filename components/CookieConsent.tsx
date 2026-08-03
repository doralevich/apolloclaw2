"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { NAVY, PAPER, PAPER_MUTED, RED } from "@/components/home/ui";

const STORAGE_KEY = "ac-cookie-consent";

// Read through useSyncExternalStore rather than an effect: reading localStorage into state
// inside useEffect trips react-hooks/set-state-in-effect, and this way the server and the
// first client paint agree on "unknown" instead of flashing the banner during hydration.
function subscribe(onChange: () => void) {
  // Only fires for writes from *other* tabs; same-tab writes are handled by local state below.
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private mode / storage disabled: treat as undecided rather than crashing.
    return null;
  }
}

// Sentinel for "we are on the server, or have not hydrated yet" — distinct from a real null
// (which means "hydrated, and this visitor has not chosen yet").
const UNKNOWN = "unknown";

// Cookie banner gating Google Analytics.
//
// The actual gating is Google Consent Mode v2, set up in app/layout.tsx: analytics_storage
// defaults to 'denied', so GA writes no cookie or identifier until this banner grants it.
// That means declining is a real decline, not just a hidden banner. Strictly necessary
// cookies (the Supabase auth session) are not covered by the banner and are not optional,
// which is why the copy says so rather than claiming "no cookies until you accept".
export default function CookieConsent() {
  const stored = useSyncExternalStore(subscribe, readStored, () => UNKNOWN);
  // Same-tab choice, so the banner dismisses immediately on click without waiting for a
  // storage event (which only fires in other tabs).
  const [justDecided, setJustDecided] = useState<string | null>(null);
  const choice = justDecided ?? stored;

  function decide(value: "accepted" | "declined") {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Nothing to persist to; the consent update below still applies for this page view.
    }
    if (value === "accepted" && typeof window !== "undefined") {
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      w.gtag?.("consent", "update", { analytics_storage: "granted" });
    }
    setJustDecided(value);
  }

  // Nothing to show before hydration, or once a choice exists.
  if (choice === UNKNOWN || choice) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[60] p-4 md:p-5"
    >
      <div
        className="mx-auto flex max-w-4xl flex-col gap-4 rounded-xl p-5 md:flex-row md:items-center md:gap-6 md:p-6"
        style={{
          background: NAVY,
          border: "1px solid rgba(245,246,248,0.14)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <p className="flex-1 text-[13px] leading-[1.6]" style={{ color: PAPER_MUTED }}>
          We use cookies to understand how the site is used. Analytics stay off until you
          accept. Cookies needed to keep you signed in are always on.{" "}
          <Link href="/cookies" className="underline" style={{ color: PAPER }}>
            Cookie Policy
          </Link>{" "}
          &middot;{" "}
          <Link href="/privacy" className="underline" style={{ color: PAPER }}>
            Privacy Policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide("declined")}
            className="font-mono rounded-[6px] border px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] transition-colors hover:bg-white/[0.06]"
            style={{ borderColor: "rgba(245,246,248,0.2)", color: PAPER }}
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="font-mono rounded-[6px] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-all hover:brightness-110"
            style={{ background: RED }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
