"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

// The agent's own face, wherever the agent appears as somebody rather than as a row of data.
//
// The fallback order matters and is the same everywhere: the picture they chose during setup,
// then the agent's initial, then a Bot glyph. Not a stand-in mascot - that made an unconfigured
// agent look like it had been given a face it never chose. The glyph survives only for an agent
// with no name to take a letter from.
//
// Lifted out of the chat transcript, which had this logic inline. Two places drawing the same
// face from the same three rules is one place, or the rules drift and the same agent ends up
// with a photo in one view and a robot outline in the other.
//
// Size and text size come from the caller, since a 28px badge beside a message and a 56px
// portrait beside a greeting want different type: pass `h-7 w-7 text-xs` or `size-14 text-xl`.
export function AgentFace({
  src,
  name,
  className,
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const initial = (name || "").trim().charAt(0).toUpperCase();

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-background font-semibold text-muted-foreground",
        className
      )}
    >
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : initial ? (
        initial
      ) : (
        <Bot className="h-1/2 w-1/2" />
      )}
    </span>
  );
}
