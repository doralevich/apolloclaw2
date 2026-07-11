"use client";

import { useMemo, useState } from "react";
import { setupQuestionsFor, type SetupQuestion } from "@/config/onboarding";
import { apiFetch } from "@/lib/api";

// The post-purchase agent setup wizard (/onboard/[agent]). Deliberately built in the SAME
// design language as the sales questionnaire at app/onboard/page.tsx — same tokens, same
// field primitives, same shell — so paying customers get the exact experience the /onboard
// flow set the bar with. If you restyle one, restyle both.

// ── Design tokens (mirrors app/onboard/page.tsx) ────────────────────────────
const R = "#D72B2B";
const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const SRF2 = "#E8E7E3";
const BDR = "rgba(0,0,0,0.08)";
const TX = "#1A1A1A";
const TXM = "#555555";
const TXD = "#888888";

function ApolloWordmark({ size = 18, sublabel = "Agent Setup" }: { size?: number; sublabel?: string }) {
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

// ── Field primitives (mirrors app/onboard/page.tsx) ─────────────────────────
const iBase: React.CSSProperties = { width: "100%", background: SRF2, border: `1px solid ${BDR}`, borderRadius: 6, color: TX, fontSize: 14, fontFamily: "inherit", padding: "10px 14px", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s" };

function useF() {
  const [f, setF] = useState(false);
  return { onFocus: () => setF(true), onBlur: () => setF(false), focused: f };
}

function TInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { onFocus, onBlur, focused } = useF();
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={500} className="oc-ph" style={{ ...iBase, borderColor: focused ? R : BDR, boxShadow: focused ? `0 0 0 3px rgba(215,43,43,0.1)` : "none" }} onFocus={onFocus} onBlur={onBlur} />;
}

function TArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const { onFocus, onBlur, focused } = useF();
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} maxLength={2000} className="oc-ph" style={{ ...iBase, resize: "vertical", lineHeight: 1.6, borderColor: focused ? R : BDR, boxShadow: focused ? `0 0 0 3px rgba(215,43,43,0.1)` : "none" }} onFocus={onFocus} onBlur={onBlur} />;
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
      {options.map((opt) => {
        const on = value === opt;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "11px 14px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontFamily: "inherit", background: on ? "rgba(215,43,43,0.1)" : SRF2, border: `1px solid ${on ? "rgba(215,43,43,0.45)" : BDR}`, color: on ? TX : TXM, transition: "all 0.15s" }}>
            <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: `2px solid ${on ? R : "rgba(0,0,0,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {on && <span style={{ width: 7, height: 7, borderRadius: "50%", background: R }} />}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function CheckGroup({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginTop: 4 }}>
      {options.map((opt) => {
        const on = value.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)} style={{ display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left", padding: "10px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit", background: on ? "rgba(215,43,43,0.1)" : SRF2, border: `1px solid ${on ? "rgba(215,43,43,0.45)" : BDR}`, color: on ? TX : TXM, transition: "all 0.15s" }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 1, border: `1.5px solid ${on ? R : "rgba(0,0,0,0.2)"}`, background: on ? R : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {on && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </span>
            <span style={{ lineHeight: 1.45 }}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function FF({ label, required, hint, children }: { label?: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TXM, marginBottom: 7 }}>{label}{required && <span style={{ color: R, marginLeft: 4 }}>*</span>}</p>}
      {children}
      {hint && <p style={{ fontSize: 11, color: TXD, marginTop: 5, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function SHead({ stepNum, total, title, subtitle }: { stepNum: number; total: number; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R }}>Step {stepNum} of {total}</span>
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: TX, margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: TXM, lineHeight: 1.65, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

// ── The wizard ───────────────────────────────────────────────────────────────

type Answers = Record<string, string | string[]>;

function QuestionField({ q, value, onChange }: { q: SetupQuestion; value: string | string[] | undefined; onChange: (v: string | string[]) => void }) {
  const str = typeof value === "string" ? value : "";
  const arr = Array.isArray(value) ? value : [];
  return (
    <FF label={q.label} required={q.required}>
      {q.type === "text" && <TInput value={str} onChange={onChange} placeholder={q.placeholder} />}
      {q.type === "textarea" && <TArea value={str} onChange={onChange} placeholder={q.placeholder} />}
      {q.type === "select" && <RadioGroup options={q.options ?? []} value={str} onChange={onChange} />}
      {q.type === "multiselect" && <CheckGroup options={q.options ?? []} value={arr} onChange={onChange} />}
    </FF>
  );
}

export function AgentSetupForm({
  agentTypeId,
  agentLabel,
  workspaceId,
  justPaid,
}: {
  agentTypeId: string;
  agentLabel: string;
  workspaceId?: string;
  justPaid: boolean;
}) {
  const { core, module } = useMemo(() => setupQuestionsFor(agentTypeId), [agentTypeId]);
  const steps = useMemo(
    () => [
      { title: "Tell us about your business", subtitle: "Everything here goes straight to your agent — the more real detail, the more useful its first day.", questions: core },
      ...(module ? [{ title: module.title, subtitle: `The specifics that make your ${agentLabel} actually yours.`, questions: module.questions }] : []),
    ],
    [core, module, agentLabel]
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const setAnswer = (id: string, v: string | string[]) => setAnswers((a) => ({ ...a, [id]: v }));

  const missingIn = (questions: SetupQuestion[]) =>
    questions.filter((q) => {
      if (!q.required) return false;
      const v = answers[q.id];
      return !v || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.length === 0);
    });

  const isLast = step === steps.length - 1;

  const next = () => {
    const missing = missingIn(steps[step].questions);
    if (missing.length > 0) { setErr(`Please fill in: ${missing.map((q) => q.label).join(", ")}`); return; }
    setErr("");
    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => { setErr(""); setStep((s) => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submit = async () => {
    const missing = missingIn(steps[step].questions);
    if (missing.length > 0) { setErr(`Please fill in: ${missing.map((q) => q.label).join(", ")}`); return; }
    setErr("");
    setBusy(true);
    try {
      await apiFetch("/api/agent-setup", {
        method: "POST",
        body: JSON.stringify({ workspace_id: workspaceId, agent_type: agentTypeId, answers }),
      });
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't save — please try again");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${R}`, background: "rgba(215,43,43,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 0 24px" }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13.5L10 18.5L21 8" stroke={R} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: TX, margin: "0 0 12px", letterSpacing: "-0.025em" }}>Your {agentLabel} Knows the Plan</h2>
        <p style={{ fontSize: 15, color: TXM, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 28px" }}>
          We&apos;ve saved your setup and are writing it into your agent right now. It&apos;ll be in
          your dashboard, ready to work, within a couple of minutes.
        </p>
        <a href="/dashboard" style={{ display: "inline-block", background: R, color: "#fff", fontWeight: 800, fontSize: 15, padding: "15px 40px", borderRadius: 8, textDecoration: "none" }}>Go to My Dashboard →</a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <style>{`.oc-ph::placeholder{color:#6b7280!important}`}</style>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 60, borderBottom: `1px solid ${BDR}`, background: "rgba(250,250,247,0.97)", position: "sticky", top: 0, zIndex: 50 }}>
        <ApolloWordmark size={17} />
        <span style={{ fontSize: 12, color: TXM }}>{agentLabel} Setup</span>
      </nav>

      {justPaid && (
        <div style={{ background: `radial-gradient(ellipse 80% 50% at 50% -5%,rgba(215,43,43,0.14) 0%,transparent 70%),${SRF}`, borderBottom: `1px solid ${BDR}`, padding: "44px 32px 36px", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(26px,4.5vw,44px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px", color: TX }}>
            Payment Received. <span style={{ color: R }}>Your {agentLabel} is being built.</span>
          </h1>
          <p style={{ fontSize: 15, color: TXM, maxWidth: 540, margin: "0 auto" }}>
            It takes a couple of minutes to boot. While it does, tell it about your business —
            about 10 minutes, and it starts day one already knowing you.
          </p>
        </div>
      )}

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px 100px" }}>
        <div style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "36px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${R},transparent)`, opacity: 0.6 }} />
          <SHead stepNum={step + 1} total={steps.length} title={steps[step].title} subtitle={steps[step].subtitle} />
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {steps[step].questions.map((q) => (
              <QuestionField key={q.id} q={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
            ))}
          </div>
          {err && (
            <div style={{ marginTop: 20, padding: "10px 14px", borderRadius: 6, background: "rgba(215,43,43,0.1)", border: `1px solid rgba(215,43,43,0.3)`, fontSize: 13, color: "#dc2626" }}>{err}</div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
          {step > 0 ? (
            <button type="button" onClick={back} disabled={busy} style={{ background: "transparent", border: `1px solid ${BDR}`, color: TXM, fontFamily: "inherit", fontWeight: 600, fontSize: 13, padding: "10px 20px", borderRadius: 6, cursor: "pointer" }}>← Back</button>
          ) : (
            <div />
          )}
          {isLast ? (
            <button type="button" onClick={submit} disabled={busy} style={{ background: R, color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 14, padding: "10px 28px", borderRadius: 6, border: "none", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1 }}>
              {busy ? "Saving…" : "Finish Setup →"}
            </button>
          ) : (
            <button type="button" onClick={next} style={{ background: R, color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 14, padding: "10px 28px", borderRadius: 6, border: "none", cursor: "pointer" }}>Continue →</button>
          )}
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: TXD, marginTop: 16, lineHeight: 1.5 }}>
          Your information is confidential and goes only to your agent. You can update any of it later — just tell your agent.
        </p>
      </div>
    </div>
  );
}
