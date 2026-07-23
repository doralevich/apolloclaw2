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

export function BuildScreen({ agentTypeId, agentLabel, workspaceId }: { agentTypeId: string; agentLabel: string; workspaceId?: string }) {
  // created: the agent row exists; running: the instance reports running.
  const [phase, setPhase] = useState<"provisioning" | "starting" | "ready" | "slow">(workspaceId ? "provisioning" : "slow");
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    const started = Date.now();
    // Read through a function: the ref mutates between polls, so inline comparisons
    // would get (wrongly) narrowed by TS control-flow analysis.
    const isReady = () => phaseRef.current === "ready";

    const tick = async () => {
      if (cancelled || isReady()) return;
      try {
        const { agents } = await apiFetch<{ agents: MergedAgent[] }>(`/api/agents?workspace=${encodeURIComponent(workspaceId)}`);
        const mine = agents.find((a) => a.agent_type === agentTypeId);
        if (mine) {
          if (mine.live_status === "running") {
            setPhase("ready");
            setTimeout(() => { if (!cancelled) window.location.assign("/dashboard"); }, 1800);
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
  }, [workspaceId, agentTypeId]);

  const provisioned = phase === "starting" || phase === "ready";
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <style>{`.ac-spin{animation:acspin 0.9s linear infinite}@keyframes acspin{to{transform:rotate(360deg)}}`}</style>
      <ApolloWordmark size={17} sublabel="Agent Build" />
      <div style={{ width: "100%", maxWidth: 480, marginTop: 28, background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "32px 36px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${R},transparent)`, opacity: 0.6 }} />
        <h2 style={{ fontSize: 24, fontWeight: 900, color: TX, margin: "0 0 6px", letterSpacing: "-0.02em" }}>Building Your {agentLabel}</h2>
        <p style={{ fontSize: 13, color: TXM, margin: "0 0 18px", lineHeight: 1.6 }}>This usually takes a minute or two. You&apos;ll be taken to your dashboard the moment it&apos;s ready.</p>
        <div style={{ borderTop: `1px solid ${BDR}` }}>
          <StepRow state="done" label="Business profile saved" />
          <StepRow state={provisioned ? "done" : "active"} label={`Provisioning your ${agentLabel}`} />
          <StepRow state={phase === "ready" ? "done" : phase === "starting" ? "active" : "pending"} label="Starting it up" />
          <StepRow state={phase === "ready" ? "active" : "pending"} label="Entering your dashboard" />
        </div>
        {phase === "slow" && (
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 6, background: "rgba(215,43,43,0.06)", border: `1px solid rgba(215,43,43,0.2)`, fontSize: 13, color: TXM, lineHeight: 1.6 }}>
            Your agent is still being built in the background — it will appear in your dashboard
            automatically once it&apos;s ready.
          </div>
        )}
        <a href="/dashboard" style={{ display: "block", textAlign: "center", marginTop: 20, background: phase === "slow" ? R : "transparent", color: phase === "slow" ? "#fff" : TXM, border: phase === "slow" ? "none" : `1px solid ${BDR}`, fontWeight: 700, fontSize: 14, padding: "11px 28px", borderRadius: 6, textDecoration: "none" }}>
          Go to My Dashboard →
        </a>
      </div>
    </div>
  );
}
