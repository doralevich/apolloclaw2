"use client";
import { useState } from "react";
import Link from "next/link";
const R = "#D72B2B";
const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const SRF2 = "#E8E7E3";
const BDR = "rgba(0,0,0,0.08)";
const TX = "#1A1A1A";
const TXM = "#555555";
const TXD = "#888888";
const iBase: React.CSSProperties = {
  width: "100%",
  background: SRF2,
  border: `1px solid ${BDR}`,
  borderRadius: 6,
  color: TX,
  fontSize: 14,
  fontFamily: "inherit",
  padding: "10px 14px",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box",
};
function useF() {
  const [f, setF] = useState(false);
  return { onFocus: () => setF(true), onBlur: () => setF(false), focused: f };
}
function TInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  const { onFocus, onBlur, focused } = useF();
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="oc-ph" style={{ ...iBase, borderColor: focused ? R : BDR, boxShadow: focused ? `0 0 0 3px rgba(232,52,42,0.1)` : "none" }} onFocus={onFocus} onBlur={onBlur} />;
}
function TArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const { onFocus, onBlur, focused } = useF();
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="oc-ph" style={{ ...iBase, resize: "vertical", lineHeight: 1.6, borderColor: focused ? R : BDR, boxShadow: focused ? `0 0 0 3px rgba(232,52,42,0.1)` : "none" }} onFocus={onFocus} onBlur={onBlur} />;
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
function Stack({ children }: { children: React.ReactNode }) { return <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>{children}</div>; }
function Row2({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`.oc-row2{display:grid;grid-template-columns:1fr 1fr;gap:16px}@media(max-width:600px){.oc-row2{grid-template-columns:1fr}}`}</style>
      <div className="oc-row2">{children}</div>
    </>
  );
}
function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: BDR }} />
      <div style={{ flex: 1, height: 1, background: BDR }} />
    </div>
  );
}
function RadioGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <FF label={label}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
        {options.map(opt => {
          const on = value === opt;
          return (
            <button key={opt} type="button" onClick={() => onChange(opt)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "11px 14px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontFamily: "inherit", background: on ? "rgba(232,52,42,0.1)" : SRF2, border: `1px solid ${on ? "rgba(232,52,42,0.45)" : BDR}`, color: on ? TX : TXM, transition: "all 0.15s" }}>
              <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: `2px solid ${on ? R : "rgba(0,0,0,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {on && <span style={{ width: 7, height: 7, borderRadius: "50%", background: R }} />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </FF>
  );
}
function CheckGroup({ label, hint, options, value, onChange, max }: { label: string; hint?: string; options: string[]; value: string[]; onChange: (v: string[]) => void; max?: number }) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) { onChange(value.filter(v => v !== opt)); return; }
    if (max && value.length >= max) return;
    onChange([...value, opt]);
  };
  return (
    <FF label={label} hint={hint}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
        {options.map(opt => {
          const on = value.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)} style={{ display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left", padding: "10px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit", background: on ? "rgba(232,52,42,0.1)" : SRF2, border: `1px solid ${on ? "rgba(232,52,42,0.45)" : BDR}`, color: on ? TX : TXM, transition: "all 0.15s" }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 1, border: `1.5px solid ${on ? R : "rgba(0,0,0,0.2)"}`, background: on ? R : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {on && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </span>
              <span style={{ lineHeight: 1.45 }}>{opt}</span>
            </button>
          );
        })}
      </div>
    </FF>
  );
}
const ROLE_OPTIONS = ["Founder / Owner", "Executive (CEO / COO / CMO / CIO)", "Department lead (Sales / Marketing / Ops / Finance)", "Solo operator / consultant / creator", "Other"];
const INDUSTRY_OPTIONS = ["Construction / Trades", "Real Estate", "Legal", "Accounting / Finance", "Health & Wellness", "E-commerce / Retail", "Professional Services", "SaaS / Software", "Marketing / Ad Agency", "Other"];
const TEAM_SIZE_OPTIONS = ["Just me", "2–10", "11–50", "51–200", "200+"];
const TIME_OPTIONS = ["Email and messaging", "Meetings and scheduling", "Reporting / pulling numbers", "Client / customer follow-up", "Internal coordination (assigning work, checking status)", "Admin (invoices, contracts, forms, docs)"];
const AI_HELP_OPTIONS = ["A digital executive assistant (email, calendar, prep)", "A sales / CRM assistant (leads, follow-ups, pipeline)", "An operations assistant (reporting, status, workflows)", "A support assistant (repetitive customer questions)", "Not sure yet; I want to see what's possible"];
export default function PreCall() {
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "", roleOther: "", industry: "", industryOther: "", teamSize: "", timeGoesTo: [] as string[], timeOther: "", aiHelp: "", cloneJob: "", anythingElse: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { setError("Please enter your name and email to continue."); return; }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: form.name, email: form.email, company: form.company,
        role: form.role === "Other" ? form.roleOther : form.role,
        industry: form.industry === "Other" ? form.industryOther : form.industry,
        teamSize: form.teamSize,
        timeGoesTo: [...form.timeGoesTo, ...(form.timeOther ? [`Other: ${form.timeOther}`] : [])],
        aiHelp: form.aiHelp, cloneJob: form.cloneJob, anythingElse: form.anythingElse,
      };
      const res = await fetch("/api/submit-precall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or email david@apolloclaw.ai");
    } finally {
      setSubmitting(false);
    }
  };
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${R}`, background: "rgba(232,52,42,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 0 24px" }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13.5L10 18.5L21 8" stroke={R} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: TX, margin: "0 0 12px", letterSpacing: "-0.025em" }}>We&apos;ve got it.</h2>
        <p style={{ fontSize: 15, color: TXM, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 16px" }}>David will review your answers before the call so you can get right into it.</p>
        <p style={{ fontSize: 15, color: TXM, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 36px" }}>If anything comes up before then, reach him at <a href="mailto:david@apolloclaw.ai" style={{ color: R, textDecoration: "none", fontWeight: 600 }}>david@apolloclaw.ai</a>.</p>
        <a href="https://apolloclaw.ai" style={{ display: "inline-block", background: R, color: "#fff", fontWeight: 800, fontSize: 15, padding: "15px 40px", borderRadius: 8, textDecoration: "none" }}>Return to Apollo[Claw] →</a>
      </div>
    );
  }
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <style>{`.oc-ph::placeholder{color:#4b5563!important}`}</style>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: 64, borderBottom: `1px solid ${BDR}`, background: "rgba(17,18,20,0.97)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Apollo</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: R }}>[</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Claw</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: R }}>]</span>
        </div>
        <a href="https://apolloclaw.ai" style={{ background: R, color: "#fff", fontWeight: 700, fontSize: 13, padding: "8px 20px", borderRadius: 6, textDecoration: "none" }}>apolloclaw.ai</a>
      </nav>
      {/* Hero */}
      <div style={{ background: `radial-gradient(ellipse 80% 50% at 50% -5%,rgba(232,52,42,0.14) 0%,transparent 70%),${SRF}`, borderBottom: `1px solid ${BDR}`, padding: "48px 32px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 12px", color: TX }}>
          Pre-Call <span style={{ color: R }}>Questionnaire</span>
        </h1>
        <p style={{ fontSize: 15, color: TXM, lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>Help us come prepared to your call. 2–3 minutes, nothing invasive.</p>
      </div>
      {/* Form */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px 100px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "36px 40px" }}>
            <Stack>
              {/* Basic Info */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R }}>1: Basic Info</span>
                </div>
                <Stack>
                  <Row2>
                    <FF label="Name" required><TInput value={form.name} onChange={v => set("name", v)} placeholder="Jane Smith" /></FF>
                    <FF label="Email" required><TInput type="email" value={form.email} onChange={v => set("email", v)} placeholder="jane@company.com" /></FF>
                  </Row2>
                  <Row2>
                    <FF label="Company"><TInput value={form.company} onChange={v => set("company", v)} placeholder="Acme Inc." /></FF>
                  </Row2>
                </Stack>
              </div>
              <Divider />
              {/* Role */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R, marginBottom: 16 }}>2: Your Role</p>
                <RadioGroup label="What best describes your role?" options={ROLE_OPTIONS} value={form.role} onChange={v => set("role", v)} />
                {form.role === "Other" && <div style={{ marginTop: 8 }}><TInput value={form.roleOther} onChange={v => set("roleOther", v)} placeholder="Describe your role…" /></div>}
              </div>
              <Divider />
              {/* Industry */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R, marginBottom: 16 }}>3: Your Industry</p>
                <RadioGroup label="Which best fits your business?" options={INDUSTRY_OPTIONS} value={form.industry} onChange={v => set("industry", v)} />
                {form.industry === "Other" && <div style={{ marginTop: 8 }}><TInput value={form.industryOther} onChange={v => set("industryOther", v)} placeholder="Describe your industry…" /></div>}
              </div>
              <Divider />
              {/* Team size */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R, marginBottom: 16 }}>4: Team Size</p>
                <RadioGroup label="Roughly how many people are on your team?" options={TEAM_SIZE_OPTIONS} value={form.teamSize} onChange={v => set("teamSize", v)} />
              </div>
              <Divider />
              {/* Time */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R, marginBottom: 16 }}>5: Where Your Time Actually Goes</p>
                <CheckGroup label="Where does most of your time go today?" hint="Pick up to 3" options={TIME_OPTIONS} value={form.timeGoesTo} onChange={v => set("timeGoesTo", v)} max={3} />
                <div style={{ marginTop: 12 }}>
                  <TInput value={form.timeOther} onChange={v => set("timeOther", v)} placeholder="Other (optional)" />
                </div>
              </div>
              <Divider />
              {/* AI help */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R, marginBottom: 16 }}>6: What You&apos;re Hoping AI Can Help With</p>
                <RadioGroup label="Which sounds closest to what you want from AI right now?" options={AI_HELP_OPTIONS} value={form.aiHelp} onChange={v => set("aiHelp", v)} />
              </div>
              <Divider />
              {/* Clone */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R, marginBottom: 16 }}>7: If You Could Clone One Part of Your Job…</p>
                <FF label="What would you hand to an AI assistant?">
                  <TArea value={form.cloneJob} onChange={v => set("cloneJob", v)} placeholder="Tell us what you'd clone…" rows={4} />
                </FF>
              </div>
              <Divider />
              {/* Anything else */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R, marginBottom: 16 }}>8: Anything We Should Know Before We Talk?</p>
                <FF label="Constraints, goals, or context you want us to keep in mind">
                  <TArea value={form.anythingElse} onChange={v => set("anythingElse", v)} placeholder="Timeline, budget, concerns, dreams…" rows={4} />
                </FF>
              </div>
            </Stack>
            {error && <div style={{ marginTop: 20, padding: "10px 14px", borderRadius: 6, background: "rgba(232,52,42,0.1)", border: `1px solid rgba(232,52,42,0.3)`, fontSize: 13, color: "#fca5a5" }}>{error}</div>}
          </div>
          <div style={{ marginTop: 20 }}>
            <button type="submit" disabled={submitting}
              style={{ width: "100%", background: submitting ? SRF2 : R, color: submitting ? TXD : "#fff", fontFamily: "inherit", fontWeight: 800, fontSize: 15, padding: "14px", borderRadius: 6, border: "none", cursor: submitting ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
              {submitting ? "Submitting…" : "Submit Questionnaire →"}
            </button>
          </div>
        </form>
        <p style={{ fontSize: 13, color: TXD, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
          Or{" "}
          <Link href="/onboard" style={{ color: R, textDecoration: "none", fontWeight: 600 }}>schedule a consultation directly</Link>
        </p>
      </div>
      <div style={{ borderTop: `1px solid ${BDR}`, padding: "16px 32px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: TXD }}>© {new Date().getFullYear()} Apollo[Claw]</span>
        <span style={{ fontSize: 12, color: TXD }}>david@apolloclaw.ai</span>
      </div>
    </div>
  );
}
