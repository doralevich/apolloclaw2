"use client";

import { useEffect, useRef, useState } from "react";
import { HAIRLINE, PAPER, PAPER_MUTED, RED } from "@/components/home/ui";
// Dark palette, matching the navy hero it sits in.
const INK = PAPER;
const INK_MUTED = PAPER_MUTED;
const LINE = HAIRLINE;

// A continuous, looping conversation between a first-time visitor and the assistant, instead of
// isolated Q&A pairs, so the hero reads as an actual chat happening rather than a static
// screenshot. Every agent line paraphrases something already said elsewhere in the approved
// copy (the home page hero, Built for You, and the FAQ); it claims nothing beyond that. Purely
// presentational, doesn't call any real backend, the real HeroAssistantInput below it does.
type Role = "user" | "agent";
const CONVERSATION: { role: Role; text: string }[] = [
  { role: "user", text: "Hi, what can Apollo[Claw] do for me?" },
  { role: "agent", text: "We build a custom AI agent around how you work. It handles research, follow-ups, reports, and scheduling, and checks in with you on anything that matters." },
  { role: "user", text: "Does it work with the tools we already use?" },
  { role: "agent", text: "Yes. Google Workspace, Microsoft 365, Slack, email, calendars, CRMs, wherever your team already works." },
  { role: "user", text: "How fast can we get one running?" },
  { role: "agent", text: "Most agents are live in about two weeks, followed by 30 days of hands-on training." },
  { role: "user", text: "Is it a fit for a business our size?" },
  { role: "agent", text: "Yes. Solo founders, growing teams, and established companies all get an agent built to fit the way they work." },
  { role: "user", text: "Is our data safe?" },
  { role: "agent", text: "Every agent is privately deployed for one client, on a dedicated private server or your own Mac Mini." },
  { role: "user", text: "Great, how do I get started?" },
  { role: "agent", text: "Hit Book a Discovery Call, or ask me anything right here first." },
];

// Only appended after the first full pass, points the visitor at the real input below instead
// of repeating on every loop.
const CLOSING_LINE = { role: "agent" as Role, text: "Ask your question now." };

const TYPE_MS = 22;
const THINK_MS = 650;
const BETWEEN_MS = 500;
const END_HOLD_MS = 3200;
const RESTART_GAP_MS = 700;

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: INK_MUTED, animation: `hero-dot 1s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
      <style>{`
        @keyframes hero-dot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-2px); } }
      `}</style>
    </span>
  );
}

function Bubble({ role, text, cursor }: { role: Role; text: string; cursor?: boolean }) {
  const isUser = role === "user";
  return (
    <div
      className={`rounded-[10px] border px-4 py-2.5 text-[13px] leading-[1.55] ${isUser ? "self-start" : ""}`}
      style={{
        borderColor: LINE,
        background: isUser ? "rgba(225,46,48,0.06)" : "rgba(245,246,248,0.04)",
        color: isUser ? INK : INK_MUTED,
        maxWidth: isUser ? "85%" : undefined,
      }}
    >
      {text || " "}
      {cursor && <span className="animate-pulse" style={{ color: RED }}>|</span>}
    </div>
  );
}

export function HeroAssistantDemo({ className = "" }: { className?: string }) {
  const [revealed, setRevealed] = useState<{ role: Role; text: string }[]>([]);
  const [typingText, setTypingText] = useState("");
  const [typingRole, setTypingRole] = useState<Role | null>(null);
  const [thinking, setThinking] = useState(false);
  const pausedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [revealed, typingText, thinking]);

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const waitIfPaused = async () => {
      while (pausedRef.current && !cancelled) await wait(200);
    };

    async function run() {
      await Promise.resolve();
      if (cancelled) return;

      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        setRevealed([...CONVERSATION, CLOSING_LINE]);
        return;
      }

      let firstLoop = true;
      while (!cancelled) {
        const script = firstLoop ? [...CONVERSATION, CLOSING_LINE] : CONVERSATION;

        for (let idx = 0; idx < script.length && !cancelled; idx++) {
          const msg = script[idx];
          setTypingRole(msg.role);
          setTypingText("");

          if (msg.role === "agent") {
            await waitIfPaused();
            setThinking(true);
            await wait(THINK_MS);
            if (cancelled) break;
            setThinking(false);
          }

          for (let c = 1; c <= msg.text.length && !cancelled; c++) {
            await waitIfPaused();
            setTypingText(msg.text.slice(0, c));
            await wait(TYPE_MS);
          }
          if (cancelled) break;

          setRevealed((prev) => [...prev, msg]);
          setTypingText("");
          setTypingRole(null);
          await wait(BETWEEN_MS);
        }
        if (cancelled) break;

        firstLoop = false;
        await wait(END_HOLD_MS);
        if (cancelled) break;
        setRevealed([]);
        await wait(RESTART_GAP_MS);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className={`flex flex-col gap-2 overflow-y-auto ${className}`}
      style={{ height: 260 }}
      onFocus={() => (pausedRef.current = true)}
      onBlur={() => (pausedRef.current = false)}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {revealed.map((msg, i) => (
        <Bubble key={i} role={msg.role} text={msg.text} />
      ))}
      {thinking ? (
        <div className="rounded-[10px] border px-4 py-3" style={{ borderColor: LINE, background: "rgba(245,246,248,0.04)" }}>
          <TypingDots />
        </div>
      ) : typingRole ? (
        <Bubble role={typingRole} text={typingText} cursor />
      ) : null}
    </div>
  );
}
