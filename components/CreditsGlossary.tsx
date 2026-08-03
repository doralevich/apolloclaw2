"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// What the words on this page mean.
//
// This page uses "credits", "allowance", "cap", "top-up", "balance" and "calls" as if they
// were interchangeable, and they are not: two of them reset every month, two of them don't,
// and one is a count rather than an amount of money. Somebody deciding whether to spend $250
// should not have to infer that from the layout.
//
// Written for the person paying, not for us. No micros, no markup, no runtime.

const TERMS: Array<{ term: string; definition: string }> = [
  {
    term: "Credits",
    definition:
      "Money your agent spends to do things. Every answer it gives, every search it runs, and every action it takes in one of your tools costs a little. Credits are how that gets paid for.",
  },
  {
    term: "Monthly allowance",
    definition:
      "The $25 of usage included with your hosting each month. It refills on the 1st, and whatever you haven't used doesn't carry over. For most people this covers the whole month on its own.",
  },
  {
    term: "Available balance",
    definition:
      "What your agent can spend right now: whatever is left of this month's allowance, plus any credits you've bought. This is the number that matters — when it hits zero, your agent stops answering.",
  },
  {
    term: "Spent this month",
    definition:
      "What has come out of the monthly allowance since the 1st. Purchased credits are spent only after the allowance is used up, so this number is the honest read on whether $25 is enough for how you work.",
  },
  {
    term: "Top-up",
    definition:
      "Credits you buy on top of the allowance. They don't expire and they don't reset — buy $50 in March and it's still there in July if you haven't used it.",
  },
  {
    term: "A call",
    definition:
      "One request your agent makes: asking the model a question, running one web search, or taking one action in a connected app. A single reply to you is usually several calls, which is why the counts are higher than the number of things you asked for.",
  },
  {
    term: "LLM",
    definition:
      "The thinking. This is the model reading your question, working out what to do, and writing the answer — normally the biggest line on your bill, and the one that grows with longer conversations and bigger documents.",
  },
  {
    term: "Search",
    definition:
      "Looking things up on the live web, for anything the model can't know from training alone — today's news, current prices, a company that launched last month.",
  },
  {
    term: "Tools",
    definition:
      "Doing things in the apps you've connected: sending an email, creating a calendar event, updating a record in your CRM. Cheap per call, and the part that actually saves you time.",
  },
  {
    term: "Low balance warning",
    definition:
      "An email when your available balance drops below a line you choose. It exists because an agent that has run out doesn't announce it — it just stops being useful.",
  },
  {
    term: "Auto-recharge",
    definition:
      "Optional. When your balance falls below your chosen line, we buy the pack you picked and charge the card you last used, so your agent doesn't stop mid-week. We email you every time it happens, and three declined charges in a row switches it off.",
  },
];

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
          {TERMS.map(({ term, definition }) => (
            <div key={term}>
              <dt className="text-sm font-semibold">{term}</dt>
              <dd className="mt-0.5 text-sm text-muted-foreground">{definition}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
