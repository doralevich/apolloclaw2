import type { Metadata } from "next";
import { DonnaChat } from "@/components/donna/DonnaChat";

// /demo: the page a client is sent to when the ask is "can I try it?".
//
// WHAT USED TO BE HERE was the purchase walkthrough - pick an agent, answer its questionnaire,
// see the files it would generate - behind an admin gate. That never had anything to do with the
// word demo as a client uses it, and it is still there, at /davidtest/purchase, still gated. This
// is a link somebody can be given.
//
// It is Donna, the same one who sits in the corner of every other page, given the whole page.
// Nothing is mocked: this is the live /api/chat, so a conversation here is a real conversation
// and a lead left here reaches David's Telegram exactly like one left in the bubble.
//
// The marketing nav and footer stay, because the visit ends one of two ways and both need them:
// she books the call, or they go and read a page. What does NOT stay is the floating bubble -
// RootShell leaves it out here, since two Donnas on one screen is a joke at our own expense.

export const metadata: Metadata = {
  title: "Try our AI assistant",
  description:
    "Talk to Donna, the AI assistant Apollo[Claw] built for itself. Ask what an AI agent could do for your business, what it costs to run, and where to start.",
  alternates: { canonical: "https://apolloclaw.ai/demo" },
};

export default function DemoPage() {
  return (
    // A div and not a <main>: RootShell already wraps every marketing page's children in one,
    // and two of them on a page is two documents as far as a screen reader is concerned.
    <div className="mx-auto max-w-2xl px-6 py-14 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E8342A]">Live demo</p>
      <h1 className="font-heading mt-3 text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
        Meet Donna.
      </h1>
      {/* Short on purpose. On a phone every line here is a line between the visitor and the
          thing they came to try, and the chat introduces itself anyway. */}
      <p className="mt-5 text-base leading-relaxed text-[#4A4A4A] sm:text-lg">
        She is our Chief Operating Officer and she is an AI agent, built on the same thing we build
        for clients. Ask her what one of these could do for your business. She can put a call in
        the diary while you are here.
      </p>

      <div className="mt-10">
        <DonnaChat token={process.env.CHAT_API_TOKEN ?? ""} />
      </div>

      {/* Said plainly and up front. Somebody who works out for themselves halfway through that
          they have been talking to software feels tricked, and nothing about this needs to be. */}
      <p className="mt-5 text-sm leading-relaxed text-[#6b6b6b]">
        Donna is AI, not a person, and she will say so if you ask. She answers about our work and
        nothing else. If you would rather talk to David, he is at{" "}
        <a
          href="mailto:hello@apolloclaw.ai"
          className="font-medium text-[#E8342A] underline underline-offset-2"
        >
          hello@apolloclaw.ai
        </a>
        .
      </p>
    </div>
  );
}
