"use client";

import { useCallback, useRef, useState } from "react";

// Donna's conversation, independent of where it is drawn.
//
// WHY A HOOK. Donna used to exist once, as the floating bubble, and the bubble owned the
// conversation as well as the chrome. She is now in two places — the bubble on every marketing
// page and the full page at /demo — and the half worth sharing is not the styling, it is the
// protocol: the request shape /api/chat expects, the ##CAPTURE_LEAD## marker it answers with, and
// what the lead form does with what the visitor types. Two copies of that is two chances for one
// of them to drift, which is exactly what had already happened before this was pulled out. See
// the note on post() for what the drift cost.

export type DonnaMessage = { role: "user" | "assistant"; content: string };

/** Her first line, before anybody has said anything. Also re-seeded by startWith(). */
export const DONNA_OPENING =
  "Hi, I'm Donna, Chief Operating Officer for David Oralevich and Apollo[Claw]. How can I help you today?";

/** How long her answer sits on screen before the lead form slides in under it. */
const CAPTURE_DELAY_MS = 3500;

const CAPTURE_MARKER = /\n?##CAPTURE_LEAD##/g;

type Reply = { text: string; capture: boolean; ok: boolean };

/**
 * One request to /api/chat, and the only one.
 *
 * WHERE THE TOKEN COMES FROM, and why it is a parameter. It used to be a 64-character literal
 * written into this file, copied from the two call sites that each carried their own. It is not
 * a secret - it ships to every visitor in the page, and it never could be one, because the thing
 * checking it is a public endpoint the browser has to be able to call. What it does is raise the
 * floor on a script that posts /api/chat without reading a page first; the real defences are the
 * origin allow-list, the rate limit and the honeypot above it in route.ts.
 *
 * A literal still did not belong in the repository, and GitGuardian was right to say so. It now
 * comes from the server, read out of the same CHAT_API_TOKEN the route checks against and handed
 * down as a prop. One variable instead of a pair that could drift, and the failure mode is the
 * safe one: with CHAT_API_TOKEN unset, the route skips the check and this sends an empty string,
 * so neither side can be armed without the other.
 *
 * EVERY call site goes through here, and that is the fix as much as the tidy-up. The lead form
 * used to post on its own and it posted `{ messages }` alone — no _token, no _hp — while the
 * other two sent both. app/api/chat/route.ts rejects that with a 403 whenever CHAT_API_TOKEN is
 * set in the environment, and the caller read `data.message || ""` off the rejection, so the
 * visitor who had just typed their name and email got an empty grey bubble and David's Telegram
 * alert never fired. The one path a lead takes was the one path that was not sending the token.
 */
async function post(messages: DonnaMessage[], token: string): Promise<Reply> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      _token: token,
      _hp: "",
    }),
  });

  const data: { message?: string; error?: string } = await res.json();
  const raw = typeof data.message === "string" ? data.message : "";

  if (!res.ok || !raw) {
    return {
      ok: false,
      capture: false,
      text: data.error || "Something went wrong. Try reaching us at hello@apolloclaw.ai",
    };
  }

  return { ok: true, capture: raw.includes("##CAPTURE_LEAD##"), text: raw.replace(CAPTURE_MARKER, "").trim() };
}

/**
 * Why the name and the email are checked at all.
 *
 * Every lead that gets past this becomes a Telegram alert and a follow-up somebody has to make,
 * so "asdf / test@test.com" costs a real person real time. The messages are hers rather than a
 * form's — she asked the question, so she is the one who says the answer does not look right.
 */
export function validateLead(name: string, email: string): string | null {
  const fakeName = /^(test|fake|john doe|jane doe|asdf|foo|bar|abc|xxx|user|anon|anonymous|na|n\/a)$/i;
  const fakeEmail = /^(test|fake|no|none|nope|asdf|foo|bar|abc|xxx|user|admin|info|hello)@(test|fake|example|mailinator|guerrillamail|yopmail|tempmail|throwaway)\.(com|net|org|io)/i;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!name.trim() || name.trim().length < 2) return "Mind sharing your real name? Even just a first name works.";
  if (fakeName.test(name.trim())) return "Ha, we appreciate the creativity, but a real name helps us follow up properly.";
  if (!email.trim() || !emailRegex.test(email.trim())) return "That email doesn't look quite right. Want to double-check it?";
  if (fakeEmail.test(email.trim())) return "That looks like a temporary email. We promise we promise we won't spam you. Can you share your real one?";
  return null;
}

