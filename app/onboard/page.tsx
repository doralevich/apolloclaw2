"use client";
import { useState } from "react";
import CompanyRepeater, { emptyCompany, emptyPortfolio, type Company, type PortfolioMeta } from "@/components/onboard/CompanyRepeater";
import { getIndustryBranch, type IndustryBranch } from "@/lib/industryConfig";
// ════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ════════════════════════════════════════════════════════════
const R = "#D72B2B";
const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const SRF2 = "#E8E7E3";
const BDR = "rgba(0,0,0,0.08)";
const TX = "#000000";
const TXM = "#1A1A1A";
const TXD = "#4A4A4A";
function ApolloWordmark({ size = 18, sublabel = "AI Consulting" }: { size?: number; sublabel?: string }) {
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
// ════════════════════════════════════════════════════════════
// OPTION LISTS
// ════════════════════════════════════════════════════════════
const BIZ_SIZES    = ["Just me (Solo)","2-5 people","6-10 people","11-25 people","26-50 people","51-100 people","100+ people"];
const REVENUE      = ["Pre-revenue","Under $5k/mo","$5k-$10k/mo","$10k-$25k/mo","$25k-$50k/mo","$50k-$100k/mo","$100k-$250k/mo","$250k-$500k/mo","$500k+/mo","Prefer not to say"];
const BIZ_AGE      = ["Less than 6 months","6-12 months","1-2 years","2-5 years","5-10 years","10+ years"];
const BIZ_MODEL    = ["Service-based (sell time/expertise)","Physical product","SaaS / Digital product","Marketplace / Platform","Subscription / Membership","Hybrid (products + services)","Agency / Reseller","Franchise / Licensed model"];
const STACK_CRM    = ["Salesforce","HubSpot","Pipedrive","Zoho CRM","Keap","Close","No CRM currently","Other"];
const STACK_COMMS  = ["Google Workspace","Office 365","Slack","Zoom","Google Meet","Telegram","Otter","Fathom","Fireflies","Other"];
const STACK_PM     = ["Notion","Asana","ClickUp","Trello","Monday.com","Jira / Linear","No PM tool","Other"];
const STACK_BILLING= ["QuickBooks Online","QuickBooks Desktop","Xero","FreshBooks","NetSuite","Bill.com","Ramp / Brex","Stripe","Square","PayPal","None","Other"];
const IT_COMPLY    = ["HIPAA (healthcare)","PCI-DSS (payments)","GDPR (EU data)","CCPA (California)","SOC 2","None / Not applicable","Not sure","Multiple"];
const BROKEN_AREAS = ["Sales / Lead Generation","Customer Support / Service","Operations / Admin","Marketing & Content","Invoicing & Finance","Scheduling & Calendar","Hiring & HR","Reporting & Analytics","Order Fulfillment / Shipping","Email & Inbox","Team Communication","Vendor / Supplier Management","Project Management","Customer Onboarding","Contracts & Proposals"];
const HOURS_WASTED = ["Less than 5 hrs/wk","5-10 hrs/wk","10-20 hrs/wk","20-30 hrs/wk","30-40 hrs/wk","40+ hrs/wk (a full-time job)","Not sure - it's everywhere"];
const COST_IMPACT  = ["Minor inconvenience","Moderate - costing real money","Significant - blocking growth","Critical - threatening the business","Unknown - hard to quantify"];
const MARITAL      = ["Single","In a relationship","Engaged","Married","Domestic partnership","Divorced / Separated","Widowed","Prefer not to say"];
const LIFE_STAGE   = ["Building - early, grinding hard","Scaling - growing fast, feeling stretched","Optimizing - established, refining","Exiting - preparing to sell or step back","Pivoting - changing direction","Surviving - navigating a hard period"];
const TIMELINE_3YR = ["Sell or exit the business","Build it to run without me","Double or triple revenue","Buy back my time","Expand into new markets","Launch new products / services","Build a team and step out of daily ops","Retire or semi-retire"];
const DECISION_STYLE = ["Data-first - I need numbers before I commit","Gut-first - I move on instinct, validate later","Consensus - I loop in my team / advisors first","Vision-first - I decide based on my 3-year picture","Risk-averse - I need proof it works elsewhere first","Opportunity-driven - big upside = fast move","Other"];
const WRITING_TONE = ["Professional & formal","Conversational & warm","Direct & punchy","Educational & detailed","Bold & provocative","Humble & approachable","Witty & clever","Empathetic & supportive"];
const BRAND_LIKE   = ["Alex Hormozi - direct, value-packed, no fluff","Gary Vaynerchuk - raw, authentic","Simon Sinek - thoughtful, purpose-driven","Seth Godin - pithy, surprising","Donald Miller - clear, customer-focused","Marie Forleo - energetic, empowering","Oprah Winfrey - empathetic, inspirational","Tim Ferriss - tactical, optimizing","Other"];
const AI_GOALS     = ["Inbox & email management","Lead qualification & follow-up","Customer support / chat","Appointment scheduling","Proposals & quotes","Content & social media","Research & competitive intel","CRM data entry & updates","Invoicing & billing","Internal workflow automation","Other"];
const SUCCESS_MET  = ["Save time - get hours back every week","Increase revenue - close more, faster","Reduce headcount or overhead costs","Scale without hiring more people","Improve customer experience & response speed","Improve consistency across my team","Reduce errors and manual mistakes","All of the above"];
const TEAM_SENT    = ["Very excited - they've been asking for this","Mostly positive - open to change","Neutral - they'll adapt when it's here","Skeptical - they worry about job security","Resistant - there will be pushback","Just me - no team involved"];
const INTERNAL_TECH= ["Yes - we have internal IT or a developer","We have a tech-savvy person who can help","We prefer Apollo[Claw] to manage everything after launch","We'll figure it out as we go","Not sure yet"];
// ════════════════════════════════════════════════════════════
// PRIMITIVES
// ════════════════════════════════════════════════════════════
const iBase: React.CSSProperties = { width: "100%", background: SRF2, border: `1px solid ${BDR}`, borderRadius: 6, color: TX, fontSize: 14, fontFamily: "inherit", padding: "10px 14px", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s" };
function useF() {
  const [f, setF] = useState(false);
  return { onFocus: () => setF(true), onBlur: () => setF(false), focused: f };
}
function TInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  const { onFocus, onBlur, focused } = useF();
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="oc-ph" style={{ ...iBase, borderColor: focused ? R : BDR, boxShadow: focused ? `0 0 0 3px rgba(215,43,43,0.1)` : "none" }} onFocus={onFocus} onBlur={onBlur} />;
}
function TArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const { onFocus, onBlur, focused } = useF();
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="oc-ph" style={{ ...iBase, resize: "vertical", lineHeight: 1.6, borderColor: focused ? R : BDR, boxShadow: focused ? `0 0 0 3px rgba(215,43,43,0.1)` : "none" }} onFocus={onFocus} onBlur={onBlur} />;
}
function TSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const { onFocus, onBlur, focused } = useF();
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...iBase, appearance: "none", cursor: "pointer", paddingRight: 36, borderColor: focused ? R : BDR, boxShadow: focused ? `0 0 0 3px rgba(215,43,43,0.1)` : "none" }} onFocus={onFocus} onBlur={onBlur}>
        <option value="">Select one…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 4l4 4 4-4" stroke={R} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
