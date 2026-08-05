"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

// Light/dark, one click, at the top of the screen.
//
// The full three-way picker (light / dark / follow the device) stays in Settings, because that is
// where a preference belongs. This is the other thing people want from a theme control: to flip it
// now, while looking at the thing they want to see differently — and having to leave the page to
// do that is the reason nobody ever finds it.
//
// Choosing either side ends "system": someone who reaches for this has an opinion, and quietly
// reverting to the device setting at sunset would look like a bug. Settings is where they go to
// hand the decision back.

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();

  // In system mode we don't know which way it resolved without reading the DOM, so ask the
  // document — the provider has already stamped the class on it.
  const isDark =
    mode === "dark" ||
    (mode === "system" &&
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"));

  return (
    <button
      type="button"
      onClick={() => setMode(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
