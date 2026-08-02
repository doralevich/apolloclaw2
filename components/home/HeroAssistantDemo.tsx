"use client";

import { useEffect, useRef, useState } from "react";
import { HAIRLINE, PAPER, PAPER_MUTED, RED } from "@/components/home/ui";

// Looping typed Q&A so the hero's assistant card reads as alive rather than a static screenshot.
// Every answer paraphrases something already said elsewhere in the approved copy (Hero, What We
// Do, Two-Fold Model, Trust Strip), nothing new is claimed here. Purely presentational, doesn't
// call any real backend, the real HeroAssistantInput below it still does that.
const EXCHANGES = [
  { q: "Does it work in Slack and WhatsApp?", a: "Yes, it works where your team already works, Slack, WhatsApp, email, and more." },
  { q: "How long does setup take?", a: "Answer a few questions and your agent is ready, with a dashboard and integrations from day one." },
  { q: "Will it check with me before anything big?", a: "Always. It checks in before anything that matters, you stay in control." },
  { q: "What about security?", a: "Encrypted in transit and at rest, isolated per client, hosted in the US." },
  { q: "Can you build it for me instead?", a: "Sure, we design, deploy, and run it for you, with a 30-day onboarding." },
];

const TYPE_MS = 24;
const THINK_MS = 700;
const HOLD_MS = 2600;
const GAP_MS = 500;

type Phase = "typingQ" | "thinking" | "typingA" | "holding" | "gap";

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            background: PAPER_MUTED,
            animation: `hero-dot 1s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes hero-dot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-2px); } }
      `}</style>
    </span>
  );
}

export function HeroAssistantDemo() {
  const [pairIndex, setPairIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typingQ");
  const [qText, setQText] = useState("");
  const [aText, setAText] = useState("");
  const pausedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const waitIfPaused = async () => {
      while (pausedRef.current && !cancelled) await wait(200);
    };

    async function run() {
      // Yield a tick first, state updates below are all scheduled work, not synchronous
      // effect-body mutations.
      await Promise.resolve();
      if (cancelled) return;

      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        setQText(EXCHANGES[0].q);
        setAText(EXCHANGES[0].a);
        setPhase("holding");
        return;
      }

      let i = 0;
      while (!cancelled) {
        const { q, a } = EXCHANGES[i % EXCHANGES.length];
        setPairIndex(i % EXCHANGES.length);

        setPhase("typingQ");
        setQText("");
        setAText("");
        for (let c = 1; c <= q.length && !cancelled; c++) {
          await waitIfPaused();
          setQText(q.slice(0, c));
          await wait(TYPE_MS);
        }
        if (cancelled) break;

        await waitIfPaused();
        setPhase("thinking");
        await wait(THINK_MS);
        if (cancelled) break;

        setPhase("typingA");
        for (let c = 1; c <= a.length && !cancelled; c++) {
          await waitIfPaused();
          setAText(a.slice(0, c));
          await wait(TYPE_MS);
        }
        if (cancelled) break;

        setPhase("holding");
        await wait(HOLD_MS);
        if (cancelled) break;

        setPhase("gap");
        await wait(GAP_MS);
        i++;
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="flex flex-col gap-2.5"
      onFocus={() => (pausedRef.current = true)}
      onBlur={() => (pausedRef.current = false)}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div
        className="self-start rounded-[10px] border px-4 py-2.5 text-[13px]"
        style={{ borderColor: HAIRLINE, background: "rgba(225,46,48,0.06)", color: PAPER }}
      >
        {qText || " "}
        {phase === "typingQ" && <span className="animate-pulse" style={{ color: RED }}>|</span>}
      </div>
      <div
        className="min-h-[52px] rounded-[10px] border px-4 py-3.5 text-[13.5px] leading-[1.6]"
        style={{ borderColor: HAIRLINE, background: "rgba(245,246,248,0.04)", color: PAPER_MUTED }}
      >
        {phase === "thinking" ? (
          <TypingDots />
        ) : (
          <>
            {aText}
            {phase === "typingA" && <span className="animate-pulse" style={{ color: RED }}>|</span>}
            {!aText && phase !== "typingQ" && " "}
          </>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {pairIndex >= 0 ? EXCHANGES[pairIndex].q : ""}
      </p>
    </div>
  );
}
