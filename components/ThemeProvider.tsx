"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";

// Light / dark / follow-the-OS, for the dashboard only.
//
// Scoped deliberately. The dashboard is built entirely on the semantic tokens in
// globals.css, so the .dark class re-skins it wholesale. The marketing pages are not —
// they carry literal hex in inline styles — so the same class there would recolour the
// shared Button and Input while every surface around them stayed put. This provider
// mounts in the dashboard layout and strips the class on the way out.

export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "apolloclaw-theme";

// Kept in sync with the inline pre-paint script in app/layout.tsx. Change one, change both.
export function resolveStoredTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    // Safari in private mode, or storage disabled entirely. Fall through to the default.
  }
  return "system";
}

const ThemeContext = createContext<{ mode: ThemeMode; setMode: (m: ThemeMode) => void }>({
  mode: "system",
  setMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// localStorage as an external store, so the stored preference is available on the FIRST
// client render rather than arriving a render later.
//
// The obvious alternatives are both wrong here. A lazy useState initializer runs on the
// server too, returns the fallback, and React hydrates with the server's value — the stored
// preference would never be read at all. Reading it in an effect and calling setState is a
// cascading render, and the frame in between is the white flash this whole file exists to
// avoid. useSyncExternalStore is the shape React provides for exactly this.
const listeners = new Set<() => void>();

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  // Another tab changing the preference. Same-tab writes go through emit(), because
  // localStorage does not fire "storage" in the tab that wrote it.
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

// Safe to re-read on every call: the snapshot is a string, so React's identity check
// compares by value and won't see a change that isn't one.
function getSnapshot(): ThemeMode {
  return resolveStoredTheme();
}

function getServerSnapshot(): ThemeMode {
  return "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = mode === "dark" || (mode === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    // Only meaningful on "system", but harmless to keep attached: apply() re-reads mode.
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mode]);

  // The dashboard's accent, which is violet where the marketing site's is red.
  //
  // Stamped on <html> rather than a wrapper because Radix renders menus, dialogs and toasts in
  // a portal at the end of <body> — outside any wrapper, and they'd keep the red. On the root
  // element, everything inherits it.
  //
  // Scoped to the dashboard for the same reason the dark class is: the marketing pages carry
  // literal brand hex in inline styles, so re-pointing --color-primary there would recolour the
  // shared Button while every surface around it stayed red.
  useEffect(() => {
    document.documentElement.classList.add("app-accent");
    return () => document.documentElement.classList.remove("app-accent");
  }, []);

  // Leaving the dashboard for a marketing page is a client-side navigation, which unmounts
  // this provider without reloading. Without the cleanup the class would survive onto pages
  // that have no dark styling.
  useEffect(() => () => document.documentElement.classList.remove("dark"), []);

  const setMode = useCallback((m: ThemeMode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, m);
    } catch {
      // Storage disabled (Safari private mode). The snapshot re-reads storage, so the choice
      // genuinely won't stick — nothing to do but let the click be a no-op rather than throw
      // an uncaught error out of an onClick.
    }
    listeners.forEach((l) => l());
  }, []);

  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>;
}
