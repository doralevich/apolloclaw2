"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CreditsView } from "@/components/CreditsView";
import { UsageView } from "@/components/UsageView";

// Credits and Usage as two tabs on one page - David's ask.
//
// They used to stack: the balance and top-up controls, then the where-it-went breakdown right
// below. Two different questions ("how much is left / add more" vs "where did it go") sharing one
// scroll meant the top-up controls sat above a table, and the table sat below controls nobody was
// using at that moment. Tabs let each be the whole screen when it's the one you came for.
const TABS = [
  { id: "credits", label: "Credits" },
  { id: "usage", label: "Usage" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function BillingTabs() {
  const [tab, setTab] = useState<TabId>("credits");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Both are mounted lazily - only the visible tab fetches its budget/usage. */}
      {tab === "credits" ? <CreditsView /> : <UsageView />}
    </div>
  );
}
