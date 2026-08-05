"use client";

import { useSyncExternalStore } from "react";
import { CalendarDays, Clock } from "lucide-react";

// The date and time in the chat header, from the mockup.
//
// The mockup also puts the weather up here. That one isn't built: it needs a location we never
// collect and a provider we don't have, and a made-up 72°F on a customer's screen is worse than
// no weather at all. Date and time are things this machine actually knows.
//
// Rendered through useSyncExternalStore rather than an effect, for the reason every other clock
// in a server-rendered app needs care: the server has no idea what time it is where the customer
// is, so it renders nothing and the browser fills it in. A useState initializer would hydrate
// with the server's blank and never correct; setting state in an effect would work but costs a
// second paint the rule rightly objects to.
//
// A minute is the resolution shown, so a minute is how often it ticks. Aligning to the wall clock
// would be neater and nobody would ever see the difference.

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
// Cached so the snapshot is referentially stable between ticks — React compares by value, and a
// fresh Date on every call would be a fresh object every render.
let snapshot = "";

function compute(): string {
  const now = new Date();
  const date = now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date}|${time}`;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (!timer) {
    snapshot = compute();
    timer = setInterval(() => {
      const next = compute();
      if (next === snapshot) return;
      snapshot = next;
      listeners.forEach((l) => l());
    }, 30_000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot(): string {
  if (!snapshot) snapshot = compute();
  return snapshot;
}

function getServerSnapshot(): string {
  return "";
}

export function HeaderClock() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!value) return null;

  const [date, time] = value.split("|");

  return (
    // Hidden on narrow screens: a chat header on a phone has room for the thread name and the
    // one button, and this is the part nobody came for.
    <div className="hidden items-center gap-3 text-[13px] text-muted-foreground/80 lg:flex">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        {date}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        {time}
      </span>
    </div>
  );
}
