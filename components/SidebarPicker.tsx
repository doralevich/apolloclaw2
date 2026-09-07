"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { PERSONALLY_HIDEABLE_NAV } from "@/config/nav";
import { useHiddenNav } from "@/components/sidebar-prefs";

// Sits directly under Appearance, and is the same kind of setting: yours, on this device.
//
// Applies on click rather than behind a Save, for the reason the theme picker gives - the rail is
// on screen while you are clicking, so the preview IS the confirmation.
//
// Offers only what the platform has left visible. A section switched off for everyone in
// config/nav.ts is gone from here too, because a checkbox that cannot change anything is worse
// than no checkbox: somebody ticks it and believes it worked. With everything switched off
// product-wide there is nothing to choose about, so the card does not render at all.
export function SidebarPicker() {
  const { toggle, isHidden } = useHiddenNav();

  if (PERSONALLY_HIDEABLE_NAV.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="text-base font-semibold">Sidebar</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Turn off the sections you don&apos;t use. Applies to your dashboard, on this device. It
        doesn&apos;t change what anyone else in the workspace sees, and the pages still work if
        something links to them.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {PERSONALLY_HIDEABLE_NAV.map((item) => {
          const off = isHidden(item.href);
          const Icon = off ? EyeOff : Eye;
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => toggle(item.href)}
              aria-pressed={!off}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors",
                off ? "text-muted-foreground hover:bg-secondary/50" : "border-primary ring-1 ring-primary"
              )}
            >
              <Icon className="size-5 text-muted-foreground" />
              <span className="mt-1 text-sm font-medium text-foreground">{item.label}</span>
              <span className="text-xs text-muted-foreground">
                {off ? "Hidden from the sidebar." : "Showing in the sidebar."}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
