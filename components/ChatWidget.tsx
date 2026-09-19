"use client";

import { useState, useRef, useEffect } from "react";
import { useDonnaChat } from "@/components/donna/useDonnaChat";

// Donna in a bubble, bottom right of every marketing page.
//
// The conversation is not hers any more — it is useDonnaChat, which she now shares with the full
// page at /demo. What is left here is the chrome: the button, the panel, the open/closed
// animation and the hero handoff, none of which /demo has any use for.
//
// `token` is CHAT_API_TOKEN, read in the root layout and handed down. See the note on post() in
// the hook for why it travels this way rather than sitting in the source.

export default function ChatWidget({ token }: { token: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, setInput, isLoading, send, startWith, lead } = useDonnaChat(token);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // The home page hero is a text field that looks like this one. Typing in it fires this event,
  // the panel opens, and the message is already sent by the time it finishes opening.
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail?.message as string;
      if (!msg) return;
      setIsOpen(true);
      // Sent a beat late so the panel is on screen when her answer lands in it, rather than the
      // whole exchange happening behind a closed bubble.
      setTimeout(() => startWith(msg), 300);
    };
    window.addEventListener("hero-chat-open", handler);
    return () => window.removeEventListener("hero-chat-open", handler);
  }, [startWith]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#E8342A",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(232, 52, 42, 0.45)",
          zIndex: 9999,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 6px 24px rgba(232, 52, 42, 0.6)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 4px 20px rgba(232, 52, 42, 0.45)";
        }}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      <div
        style={{
          position: "fixed",
          bottom: "92px",
          right: "24px",
          width: "min(360px, calc(100vw - 48px))",
          height: "min(480px, calc(100vh - 120px))",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 9998,
          transition: "opacity 0.2s, transform 0.25s",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
          pointerEvents: isOpen ? "all" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#E8342A",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div>
            <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", margin: 0, lineHeight: 1.2 }}>
              Apollo[Claw] AI
            </p>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px", fontFamily: "Inter, sans-serif", margin: 0 }}>
              Ask about AI for your business
            </p>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  backgroundColor: msg.role === "user" ? "#E8342A" : "#f4f4f5",
                  color: msg.role === "user" ? "#ffffff" : "#111111",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: "16px 16px 16px 4px",
                  backgroundColor: "#f4f4f5",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#999",
                      animation: "chatBounce 1.2s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
                      display: "inline-block",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Lead Capture Form */}
        {lead.show && (
          <div style={{
            margin: "8px 12px",
            padding: "14px 16px",
            backgroundColor: "#fff7f6",
            border: "1.5px solid #E8342A",
            borderRadius: "12px",
            flexShrink: 0,
          }}>
            <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 700, color: "#1a1a1a", fontFamily: "Inter, sans-serif" }}>
              Before we continue - can I get your info?
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={lead.name}
              onChange={e => lead.setName(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", marginBottom: "8px", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", fontFamily: "Inter, sans-serif", outline: "none" }}
            />
            <input
              type="email"
              placeholder="Your email"
              value={lead.email}
              onChange={e => lead.setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && lead.submit()}
              style={{ width: "100%", boxSizing: "border-box", marginBottom: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", fontFamily: "Inter, sans-serif", outline: "none" }}
            />
            {lead.error && (
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#E8342A", fontFamily: "Inter, sans-serif" }}>{lead.error}</p>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={lead.submit} style={{ flex: 1, backgroundColor: "#E8342A", color: "#fff", border: "none", borderRadius: "6px", padding: "9px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                Submit
              </button>
              <button onClick={lead.dismiss} style={{ backgroundColor: "transparent", color: "#999", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "9px 14px", fontSize: "12px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: "8px",
            flexShrink: 0,
            backgroundColor: "#ffffff",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about AI for your business..."
            disabled={isLoading}
            style={{
              flex: 1,
              border: "1px solid #e5e7eb",
              borderRadius: "999px",
              padding: "9px 14px",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              outline: "none",
              color: "#111",
              backgroundColor: "#fafafa",
            }}
          />
          <button
            onClick={send}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#E8342A",
              border: "none",
              cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
              opacity: isLoading || !input.trim() ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "opacity 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {/* Branding */}
        <div
          style={{
            padding: "6px 16px 10px",
            textAlign: "center",
            backgroundColor: "#ffffff",
          }}
        >
          <p style={{ fontSize: "10px", color: "#aaa", fontFamily: "Inter, sans-serif", margin: 0 }}>
            Powered by{" "}
            <a
              href="https://apolloclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#E8342A", textDecoration: "none", fontWeight: 600 }}
            >
              Apollo[Claw]
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
