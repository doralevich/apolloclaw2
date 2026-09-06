import { CalendarCheck, ExternalLink, Mail } from "lucide-react";

// "Stuck or need help?" — the way out of a setup page.
//
// Every screen in here assumes the person gets to the end of it. Connections assumes the OAuth
// window comes back, Channels assumes the bot token pastes in, the checklist assumes each row is
// a thing you can finish alone. When one of those is not true today there is nothing on the page
// that says what to do about it, and the honest answer — talk to David for twenty minutes — is
// the one thing the product never offers.
//
// So it offers it, at the bottom, where somebody who has already tried is looking. Same Calendly
// link the marketing site books on, so a customer stuck on setup and a prospect who wants a demo
// land in the same calendar rather than two systems that disagree about who booked what.
//
// A server component on purpose: two links and no state, so it costs nothing on any page that
// carries it.

const CALENDLY = "https://cal.com/therealdaveo/apollo-claw";
const SUPPORT_EMAIL = "david@apolloclaw.ai";

export function HelpFooter({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-dashed bg-secondary/30 px-5 py-4 text-center ${className}`}
    >
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Stuck or need help?</span>{" "}
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          <CalendarCheck className="size-4" />
          Book a free setup call
          <ExternalLink className="size-3.5" />
        </a>{" "}
        or email{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          <Mail className="size-4" />
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        We will connect anything on your list with you, on the call. Nothing here has to be done
        alone.
      </p>
    </div>
  );
}
