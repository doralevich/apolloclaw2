"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// How many logins a user is shown the getting-started (Start Here) page for. Once the count
// reaches this, the page is retired: /dashboard/start-here bounces to Chat and the Welcome tab
// drops off the rail. One number, so the threshold is a one-line change.
//
// At 4 this shows the page for a user's first three logins and retires it from the fourth on.
export const GETTING_STARTED_MAX_LOGINS = 4;

// Per-user, per-browser login counter.
//
// Keyed on Supabase's last_sign_in_at, which changes only on an actual sign-in - not on a token
// refresh and not on navigating between pages inside a session - so returning to Start Here in the
// same session never re-counts. It lives in localStorage, so it is per-device by design: a new
// browser starts the welcome over, which is the right behaviour for a "stop showing this" gate,
// not a security control.
const key = (userId: string) => `apolloclaw:loginCount:${userId}`;

// One page load mounts this hook twice (Start Here and the sidebar). This memo makes the two agree
// on the count and ensures only the first writes, rather than both racing to double-count the same
// sign-in.
const memo = new Map<string, number>();

function recordLogin(userId: string, lastSignIn: string): number {
  const memoKey = `${userId}:${lastSignIn}`;
  const cached = memo.get(memoKey);
  if (cached !== undefined) return cached;

  let count = 1;
  try {
    const raw = localStorage.getItem(key(userId));
    const prev = raw ? (JSON.parse(raw) as { lastSignIn?: string; count?: number }) : null;
    if (prev && prev.lastSignIn === lastSignIn) {
      // This sign-in is already recorded (an earlier page in the same session counted it).
      count = prev.count ?? 1;
    } else {
      // A sign-in we have not seen: bump the count and remember which sign-in it was.
      count = (prev?.count ?? 0) + 1;
      localStorage.setItem(key(userId), JSON.stringify({ lastSignIn, count }));
    }
  } catch {
    // Storage blocked or unavailable (private window, cleared data): treat as a first login, so we
    // err toward SHOWING the getting-started page rather than hiding it from someone new.
    count = 1;
  }

  memo.set(memoKey, count);
  return count;
}

// Returns how many times this user has signed in on this browser, or null until it is known.
// Null means "still resolving" - callers should not retire the getting-started page on null.
export function useLoginCount(): { count: number | null } {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    // getSession reads the stored session (no network round-trip) and carries the user, including
    // last_sign_in_at.
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        const user = data.session?.user;
        if (cancelled || !user) return;
        // A signed-in user should always have last_sign_in_at; fall back to a fixed marker so a
        // missing value counts as one login rather than incrementing on every page.
        setCount(recordLogin(user.id, user.last_sign_in_at ?? "initial"));
      })
      .catch(() => {
        // Auth read failed: leave count null so nothing is retired on a transient error.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { count };
}

/** True once we know the user has logged in enough times to retire the getting-started page. */
export function gettingStartedRetired(count: number | null): boolean {
  return count !== null && count >= GETTING_STARTED_MAX_LOGINS;
}
