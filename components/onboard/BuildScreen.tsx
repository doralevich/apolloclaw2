"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { MergedAgent } from "@/lib/types";

// Post-submit screen for the paid onboarding flow: polls the workspace's agent list
// until the webhook-provisioned agent exists and is running, walking a checklist
// (profile saved -> building -> starting up), then enters the dashboard automatically.
// If anything is slow, a manual dashboard link appears.

const R = "#D72B2B";
const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const BDR = "rgba(0,0,0,0.08)";
const TX = "#1A1A1A";
const TXM = "#555555";
const TXD = "#888888";

function ApolloWordmark({ size = 18, sublabel = "Agent Build" }: { size?: number; sublabel?: string }) {
  const subtitleSize = Math.max(8, Math.round(size * 0.44));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: 800, fontSize: size, color: TX }}>Apollo</span>
        <span style={{ fontWeight: 800, fontSize: size, color: R }}>[</span>
        <span style={{ fontWeight: 800, fontSize: size, color: TX }}>Claw</span>
        <span style={{ fontWeight: 800, fontSize: size, color: R }}>]</span>
      </div>
      <div style={{ fontSize: subtitleSize, fontWeight: 600, letterSpacing: "0.25em", color: TXD, textTransform: "uppercase", marginTop: 1 }}>{sublabel}</div>
    </div>
  );
}

function StepRow({ state, label }: { state: "done" | "active" | "pending"; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", opacity: state === "pending" ? 0.45 : 1 }}>
      <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${state === "pending" ? "rgba(0,0,0,0.15)" : R}`, background: state === "done" ? "rgba(215,43,43,0.1)" : "transparent" }}>
        {state === "done" && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L4.5 9L10 3" stroke={R} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        {state === "active" && <span className="ac-spin" style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid rgba(215,43,43,0.25)`, borderTopColor: R }} />}
      </span>
      <span style={{ fontSize: 15, fontWeight: state === "active" ? 700 : 500, color: state === "pending" ? TXM : TX }}>{label}</span>
    </div>
  );
}

