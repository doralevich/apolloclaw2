"use client";
import { useState } from "react";
import ApolloClawLogo from "@/components/ApolloClawLogo";

// Client UI for /agent-invite/[type]. Two phases:
//   - gate:    enter the access password -> POST /api/agent-invite/unlock (sets the cookie).
//   - welcome: "Welcome" + name/email -> POST /api/agent-invite/[type]/claim, which provisions the
//              live agent and returns a one-click sign-in URL we navigate to. From there the visitor
//              is in the standard customer onboarding, same as any other agent.
//
// Parameterized by agent type: the same flow serves the CFO, Law, CEO, Marketing, Sales, Recruiting,
// Medical, and Real Estate agents. `agentLabel` is the registry label (e.g. "The CFO Agent").
//
// Brand rule: no em dashes in user-facing copy. Use hyphens or commas.

const R = "#D72B2B";
const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const SRF2 = "#E8E7E3";
const BDR = "rgba(0,0,0,0.10)";
const TX = "#000000";
const TXM = "#1A1A1A";
const TXD = "#4A4A4A";

const FONT = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";

// "The CFO Agent" -> "CFO Agent", for possessive/inline copy ("your customized CFO Agent").
function inlineLabel(label: string): string {
  return label.replace(/^The\s+/i, "");
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <ApolloClawLogo ink={TX} height={30} />
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#FFFFFF",
          border: `1px solid ${BDR}`,
          borderRadius: 16,
          padding: "36px 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.05)",
        }}
      >
        {children}
      </div>
      <style>{`@keyframes oc-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  fontSize: 15,
  fontFamily: FONT,
  color: TX,
  background: SRF,
  border: `1px solid ${BDR}`,
  borderRadius: 10,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: TXD,
  margin: "0 0 7px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: R,
  margin: "0 0 10px",
};

function Button({
  children,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "14px 18px",
        fontSize: 15,
        fontWeight: 800,
        fontFamily: FONT,
        color: "#FFFFFF",
        background: disabled ? "#C88" : R,
        border: "none",
        borderRadius: 10,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.75 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div
        style={{
          width: 44,
          height: 44,
          border: `3px solid ${SRF2}`,
          borderTopColor: R,
          borderRadius: "50%",
          animation: "oc-spin 1s linear infinite",
          margin: "0 auto 20px",
        }}
      />
      <p style={{ fontSize: 15, fontWeight: 700, color: TXM, margin: 0 }}>{label}</p>
      <p style={{ fontSize: 13, color: TXD, margin: "6px 0 0" }}>This takes a few moments.</p>
    </div>
  );
}

export default function AgentInvite({
  type,
  agentLabel,
  unlocked,
  greetName,
}: {
  type: string;
  agentLabel: string;
  unlocked: boolean;
  greetName: string;
}) {
  const [isUnlocked, setUnlocked] = useState(unlocked);

  // Gate state
  const [passcode, setPasscode] = useState("");
  const [gateErr, setGateErr] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // Welcome state
  const [name, setName] = useState(greetName);
  const [email, setEmail] = useState("");
  const [welcomeErr, setWelcomeErr] = useState("");
  const [claiming, setClaiming] = useState(false);

  const eyebrow = agentLabel.toUpperCase();
  const inline = inlineLabel(agentLabel);

  const submitPasscode = async () => {
    if (!passcode.trim() || unlocking) return;
    setUnlocking(true);
    setGateErr("");
    try {
      const res = await fetch("/api/agent-invite/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        setUnlocked(true);
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setGateErr(data.error || "Incorrect password.");
    } catch {
      setGateErr("Something went wrong. Please try again.");
    } finally {
      setUnlocking(false);
    }
  };

  const submitClaim = async () => {
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setWelcomeErr("Please enter a valid email address.");
      return;
    }
    if (claiming) return;
    setClaiming(true);
    setWelcomeErr("");
    try {
      const res = await fetch(`/api/agent-invite/${encodeURIComponent(type)}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: trimmedEmail }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && data.url) {
        // Navigate to the sign-in link, which logs the visitor in and forwards to the standard
        // setup questionnaire for this agent.
        window.location.href = data.url;
        return;
      }
      setWelcomeErr(data.error || "Something went wrong. Please try again.");
      setClaiming(false);
    } catch {
      setWelcomeErr("Something went wrong. Please try again.");
      setClaiming(false);
    }
  };

  if (claiming) {
    return (
      <Shell>
        <Spinner label="Setting up your account and building your agent" />
      </Shell>
    );
  }

  if (!isUnlocked) {
    return (
      <Shell>
        <p style={eyebrowStyle}>{eyebrow}</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: TX, margin: "0 0 8px", lineHeight: 1.2 }}>
          Private access
        </h1>
        <p style={{ fontSize: 15, color: TXD, margin: "0 0 24px", lineHeight: 1.55 }}>
          This is a private link. Enter the access password you were given to begin.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitPasscode();
          }}
        >
          <label style={labelStyle} htmlFor="ai-passcode">
            Access password
          </label>
          <input
            id="ai-passcode"
            type="password"
            value={passcode}
            autoFocus
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter password"
            style={{ ...inputStyle, marginBottom: gateErr ? 8 : 20 }}
          />
          {gateErr && (
            <p style={{ fontSize: 13, color: R, margin: "0 0 16px", fontWeight: 600 }}>{gateErr}</p>
          )}
          <Button type="submit" disabled={unlocking || !passcode.trim()}>
            {unlocking ? "Checking..." : "Unlock →"}
          </Button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell>
      <p style={eyebrowStyle}>{eyebrow}</p>
      <h1 style={{ fontSize: 27, fontWeight: 900, color: TX, margin: "0 0 10px", lineHeight: 1.2 }}>
        {greetName ? `Welcome, ${greetName}.` : "Welcome."}
      </h1>
      <p style={{ fontSize: 15, color: TXD, margin: "0 0 24px", lineHeight: 1.6 }}>
        Let&apos;s build your customized {inline}. First, tell us where to set up your account. Next
        you&apos;ll answer a few questions, and your agent will be ready to use.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitClaim();
        }}
      >
        <label style={labelStyle} htmlFor="ai-name">
          Your name
        </label>
        <input
          id="ai-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          style={{ ...inputStyle, marginBottom: 18 }}
        />
        <label style={labelStyle} htmlFor="ai-email">
          Your email
        </label>
        <input
          id="ai-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ ...inputStyle, marginBottom: welcomeErr ? 8 : 22 }}
        />
        {welcomeErr && (
          <p style={{ fontSize: 13, color: R, margin: "0 0 16px", fontWeight: 600 }}>{welcomeErr}</p>
        )}
        <Button type="submit" disabled={claiming}>
          Start building &rarr;
        </Button>
        <p style={{ fontSize: 12, color: TXD, margin: "16px 0 0", lineHeight: 1.5, textAlign: "center" }}>
          We&apos;ll set up your account with this email and sign you in automatically. No payment
          required.
        </p>
      </form>
    </Shell>
  );
}
