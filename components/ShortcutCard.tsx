"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { fillShortcut, type Shortcut } from "@/config/shortcuts";
import { cn } from "@/lib/utils";

// One suggested thing to say, on Start Here and on the Guide.
//
// Two ways out of it, because they serve different moments: the body is a link that opens the
// chat with the question already typed (for someone ready to go), and the copy button takes
// the text (for someone who wants to edit it somewhere else first, or send it from their
// phone). Neither auto-sends — several of these carry a [placeholder] that has to be filled
// in, and firing them off unedited would produce a bad first answer, which is exactly the
// impression this whole page exists to avoid.

export function ShortcutCard({
  shortcut,
  agentName,
  companyName,
  className,
}: {
  shortcut: Shortcut;
  agentName: string;
  companyName?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const prompt = fillShortcut(shortcut.prompt, agentName, companyName);
  const detail = fillShortcut(shortcut.detail, agentName, companyName);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard is permission-gated and unavailable over plain http. The link still works,
      // so failing quietly is better than an error toast for a secondary affordance.
    }
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-lg border bg-card p-4 transition-colors hover:border-foreground/25",
        className
      )}
    >
      <Link
        href={`/dashboard/chat?q=${encodeURIComponent(prompt)}`}
        className="min-w-0 pr-8 after:absolute after:inset-0"
      >
        <p className="text-sm font-medium leading-snug">&ldquo;{prompt}&rdquo;</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
      </Link>

      <ArrowUpRight className="pointer-events-none absolute right-3 top-4 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Sits above the link's overlay so it stays clickable in its own right. */}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy this question"}
        className="absolute bottom-3 right-3 z-10 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
