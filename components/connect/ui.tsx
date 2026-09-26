"use client";

import { cn } from "@/lib/utils";

// The furniture every screen in the guided connect flow is built on.
//
// Pulled out of ConnectFlow.tsx when the channel step became its own component and needed the
// same page shape. Two copies of this would be two headline sizes and two step counters.

// ONE PIECE OF PAGE FURNITURE FOR EVERY SCREEN, and it is deliberately sparse.
//
// The reference David sent (Instinct's sign-up) does four things this page was not: it puts ONE
// thing on screen, sets the headline in the display face at a size you cannot miss, drops all card
// chrome so the words sit on the page rather than inside a box, and makes the way out quiet but
// obvious. This is that, in ApolloClaw's own display face (Bricolage, the site rebuild's heading
// font) rather than the serif in the screenshot.
//
// `eyebrow` is the small line above the headline: who is talking on the screens where the agent is
// asking, and where you are in the sequence on the screens where an app is.
//
// DECLARED AT MODULE SCOPE, never inside a component. A component defined during render is a new
// type every render, so React unmounts and remounts its whole subtree each time - which on this
// page would blow away the focus and the scroll position on every poll tick. Caught by the linter.
export function Page({
  eyebrow,
  title,
  titleIcon,
  children,
}: {
  eyebrow: React.ReactNode;
  title: string;
  /** Rendered to the left of the headline rather than above it, for the one screen that is
   *  asking about the agent itself (ChannelStep's chooser) rather than speaking as the agent -
   *  every other screen leaves this unset and gets the plain headline it always had. */
  titleIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-xl px-1 py-10 sm:py-16">
      {eyebrow}
      <div className={cn("mt-4", titleIcon && "flex items-center gap-4")}>
        {titleIcon}
        <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}

export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <span className="font-medium">
        Step {Math.min(current + 1, total)} of {total}
      </span>
      <span className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i < current ? "w-5 bg-foreground/30" : i === current ? "w-5 bg-foreground" : "w-1.5 bg-border"
            )}
          />
        ))}
      </span>
    </div>
  );
}

export function AppLogo({
  logo,
  name,
  size = "sm",
}: {
  logo: string;
  name: string;
  size?: "sm" | "lg";
}) {
  const box = size === "lg" ? "size-8" : "size-7";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt=""
      loading="lazy"
      decoding="async"
      title={name}
      className={cn(box, "shrink-0 rounded-lg object-contain")}
    />
  );
}

/** "a, b and c" - the agent is talking, and a comma-separated list reads like a form. */
export function joinPhrases(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
