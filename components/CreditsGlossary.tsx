"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CREDITS_GLOSSARY } from "@/config/glossary";
import { cn } from "@/lib/utils";

// The money words, inline beside the balance — the subset of config/glossary.ts marked
// `onCreditsPage`. The rest (integrations, models, what an agent even is) live on the Guide,
// so this stays about the number the customer is looking at rather than becoming the manual.

export function CreditsGlossary() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-6 text-left"
      >
        <div>
          <h2 className="text-base font-semibold">What these words mean</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Credits, allowance, calls — plain English for everything on this page.
          </p>
        </div>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <dl className="border-t px-6 pb-6 pt-4 space-y-4">
          {CREDITS_GLOSSARY.map(({ term, definition }) => (
            <div key={term}>
              <dt className="text-sm font-semibold">{term}</dt>
              <dd className="mt-0.5 text-sm text-muted-foreground">{definition}</dd>
            </div>
          ))}
          <p className="pt-1 text-xs text-muted-foreground">
            More of these — integrations, models, what your agent actually is — are in the{" "}
            <Link href="/dashboard/guide#glossary" className="underline underline-offset-2">
              Guide
            </Link>
            .
          </p>
        </dl>
      )}
    </div>
  );
}
