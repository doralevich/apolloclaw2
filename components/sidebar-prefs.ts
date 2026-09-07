"use client";

import { useCallback, useSyncExternalStore } from "react";

// Which daily-rail rows this person has chosen not to see.
//
// PER PERSON, PER DEVICE, and that is the whole design. It sits beside Appearance in Settings >
// General and behaves the same way: your dashboard, your device, nobody else's. Hiding Checklist
// does not hide it for a teammate, and an admin cannot hide it on anyone's behalf. If that is
// what is wanted it is a different feature - a column on the workspace, an API route, and an
// admin-only control - and it should be argued for on its own rather than arrived at by widening
// this one.
//
// HIDING IS NOT DISABLING. The route still exists and still works when typed or linked; only the
// rail row goes. That matters because half the product links to these pages from elsewhere -
// Home's tiles point at Connections and My Schedule - and a hidden row must not turn those into
// dead ends.
//
// Storage is localStorage, read through useSyncExternalStore for the same reason ThemeProvider
// does: a lazy useState initializer runs on the server, returns the fallback, and React hydrates
// with the server's value, so the preference would never be read at all. This shape lets React
// render the server's answer during hydration and re-render with the real one immediately after.

export const HIDDEN_NAV_STORAGE_KEY = "apolloclaw-hidden-nav";

/**
 * The rows a person is allowed to hide.
 *
 * Home and Chat are deliberately absent. Home is where every login lands, and Chat is the
 * product - a rail that can be emptied of both is a way to lose the thing you paid for behind a
 * checkbox you ticked once and forgot.
 */
export const HIDEABLE_NAV = [
  { href: "/dashboard/checklist", label: "Checklist" },
  { href: "/dashboard/integrations", label: "Connections" },
  { href: "/dashboard/schedule", label: "My Schedule" },
] as const;

// Set<string>, not the literal union `as const` infers: every caller checks an href that arrives
// as a plain string (a pathname, a parsed storage value), and a union-typed Set rejects those at
// the type level while being exactly the check they need at runtime.
const HIDEABLE_HREFS: ReadonlySet<string> = new Set<string>(HIDEABLE_NAV.map((n) => n.href));

/** Nothing hidden. A frozen shared instance so the snapshot is referentially stable - returning a
 *  fresh [] every call would make useSyncExternalStore re-render forever. */
const NONE: readonly string[] = Object.freeze([]);

/** The last parsed value, kept so getSnapshot can return the SAME array when the raw string has
 *  not changed. React compares snapshots by identity. */
let cachedRaw: string | null = null;
let cachedValue: readonly string[] = NONE;

function read(): readonly string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(HIDDEN_NAV_STORAGE_KEY);
  } catch {
    // Storage disabled (Safari private mode). Nothing hidden is the safe answer: the worst case
    // is a row someone wanted gone stays, rather than a row they need going missing.
    return NONE;
  }
  if (raw === null) return NONE;
  if (raw === cachedRaw) return cachedValue;

  let next: readonly string[] = NONE;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filtered against HIDEABLE_NAV on the way in, so a stale entry from a renamed route - or
      // anything hand-edited into storage - can never hide a row this feature does not own.
      const kept = parsed.filter((x): x is string => typeof x === "string" && HIDEABLE_HREFS.has(x));
      if (kept.length) next = Object.freeze(kept);
    }
  } catch {
    // Corrupt JSON. Same reasoning as storage being unavailable: show everything.
  }
  cachedRaw = raw;
  cachedValue = next;
  return next;
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  // Another tab. Same-tab writes go through the emit in setHidden, because localStorage does not
  // fire "storage" in the tab that wrote it.
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getServerSnapshot(): readonly string[] {
  return NONE;
}

export function useHiddenNav() {
  const hidden = useSyncExternalStore(subscribe, read, getServerSnapshot);

  const toggle = useCallback((href: string) => {
    if (!HIDEABLE_HREFS.has(href)) return;
    const current = read();
    const next = current.includes(href)
      ? current.filter((h) => h !== href)
      : [...current, href];
    try {
      localStorage.setItem(HIDDEN_NAV_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Nothing to do but let the click be a no-op rather than throw out of an onChange.
    }
    listeners.forEach((l) => l());
  }, []);

  const isHidden = useCallback((href: string) => hidden.includes(href), [hidden]);

  return { hidden, toggle, isHidden };
}