// Two ways in, because the two flows authorize differently:
//
//   workspaceId — the per-agent flow. A logged-in member polls /api/agents.
//   sessionId   — the license flow. The buyer has an account but has never signed in, so
//                 there is no session to poll with; the paid Stripe checkout session
//                 authorizes /api/onboard/status instead. They have no password either, so
//                 the closing screen asks them to choose one (/api/onboard/set-password),
//                 signs them in with it, and walks them into the dashboard like anyone else.
export function BuildScreen({ agentTypeId, agentLabel, workspaceId, sessionId }: { agentTypeId: string; agentLabel: string; workspaceId?: string; sessionId?: string }) {
  const viaSession = !!sessionId && !workspaceId;
  // created: the agent row exists; running: the instance reports running.
  const [phase, setPhase] = useState<"provisioning" | "starting" | "ready" | "slow">(workspaceId || sessionId ? "provisioning" : "slow");
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (!workspaceId && !sessionId) return;
    let cancelled = false;
    const started = Date.now();
    // Read through a function: the ref mutates between polls, so inline comparisons
    // would get (wrongly) narrowed by TS control-flow analysis.
    const isReady = () => phaseRef.current === "ready";

    // Both endpoints answer the same two questions — does the agent exist, is it running —
    // and differ only in what authorizes the read.
    const poll = async (): Promise<{ created: boolean; running: boolean }> => {
      if (workspaceId) {
        const { agents } = await apiFetch<{ agents: MergedAgent[] }>(`/api/agents?workspace=${encodeURIComponent(workspaceId)}`);
        const mine = agents.find((a) => a.agent_type === agentTypeId);
        return { created: !!mine, running: mine?.live_status === "running" };
      }
      const res = await fetch(`/api/onboard/status?id=${encodeURIComponent(sessionId!)}`);
      if (!res.ok) throw new Error("status unavailable");
      return (await res.json()) as { created: boolean; running: boolean };
    };

    const tick = async () => {
      if (cancelled || isReady()) return;
      try {
        const { created, running } = await poll();
        if (created) {
          if (running) {
            setPhase("ready");
            // Only the logged-in flow can be walked into the dashboard. A license buyer has
            // no session yet, so they stay here and read the closing instructions.
            if (!viaSession) {
              setTimeout(() => { if (!cancelled) window.location.assign("/dashboard/start-here"); }, 1800);
            }
            return;
          }
          setPhase("starting");
        }
      } catch {
        // transient — keep polling
      }
      // After 4 minutes stop implying live progress and hand over a manual link.
      if (Date.now() - started > 240_000 && !isReady()) setPhase("slow");
      if (!cancelled) setTimeout(tick, 5000);
    };
    void tick();
    return () => { cancelled = true; };
  }, [workspaceId, sessionId, agentTypeId, viaSession]);

  // The closing step for a license buyer: choose the password their account has never had,
  // then straight into the dashboard. Only the "already_set" case sends them to /login, and
  // only because at that point /login is genuinely the right door.
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [useLogin, setUseLogin] = useState(false);

  const submitPassword = async () => {
    if (pw.length < 8) { setPwErr("Please choose a password of at least 8 characters."); return; }
    if (pw !== pw2) { setPwErr("Those two passwords do not match."); return; }
    setPwErr("");
    setSavingPw(true);
    try {
      const res = await fetch("/api/onboard/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, password: pw }),
      });
      const body = (await res.json()) as { ok?: boolean; email?: string; error?: { code?: string; message?: string } };
      if (!res.ok || !body.email) {
        // The account already has a working password (a replayed id, a second tab, or the
        // emailed link used first). Nothing to set — point at the door that opens.
        if (body.error?.code === "already_set") setUseLogin(true);
        setPwErr(body.error?.message || "Could not set your password. Please try again.");
        return;
      }
      // Sign in here rather than server-side: the browser client owns the auth cookies, and
      // signing in through it is what makes the dashboard load already logged in.
      const { error } = await createClient().auth.signInWithPassword({ email: body.email, password: pw });
      // The password IS set at this point, so a sign-in hiccup is not a failure of the thing
      // they just did — /login will now accept exactly what they typed.
      window.location.assign(error ? "/login" : "/dashboard/start-here");
    } catch {
      setPwErr("Could not set your password. Please try again.");
    } finally {
      setSavingPw(false);
    }
  };

  const provisioned = phase === "starting" || phase === "ready";
  // Deliberately NOT gated on the build being finished. Setting a password does not depend on
  // the agent being up — the account already exists, because /api/onboard/complete resolved it
  // before any of this rendered. Gating it on "ready" meant a build that stalled, or merely ran
  // past the four-minute mark, put the buyer back where this whole screen started: a "Go to Log
  // In" button they had no password for. It also makes them wait for no reason; they can set it
  // while the build finishes and go watch it from their own dashboard.
  const askForPassword = viaSession;
  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#E8E7E3", border: `1px solid ${BDR}`, borderRadius: 6,
    color: TX, fontSize: 14, fontFamily: "inherit", padding: "10px 14px", outline: "none", boxSizing: "border-box",
  };
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <style>{`.ac-spin{animation:acspin 0.9s linear infinite}@keyframes acspin{to{transform:rotate(360deg)}}`}</style>
      <ApolloWordmark size={17} sublabel="Agent Build" />
      <div style={{ width: "100%", maxWidth: 480, marginTop: 28, background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "32px 36px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${R},transparent)`, opacity: 0.6 }} />
        <h2 style={{ fontSize: 24, fontWeight: 900, color: TX, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Building Your {agentLabel}</h2>
        <p style={{ fontSize: 13, color: TXM, margin: "0 0 18px", lineHeight: 1.6 }}>
          {viaSession
            ? "This usually takes a minute or two. Your answers are already in — we're building your agent around them now."
            : "This usually takes a minute or two. You'll be taken to your dashboard the moment it's ready."}
        </p>
        <div style={{ borderTop: `1px solid ${BDR}` }}>
          <StepRow state="done" label="Business profile saved" />
          <StepRow state={provisioned ? "done" : "active"} label={`Provisioning your ${agentLabel}`} />
          <StepRow state={phase === "ready" ? "done" : phase === "starting" ? "active" : "pending"} label="Starting it up" />
          {viaSession ? (
            <StepRow state={phase === "ready" ? "done" : "pending"} label="Writing your business profile in" />
          ) : (
            <StepRow state={phase === "ready" ? "active" : "pending"} label="Entering your dashboard" />
          )}
        </div>
        {askForPassword && !useLogin && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BDR}` }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: TX, margin: "0 0 4px" }}>
              {phase === "ready" ? "Your agent is live." : "Set up your login."}
            </p>
            <p style={{ fontSize: 13, color: TXM, margin: "0 0 14px", lineHeight: 1.6 }}>
              {phase === "ready"
                ? "Choose a password and we'll take you straight in. You'll use it with the email address you paid with."
                : "Choose a password while this finishes. You'll use it with the email address you paid with, and your agent will appear in your dashboard as soon as it's ready."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="password" value={pw} onChange={e => setPw(e.target.value)}
                placeholder="New password (8+ characters)" autoComplete="new-password" style={inputStyle}
              />
              <input
                type="password" value={pw2} onChange={e => setPw2(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !savingPw) void submitPassword(); }}
                placeholder="Confirm password" autoComplete="new-password" style={inputStyle}
              />
            </div>
            {pwErr && (
              <p style={{ marginTop: 10, fontSize: 13, color: "#dc2626", lineHeight: 1.5 }}>{pwErr}</p>
            )}
          </div>
        )}
        {askForPassword && useLogin && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 6, background: "rgba(215,43,43,0.06)", border: `1px solid rgba(215,43,43,0.2)`, fontSize: 13, color: TXM, lineHeight: 1.6 }}>
            This account already has a password. Log in with it — or use &ldquo;Forgot
            password?&rdquo; if you need a new one. Your agent
            {phase === "ready" ? " is live and waiting." : " will be waiting once it finishes building."}
          </div>
        )}
        {phase === "slow" && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 6, background: "rgba(215,43,43,0.06)", border: `1px solid rgba(215,43,43,0.2)`, fontSize: 13, color: TXM, lineHeight: 1.6 }}>
            Your agent is still being built in the background; it will appear in your dashboard
            automatically once it&apos;s ready.
          </div>
        )}
        {/* The license buyer's way in is the password they are typing above, not a link — a
            plain "go to my dashboard" would bounce them to a login they cannot pass. Every
            other case still has somewhere useful to point. */}
        {askForPassword && !useLogin ? (
          <button
            type="button" onClick={() => void submitPassword()} disabled={savingPw}
            style={{ display: "block", width: "100%", textAlign: "center", marginTop: 20, background: R, color: "#fff", border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 6, cursor: savingPw ? "default" : "pointer", opacity: savingPw ? 0.7 : 1 }}
          >
            {savingPw ? "Setting up…" : "Set Password & Continue →"}
          </button>
        ) : (
          <a href={viaSession ? "/login" : "/dashboard/start-here"} style={{ display: "block", textAlign: "center", marginTop: 20, background: phase === "slow" || useLogin ? R : "transparent", color: phase === "slow" || useLogin ? "#fff" : TXM, border: phase === "slow" || useLogin ? "none" : `1px solid ${BDR}`, fontWeight: 700, fontSize: 14, padding: "11px 28px", borderRadius: 6, textDecoration: "none" }}>
            {viaSession ? "Go to Log In →" : "Go to My Dashboard →"}
          </a>
        )}
      </div>
    </div>
  );
}
