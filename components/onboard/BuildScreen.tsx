"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
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
//                 authorizes /api/onboard/status instead. They also cannot be dropped into
//                 the dashboard at the end, because they still have no password — the
//                 closing screen points them at the email that lets them set one.
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

  const provisioned = phase === "starting" || phase === "ready";
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
        {viaSession && phase === "ready" && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 6, background: "rgba(215,43,43,0.06)", border: `1px solid rgba(215,43,43,0.2)`, fontSize: 13, color: TXM, lineHeight: 1.6 }}>
            Your agent is live. Check your email for the link to set your password — that is
            what gets you into your dashboard for the first time.
          </div>
        )}
        {phase === "slow" && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 6, background: "rgba(215,43,43,0.06)", border: `1px solid rgba(215,43,43,0.2)`, fontSize: 13, color: TXM, lineHeight: 1.6 }}>
            Your agent is still being built in the background; it will appear in your dashboard
            automatically once it&apos;s ready.
          </div>
        )}
        {/* A license buyer has no password yet, so "go to my dashboard" would bounce them to
            a login they cannot pass. Point at the email that lets them set one instead. */}
        <a href={viaSession ? "/login" : "/dashboard/start-here"} style={{ display: "block", textAlign: "center", marginTop: 20, background: phase === "slow" || (viaSession && phase === "ready") ? R : "transparent", color: phase === "slow" || (viaSession && phase === "ready") ? "#fff" : TXM, border: phase === "slow" || (viaSession && phase === "ready") ? "none" : `1px solid ${BDR}`, fontWeight: 700, fontSize: 14, padding: "11px 28px", borderRadius: 6, textDecoration: "none" }}>
          {viaSession ? "Go to Log In →" : "Go to My Dashboard →"}
        </a>
      </div>
    </div>
  );
}
