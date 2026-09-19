"use client";

import { useEffect, useRef } from "react";
import { useDonnaChat } from "@/components/donna/useDonnaChat";

// Donna at full size, for /demo.
//
// Same conversation as the bubble - literally, it is the same hook - given the room to be the
// point of the page rather than a thing in the corner of one. That is the whole difference and
// it is worth the second component: a client who has been sent a link to try the chat should
// land on the chat, not on a page with a chat available somewhere on it.
//
// The red is written out rather than taken from the accent token, and deliberately: the token is
// black on the dashboard (see the .app-accent block in globals.css) and this is Donna's own
// chrome, which is the same #E8342A in the bubble. One character of duplication against a page
// that would quietly turn grey.

const RED = "#E8342A";

/**
 * Three ways in, for the visitor who opens a chat and has nothing ready.
 *
 * They fill the composer rather than sending - the difference matters here, because a stranger's
 * first message to a company should be one they chose to send, and a starter they can edit first
 * is a starter they can make their own.
 */
const STARTERS = [
  "What could an AI agent actually do for my business?",
  "How much does one of these cost to run?",
  "I run a small team. Where would you start?",
];

export function DonnaChat({ token }: { token: string }) {
  const { messages, input, setInput, isLoading, send, lead } = useDonnaChat(token);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // `nearest` rather than the bubble's default: this panel is in the middle of a scrolling
    // marketing page, and scrolling the newest message into the centre of the window would drag
    // the whole page down under the visitor every time she answers.
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading]);

  const fill = (text: string) => {
    setInput(text);
    // preventScroll because the chip and the composer are already both on screen: without it the
    // browser scrolls the composer to the middle of the window and takes the headline with it,
    // so clicking a suggestion appears to throw the page down.
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center gap-3 px-5 py-4" style={{ backgroundColor: RED }}>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
            <path d="M12 8v4l3 3" />
          </svg>
        </div>
        <div>
          <p className="m-0 font-mono text-sm font-bold leading-tight text-white">Donna</p>
          <p className="m-0 text-[11px] text-white/75">Chief Operating Officer, Apollo[Claw]</p>
        </div>
      </div>

      {/* Messages */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation with Donna"
        className="flex max-h-[min(58vh,520px)] min-h-[240px] flex-col gap-3 overflow-y-auto p-5"
      >
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                msg.role === "user"
                  ? "max-w-[78%] rounded-[18px] rounded-br-[5px] px-4 py-2.5 text-sm leading-relaxed text-white"
                  : "max-w-[78%] rounded-[18px] rounded-bl-[5px] bg-[#f4f4f5] px-4 py-2.5 text-sm leading-relaxed text-[#111]"
              }
              style={msg.role === "user" ? { backgroundColor: RED } : undefined}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-[18px] rounded-bl-[5px] bg-[#f4f4f5] px-4 py-3">
              <span className="sr-only">Donna is typing</span>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[#999]"
                  style={{ animation: "chatBounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Only before the first question. After that the conversation is the prompt. */}
        {messages.length === 1 && !isLoading && (
          <div className="mt-2 flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => fill(s)}
                className="rounded-full border border-black/10 bg-white px-3.5 py-2 text-left text-[13px] text-[#4A4A4A] transition-colors hover:border-black/25 hover:text-[#111]"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Lead capture, asked for by Donna herself when the conversation has earned it. */}
      {lead.show && (
        <div className="mx-4 mb-1 flex-shrink-0 rounded-xl border-[1.5px] bg-[#fff7f6] p-4" style={{ borderColor: RED }}>
          <p className="m-0 mb-2.5 text-sm font-bold text-[#1a1a1a]">Before we continue - can I get your info?</p>
          <input
            type="text"
            placeholder="Your name"
            value={lead.name}
            onChange={(e) => lead.setName(e.target.value)}
            className="mb-2 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-black/30"
          />
          <input
            type="email"
            placeholder="Your email"
            value={lead.email}
            onChange={(e) => lead.setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lead.submit()}
            className="mb-2.5 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-black/30"
          />
          {lead.error && <p className="m-0 mb-2 text-xs" style={{ color: RED }}>{lead.error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={lead.submit}
              className="flex-1 rounded-md py-2.5 text-sm font-bold text-white"
              style={{ backgroundColor: RED }}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={lead.dismiss}
              className="rounded-md border border-[#e5e7eb] px-4 py-2.5 text-xs text-[#999] hover:text-[#4A4A4A]"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="flex flex-shrink-0 items-center gap-2 border-t border-[#e5e7eb] bg-white px-4 py-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask Donna about AI for your business..."
          aria-label="Message Donna"
          disabled={isLoading}
          maxLength={500}
          className="flex-1 rounded-full border border-[#e5e7eb] bg-[#fafafa] px-4 py-2.5 text-sm text-[#111] outline-none focus:border-black/30"
        />
        <button
          type="button"
          onClick={send}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: RED }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {/* The bubble declares the same keyframes, and only one of the two is ever on a page: this
          component renders on /demo, where RootShell leaves the bubble out. */}
      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