export function useDonnaChat(token: string) {
  const [messages, setMessages] = useState<DonnaMessage[]>([{ role: "assistant", content: DONNA_OPENING }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState("");

  // Read inside callbacks that must not be rebuilt when it changes. The bubble hangs a window
  // event listener off startWith, and a listener that is torn down and re-added on every state
  // change is a listener that can miss the event it was added for.
  const leadSubmittedRef = useRef(false);
  const loadingRef = useRef(false);

  // One call rather than two every time, and the ref is what send() and submitLead() read to
  // refuse a second send while the first is in flight without taking isLoading as a dependency.
  const setLoading = useCallback((v: boolean) => {
    loadingRef.current = v;
    setIsLoading(v);
  }, []);

  /** Post `history`, append the answer to it, and arm the lead form if she asked for one. */
  const exchange = useCallback(
    async (history: DonnaMessage[]) => {
      setMessages(history);
      setLoading(true);
      try {
        const reply = await post(history, token);
        setMessages([...history, { role: "assistant", content: reply.text }]);
        if (reply.capture && !leadSubmittedRef.current) {
          setTimeout(() => setShowLeadForm(true), CAPTURE_DELAY_MS);
        }
      } catch {
        setMessages([
          ...history,
          { role: "assistant", content: "Connection error. Please try again or email hello@apolloclaw.ai" },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, token],
  );

  /** Send whatever is in the composer. */
  const send = useCallback(() => {
    const text = input.trim();
    if (!text || loadingRef.current) return;
    setInput("");
    void exchange([...messages, { role: "user", content: text }]);
  }, [input, messages, exchange]);

  /**
   * Open on somebody else's words: the home page hero takes the first message, so by the time
   * Donna appears the visitor has already asked. The conversation is re-seeded rather than
   * appended to, because that is a first message by definition.
   */
  const startWith = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      void exchange([
        { role: "assistant", content: DONNA_OPENING },
        { role: "user", content: trimmed },
      ]);
    },
    [exchange],
  );

  const submitLead = useCallback(async () => {
    const error = validateLead(leadName, leadEmail);
    if (error) {
      setLeadError(error);
      return;
    }
    const name = leadName.trim();
    const email = leadEmail.trim();

    setLeadError("");
    setShowLeadForm(false);
    setLeadSubmitted(true);
    leadSubmittedRef.current = true;
    setLoading(true);

    // Two versions of the same turn, on purpose. The server gets the bracketed form, which is
    // what route.ts greps for the name and email it sends to Telegram; the transcript shows the
    // sentence, because a visitor should not watch their details turn into a marker.
    const history = messages;
    const forServer: DonnaMessage[] = [...history, { role: "user", content: `[LEAD: ${name}, ${email}]` }];
    const shown: DonnaMessage[] = [
      ...history,
      { role: "user", content: `My name is ${name} and my email is ${email}` },
    ];
    setMessages(shown);

    const thanks = `Thanks ${name}! Got your info. What else can I help you with?`;
    try {
      const reply = await post(forServer, token);
      // An empty answer here used to render as an empty bubble. Whatever went wrong, the
      // visitor handed over their details and is owed a reply to them.
      setMessages([...shown, { role: "assistant", content: reply.ok ? reply.text : thanks }]);
    } catch {
      setMessages([...shown, { role: "assistant", content: thanks }]);
    } finally {
      setLoading(false);
    }
  }, [leadName, leadEmail, messages, setLoading, token]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    send,
    startWith,
    lead: {
      show: showLeadForm && !leadSubmitted,
      name: leadName,
      email: leadEmail,
      error: leadError,
      setName: setLeadName,
      setEmail: setLeadEmail,
      submit: submitLead,
      dismiss: () => setShowLeadForm(false),
    },
  };
}
