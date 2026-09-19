import Link from "next/link";
import { SCENARIOS } from "@/config/davidtest";

// The front door. Two halves of one journey, and it says which is which, because the most
// confusing thing about having both is not knowing where one stops.

export const metadata = { title: "davidtest" };

const CARDS = [
  {
    href: "/davidtest/purchase",
    kicker: "Before the agent exists",
    title: "The purchase journey",
    body: "Pick any agent, answer its real questionnaire, and see the USER.md, AGENTS.md and TOOLS.md it would generate. No payment, no provisioning. This lived at /demo until /demo became Donna's chat; the screens are unchanged.",
    cta: "Walk it",
  },
  {
    href: "/davidtest/connect?vendor=google&conns=none",
    kicker: "First screen after the build",
    title: "The connect flow",
    body: "Where a new owner lands off the build screen: email, calendar, files, then which chat app you want to reach it in. Pressing Connect flips the connection on instead of opening a consent tab, and the real component's own polling finds it and moves on, so the pacing is the real pacing. The channel step walks too - a token of any shape is accepted, and tapping through to the bot stands in for messaging it.",
    cta: "Walk it",
  },
  {
    href: "/davidtest/chat?s=hated&conns=none",
    kicker: "The first conversation",
    title: "The chat welcome",
    body: "The agent's opening line and the four chips, built by the real generators from whichever answers you pick. Switch between a customer who wrote what they hate, one who only picked goals, a role agent, a legacy record, and one with nothing at all.",
    cta: "Walk it",
  },
];

export default function DavidTestPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        davidtest
      </p>
      <h1 className="font-heading mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
        Walk it without buying it
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
        The real screens, running the real code, against answers that are made up in your browser.
        Nothing here writes to the database, spends a credit, provisions a box or touches a
        customer.
      </p>

      <div className="mt-12 space-y-4">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group block rounded-2xl border p-6 transition-colors hover:border-foreground/25 hover:bg-secondary/30"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {c.kicker}
            </p>
            <h2 className="mt-1.5 text-xl font-semibold">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            <p className="mt-3 text-sm font-medium">
              {c.cta}
              <span aria-hidden="true" className="ml-1.5 inline-block transition-transform group-hover:translate-x-0.5">
                &rarr;
              </span>
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 border-t pt-6">
        <h2 className="text-sm font-semibold">The answer sets</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every screen above that reads the questionnaire can be pointed at any of these. They are
          shapes copied from real rows, not invented ones.
        </p>
        <ul className="mt-4 space-y-2.5">
          {SCENARIOS.map((s) => (
            <li key={s.id} className="text-sm">
              <span className="font-medium">{s.label}</span>
              <span className="text-muted-foreground"> &mdash; {s.note}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Said here rather than discovered later: the gap between what this covers and what it does
          not is the thing that would waste an afternoon. */}
      <div className="mt-10 rounded-xl border bg-secondary/30 p-5 text-sm leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">What this does not cover</p>
        <p className="mt-2">
          Sending a message in chat, which needs a live agent. The OAuth handshake itself, which
          is the one thing only a real Google or Microsoft account can prove. And the two halves
          of channel setup that happen in somebody else&apos;s app: whether BotFather really gave
          you that token, and whether Slack really accepted the Request URL. The screens around
          them are real; the credential is not.
        </p>
      </div>
    </main>
  );
}