function CheckGroup({ label, hint, options, value = [], onChange, cols = 2, split = false }: { label?: string; hint?: string; options: string[]; value: string[]; onChange: (v: string[]) => void; cols?: number; split?: boolean }) {
  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  return (
    <FF label={label} hint={hint}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${cols >= 3 ? 150 : 220}px), 1fr))`, gap: 8, marginTop: 4 }}>
        {options.map(opt => {
          const on = value.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)} style={{ display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left", padding: "10px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit", background: on ? "rgba(215,43,43,0.1)" : SRF2, border: `1px solid ${on ? "rgba(215,43,43,0.45)" : BDR}`, color: on ? TX : TXM, transition: "all 0.15s" }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 1, border: `1.5px solid ${on ? R : "rgba(0,0,0,0.2)"}`, background: on ? R : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {on && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </span>
              <span style={{ lineHeight: 1.4 }}>{split && opt.includes(" - ") ? (<><span style={{ fontWeight: 700 }}>{opt.slice(0, opt.indexOf(" - "))}</span><br /><span style={{ fontSize: 11.5, color: TXD }}>{opt.slice(opt.indexOf(" - ") + 3)}</span></>) : opt}</span>
            </button>
          );
        })}
      </div>
    </FF>
  );
}
function RadioGroup({ label, hint, options, value, onChange }: { label?: string; hint?: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <FF label={label} hint={hint}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
        {options.map(opt => {
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
    </FF>
  );
}
function ScaleRow({ label, hint, low, high, value, onChange }: { label?: string; hint?: string; low: string; high: string; value: number | null; onChange: (v: number) => void }) {
  return (
    <FF label={label} hint={hint}>
      <div style={{ marginTop: 6 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
            const on = value === n;
            return <button key={n} type="button" onClick={() => onChange(n)} style={{ flex: 1, padding: "8px 0", borderRadius: 5, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s", background: on ? R : SRF2, border: `1px solid ${on ? R : BDR}`, color: on ? "#fff" : TXD }}>{n}</button>;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: 11, color: TXD }}>{low}</span>
          <span style={{ fontSize: 11, color: TXD }}>{high}</span>
        </div>
      </div>
    </FF>
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
function Divider({ label }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: BDR }} />
      {label && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: TXD, whiteSpace: "nowrap" }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: BDR }} />
    </div>
  );
}
// Auto-fit so paired fields sit side-by-side on desktop but stack to one column on
// narrow (mobile) screens instead of squishing and truncating.
function Row2({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>{children}</div>; }
function Stack({ children }: { children: React.ReactNode }) { return <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>{children}</div>; }
function SHead({ stepNum, total, title, subtitle, badge }: { stepNum: number; total: number; title: string; subtitle?: string; badge?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {badge && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(215,43,43,0.15)", color: R, border: `1px solid rgba(215,43,43,0.3)`, letterSpacing: "0.08em", textTransform: "uppercase" }}>{badge}</span>
        </div>
      )}
      <h2 style={{ fontSize: 26, fontWeight: 900, color: TX, margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: TXM, lineHeight: 1.65, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// GATEKEEPER
// ════════════════════════════════════════════════════════════
interface GateData { first: string; last: string; email: string; personalEmail: string; phone: string; heard: string[]; tz: string; title: string; linkedin: string; company: string; referralSource: string; referralName: string }
const REFERRAL_SOURCE = ["Referral from someone I know","LinkedIn","Search","Podcast / newsletter","Event or conference","Other"];
function Gatekeeper({ onPass }: { onPass: (d: GateData) => void }) {
  const [d, setD] = useState<GateData>({ first: "", last: "", email: "", personalEmail: "", phone: "", heard: [], tz: "", title: "", linkedin: "", company: "", referralSource: "", referralName: "" });

  const [err, setErr] = useState("");
  const set = (k: keyof GateData, v: string | string[]) => setD(p => ({ ...p, [k]: v }));
  const submit = () => {
    if (!d.first.trim() || !d.last.trim() || !d.email.trim() || !d.phone.trim()) { setErr("Please fill in all required fields to continue."); return; }
    if (!/\S+@\S+\.\S+/.test(d.email)) { setErr("Please enter a valid email address."); return; }
    if (!d.referralSource) { setErr("Please let us know how you heard about us."); return; }
    setErr(""); onPass(d);
  };
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <div style={{ background: `radial-gradient(ellipse 80% 50% at 50% -5%,rgba(215,43,43,0.14) 0%,transparent 70%),${SRF}`, borderBottom: `1px solid ${BDR}`, padding: "48px 32px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 16px", color: TX }}>
          Let's Build Something <span style={{ color: R }}>Amazing!</span>
        </h1>
        <p style={{ fontSize: 15, color: TXM, maxWidth: 520, margin: "0 auto" }}>Before we build your AI assistant, we need to understand your business. Takes about 15 minutes. The more detail, the better the result.</p>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 700, background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "clamp(24px, 5vw, 36px) clamp(18px, 5vw, 40px)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${R},transparent)`, opacity: 0.6 }} />
          <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${BDR}` }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: TX, margin: "0 0 4px" }}>Start here</p>
            <p style={{ fontSize: 13, color: TXD, margin: 0 }}>Tell us about yourself so we can personalize your experience.</p>
          </div>
          <Stack>
            <Row2>
              <FF label="First Name"><TInput value={d.first} onChange={v => set("first", v)} placeholder="Jane" /></FF>
              <FF label="Last Name"><TInput value={d.last} onChange={v => set("last", v)} placeholder="Smith" /></FF>
            </Row2>
            <Row2>
              <FF label="Business Email"><TInput type="email" value={d.email} onChange={v => set("email", v)} placeholder="jane@yourcompany.com" /></FF>
              <FF label="Personal Email"><TInput type="email" value={d.personalEmail} onChange={v => set("personalEmail", v)} placeholder="jane@gmail.com" /></FF>
            </Row2>
            <FF label="Phone Number"><TInput type="tel" value={d.phone} onChange={v => set("phone", v)} placeholder="+1 (___) ___-____" /></FF>
            <FF label="How did you hear about us?" required><TSelect value={d.referralSource} onChange={v => set("referralSource", v)} options={REFERRAL_SOURCE} /></FF>
            {(d.referralSource === "Referral from someone I know" || d.referralSource === "Other") && (
              <FF label="Who should we thank?"><TInput value={d.referralName} onChange={v => set("referralName", v)} placeholder="Name of the person or source" /></FF>
            )}
          </Stack>
          {err && <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 6, background: "rgba(215,43,43,0.1)", border: `1px solid rgba(215,43,43,0.3)`, fontSize: 13, color: "#dc2626" }}>{err}</div>}
          <button type="button" onClick={submit} style={{ width: "100%", marginTop: 24, background: R, color: "#fff", fontFamily: "inherit", fontWeight: 800, fontSize: 15, padding: "13px", borderRadius: 6, border: "none", cursor: "pointer", letterSpacing: "0.01em" }}>
            Continue →
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: TXD, marginTop: 12, lineHeight: 1.5 }}>Your information is confidential. We do not sell or share your data.</p>
        </div>
      </div>
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// SHELL
// ════════════════════════════════════════════════════════════
function Shell({ steps, step, children, onBack, onNext, onSubmit, isLast }: { steps: string[]; step: number; children: React.ReactNode; onBack: () => void; onNext: () => void; onSubmit: () => void; isLast: boolean }) {
  const pct = Math.round(((step + 1) / steps.length) * 100);
  const stepLabel = steps[step] ?? "";
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <style>{`.oc-ph::placeholder{color:#6b7280!important}@keyframes oc-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 60, borderBottom: `1px solid ${BDR}`, background: "rgba(250,250,247,0.97)", position: "sticky", top: 0, zIndex: 50 }}>
        <ApolloWordmark size={17} />
        <span style={{ fontSize: 12, color: TXM }}>{stepLabel || "Apollo[Claw] Onboarding"}</span>
      </nav>
      {/* Continuous progress bar - fills as you advance. No step numbers (they miscount). */}
      <div style={{ position: "sticky", top: 60, zIndex: 49, height: 3, background: SRF2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: R, transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px 100px" }}>
        <div key={step} style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "clamp(24px, 5vw, 36px) clamp(18px, 5vw, 40px)", animation: "oc-fade 0.35s ease" }}>{children}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
          {step > 0 ? <button type="button" onClick={onBack} style={{ background: "transparent", border: `1px solid ${BDR}`, color: TXM, fontFamily: "inherit", fontWeight: 600, fontSize: 13, padding: "10px 20px", borderRadius: 6, cursor: "pointer" }}>← Back</button> : <div />}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
{isLast
              ? <button type="button" onClick={onSubmit} style={{ background: R, color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 14, padding: "10px 28px", borderRadius: 6, border: "none", cursor: "pointer" }}>Submit Application →</button>
              : <button type="button" onClick={onNext} style={{ background: R, color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 14, padding: "10px 28px", borderRadius: 6, border: "none", cursor: "pointer" }}>Continue →</button>
            }
          </div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${BDR}`, padding: "16px 32px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: TXD }}>© {new Date().getFullYear()} Apollo[Claw]</span>
        <span style={{ fontSize: 12, color: TXD }}>david@apolloclaw.ai</span>
      </div>
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// SUCCESS
// ════════════════════════════════════════════════════════════
function Success() {
  const message = "This is one of the most comprehensive applications we receive. That tells us you're serious - and we take that seriously.";
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${R}`, background: "rgba(215,43,43,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 0 24px" }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13.5L10 18.5L21 8" stroke={R} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: TX, margin: "0 0 12px", letterSpacing: "-0.025em" }}>Application Submitted</h2>
      <p style={{ fontSize: 15, color: TXM, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 10px" }}>{message}</p>
      
      <a href="https://apolloclaw.ai" style={{ display: "inline-block", background: R, color: "#fff", fontWeight: 800, fontSize: 15, padding: "15px 40px", borderRadius: 8, textDecoration: "none" }}>Return to Apollo[Claw] →</a>
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// BUSINESS TRACK
// ════════════════════════════════════════════════════════════
const GROWTH_BOTTLENECK = ["Me - my time and attention are the ceiling","My team - capacity, skills, or hiring","My systems & processes - too much is manual","Demand - not enough qualified pipeline","Capital - funding constrains the next move","Not sure - that's part of why I'm here","Other"];
// Gap fields (from the onboarding review spec, Part 4).
const ACCESS_READINESS = ["I have admin access to all of them","My team controls logins but can grant access","We use them but access is scattered","Not sure"];
const PROCESS_DOCS = ["Documented SOPs exist","Some are written down","It is mostly in my head and my team's heads","We are starting from scratch"];
const OPS_VOLUME = ["Under 25","25 to 100","100 to 500","500+","Not sure"];
const TIMELINE_LIVE = ["ASAP","This quarter","Next 6 months","Just exploring"];

// Renders the dynamic "Industry Deep-Dive" step from an industryConfig branch,
// mapping each field type onto the form's existing primitives.
function IndustryStep({ branch, values, onChange, otherLabel }: { branch: IndustryBranch; values: Record<string, string | string[]>; onChange: (k: string, v: string | string[]) => void; otherLabel?: string }) {
  const isGeneric = branch.fields[0]?.key === "industry_detail";
  const subtitle = isGeneric && otherLabel ? `A bit more about your ${otherLabel} business.` : branch.stepSubtitle;
  return (
    <Stack>
      <SHead stepNum={0} total={0} title={branch.stepTitle} subtitle={subtitle} badge="Industry" />
      {branch.fields.map(f => {
        const val = values[f.key];
        const str = typeof val === "string" ? val : "";
        const arr = Array.isArray(val) ? val : [];
        if (f.type === "dropdown") return <FF key={f.key} label={f.label} required={f.required} hint={f.helper}><TSelect value={str} onChange={v => onChange(f.key, v)} options={f.options ?? []} /></FF>;
        if (f.type === "multiselect") return <CheckGroup key={f.key} label={f.label} hint={f.helper ?? "Select all that apply"} options={f.options ?? []} value={arr} onChange={v => onChange(f.key, v)} cols={2} />;
        if (f.type === "radio") return <RadioGroup key={f.key} label={f.label} hint={f.helper} options={f.options ?? []} value={str} onChange={v => onChange(f.key, v)} />;
        if (f.type === "scale") return <ScaleRow key={f.key} label={f.label} low="Low" high="High" value={str ? Number(str) : null} onChange={v => onChange(f.key, String(v))} />;
        if (f.type === "textarea") return <FF key={f.key} label={f.label} required={f.required} hint={f.helper}><TArea value={str} onChange={v => onChange(f.key, v)} placeholder={f.placeholder} rows={3} /></FF>;
        return <FF key={f.key} label={f.label} required={f.required} hint={f.helper}><TInput value={str} onChange={v => onChange(f.key, v)} placeholder={f.placeholder} /></FF>;
      })}
    </Stack>
  );
}
// Read a File into a base64 string (no data: prefix) for JSON upload to /api/intake.
function readFileAsBase64(file: File): Promise<{ name: string; type: string; size: number; dataBase64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type || "application/octet-stream", size: file.size, dataBase64: String(reader.result).split(",")[1] || "" });
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

// Multi-file picker for client materials. Capped so the base64 payload stays under the
// serverless body limit; larger files are directed to email.
function FileUpload({ files, onFiles }: { files: File[]; onFiles: (f: File[]) => void }) {
  const MAX = 2.5 * 1024 * 1024;
  const [msg, setMsg] = useState("");
  const add = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)];
    if (next.reduce((s, f) => s + f.size, 0) > MAX) { setMsg("Total uploads must be under 2.5MB. Remove a file, or email larger ones to david@apolloclaw.ai."); return; }
    setMsg(""); onFiles(next);
  };
  return (
    <div>
      <label style={{ display: "block", border: `1px dashed rgba(0,0,0,0.25)`, borderRadius: 8, padding: "16px", textAlign: "center", cursor: "pointer", background: SRF2, color: TXM, fontSize: 13, fontWeight: 700 }}>
        + Add files
        <input type="file" multiple onChange={e => { add(e.target.files); e.currentTarget.value = ""; }} style={{ display: "none" }} />
      </label>
      {files.length > 0 && (
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 6, background: SRF2, border: `1px solid ${BDR}`, fontSize: 13 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name} <span style={{ color: TXD }}>({Math.round(f.size / 1024)} KB)</span></span>
              <button type="button" onClick={() => onFiles(files.filter((_, idx) => idx !== i))} aria-label="Remove file" style={{ border: "none", background: "none", color: TXD, cursor: "pointer", fontSize: 16, lineHeight: 1, flexShrink: 0 }}>x</button>
            </div>
          ))}
        </div>
      )}
      {msg && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>{msg}</p>}
    </div>
  );
}
function BizTrack({ gate, onDone }: { gate: GateData; onDone: (data: Record<string, unknown>, track: string) => void }) {
  const [step, setStep] = useState(0);
  const [s2, setS2] = useState({ biz: "", url: "", industry: "", size: "", revenue: "", age: "", model: "", proud: [] as string[], crm: [] as string[], crmOther: "", ecom: [] as string[], ecomOther: "", comms: [] as string[], commsOther: "", pm: [] as string[], pmOther: "", billing: [] as string[], billingOther: "", mktg: [] as string[], auto: [] as string[], autoOther: "", support: [] as string[], supportOther: "", webplat: "", desc: "", differentiate: "", web_presence: "" });
  const [s3, setS3] = useState({ pain: "", depts: [] as string[], hours: "", duration: "", hate: "", tried: [] as string[], costImpact: "", fixed: "", opsVolume: "" });
  const [s4, setS4] = useState({ marital: "", linkedin: "", kids: "", kidsAges: [] as string[], caretaking: [] as string[], homeLife: "", protect: [] as string[], lifeStage: "", timeline3yr: [] as string[], personalGoal: "" });
  const [s5, setS5] = useState({ decStyle: [] as string[], stressResp: "", motivators: [] as string[], blockers: [] as string[], moneyMind: "", agencyHist: "", techTrust: null as number | null, controlComfort: null as number | null, worthIt: "", strategicBet: "", growthBottleneck: [] as string[], stuckDecision: "" });
  const [s6, setS6] = useState({ tone: "", writingComf: "", brandLike: "", voiceDesc: "", voiceStyle: [] as string[], loveWords: "", hateWords: "", socialActive: "", platforms: [] as string[], sample: "" });
  const [s7, setS7] = useState({ goals: [] as string[], metric: "", priority: "", prior: "", past: "", aiThoughts: "", aiStartup: "", teamSent: "" });
  const [s8, setS8] = useState({ hosting: [] as string[], os: "", security: [] as string[], data: [] as string[], comply: [] as string[], budget: "", timeline: "", engagement: "", internalTech: "", itInvolved: "", constraints: "", accessReadiness: "", processDocs: "", decisionAuthority: "", agree: false });
  const [companies, setCompanies] = useState<Company[]>([emptyCompany()]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioMeta>(emptyPortfolio());
  const [industryDetails, setIndustryDetails] = useState<Record<string, string | string[]>>({});
  const [agreeErr, setAgreeErr] = useState(false);
  const [vErr, setVErr] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const setIndustry = (k: string, v: string | string[]) => setIndustryDetails(p => ({ ...p, [k]: v }));
  const primaryCompany = companies[primaryIndex] || companies[0];
  const primaryName = primaryCompany?.name?.trim() || "your business";
  const branch = getIndustryBranch(primaryCompany?.industry);
  const branchHasVolume = branch ? branch.fields.some(f => /volume|count|sku/i.test(f.key)) : false;
  // Ordered step keys (mirrors allPages below); the Industry Deep-Dive only appears once
  // the primary company has an industry. Defined up front so navigation/validation never
  // reference allPages before it is built.
  const pageKeys = ["biz", "whatyoudo", ...(branch ? ["industry"] : []), "stack", "ops", "exec", "life", "voice", "goals", "scope"];
  const f2 = (k: string, v: unknown) => setS2(p => ({ ...p, [k]: v }));
  const f3 = (k: string, v: unknown) => setS3(p => ({ ...p, [k]: v }));
  const f4 = (k: string, v: unknown) => setS4(p => ({ ...p, [k]: v }));
  const f5 = (k: string, v: unknown) => setS5(p => ({ ...p, [k]: v }));
  const f6 = (k: string, v: unknown) => setS6(p => ({ ...p, [k]: v }));
  const f7 = (k: string, v: unknown) => setS7(p => ({ ...p, [k]: v }));
  const f8 = (k: string, v: unknown) => setS8(p => ({ ...p, [k]: v }));
  const buildData = () => ({ firstName: gate.first, lastName: gate.last, email: gate.email, phone: gate.phone, referralSource: gate.referralSource, referralName: gate.referralName, companies, primaryCompanyIndex: primaryIndex, portfolio, industryDetails, source: [] as string[], contactMethod: "", bestTime: "", linkedin: s4.linkedin || gate.linkedin, companyName: primaryCompany?.name || gate.company || s2.biz, primaryRole: primaryCompany?.role || "", website: s2.web_presence || s2.url, webPresence: s2.web_presence, industry: primaryCompany?.industry || s2.industry, companySize: s2.size, revenue: s2.revenue, businessAge: s2.age, businessModel: s2.model, mostProud: s2.proud, businessDescription: s2.desc, differentiator: s2.differentiate, webPlatform: s2.webplat, crmTools: s2.crm, crmToolsOther: s2.crmOther, ecomTools: s2.ecom, commsTools: s2.comms, pmTools: s2.pm, billingTools: s2.billing, mktgTools: s2.mktg, autoTools: s2.auto, supportTools: s2.support, mainPain: s3.pain, brokenAreas: s3.depts, manualHours: s3.hours, opsVolume: s3.opsVolume, painDuration: s3.duration, hatedTasks: s3.hate, triedBefore: s3.tried, costImpact: s3.costImpact, fixedLooksLike: s3.fixed, maritalStatus: s4.marital, children: s4.kids, childrenAges: s4.kidsAges, caretaking: s4.caretaking, homeLife: s4.homeLife, protecting: s4.protect, lifeStage: s4.lifeStage, threeYearGoals: s4.timeline3yr, personalGoal: s4.personalGoal, decisionStyle: s5.decStyle, stressResponse: s5.stressResp, motivators: s5.motivators, blockers: s5.blockers, moneyMindset: s5.moneyMind, agencyHistory: s5.agencyHist, techTrust: s5.techTrust, controlComfort: s5.controlComfort, worthIt: s5.worthIt, strategicBet: s5.strategicBet, growthBottleneck: s5.growthBottleneck, stuckDecision: s5.stuckDecision, writingTone: s6.tone, writingComfort: s6.writingComf, brandVoiceLike: s6.brandLike, voiceDescription: s6.voiceStyle, loveWords: s6.loveWords, hateWords: s6.hateWords, socialPresence: s6.socialActive, platforms: s6.platforms, writingSample: s6.sample, aiGoals: s7.goals, successMetric: s7.metric, priorityWorkflow: s7.priority, priorAI: s7.prior, pastExperience: s7.past, aiThoughts: s7.aiThoughts, aiStartup: s7.aiStartup, teamSentiment: s7.teamSent, hosting: s8.hosting, os: s8.os, securityMeasures: s8.security, dataTypes: s8.data, compliance: s8.comply, budgetRange: s8.budget, budget: s8.budget, timeline: s8.timeline, decisionAuthority: s8.decisionAuthority, accessReadiness: s8.accessReadiness, processDocs: s8.processDocs, engagement: s8.engagement, internalTech: s8.internalTech, constraints: s8.constraints });
  const validate = (key?: string): string => {
    if (key === "biz") {
      const p = companies[primaryIndex] || companies[0];
      if (!p?.name?.trim() || !p?.industry || !p?.role) return "Please fill in the primary business name, industry, and your role.";
      if (p.industry === "Other" && !p.industryOther?.trim()) return "Please tell us the primary business industry.";
      for (const c of companies) { if (c.name.trim() && !c.industry) return "Each business you add needs an industry."; }
      if (companies.length > 1) {
        if (!companies[primaryIndex]?.name) return "Please choose which business your agent should focus on first.";
        if (!portfolio.structure || !portfolio.sharedOps) return "Please tell us how the businesses are connected and whether they share operations.";
      }
      if (!s2.web_presence.trim()) return "Please add a website or LinkedIn.";
    }
    if (key === "whatyoudo") {
      if (!s2.desc.trim()) return "Please describe your business.";
    }
    if (key === "industry" && branch) {
      for (const f of branch.fields) {
        if (!f.required) continue;
        const v = industryDetails[f.key];
        if (!v || (Array.isArray(v) && v.length === 0) || (typeof v === "string" && !v.trim())) return `Please complete: ${f.label}.`;
      }
    }
    if (key === "stack") {
      if (!s8.accessReadiness) return "Please tell us who controls access to your systems.";
      if (!s8.processDocs) return "Please tell us how documented your processes are.";
    }
    return "";
  };
  const next = () => {
    const err = validate(pageKeys[step]);
    if (err) { setVErr(err); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setVErr("");
    setStep(s => Math.min(s + 1, pageKeys.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => { setVErr(""); setStep(s => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const submit = async () => {
    const err = validate(pageKeys[step]);
    if (err) { setVErr(err); return; }
    if (!s8.agree) { setAgreeErr(true); return; }
    setAgreeErr(false);
    let uploadedFiles: unknown[] = [];
    try { uploadedFiles = await Promise.all(files.map(readFileAsBase64)); } catch { uploadedFiles = []; }
    onDone({ ...buildData(), uploadedFiles }, "business");
  };
  const allPages: { key: string; label: string; node: React.ReactNode }[] = [
    { key: "biz", label: "Your Business", node: (
    <Stack key="s2a">
      <SHead stepNum={1} total={0} title="Your Business" subtitle="Tell us about the business, or businesses, behind this." badge="Business" />
      <CompanyRepeater companies={companies} onCompaniesChange={setCompanies} primaryIndex={primaryIndex} onPrimaryChange={setPrimaryIndex} portfolio={portfolio} onPortfolioChange={setPortfolio} />
      <FF label="Website"><TInput value={s2.web_presence} onChange={v => f2("web_presence", v)} placeholder="yourcompany.com" /></FF>
      <Row2><FF label="Team Size"><TSelect value={s2.size} onChange={v => f2("size", v)} options={BIZ_SIZES} /></FF><FF label="Monthly Revenue"><TSelect value={s2.revenue} onChange={v => f2("revenue", v)} options={REVENUE} /></FF></Row2>
      <Row2><FF label="Years in Business"><TSelect value={s2.age} onChange={v => f2("age", v)} options={BIZ_AGE} /></FF><FF label="Business Model"><TSelect value={s2.model} onChange={v => f2("model", v)} options={BIZ_MODEL} /></FF></Row2>
    </Stack>
    ) },
    { key: "whatyoudo", label: "What You Do", node: (
    <Stack key="s2b">
      <SHead stepNum={2} total={0} title="What Do You Do?" subtitle="Who you serve, what you deliver, and the edge that wins you business." badge="Business" />
      <FF label="Describe your business" required hint="Who do you serve, and what do you deliver for them?"><TArea value={s2.desc} onChange={v => f2("desc", v)} placeholder="We help [who] do [what] by [how]..." rows={7} /></FF>
      <FF label="What makes you different?" hint="Why clients choose you over the alternatives - your real edge."><TArea value={s2.differentiate} onChange={v => f2("differentiate", v)} placeholder="e.g. We're the only firm in the region that..., our turnaround is 3x faster, we own a proprietary process..." rows={3} /></FF>
    </Stack>
    ) },
    ...(branch ? [{ key: "industry", label: "Industry", node: (
      <IndustryStep branch={branch} values={industryDetails} onChange={setIndustry} otherLabel={primaryCompany?.industryOther} />
    ) }] : []),
    { key: "stack", label: "Tech Stack", node: (
    <Stack key="s2stack">
      <SHead stepNum={3} total={0} title="Your Tech Stack" subtitle="What the business runs on today. Pick what applies - this tells us what your agent has to work with." badge="Business" />
      <Divider label="Sales & CRM" />
      <CheckGroup options={STACK_CRM} value={s2.crm} onChange={v => f2("crm", v)} cols={2} />
      {s2.crm.includes("Other") && <FF label="Which CRM?"><TInput value={s2.crmOther || ""} onChange={v => f2("crmOther", v)} placeholder="Name the tool" /></FF>}
      <Divider label="Communication" />
      <CheckGroup options={STACK_COMMS} value={s2.comms} onChange={v => f2("comms", v)} cols={2} />
      {s2.comms.includes("Other") && <FF label="Which tool?"><TInput value={s2.commsOther || ""} onChange={v => f2("commsOther", v)} placeholder="Name the tool" /></FF>}
      <Divider label="Projects & Operations" />
      <CheckGroup options={STACK_PM} value={s2.pm} onChange={v => f2("pm", v)} cols={2} />
      {s2.pm.includes("Other") && <FF label="Which tool?"><TInput value={s2.pmOther || ""} onChange={v => f2("pmOther", v)} placeholder="Name the tool" /></FF>}
      <Divider label="Finance & Billing" />
      <CheckGroup options={STACK_BILLING} value={s2.billing} onChange={v => f2("billing", v)} cols={2} />
      {s2.billing.includes("Other") && <FF label="Which tool?"><TInput value={s2.billingOther || ""} onChange={v => f2("billingOther", v)} placeholder="Name the tool" /></FF>}
      <Divider label="Access & Documentation" />
      <RadioGroup label="Who controls access to these systems?" options={ACCESS_READINESS} value={s8.accessReadiness} onChange={v => f8("accessReadiness", v)} />
      <RadioGroup label="How documented are your processes today?" options={PROCESS_DOCS} value={s8.processDocs} onChange={v => f8("processDocs", v)} />
    </Stack>
    ) },
    { key: "ops", label: "Operations", node: (
    <Stack key="s3">
      <SHead stepNum={4} total={0} title={`Operations & Pain Points for ${primaryName}`} subtitle="Be direct. The clearer the problem, the better we can architect the fix." badge="Business" />
      <FF label="Your biggest operational headache right now"><TArea value={s3.pain} onChange={v => f3("pain", v)} placeholder="Walk us through a typical bad day. What breaks, what falls through the cracks?" rows={4} /></FF>
      <CheckGroup label="Which areas feel most broken?" hint="Select all that apply" options={BROKEN_AREAS} value={s3.depts} onChange={v => f3("depts", v)} cols={2} />
      <Row2>
        <FF label="Hours lost to administrative tasks each week"><TSelect value={s3.hours} onChange={v => f3("hours", v)} options={HOURS_WASTED} /></FF>
        <FF label="What's this costing the business?"><TSelect value={s3.costImpact} onChange={v => f3("costImpact", v)} options={COST_IMPACT} /></FF>
      </Row2>
      {!branchHasVolume && <FF label="Rough weekly volume on your busiest workflow"><TSelect value={s3.opsVolume} onChange={v => f3("opsVolume", v)} options={OPS_VOLUME} /></FF>}
      <FF label="What does 'fixed' look like in 12 months?" hint="What does your day look like? What numbers have changed?"><TArea value={s3.fixed} onChange={v => f3("fixed", v)} placeholder="Be specific about the outcome you're buying." rows={3} /></FF>
    </Stack>
    ) },
    { key: "exec", label: "Executive Profile", node: (
    <Stack key="s5exec">
      <SHead stepNum={5} total={0} title={`Executive Profile for ${primaryName}`} subtitle="The strategic picture - how you think, where you're stuck, and what a win is worth." badge="Business" />
      <FF label="What's your biggest goal or priority for the next 12 months?"><TArea value={s5.strategicBet} onChange={v => f5("strategicBet", v)} placeholder="The move that matters most - a new market, a product, a key hire, more revenue, an acquisition..." rows={3} /></FF>
      <CheckGroup label="Where's the real bottleneck to growth right now?" hint="Select all that apply" options={GROWTH_BOTTLENECK} value={s5.growthBottleneck} onChange={v => f5("growthBottleneck", v)} cols={2} split />
      <CheckGroup label="How do you make big decisions?" hint="Select all that apply" options={DECISION_STYLE} value={s5.decStyle} onChange={v => f5("decStyle", v)} cols={2} split />
    </Stack>
    ) },
    { key: "life", label: "Life Context", node: (
    <Stack key="s4">
      <SHead stepNum={6} total={0} title="Life Context (Optional)" subtitle="A little context on your life helps us build something that fits it. Skip if you'd rather not." badge="Business" />
      <button type="button" onClick={next} style={{ alignSelf: "flex-start", background: "transparent", border: `1px solid ${BDR}`, color: TXM, fontFamily: "inherit", fontWeight: 600, fontSize: 13, padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>Skip this step →</button>
      <FF label="Relationship status"><TSelect value={s4.marital} onChange={v => f4("marital", v)} options={MARITAL} /></FF>
      <FF label="LinkedIn"><TInput value={s4.linkedin} onChange={v => f4("linkedin", v)} placeholder="linkedin.com/in/you" /></FF>
      <RadioGroup label="Where are you in your business journey?" options={LIFE_STAGE} value={s4.lifeStage} onChange={v => f4("lifeStage", v)} />
      <CheckGroup label="What do you want your business to do for you in 3 years?" options={TIMELINE_3YR} value={s4.timeline3yr} onChange={v => f4("timeline3yr", v)} cols={2} />
      <FF label="Your personal 3-year vision" hint="Not metrics - your actual life."><TArea value={s4.personalGoal} onChange={v => f4("personalGoal", v)} placeholder="Be honest. What are you really building toward?" rows={3} /></FF>
    </Stack>
    ) },
    { key: "voice", label: "Your Voice", node: (
    <Stack key="s6voice">
      <SHead stepNum={7} total={0} title="Your Voice" subtitle="AI that sounds like you is the goal. Help us capture how you communicate." badge="Business" />
      <CheckGroup label="Your natural tone" hint="Select all that apply" options={WRITING_TONE} value={s6.tone ? [s6.tone] : []} onChange={v => f6("tone", v[v.length-1] || "")} cols={2} />
      <CheckGroup label="Describe your ideal voice" hint="Select all that apply" options={["Confident, not arrogant","Clear and direct","Warm and personable","Professional and polished","Casual and conversational","Bold and punchy","Empathetic and supportive","Witty and clever","Never corporate or stiff"]} value={s6.voiceStyle} onChange={v => f6("voiceStyle", v)} cols={2} />
      <CheckGroup label="Whose voice do you sound most like?" hint="Pick up to 3" split options={BRAND_LIKE} value={Array.isArray(s6.brandLike) ? s6.brandLike : (s6.brandLike ? [s6.brandLike] : [])} onChange={v => f6("brandLike", v.slice(-3))} cols={2} />
      <FF label="Share a sample of your Voice / Writing" hint="Optional. Paste an email, LinkedIn summary, or any writing that sounds like you."><TArea value={s6.sample} onChange={v => f6("sample", v)} placeholder="A long email, your LinkedIn About section, a proposal, or a Slack message that sounds like you..." rows={4} /></FF>
    </Stack>
    ) },
    { key: "goals", label: "Goals & AI", node: (
    <Stack key="s7">
      <SHead stepNum={8} total={0} title="Goals & AI Scope" subtitle="What you want AI to own, and what winning looks like." badge="Business" />
      <CheckGroup label="What tasks would you like your agent to manage?" hint="Select all that apply" options={AI_GOALS} value={s7.goals} onChange={v => f7("goals", v)} cols={2} />
      <FF label="The #1 workflow you want automated first" hint="From trigger to outcome - the more specific, the better."><TArea value={s7.priority} onChange={v => f7("priority", v)} placeholder="e.g. 'Lead fills a form, gets an auto-reply, is scored, and if qualified is booked on my calendar...'" rows={4} /></FF>
      <CheckGroup label="What does winning look like?" hint="Select all that apply" split options={SUCCESS_MET} value={s7.metric ? [s7.metric] : []} onChange={v => f7("metric", v[v.length-1] || "")} cols={2} />
      <RadioGroup label="Have you tried AI or automation before?" options={["Yes","No"]} value={s7.prior} onChange={v => f7("prior", v)} />
      {s7.prior === "Yes" && (
        <>
          <FF label="What did you use? Which programs or tools?"><TArea value={s7.past} onChange={v => f7("past", v)} placeholder="e.g. ChatGPT for content, a Zapier automation for leads, a hired dev who built a bot..." rows={2} /></FF>
          <FF label="What did you and/or your team think about it?"><TArea value={s7.aiThoughts} onChange={v => f7("aiThoughts", v)} placeholder="What worked, what fell short, how the team felt about it." rows={2} /></FF>
          <FF label="How was the implementation / startup?"><TArea value={s7.aiStartup} onChange={v => f7("aiStartup", v)} placeholder="How smooth or rough was getting it set up and adopted?" rows={2} /></FF>
        </>
      )}
      <RadioGroup label="How does your team feel about bringing in AI?" options={TEAM_SENT} value={s7.teamSent} onChange={v => f7("teamSent", v)} />
      <ScaleRow label="How much do you trust technology to handle critical tasks?" low="Not at all - want humans involved" high="Fully - automate everything" value={s5.techTrust} onChange={v => f5("techTrust", v)} />
    </Stack>
    ) },
    { key: "scope", label: "Scope", node: (
    <Stack key="s8">
      <SHead stepNum={9} total={0} title="Final Details" subtitle="A few last things so we can start building for you." badge="Business" />
      <RadioGroup label="When do you want this live?" options={TIMELINE_LIVE} value={s8.timeline} onChange={v => f8("timeline", v)} />
      <FF label="Internal technical resources after launch"><TSelect value={s8.internalTech} onChange={v => f8("internalTech", v)} options={INTERNAL_TECH} /></FF>
      <CheckGroup label="Any compliance requirements?" hint="Select all that apply" options={IT_COMPLY} value={s8.comply} onChange={v => f8("comply", v)} cols={2} />
      <FF label="Anything else we should know?" hint="Extra context, priorities, or details that will help us build."><TArea value={s8.constraints} onChange={v => f8("constraints", v)} placeholder="Anything else that helps us understand your business and what you need." rows={4} /></FF>
      <FF label="Upload company materials" hint="Optional, and the more the better. Anything that helps us learn your business: company materials, your resume so we know your background, example emails / memos / documents, SOPs, and templates.">
        <FileUpload files={files} onFiles={setFiles} />
      </FF>
      <button type="button" onClick={() => f8("agree", !s8.agree)} style={{ display: "flex", alignItems: "center", gap: 16, textAlign: "left", padding: "20px 24px", borderRadius: 10, cursor: "pointer", fontSize: 15.5, fontWeight: 600, fontFamily: "inherit", lineHeight: 1.5, background: s8.agree ? "rgba(215,43,43,0.12)" : agreeErr ? "rgba(215,43,43,0.06)" : "#fff", border: `2px solid ${s8.agree ? R : agreeErr ? "rgba(215,43,43,0.65)" : "rgba(0,0,0,0.18)"}`, color: s8.agree ? TX : agreeErr ? "#dc2626" : TX, boxShadow: s8.agree ? "0 0 0 4px rgba(215,43,43,0.12)" : "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.15s" }}>
        <span style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: `2px solid ${s8.agree ? R : "rgba(0,0,0,0.28)"}`, background: s8.agree ? R : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {s8.agree && <svg width="15" height="15" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </span>
        I've answered honestly and I'm ready to get started building my agent.
      </button>
      {agreeErr && <p style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", marginTop: 6 }}>Please check this box before submitting.</p>}
    </Stack>
    ) },
  ];
  const stepLabels = allPages.map(p => p.label);
  const cur = allPages[step] || allPages[allPages.length - 1];
  return <Shell steps={stepLabels} step={step} onBack={back} onNext={next} onSubmit={submit} isLast={step === allPages.length - 1}>{cur.node}{vErr && <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 6, background: "rgba(215,43,43,0.1)", border: `1px solid rgba(215,43,43,0.3)`, fontSize: 13, color: "#dc2626" }}>{vErr}</div>}</Shell>;
}
// ════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════
export default function OnboardPage() {
  const [phase, setPhase] = useState<"gate" | "form" | "submitting" | "done">("gate");
  const [gate, setGate] = useState<GateData>({ first: "", last: "", email: "", personalEmail: "", phone: "", heard: [], tz: "", title: "", linkedin: "", company: "", referralSource: "", referralName: "" });
  const handleGate = (info: GateData) => { setGate(info); setPhase("form"); };
  const handleDone = async (data: Record<string, unknown>, trackType: string) => {
    setPhase("submitting");
    try {
      const res = await fetch("/api/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, trackType }) });
      if (!res.ok) throw new Error("Submission failed");
      setPhase("done");
    } catch (err) {
      console.error("Submission error:", err);
      setPhase("form");
      alert("Something went wrong submitting your application. Please try again.");
    }
  };
  if (phase === "gate") return <Gatekeeper onPass={handleGate} />;
  if (phase === "submitting") return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 48, height: 48, border: `3px solid ${SRF2}`, borderTopColor: R, borderRadius: "50%", animation: "oc-spin 1s linear infinite", marginBottom: 24 }} />
      <h2 style={{ fontSize: 24, fontWeight: 900, color: TX, margin: "0 0 8px" }}>Submitting Your Application…</h2>
      <p style={{ fontSize: 14, color: TXM }}>This will only take a moment.</p>
      <style>{`@keyframes oc-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (phase === "done") return <Success />;
  if (phase === "form") return <BizTrack gate={gate} onDone={handleDone} />;
  return null;
}
