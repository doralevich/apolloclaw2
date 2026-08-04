"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type ThemeMode } from "@/components/ThemeProvider";

const OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun; hint: string }[] = [
  { value: "light", label: "Light", icon: Sun, hint: "Always light." },
  { value: "dark", label: "Dark", icon: Moon, hint: "Always dark." },
  { value: "system", label: "System", icon: Monitor, hint: "Follows your device." },
];

// Applies immediately on click rather than sitting behind a Save — a theme is the one setting
// where the preview IS the confirmation.
export function ThemePicker() {
  const { mode, setMode } = useTheme();

  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="text-base font-semibold">Appearance</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Applies to your dashboard, on this device. It doesn&apos;t change what anyone else in
        the workspace sees.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          const on = mode === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setMode(o.value)}
              aria-pressed={on}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors",
                on ? "border-primary ring-1 ring-primary" : "hover:bg-secondary/50"
              )}
            >
              <Icon className="size-5 text-muted-foreground" />
              <span className="mt-1 text-sm font-medium">{o.label}</span>
              <span className="text-xs text-muted-foreground">{o.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
