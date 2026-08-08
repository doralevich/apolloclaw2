"use client";
import { Fragment, useEffect, useState, useSyncExternalStore } from "react";
import CompanyRepeater, { emptyCompany, emptyPortfolio, type Company, type PortfolioMeta } from "@/components/onboard/CompanyRepeater";
import { BuildScreen } from "@/components/onboard/BuildScreen";
import { LICENSE_AGENT_TYPE_ID } from "@/config/agent-types";
import { AVATAR_PRESETS } from "@/config/avatar-presets";
import { getIndustryBranch, type IndustryBranch } from "@/lib/industryConfig";
import {
  DEFAULT_LICENSE_TIER,
  LICENSE_TIERS,
  resolveLicenseTier,
  type LicenseTier,
  type LicenseTierId,
} from "@/lib/pricing/catalog";
import { apiFetch } from "@/lib/api";

// The single business-onboarding questionnaire, shared by three entry points:
//   - /onboard                 (mode="lead")       - no login. Submits to /api/intake as a
//                                                     sales lead (CRM + email, no agent).
//                                                     This is the cloud-hosted (VPS) path and
//                                                     is where the licensing paywall goes,
//                                                     between the gate and the questionnaire.
//   - /white-glove-onboarding  (mode="whiteglove") - the same questionnaire with NO paywall,
//                                                     ever. Unlisted; David hands the link out
//                                                     directly for self-hosted (Mac Mini)
//                                                     builds and custom engagements, where the
//                                                     commercial terms are agreed offline.
//                                                     Submits to /api/intake like the lead
//                                                     form, tagged so it is obvious which
//                                                     submissions came in this way, and hands
//                                                     off to /setup at the end.
//   - /onboard/[agent]         (mode="customer")   - requires login + a paid agent type.
//                                                     Submits to /api/agent-setup, which is
//                                                     what actually configures and provisions
//                                                     the paying customer's live agent.
// Same fields, same design, same "path of questions leading into an agent" in all three —
// only the gating and what happens on submit differ. If you change a field, change it here
// once; every flow picks it up automatically.

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
// Sales & CRM, weighted to what mid-market and enterprise buyers actually run.
//
// Keap and Close came out at David's call - both are small-business tools, and neither is a
// system somebody with a sales team is likely to name. What replaces them is the set a company
// of that size answers with: the two platform incumbents were already here, Dynamics and
// NetSuite cover the Microsoft and Oracle estates, Attio and Copper are the modern lightweight
// end, and Outreach, Salesloft, Gong and Apollo.io are sales-engagement layers that sit BESIDE
// a CRM rather than replacing one - which is why this is a multi-select and why naming them
// matters: an agent that knows sequences live in Outreach and calls are recorded in Gong knows
// where to look.
const STACK_CRM    = ["Salesforce","HubSpot","Microsoft Dynamics 365","Oracle NetSuite CRM","Zoho CRM","Pipedrive","Attio","Copper","Freshsales","Outreach","Salesloft","Gong","Apollo.io","No CRM currently","Other"];
// Otter, Fathom, Fireflies and Zoom removed at David's call. The three note-takers are
// meeting-recording add-ons rather than the communication system a business runs on, and they
// made a short list read like a tool directory. WhatsApp added: outside the US it is the
// default way a business talks to customers, and it is one of the channels the agent can
// answer on.
// "Google Workspace" split into Google Mail and Google Calendar at David's call. The suite name
// was one checkbox standing for two separate Composio connections, so ticking it produced a
// single checklist item for mail and silently nothing for calendar - and somebody who lives in
// Calendar but not Gmail had no way to say so.
const STACK_COMMS  = ["Google Mail","Google Calendar","Office 365","Slack","Microsoft Teams","Google Meet","WhatsApp","Telegram","Other"];
const STACK_PM     = ["Notion","Asana","ClickUp","Trello","Monday.com","Jira / Linear","No PM tool","Other"];
const STACK_BILLING= ["QuickBooks Online","QuickBooks Desktop","Xero","FreshBooks","NetSuite","Bill.com","Ramp / Brex","Stripe","Square","PayPal","None","Other"];
const IT_COMPLY    = ["HIPAA (healthcare)","PCI-DSS (payments)","GDPR (EU data)","CCPA (California)","SOC 2","None / Not applicable","Not sure","Multiple"];
const BROKEN_AREAS = ["Sales / Lead Generation","Customer Support / Service","Operations / Admin","Marketing & Content","Invoicing & Finance","Scheduling & Calendar","Hiring & HR","Reporting & Analytics","Order Fulfillment / Shipping","Email & Inbox","Team Communication","Vendor / Supplier Management","Project Management","Customer Onboarding","Contracts & Proposals"];
const KIDS_COUNT   = ["None","1","2","3","4","5 or more"];
const MARITAL      = ["Single","In a relationship","Engaged","Married","Domestic partnership","Divorced / Separated","Widowed","Prefer not to say"];
const LIFE_STAGE   = ["Building - early, grinding hard","Scaling - growing fast, feeling stretched","Optimizing - established, refining","Exiting - preparing to sell or step back","Pivoting - changing direction","Surviving - navigating a hard period"];
const DECISION_STYLE = ["Data-first - I need numbers before I commit","Gut-first - I move on instinct, validate later","Consensus - I loop in my team / advisors first","Vision-first - I decide based on my 3-year picture","Risk-averse - I need proof it works elsewhere first","Opportunity-driven - big upside = fast move","Other"];
const WRITING_TONE = ["Professional & formal","Conversational & warm","Direct & punchy","Educational & detailed","Bold & provocative","Humble & approachable","Witty & clever","Empathetic & supportive"];
const BRAND_LIKE   = ["Alex Hormozi - direct, value-packed, no fluff","Gary Vaynerchuk - raw, authentic","Simon Sinek - thoughtful, purpose-driven","Seth Godin - pithy, surprising","Donald Miller - clear, customer-focused","Marie Forleo - energetic, empowering","Oprah Winfrey - empathetic, inspirational","Tim Ferriss - tactical, optimizing","Brene Brown - vulnerable, human-centered","Steve Jobs - visionary, minimalist","Warren Buffett - plainspoken, folksy wisdom","Rachel Hollis - motivational, relatable","Other"];
const AI_GOALS     = ["Inbox & email management","Lead qualification & follow-up","Customer support / chat","Appointment scheduling","Proposals & quotes","Content & social media","Research & competitive intel","CRM data entry & updates","Invoicing & billing","Internal workflow automation","Other"];
const SUCCESS_MET  = ["Save time - get hours back every week","Increase revenue - close more, faster","Reduce headcount or overhead costs","Scale without hiring more people","Improve customer experience & response speed","Improve consistency across my team","Reduce errors and manual mistakes","Something else"];
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
function CheckGroup({ label, required, hint, options, value = [], onChange, cols = 2, split = false }: { label?: string; required?: boolean; hint?: string; options: string[]; value: string[]; onChange: (v: string[]) => void; cols?: number; split?: boolean }) {
  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  return (
    <FF label={label} required={required} hint={hint}>
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
export interface KeyPerson { name: string; role: string }
// The people around the customer, by name and role.
//
// Name and role as SEPARATE fields, and repeated rather than one textarea, because of what the
// agent does with them: "Sarah, Ops Manager" typed into a paragraph is prose it can quote back,
// while a list of {name, role} is something it can match against - so when an email arrives
// from Sarah it already knows who she is and what she decides, instead of asking.
//
// Starts as one blank row and grows on demand. Rows left empty are dropped on submit, so
// somebody who has nobody to name simply walks past it.
function KeyPeople({ people, onChange }: { people: KeyPerson[]; onChange: (p: KeyPerson[]) => void }) {
  const update = (i: number, patch: Partial<KeyPerson>) => onChange(people.map((p, n) => (n === i ? { ...p, ...patch } : p)));
  const remove = (i: number) => onChange(people.length > 1 ? people.filter((_, n) => n !== i) : [{ name: "", role: "" }]);
  return (
    <FF label="Key people we should know about" hint="The names that come up in your day - who they are and what they run. Optional, and you can add more later.">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
        {people.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
              <TInput value={p.name} onChange={v => update(i, { name: v })} placeholder="Name" />
              <TInput value={p.role} onChange={v => update(i, { role: v })} placeholder="Role - e.g. Operations Manager" />
            </div>
            <button type="button" onClick={() => remove(i)} aria-label={`Remove person ${i + 1}`} style={{ border: "none", background: "none", color: TXD, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>x</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...people, { name: "", role: "" }])} style={{ marginTop: 10, border: `1px dashed ${BDR}`, background: "transparent", color: TXM, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 6 }}>
        + Add another person
      </button>
    </FF>
  );
}
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
interface GateData { first: string; last: string; email: string; phone: string; linkedin: string; company: string }
// `heading`/`intro` are overridable so the white-glove entry point can say plainly that this
// is an invited flow, rather than reusing self-serve copy that would read as a sales page to
// someone David has already spoken to.
// `initial` re-seeds the five fields when someone steps BACK here from the questionnaire.
// Without it the screen would remount empty and the trip back to fix one typo would cost
// them all five.
function Gatekeeper({ onPass, heading, intro, initial }: { onPass: (d: GateData) => void; heading?: React.ReactNode; intro?: string; initial?: GateData }) {
  const [d, setD] = useState<GateData>(initial ?? { first: "", last: "", email: "", phone: "", linkedin: "", company: "" });

  const [err, setErr] = useState("");
  // "That address already has an account" is not an error in the same sense as a missing field
  // — there is nothing to correct unless they want to correct it — so it renders as its own
  // block with the two ways out, rather than as red text telling them off.
  const [taken, setTaken] = useState(false);
  const [checking, setChecking] = useState(false);
  const set = (k: keyof GateData, v: string) => {
    setD(p => ({ ...p, [k]: v }));
    // Editing the address clears the verdict on the old one.
    if (k === "email") setTaken(false);
  };

  const submit = async () => {
    if (!d.first.trim() || !d.last.trim() || !d.email.trim() || !d.phone.trim()) { setErr("Please fill in all required fields to continue."); return; }
    if (!/\S+@\S+\.\S+/.test(d.email)) { setErr("Please enter a valid email address."); return; }
    setErr("");
    setTaken(false);

    // Checked HERE, on the first screen, because this is the last moment it is free.
    //
    // An address that already has an account used to get all the way through the gate, the
    // checkout and the questionnaire before dying on the closing screen, where
    // /api/onboard/set-password refuses an account that has ever been signed into. The buyer
    // discovered the problem after paying, at the final step, with no way forward.
    //
    // Failure to reach the check does NOT block: the endpoint fails open for the same reason,
    // and a network blip must not cost a sale.
    setChecking(true);
    try {
      const res = await fetch("/api/onboard/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: d.email.trim().toLowerCase() }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body?.available === false) {
        setTaken(true);
        return;
      }
    } catch {
      // Deliberately ignored - see above.
    } finally {
      setChecking(false);
    }

    onPass(d);
  };
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <div style={{ background: `radial-gradient(ellipse 80% 50% at 50% -5%,rgba(215,43,43,0.14) 0%,transparent 70%),${SRF}`, borderBottom: `1px solid ${BDR}`, padding: "48px 32px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 16px", color: TX }}>
          {heading ?? <>Let&apos;s Create Your <span style={{ color: R }}>Agent!</span></>}
        </h1>
        <p style={{ fontSize: 15, color: TXM, maxWidth: 520, margin: "0 auto" }}>{intro ?? "Before we build your AI assistant, we need to understand your business. Takes about 15 minutes. The more detail, the better the result."}</p>
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
            {/* One email. There used to be a second "Personal Email - a backup contact, not
                used for login", which asked the very first question of the flow twice and had
                to explain in a hint why the answer didn't matter. Nothing ever read it. */}
            <Row2>
              <FF label="Email" hint="This is the email you'll use to log in."><TInput type="email" value={d.email} onChange={v => set("email", v)} placeholder="jane@yourcompany.com" /></FF>
              <FF label="Phone Number"><TInput type="tel" value={d.phone} onChange={v => set("phone", v)} placeholder="+1 (___) ___-____" /></FF>
            </Row2>
            {/* LinkedIn belongs here, with the rest of "who are you". It used to sit in the
                optional Life Context step between relationship status and children — filed
                under personal life, behind a "Skip this step" button, so the one public
                professional record of the person we are building an agent for could disappear
                from the answers entirely. */}
            <FF label="LinkedIn" hint="Optional. Helps your agent understand your professional background."><TInput value={d.linkedin} onChange={v => set("linkedin", v)} placeholder="linkedin.com/in/you" /></FF>
          </Stack>
          {err && <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 6, background: "rgba(215,43,43,0.1)", border: `1px solid rgba(215,43,43,0.3)`, fontSize: 13, color: "#dc2626" }}>{err}</div>}

          {/* An existing account does not buy again - David's call, and the right one: they
              already own a license, so a second purchase would charge them for something they
              have. Getting back INTO the account is the whole job here.

              So the primary action is the reset form itself, opened directly with their address
              already in it. Linking to plain /login would land them on a sign-in form where they
              still have to spot "Forgot password?" and retype the address they just typed, which
              is most of the instruction left undone.

              Registering a different business on another address stays available underneath,
              stated plainly rather than as an equal-weight option. */}
          {taken && (
            <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 6, background: "rgba(215,43,43,0.06)", border: `1px solid rgba(215,43,43,0.25)`, fontSize: 13, color: TXM, lineHeight: 1.65 }}>
              <p style={{ margin: "0 0 6px", fontWeight: 700, color: TX }}>
                {d.email.trim().toLowerCase()} already has an ApolloClaw account.
              </p>
              {/* Naming the destination, not just the obstacle.
                  This said "reset your password and log in" and stopped there, which reads as
                  "there is nothing for you here" to the one person it most needs to help:
                  somebody with an account and NO agent. David hit exactly that on a test
                  address - blocked at the gate, offered a password reset, and no way to reach
                  the Create button that is now waiting on Welcome for any workspace with zero
                  agents. The route existed; the sign did not. */}
              <p style={{ margin: "0 0 12px" }}>
                There is nothing to buy here - the licence is already yours. Log in and your
                dashboard picks up where you left off, and if there is no agent on it yet you can
                build one from the Welcome page.
              </p>
              <a
                href={`/login?email=${encodeURIComponent(d.email.trim().toLowerCase())}`}
                style={{ display: "inline-block", background: R, color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 6, textDecoration: "none" }}
              >
                Log in →
              </a>
              <p style={{ margin: "12px 0 0", fontSize: 12, color: TXD }}>
                Forgotten your password?{" "}
                <a href={`/login?reset=1&email=${encodeURIComponent(d.email.trim().toLowerCase())}`} style={{ color: TXM, fontWeight: 600 }}>Reset it</a>.
                Setting up a different business? Use another email address above.
              </p>
            </div>
          )}

          <button type="button" onClick={() => void submit()} disabled={checking} style={{ width: "100%", marginTop: 24, background: R, color: "#fff", fontFamily: "inherit", fontWeight: 800, fontSize: 15, padding: "13px", borderRadius: 6, border: "none", cursor: checking ? "default" : "pointer", opacity: checking ? 0.75 : 1, letterSpacing: "0.01em" }}>
            {checking ? "Checking…" : "Continue →"}
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: TXD, marginTop: 12, lineHeight: 1.5 }}>Your information is confidential. We do not sell or share your data.</p>
        </div>
      </div>
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// PERSONALIZE (customer mode only — name + avatar for the agent itself, not the buyer)
// ════════════════════════════════════════════════════════════
const AGENT_NAME_SUGGESTIONS = ["Atlas", "Nova", "Sage", "Ember", "Juno", "Orion", "Vale", "Piper", "Rex", "Iris", "Max", "Lex"];
const AVATAR_COLORS = ["#D72B2B", "#0B1729", "#2563EB", "#059669", "#7C3AED", "#EA580C"];

// A small inline SVG "initials in a colored circle" avatar — no image asset dependency,
// works for any name typed on the fly. Stored directly in agents.avatar_url; renders in an
// <img src> exactly like an uploaded file's Supabase Storage URL would.
function initialsAvatarDataUri(label: string, color: string): string {
  const initials = (label.trim().match(/\b\w/g)?.slice(0, 2).join("") || label.trim().slice(0, 2) || "A").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><circle cx="60" cy="60" r="60" fill="${color}"/><text x="60" y="62" text-anchor="middle" dominant-baseline="middle" font-family="Inter,Arial,sans-serif" font-size="46" font-weight="700" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export interface PersonalizeData {
  agentName: string;
  avatarFile: File | null;
  avatarPresetColor: string | null;
  /** One of the shipped mascot avatars (config/avatar-presets.ts), by path. */
  avatarPresetImage: string | null;
}

function Personalize({ agentLabel, onNext }: { agentLabel: string; onNext: (d: PersonalizeData) => void }) {
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [presetColor, setPresetColor] = useState<string | null>(null);
  const [presetImage, setPresetImage] = useState<string | null>(null);

  // Upload, portrait and colour are mutually exclusive — picking any one clears the other two,
  // so the preview always shows the thing that will actually be saved.
  const pickPreset = (color: string) => { setPresetColor(color); setPresetImage(null); setAvatarFile(null); setAvatarPreview(null); };
  const pickPortrait = (src: string) => { setPresetImage(src); setPresetColor(null); setAvatarFile(null); setAvatarPreview(null); };
  const handleUpload = (file: File | null) => {
    if (!file) return;
    setAvatarFile(file);
    setPresetColor(null);
    setPresetImage(null);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result));
    reader.readAsDataURL(file);
  };
  const surprise = () => {
    const pool = AGENT_NAME_SUGGESTIONS.filter((n) => n !== name);
    setName(pool[Math.floor(Math.random() * pool.length)]);
  };

  const previewUrl =
    avatarPreview || presetImage || initialsAvatarDataUri(name.trim() || agentLabel, presetColor || AVATAR_COLORS[0]);
  const chipStyle: React.CSSProperties = { background: SRF2, border: `1px solid ${BDR}`, color: TXM, fontFamily: "inherit", fontWeight: 600, fontSize: 12.5, padding: "6px 14px", borderRadius: 20, cursor: "pointer" };

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 560, background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "clamp(24px, 5vw, 36px) clamp(18px, 5vw, 40px)", textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="Agent avatar preview" width={84} height={84} style={{ borderRadius: "50%", margin: "0 auto 20px", display: "block" }} />
        <h2 style={{ fontSize: 24, fontWeight: 900, color: TX, margin: "0 0 8px" }}>Make it yours</h2>
        <p style={{ fontSize: 14, color: TXM, margin: "0 0 28px" }}>Give your {agentLabel} a name and a face. Totally optional - skip either and we&apos;ll use a default.</p>

        <div style={{ textAlign: "left", marginBottom: 24 }}>
          <FF label="What would you like to call your agent?">
            <TInput value={name} onChange={setName} placeholder={agentLabel} />
          </FF>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {AGENT_NAME_SUGGESTIONS.slice(0, 3).map((n) => (
              <button key={n} type="button" onClick={() => setName(n)} style={chipStyle}>{n}</button>
            ))}
            <button type="button" onClick={surprise} style={chipStyle}>Surprise me</button>
          </div>
        </div>

        <div style={{ textAlign: "left" }}>
          {/* The portraits, first.
              A row of mascot poses used to be here and came out at David's call - it left every
              agent looking like every other agent, because it was seven poses of one robot. The
              presets are forty photographs of different people now, which is the opposite
              problem solved: they are the fastest way to a face that is not a coloured letter,
              and this screen is the first place anyone is asked to choose one.
              Same 68px tiles as the dashboard pickers, scrolling after three rows. */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TXM, marginBottom: 10 }}>Avatar</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))", gap: 10, maxHeight: 250, overflowY: "auto", paddingRight: 4, marginBottom: 14 }}>
            {AVATAR_PRESETS.map((p) => {
              const on = presetImage === p.src;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickPortrait(p.src)}
                  aria-label={p.label}
                  aria-pressed={on}
                  style={{ width: "100%", aspectRatio: "1", borderRadius: "50%", overflow: "hidden", padding: 0, background: SRF2, border: on ? `2px solid ${R}` : `1px solid ${BDR}`, boxShadow: on ? `0 0 0 2px ${SRF}, 0 0 0 3px ${R}` : "none", cursor: "pointer" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              );
            })}
          </div>
          <label style={{ display: "inline-block", border: `1px dashed rgba(0,0,0,0.25)`, borderRadius: 8, padding: "10px 18px", cursor: "pointer", background: SRF2, color: TXM, fontSize: 13, fontWeight: 700 }}>
            Or upload your own
            <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={(e) => { handleUpload(e.target.files?.[0] ?? null); e.currentTarget.value = ""; }} />
          </label>
          <p style={{ fontSize: 11, color: TXD, margin: "10px 0 8px" }}>Or pick a color and we&apos;ll use your agent&apos;s initials</p>
          <div style={{ display: "flex", gap: 10 }}>
            {AVATAR_COLORS.map((c) => {
              const on = presetColor === c && !avatarFile && !presetImage;
              return <button key={c} type="button" onClick={() => pickPreset(c)} aria-label={`Pick ${c}`} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: on ? `2px solid ${TX}` : "2px solid transparent", boxShadow: on ? `0 0 0 2px ${SRF}, 0 0 0 3px ${TX}` : "none", cursor: "pointer" }} />;
            })}
          </div>
        </div>

        {/* avatarPresetImage was hardcoded null while there were no image presets to send. The
            downstream handling never went away - /api/agent-setup and /api/onboard/complete both
            still read it - so wiring it back up is this one argument. */}
        <button type="button" onClick={() => onNext({ agentName: name.trim(), avatarFile, avatarPresetColor: presetColor, avatarPresetImage: presetImage })} style={{ width: "100%", marginTop: 28, background: R, color: "#fff", fontFamily: "inherit", fontWeight: 800, fontSize: 15, padding: "13px", borderRadius: 6, border: "none", cursor: "pointer" }}>
          Continue →
        </button>
      </div>
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// SHELL
// ════════════════════════════════════════════════════════════
function Shell({ steps, step, children, onBack, canBack, onNext, onSubmit, isLast, submitLabel }: { steps: string[]; step: number; children: React.ReactNode; onBack: () => void; canBack: boolean; onNext: () => void; onSubmit: () => void; isLast: boolean; submitLabel: string }) {
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
          {canBack ? <button type="button" onClick={onBack} style={{ background: "transparent", border: `1px solid ${BDR}`, color: TXM, fontFamily: "inherit", fontWeight: 600, fontSize: 13, padding: "10px 20px", borderRadius: 6, cursor: "pointer" }}>← Back</button> : <div />}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
{isLast
              ? <button type="button" onClick={onSubmit} style={{ background: R, color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 14, padding: "10px 28px", borderRadius: 6, border: "none", cursor: "pointer" }}>{submitLabel}</button>
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
// SUCCESS (lead mode only — customer mode goes to BuildScreen instead)
// ════════════════════════════════════════════════════════════
// `nextStep` continues the white-glove journey into the technical setup form at /setup.
// The plain lead form has no such next step — nobody has bought anything yet — so it keeps
// the "return to the site" ending.
function Success({ nextStep }: { nextStep?: boolean }) {
  const message = "This is one of the most comprehensive applications we receive. That tells us you're serious - and we take that seriously.";
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${R}`, background: "rgba(215,43,43,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 0 24px" }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13.5L10 18.5L21 8" stroke={R} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: TX, margin: "0 0 12px", letterSpacing: "-0.025em" }}>Application Submitted</h2>
      {nextStep ? (
        <>
          <p style={{ fontSize: 15, color: TXM, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 6px" }}>
            We have everything we need about your business. One step left: the technical setup, where
            you tell us about the machine your agent will run on and connect the accounts it needs.
          </p>
          <p style={{ fontSize: 13, color: TXD, lineHeight: 1.6, maxWidth: 480, margin: "0 auto 26px" }}>
            It takes about five minutes. You can also come back to it later at apolloclaw.ai/setup.
          </p>
          <a href="/setup" style={{ display: "inline-block", background: R, color: "#fff", fontWeight: 800, fontSize: 15, padding: "15px 40px", borderRadius: 8, textDecoration: "none" }}>Continue to Technical Setup →</a>
        </>
      ) : (
        <>
          <p style={{ fontSize: 15, color: TXM, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 26px" }}>{message}</p>
          <a href="https://apolloclaw.ai" style={{ display: "inline-block", background: R, color: "#fff", fontWeight: 800, fontSize: 15, padding: "15px 40px", borderRadius: 8, textDecoration: "none" }}>Return to Apollo[Claw] →</a>
        </>
      )}
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// PAYWALL (lead mode — between "Start Here" and "Your Business")
// ════════════════════════════════════════════════════════════
// David's call on how the funnel works now: the lead details are captured first (so a
// drop-off here is still a lead we have), then payment, then the questionnaire. The buyer
// has no account at this point and does not need one — /api/onboard/checkout is anonymous
// and the account is created from the completed checkout by the Stripe webhook.
// One tier card on the paywall. Module scope, not defined inside Paywall: a component created
// during render is a fresh type on every render, which remounts its subtree.
//
// The whole card is the control, and it is a real <button> rather than a div with an onClick —
// so it is reachable by keyboard and announces its pressed state without any of that being
// reimplemented here.
function TierCard({ tier, selected, disabled, onSelect }: { tier: LicenseTier; selected: boolean; disabled: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      style={{
        flex: "1 1 260px", textAlign: "left", fontFamily: "inherit", cursor: disabled ? "default" : "pointer",
        background: selected ? "rgba(215,43,43,0.05)" : "transparent",
        border: `1px solid ${selected ? R : BDR}`,
        boxShadow: selected ? `0 0 0 1px ${R}` : "none",
        borderRadius: 10, padding: "20px 18px", position: "relative", transition: "border-color .15s, background .15s",
      }}
    >
      {tier.recommended && (
        <span style={{ position: "absolute", top: -9, right: 16, background: R, color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 4 }}>
          Recommended
        </span>
      )}
      <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: TX }}>{tier.label}</p>
      <p style={{ margin: "3px 0 0", fontSize: 13, color: TXD, lineHeight: 1.5 }}>{tier.tagline}</p>
      {/* Both numbers, always. The license alone reads as the whole price, and a monthly
          somebody only meets on the Stripe page is the kind of surprise that becomes a
          chargeback rather than a customer. */}
      <p style={{ margin: "14px 0 0", fontWeight: 800, fontSize: 20, color: TX }}>{tier.priceLabel}</p>
      <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 7 }}>
        {tier.includes.map((line) => (
          <li key={line} style={{ display: "flex", gap: 8, fontSize: 13, color: TXM, lineHeight: 1.5 }}>
            <span aria-hidden style={{ color: R, fontWeight: 800, flexShrink: 0 }}>✓</span>
            {line}
          </li>
        ))}
      </ul>
    </button>
  );
}

function Paywall({ gate, onBack }: { gate: GateData; onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  // Pre-selected rather than blank. A picker with nothing chosen adds a decision before the
  // decision, and the default is the tier we steer to anyway.
  const [tierId, setTierId] = useState<LicenseTierId>(DEFAULT_LICENSE_TIER);
  const tier = resolveLicenseTier(tierId);

  const go = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/onboard/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first: gate.first,
          last: gate.last,
          email: gate.email,
          phone: gate.phone,
          tier: tierId,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.url) {
        throw new Error(body?.error?.message || "We could not start checkout. Please try again.");
      }
      window.location.href = body.url as string;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "We could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <div style={{ background: `radial-gradient(ellipse 80% 50% at 50% -5%,rgba(215,43,43,0.14) 0%,transparent 70%),${SRF}`, borderBottom: `1px solid ${BDR}`, padding: "48px 32px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 16px", color: TX }}>
          Let&apos;s Make It <span style={{ color: R }}>Yours.</span>
        </h1>
        <p style={{ fontSize: 15, color: TXM, maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>
          We do not sell an off-the-shelf bot. We build one around your business, and the
          questionnaire that follows is what we build from.
        </p>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 760, background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "clamp(24px, 5vw, 36px) clamp(18px, 5vw, 40px)", position: "relative", overflow: "visible" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${R},transparent)`, opacity: 0.6, borderRadius: "12px 12px 0 0" }} />

          {/* Two ways to buy the same agent. Wraps to a single column under ~600px, where two
              cards side by side would each be too narrow to read the includes list in. */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 6 }}>
            {LICENSE_TIERS.map((t) => (
              <TierCard
                key={t.id}
                tier={t}
                selected={t.id === tierId}
                disabled={loading}
                onSelect={() => setTierId(t.id)}
              />
            ))}
          </div>

          {/* Said once, under both, because it is identical on both. Repeating it inside each
              card would read as a difference between them. */}
          <p style={{ fontSize: 13, color: TXD, lineHeight: 1.6, margin: "18px 0 0" }}>
            The $189/mo covers managed hosting - we run it, patch it and keep it online - and
            includes $25/mo of token usage. Same on either tier. Cancel the hosting whenever you
            like; the license is yours to keep.
          </p>
          <p style={{ fontSize: 13, color: TXD, lineHeight: 1.6, margin: "10px 0 0" }}>
            Billed securely through Stripe. Your account is created the moment payment clears,
            and we will email you a link to set your password.
          </p>

          {err && <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 6, background: "rgba(215,43,43,0.1)", border: `1px solid rgba(215,43,43,0.3)`, fontSize: 13, color: "#dc2626" }}>{err}</div>}

          <button type="button" onClick={go} disabled={loading} style={{ width: "100%", marginTop: 24, background: R, color: "#fff", fontFamily: "inherit", fontWeight: 800, fontSize: 15, padding: "15px", borderRadius: 6, border: "none", cursor: loading ? "default" : "pointer", opacity: loading ? 0.75 : 1, letterSpacing: "0.01em" }}>
            {loading ? "Taking you to checkout…" : `Continue with ${tier.label} - ${tier.priceLabel} →`}
          </button>
          <button type="button" onClick={onBack} disabled={loading} style={{ width: "100%", marginTop: 10, background: "transparent", border: "none", color: TXD, fontFamily: "inherit", fontSize: 13, padding: "8px", cursor: loading ? "default" : "pointer" }}>
            ← Back
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: TXD, marginTop: 14, lineHeight: 1.6 }}>
            Running it on your own hardware instead, or need something bespoke?{" "}
            <a href="/contact" style={{ color: TXM, fontWeight: 600 }}>Talk to us first</a> - that
            is a different conversation and we will set it up for you.
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CONFIRMATION (lead mode, back from Stripe)
// ════════════════════════════════════════════════════════════
// Someone has just spent $449 or $2,500. Dropping them straight into a form with no acknowledgement
// reads as though the payment went nowhere, so this marks the moment before the
// questionnaire starts.
//
// The amount is read back from the checkout session rather than printed from the catalog,
// because a promotion code means the two disagree, and a wrong number on a payment
// confirmation is exactly the thing that generates a worried email. This is not the receipt
// — Stripe emails that — and the copy says so.
function PaymentConfirmation({ sessionId, email, onContinue }: { sessionId?: string; email?: string; onContinue: () => void }) {
  const [detail, setDetail] = useState<{ amountTotal: number | null; currency: string | null; email: string | null } | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    fetch(`/api/onboard/session?id=${encodeURIComponent(sessionId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setDetail({ amountTotal: d.amountTotal ?? null, currency: d.currency ?? null, email: d.email ?? null });
      })
      .catch(() => {
        // The payment happened either way. Failing to read it back must not strand anyone
        // on this screen, so the amount line simply does not appear.
      });
    return () => { cancelled = true; };
  }, [sessionId]);

  const total =
    detail?.amountTotal != null
      ? `$${(detail.amountTotal / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : null;
  const shownEmail = detail?.email || email || "";

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 60, borderBottom: `1px solid ${BDR}`, background: "rgba(250,250,247,0.97)" }}>
        <ApolloWordmark size={17} />
        <span style={{ fontSize: 12, color: TXM }}>Order Confirmed</span>
      </nav>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: `radial-gradient(ellipse 80% 50% at 50% -5%,rgba(215,43,43,0.14) 0%,transparent 70%)` }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${R}`, background: "rgba(215,43,43,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 0 26px" }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13.5L10 18.5L21 8" stroke={R} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>

        <h1 style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px", textAlign: "center" }}>
          Payment Received.<br /><span style={{ color: R }}>Welcome aboard.</span>
        </h1>

        <div style={{ width: "100%", maxWidth: 460, background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "22px 26px", margin: "18px 0 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "8px 0", fontSize: 14 }}>
            <span style={{ color: TXD }}>Agent License</span>
            <span style={{ fontWeight: 700 }}>one time</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "8px 0", fontSize: 14, borderBottom: total ? `1px solid ${BDR}` : "none" }}>
            <span style={{ color: TXD }}>Managed Hosting</span>
            <span style={{ fontWeight: 700 }}>$189 / month</span>
          </div>
          {total && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "14px 0 4px", fontSize: 15 }}>
              <span style={{ fontWeight: 700 }}>Charged today</span>
              <span style={{ fontWeight: 800 }}>{total}</span>
            </div>
          )}
          {shownEmail && (
            <p style={{ margin: "14px 0 0", fontSize: 12, color: TXD, lineHeight: 1.6 }}>
              Your receipt and a link to set your password are on their way to{" "}
              <strong style={{ color: TXM }}>{shownEmail}</strong>.
            </p>
          )}
        </div>

        <p style={{ fontSize: 15, color: TXM, maxWidth: 520, margin: "0 auto 30px", lineHeight: 1.65, textAlign: "center" }}>
          Next, the part that actually shapes what we build. Tell us about your business so
          your agent starts day one already knowing it.
        </p>

        <button type="button" onClick={onContinue} style={{ background: R, color: "#fff", fontFamily: "inherit", fontWeight: 800, fontSize: 16, padding: "16px 44px", borderRadius: 8, border: "none", cursor: "pointer", letterSpacing: "0.01em" }}>
          Continue to the Questions →
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAYMENT SPLASH (customer mode, fresh from Stripe checkout)
// ════════════════════════════════════════════════════════════
function PaymentSplash({ agentLabel, onStart }: { agentLabel: string; onStart: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 60, borderBottom: `1px solid ${BDR}`, background: "rgba(250,250,247,0.97)" }}>
        <ApolloWordmark size={17} />
        <span style={{ fontSize: 12, color: TXM }}>{agentLabel} Setup</span>
      </nav>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center", background: `radial-gradient(ellipse 80% 50% at 50% -5%,rgba(215,43,43,0.14) 0%,transparent 70%)` }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${R}`, background: "rgba(215,43,43,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 0 26px" }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13.5L10 18.5L21 8" stroke={R} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h1 style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 16px" }}>
          Payment Received.<br /><span style={{ color: R }}>Your {agentLabel} is ready to be built.</span>
        </h1>
        <p style={{ fontSize: 15, color: TXM, maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.65 }}>
          Next, tell us about your business so your agent starts day one already knowing you.
        </p>
        <button type="button" onClick={onStart} style={{ background: R, color: "#fff", fontFamily: "inherit", fontWeight: 800, fontSize: 16, padding: "16px 44px", borderRadius: 8, border: "none", cursor: "pointer", letterSpacing: "0.01em" }}>
          Click Here to Get Started →
        </button>
      </div>
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// BUSINESS TRACK
// ════════════════════════════════════════════════════════════
const GROWTH_BOTTLENECK = ["Me - my time and attention are the ceiling","My team - capacity, skills, or hiring","My systems & processes - too much is manual","Demand - not enough qualified pipeline","Capital - funding constrains the next move","Not sure - that's part of why I'm here","Other"];

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
        if (f.type === "multiselect") {
          const otherKey = `${f.key}_other`;
          const otherVal = values[otherKey];
          return (
            <Fragment key={f.key}>
              <CheckGroup label={f.label} required={f.required} hint={f.helper ?? "Select all that apply"} options={f.options ?? []} value={arr} onChange={v => onChange(f.key, v)} cols={2} />
              {arr.includes("Other") && (
                <FF label="Please specify">
                  <TInput value={typeof otherVal === "string" ? otherVal : ""} onChange={v => onChange(otherKey, v)} placeholder="Tell us more" />
                </FF>
              )}
            </Fragment>
          );
        }
        if (f.type === "radio") return <RadioGroup key={f.key} label={f.label} hint={f.helper} options={f.options ?? []} value={str} onChange={v => onChange(f.key, v)} />;
        if (f.type === "scale") return <ScaleRow key={f.key} label={f.label} low="Low" high="High" value={str ? Number(str) : null} onChange={v => onChange(f.key, String(v))} />;
        if (f.type === "textarea") return <FF key={f.key} label={f.label} required={f.required} hint={f.helper}><TArea value={str} onChange={v => onChange(f.key, v)} placeholder={f.placeholder} rows={3} /></FF>;
        return <FF key={f.key} label={f.label} required={f.required} hint={f.helper}><TInput value={str} onChange={v => onChange(f.key, v)} placeholder={f.placeholder} /></FF>;
      })}
    </Stack>
  );
}
// Read a File into a base64 string (no data: prefix) for JSON upload.
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
function BizTrack({ gate, submitLabel, onDone, onExit }: { gate: GateData; submitLabel: string; onDone: (data: Record<string, unknown>, track: string) => void; onExit?: () => void }) {
  const [step, setStep] = useState(0);
  const [s2, setS2] = useState({ biz: "", url: "", industry: "", size: "", revenue: "", age: "", model: "", crm: [] as string[], crmOther: "", ecom: [] as string[], ecomOther: "", comms: [] as string[], commsOther: "", pm: [] as string[], pmOther: "", billing: [] as string[], billingOther: "", mktg: [] as string[], auto: [] as string[], autoOther: "", support: [] as string[], supportOther: "", webplat: "", desc: "", differentiate: "", web_presence: "" });
  const [s3, setS3] = useState({ pain: "", depts: [] as string[], hours: "", duration: "", hate: "", tried: [] as string[], costImpact: "", opsVolume: "" });
  const [s4, setS4] = useState({ marital: "", partnerName: "", kids: "", kidsDetails: "", household: "", kidsAges: [] as string[], caretaking: [] as string[], homeLife: "", protect: [] as string[], lifeStage: "", timeline3yr: [] as string[], personalGoal: "" });
  const [s5, setS5] = useState({ decStyle: [] as string[], stressResp: "", motivators: [] as string[], blockers: [] as string[], moneyMind: "", agencyHist: "", techTrust: null as number | null, controlComfort: null as number | null, worthIt: "", strategicBet: "", growthBottleneck: [] as string[] });
  const [s6, setS6] = useState({ tone: [] as string[], writingComf: "", brandLike: "", brandLikeOther: "", voiceDesc: "", voiceStyle: [] as string[], loveWords: "", hateWords: "", socialActive: "", platforms: [] as string[], sample: "" });
  const [s7, setS7] = useState({ goals: [] as string[], metric: [] as string[], metricOther: "", prior: "", past: "", aiThoughts: "", aiStartup: "", teamSent: "", horizon3: "", horizon6: "", horizon12: "" });
  const [s8, setS8] = useState({ hosting: [] as string[], os: "", security: [] as string[], data: [] as string[], comply: [] as string[], budget: "", timeline: "", engagement: "", internalTech: "", itInvolved: "", constraints: "", decisionAuthority: "", agree: false });
  const [keyPeople, setKeyPeople] = useState<KeyPerson[]>([{ name: "", role: "" }]);
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
  // The step order, and it MUST match allPages below. Checked at the bottom of this component
  // rather than trusted.
  //
  // These two drifted the moment two pages were added - Your Writing and What It Should Do -
  // without this list. Nothing errored. validate() silently began reading the wrong key for
  // every step past the insert, and next() caps the step at pageKeys.length - 1, so the
  // questionnaire simply STOPPED ADVANCING at index 9: Continue did nothing, and said nothing
  // about why. Which page you got stuck on depended on the industry branch.
  //
  // It stays a literal because the handlers below close over it and allPages is built from
  // state further down; the assertion is what makes the duplication safe.
  const pageKeys = ["biz", "whatyoudo", "exec", ...(branch ? ["industry"] : []), "stack", "ops", "life", "voice", "sample", "goals", "scopeai", "horizon", "scope"];
  const f2 = (k: string, v: unknown) => setS2(p => ({ ...p, [k]: v }));
  const f3 = (k: string, v: unknown) => setS3(p => ({ ...p, [k]: v }));
  const f4 = (k: string, v: unknown) => setS4(p => ({ ...p, [k]: v }));
  const f5 = (k: string, v: unknown) => setS5(p => ({ ...p, [k]: v }));
  const f6 = (k: string, v: unknown) => setS6(p => ({ ...p, [k]: v }));
  const f7 = (k: string, v: unknown) => setS7(p => ({ ...p, [k]: v }));
  const f8 = (k: string, v: unknown) => setS8(p => ({ ...p, [k]: v }));
  const buildData = () => ({ firstName: gate.first, lastName: gate.last, email: gate.email, phone: gate.phone, companies, primaryCompanyIndex: primaryIndex, portfolio, industryDetails, contactMethod: "", bestTime: "", linkedin: gate.linkedin, companyName: primaryCompany?.name || gate.company || s2.biz, primaryRole: (primaryCompany?.role === "Other" ? primaryCompany?.roleOther : primaryCompany?.role) || "", primaryOwnership: primaryCompany?.ownership || "", website: s2.web_presence || s2.url, webPresence: s2.web_presence, industry: primaryCompany?.industry || s2.industry, companySize: s2.size, revenue: s2.revenue, businessAge: s2.age, keyPeople: keyPeople.filter(p => p.name.trim() || p.role.trim()), businessModel: s2.model, businessDescription: s2.desc, differentiator: s2.differentiate, webPlatform: s2.webplat, crmTools: s2.crm, crmToolsOther: s2.crmOther, ecomTools: s2.ecom, commsTools: s2.comms, pmTools: s2.pm, billingTools: s2.billing, mktgTools: s2.mktg, autoTools: s2.auto, supportTools: s2.support, mainPain: s3.pain, brokenAreas: s3.depts, manualHours: s3.hours, opsVolume: s3.opsVolume, painDuration: s3.duration, hatedTasks: s3.hate, triedBefore: s3.tried, costImpact: s3.costImpact, maritalStatus: s4.marital, partnerName: s4.partnerName, children: s4.kids, childrenDetails: s4.kidsDetails, household: s4.household, childrenAges: s4.kidsAges, caretaking: s4.caretaking, homeLife: s4.homeLife, protecting: s4.protect, lifeStage: s4.lifeStage, threeYearGoals: s4.timeline3yr, personalGoal: s4.personalGoal, decisionStyle: s5.decStyle, stressResponse: s5.stressResp, motivators: s5.motivators, blockers: s5.blockers, moneyMindset: s5.moneyMind, agencyHistory: s5.agencyHist, techTrust: s5.techTrust, controlComfort: s5.controlComfort, worthIt: s5.worthIt, strategicBet: s5.strategicBet, growthBottleneck: s5.growthBottleneck, writingTone: s6.tone, writingComfort: s6.writingComf, brandVoiceLike: s6.brandLike, brandVoiceLikeOther: s6.brandLikeOther, voiceDescription: s6.voiceStyle, loveWords: s6.loveWords, hateWords: s6.hateWords, socialPresence: s6.socialActive, platforms: s6.platforms, writingSample: s6.sample, aiGoals: s7.goals, successMetric: s7.metric, successMetricOther: s7.metricOther, priorAI: s7.prior, pastExperience: s7.past, aiThoughts: s7.aiThoughts, aiStartup: s7.aiStartup, teamSentiment: s7.teamSent, horizon3Months: s7.horizon3, horizon6Months: s7.horizon6, horizon12Months: s7.horizon12, hosting: s8.hosting, os: s8.os, securityMeasures: s8.security, dataTypes: s8.data, compliance: s8.comply, budgetRange: s8.budget, budget: s8.budget, timeline: s8.timeline, decisionAuthority: s8.decisionAuthority, engagement: s8.engagement, internalTech: s8.internalTech, constraints: s8.constraints });
  const validate = (key?: string): string => {
    if (key === "biz") {
      const p = companies[primaryIndex] || companies[0];
      if (!p?.name?.trim() || !p?.industry || !p?.role) return "Please fill in the primary business name, industry, and your role.";
      if (p.industry === "Other" && !p.industryOther?.trim()) return "Please tell us the primary business industry.";
      if (p.role === "Other" && !p.roleOther?.trim()) return "Please tell us your role.";
      // No ownership check: the field it guarded has been removed, and leaving this would
      // block every submission on a question nobody can answer any more.
      for (const c of companies) { if (c.name.trim() && !c.industry) return "Each business you add needs an industry."; }
      if (companies.length > 1) {
        if (!companies[primaryIndex]?.name) return "Please choose which business your agent should focus on first.";
        if (!portfolio.structure || !portfolio.sharedOps) return "Please tell us how the businesses are connected and whether they share operations.";
      }
      if (!s2.web_presence.trim()) return "Please add a website.";
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
    return "";
  };
  const next = () => {
    const err = validate(pageKeys[step]);
    if (err) { setVErr(err); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setVErr("");
    setStep(s => Math.min(s + 1, pageKeys.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // Step 0 has nowhere to go WITHIN the questionnaire, so it hands off to onExit — the screen
  // the form was entered from. Only wired where that screen can be returned to without losing
  // what was typed on it (see the call site); elsewhere step 0 keeps no Back at all.
  const back = () => {
    setVErr("");
    if (step === 0) { onExit?.(); return; }
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submit = async () => {
    const err = validate(pageKeys[step]);
    if (err) { setVErr(err); return; }
    if (!s8.agree) { setAgreeErr(true); return; }
    setAgreeErr(false);
    let uploadedFiles: unknown[] = [];
    try { uploadedFiles = await Promise.all(files.map(readFileAsBase64)); } catch { uploadedFiles = []; }
    onDone({ ...buildData(), uploadedFiles }, "business");
  };
  // brandLike predates the switch to a multi-select and still initialises as "", so older
  // in-flight state can be either shape. Normalised once here rather than at each use.
  const brandLike = Array.isArray(s6.brandLike) ? s6.brandLike : (s6.brandLike ? [s6.brandLike] : []);
  const allPages: { key: string; label: string; node: React.ReactNode }[] = [
    { key: "biz", label: "Your Business", node: (
    <Stack key="s2a">
      <SHead stepNum={1} total={0} title="Your Business" subtitle="Tell us about the business, or businesses, behind this." badge="Business" />
      <CompanyRepeater companies={companies} onCompaniesChange={setCompanies} primaryIndex={primaryIndex} onPrimaryChange={setPrimaryIndex} portfolio={portfolio} onPortfolioChange={setPortfolio} />
      <FF label="Website" required><TInput value={s2.web_presence} onChange={v => f2("web_presence", v)} placeholder="yourcompany.com" /></FF>
      <Row2><FF label="Team Size"><TSelect value={s2.size} onChange={v => f2("size", v)} options={BIZ_SIZES} /></FF><FF label="Monthly Revenue"><TSelect value={s2.revenue} onChange={v => f2("revenue", v)} options={REVENUE} /></FF></Row2>
      {/* Business Model sat beside this and is gone at David's call. Service-based vs product
          vs SaaS is the kind of self-classification people stall on when their business is two
          of them, and the answers below - what you sell, what is broken, which tools you run -
          say it more accurately than the label would. s2.model stays in state and in the
          payload as an empty string; nothing reads it to decide anything. */}
      <Row2><FF label="Years in Business"><TSelect value={s2.age} onChange={v => f2("age", v)} options={BIZ_AGE} /></FF></Row2>
      <KeyPeople people={keyPeople} onChange={setKeyPeople} />
    </Stack>
    ) },
    { key: "whatyoudo", label: "What You Do", node: (
    <Stack key="s2b">
      <SHead stepNum={2} total={0} title="What Do You Do?" subtitle="Who you serve, what you deliver, and the edge that wins you business." badge="Business" />
      <FF label="Describe your business" required hint="Who do you serve, and what do you deliver for them?"><TArea value={s2.desc} onChange={v => f2("desc", v)} placeholder="We help [who] do [what] by [how]..." rows={7} /></FF>
      <FF label="What makes you different?" hint="Why clients choose you over the alternatives - your real edge."><TArea value={s2.differentiate} onChange={v => f2("differentiate", v)} placeholder="e.g. We're the only firm in the region that..., our turnaround is 3x faster, we own a proprietary process..." rows={3} /></FF>
    </Stack>
    ) },
    // Moved up to sit directly after What You Do, at David's call. Describing the business and
    // then immediately saying where you want it to go is one thought; asking for it four pages
    // later, after tooling and pain points, made it read as an afterthought when it is the
    // question the whole build is aimed at.
    { key: "exec", label: "Executive Profile", node: (
    <Stack key="s5exec">
      <SHead stepNum={5} total={0} title={`Executive Profile for ${primaryName}`} subtitle="The strategic picture - how you think, where you're stuck, and what a win is worth." badge="Business" />
      <FF label="What's your biggest goal or priority for the next 12 months?"><TArea value={s5.strategicBet} onChange={v => f5("strategicBet", v)} placeholder="The move that matters most - a new market, a product, a key hire, more revenue, an acquisition..." rows={3} /></FF>
      <CheckGroup label="Where's the real bottleneck to growth right now?" hint="Select all that apply" options={GROWTH_BOTTLENECK} value={s5.growthBottleneck} onChange={v => f5("growthBottleneck", v)} cols={2} split />
      {/* Moved here from Your Voice at David's call, and it reads as an oversight corrected:
          how you weigh a decision belongs beside your goal and your bottleneck, not beside
          your tone of voice. It also governs how much the agent decides alone versus brings
          to you, which is an executive question. */}
      <CheckGroup label="How do you make big decisions?" hint="Select all that apply" options={DECISION_STYLE} value={s5.decStyle} onChange={v => f5("decStyle", v)} cols={2} split />
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
      {/* Moved here from Final Details at David's call. Who can touch the stack after launch is
          a fact about the stack, and asking it beside the tools it applies to gets a truer
          answer than asking it on the last page beside compliance and a file upload. */}
      <Divider label="After Launch" />
      <FF label="Internal technical resources after launch"><TSelect value={s8.internalTech} onChange={v => f8("internalTech", v)} options={INTERNAL_TECH} /></FF>
    </Stack>
    ) },
    { key: "ops", label: "Operations", node: (
    <Stack key="s3">
      <SHead stepNum={4} total={0} title={`Operations & Pain Points for ${primaryName}`} subtitle="Be direct. The clearer the problem, the better we can architect the fix." badge="Business" />
      <FF label="Your biggest operational headache right now"><TArea value={s3.pain} onChange={v => f3("pain", v)} placeholder="Walk us through a typical bad day. What breaks, what falls through the cracks?" rows={4} /></FF>
      <CheckGroup label="Which areas feel most broken?" hint="Select all that apply" options={BROKEN_AREAS} value={s3.depts} onChange={v => f3("depts", v)} cols={2} />
      {/* "Hours lost to administrative tasks each week" and "What's this costing the business?"
          sat here and are gone at David's call. Both asked for a number nobody has: the hours
          are spread across a dozen small tasks and the cost is a guess on top of that guess, so
          the answer was a shrug picked from a dropdown. The headache box and the broken-areas
          list above say the same thing in terms the customer can actually be sure of.
          s3.hours and s3.costImpact stay in state and in the payload as empty strings; nothing
          reads them to decide anything. */}
      {/* "Rough weekly volume on your busiest workflow" was here and is gone at David's
          call. It asked somebody to pick their busiest workflow and then estimate it, which
          is two judgements before an answer, and the industry branches that care about
          volume ask it in their own terms - patients per week, active clients, order count.
          branchHasVolume existed only to stop this duplicating those. */}
    </Stack>
    ) },
    { key: "life", label: "Life Context", node: (
    <Stack key="s4">
      <SHead stepNum={6} total={0} title="Life Context (Optional)" subtitle="A little context on your life helps us build something that fits it. Skip if you'd rather not." badge="Business" />
      <button type="button" onClick={next} style={{ alignSelf: "flex-start", background: "transparent", border: `1px solid ${BDR}`, color: TXM, fontFamily: "inherit", fontWeight: 600, fontSize: 13, padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>Skip this step →</button>
      <FF label="Relationship status"><TSelect value={s4.marital} onChange={v => f4("marital", v)} options={MARITAL} /></FF>

      {/* The family, by name.
          `kids` and `kidsAges` have been in state and in the payload all along with no UI to
          fill them, so children have never actually been asked - the fields only ever arrived
          empty.

          Names matter more than counts here. An agent that knows your wife is Maria and your
          daughter is eight can write "Maria's birthday" into a calendar entry and understand
          why Thursday at four is not a good time. A number cannot do any of that.

          NAMES AND AGES TOGETHER, in one field, rather than the two separate lists David listed.
          Two parallel lists cannot be matched up - "Emma, Jack" beside "8, 14" leaves the agent
          guessing which is which, and gets it wrong half the time. One line each pairs them
          unambiguously.

          All optional, on a step that already says "Optional" and carries a Skip button. This is
          the most personal information the questionnaire asks for, and nobody should have to
          name their children to get past a form. */}
      <FF label="Partner or spouse's name" hint="So your agent can use it rather than say 'your partner'.">
        <TInput value={s4.partnerName} onChange={v => f4("partnerName", v)} placeholder="First name is enough" />
      </FF>
      <FF label="Children"><TSelect value={s4.kids} onChange={v => f4("kids", v)} options={KIDS_COUNT} /></FF>
      {s4.kids && s4.kids !== "None" && (
        <FF label="Their names and ages" hint="One per line. Ages are useful for school runs, holidays and what counts as an interruption.">
          <TArea value={s4.kidsDetails} onChange={v => f4("kidsDetails", v)} placeholder={"Emma, 8\nJack, 14"} rows={3} />
        </FF>
      )}
      <FF label="Anyone else your agent should know about?" hint="Anyone whose name comes up in your week - a parent you care for, a business partner, an assistant, a dog.">
        <TArea value={s4.household} onChange={v => f4("household", v)} placeholder="e.g. My mother Anne, who I drive to appointments on Tuesdays. Our office manager Priya." rows={2} />
      </FF>

      <RadioGroup label="Where are you in your business journey?" options={LIFE_STAGE} value={s4.lifeStage} onChange={v => f4("lifeStage", v)} />

      {/* Both three-year questions removed at David's call.
          "What do you want your business to do for you in 3 years?" offered a list of owner
          answers - sell it, run without me, pay me more - which assumes the person filling this
          in owns the place. Under seats they often will not: a colleague answering for their own
          agent has no view on what the business does for them in three years, and being asked
          reads as a form written for somebody else.
          "Your personal 3-year vision" went with it. Three years is further out than anyone can
          answer usefully on a signup form, and the three/six/twelve month horizons in Goals now
          ask the same thing at a range people can actually see. */}
    </Stack>
    ) },
    { key: "voice", label: "Your Voice", node: (
    <Stack key="s6voice">
      <SHead stepNum={7} total={0} title="Your Voice" subtitle="AI that sounds like you is the goal. Help us capture how you communicate." badge="Business" />
      {/* Multi-select for real. It said "Select all that apply" and then kept only the last
          box pressed - v[v.length-1] - so ticking a second silently cleared the first.
          Nobody has one tone: direct with a supplier and warm with a client is the normal
          case, and that spread is the useful thing to know. */}
      <CheckGroup label="Your natural tone" hint="Select all that apply" options={WRITING_TONE} value={s6.tone} onChange={v => f6("tone", v)} cols={2} />
      <CheckGroup label="Describe your ideal voice" hint="Select all that apply" options={["Confident, not arrogant","Clear and direct","Warm and personable","Professional and polished","Casual and conversational","Bold and punchy","Empathetic and supportive","Witty and clever","Never corporate or stiff"]} value={s6.voiceStyle} onChange={v => f6("voiceStyle", v)} cols={2} />
      <CheckGroup label="Whose voice do you sound most like?" hint="Pick up to 3" split options={BRAND_LIKE} value={brandLike} onChange={v => f6("brandLike", v.slice(-3))} cols={2} />
      {/* The list is twelve names long and still misses most people. "Other" without somewhere
          to type is the one answer that tells the agent nothing, so it opens a write-in. */}
      {brandLike.includes("Other") && (
        <FF label="Please specify" hint="A person, brand, or publication whose writing you'd want yours to read like.">
          <TInput value={s6.brandLikeOther} onChange={v => f6("brandLikeOther", v)} placeholder="Someone whose writing sounds the way you want to sound" />
        </FF>
      )}
    </Stack>
    ) },
    // Its own page, at David's call, and it earns one. Every other voice question is a box to
    // tick; this is the only one that asks for real writing, and a 4-row textarea at the bottom
    // of a screen full of checkboxes reads as an afterthought people scroll past. It is also by
    // far the most useful answer here: a paragraph somebody actually wrote teaches the agent more
    // about their voice than every checkbox above it combined.
    { key: "sample", label: "Your Writing", node: (
    <Stack key="s6sample">
      <SHead stepNum={8} total={0} title="Share a sample of your writing" subtitle="The single most useful thing on this form. One real paragraph you wrote teaches your agent more than any list of adjectives." badge="Business" />
      <FF label="Paste anything you have written" hint="An email, your LinkedIn About section, a proposal, even a long Slack message.">
        <TArea value={s6.sample} onChange={v => f6("sample", v)} placeholder="Paste it here. Longer is better - a few paragraphs beats a few lines, and rough beats polished. Your agent is learning how you actually write, not how you write when you know you are being read." rows={10} />
      </FF>

      {/* Or drop files instead of typing, at David's call.
          Most people have not got a paragraph ready to paste, but everybody has sent an email or
          written a proposal - and asking them to find one, open it, and copy it out is three
          steps at which they give up and leave the box empty. Dragging two documents in is one.

          The SAME FileUpload and the same `files` state the materials step uses, deliberately:
          both end up in the one uploadedFiles array on submit, so there is a single path to the
          server, a single size cap, and no second half-copy of this to drift. */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0" }}>
        <span style={{ flex: 1, height: 1, background: BDR }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TXD }}>Or drop files in</span>
        <span style={{ flex: 1, height: 1, background: BDR }} />
      </div>
      <FF label="Upload writing instead" hint="Emails, proposals, memos, a blog post, anything you wrote. They go in with your other materials.">
        <FileUpload files={files} onFiles={setFiles} />
      </FF>

      <p style={{ fontSize: 12, color: TXD, lineHeight: 1.6, margin: 0 }}>
        Either way, pick something you did not labour over. A quick reply to a client says more
        about your voice than anything you edited five times.
      </p>
    </Stack>
    ) },
    { key: "goals", label: "Goals & AI", node: (
    <Stack key="s7">
      {/* Reordered at David's call, and the new order tells a story the old one did not: what
          you have tried, how the room feels about it, how far you trust it. Each answer sets up
          the next, and all three are about READINESS. "What should it do" is a different
          question and now gets its own page. */}
      <SHead stepNum={8} total={0} title="Where You Are With AI" subtitle="What you have tried, how your team feels, and how much you want it deciding on its own." badge="Business" />
      <RadioGroup label="Have you tried AI or automation before?" options={["Yes","No"]} value={s7.prior} onChange={v => f7("prior", v)} />
      {s7.prior === "Yes" && (
        <>
          <FF label="What did you use? Which programs or tools?"><TArea value={s7.past} onChange={v => f7("past", v)} placeholder="e.g. ChatGPT for content, a Zapier automation for leads, a hired dev who built a bot..." rows={2} /></FF>
          <FF label="What did you and/or your team think about it?"><TArea value={s7.aiThoughts} onChange={v => f7("aiThoughts", v)} placeholder="What worked, what fell short, how the team felt about it." rows={2} /></FF>
          <FF label="How was the implementation / startup?"><TArea value={s7.aiStartup} onChange={v => f7("aiStartup", v)} placeholder="How smooth or rough was getting it set up and adopted?" rows={2} /></FF>
        </>
      )}
      <RadioGroup label="How does your team feel about implementing our new program?" options={TEAM_SENT} value={s7.teamSent} onChange={v => f7("teamSent", v)} />
      <ScaleRow label="How much do you trust technology to handle critical tasks?" low="Not at all - want humans involved" high="Fully - automate everything" value={s5.techTrust} onChange={v => f5("techTrust", v)} />
    </Stack>
    ) },
    // The page break David asked for. "What should it do" and "what does winning look like" are
    // the two questions that decide what gets built, and they were buried under the AI-history
    // block on a step that had grown to eight questions.
    { key: "scopeai", label: "What It Should Do", node: (
    <Stack key="s7scope">
      <SHead stepNum={9} total={0} title="What your agent should take on" subtitle="The work you want off your desk, and what a win looks like." badge="Business" />
      <CheckGroup label="What tasks would you like your agent to manage?" hint="Select all that apply" options={AI_GOALS} value={s7.goals} onChange={v => f7("goals", v)} cols={2} />
      {/* `split` removed at David's call. It bolded everything before the dash and greyed the
          rest, so "Save time" and "Increase revenue" shouted while the clause that carried the
          actual meaning receded. Plain sentences, read as written.
          Multi-select too: it kept only the last box despite saying "select all that apply",
          the same bug as the tone question - and most people want two or three of these. */}
      <CheckGroup label="What does winning look like?" hint="Select all that apply" options={SUCCESS_MET} value={s7.metric} onChange={v => f7("metric", v)} cols={2} />
      {s7.metric.includes("Something else") && (
        <FF label="Tell us what winning looks like" hint="In your words.">
          <TArea value={s7.metricOther} onChange={v => f7("metricOther", v)} placeholder="What would make this obviously worth it, six months from now?" rows={2} />
        </FF>
      )}
    </Stack>
    ) },
    // Its own page at David's call. It was a divider at the bottom of Where You Are With AI -
    // three open boxes arriving after five questions about the past, on a page somebody had
    // already decided they were finished with. The only forward-looking question in the
    // questionnaire deserves to be asked on its own.
    { key: "horizon", label: "Where This Is Going", node: (
    <Stack key="s7horizon">
      {/* Three horizons, three boxes, not one.
          Separate fields rather than one paragraph because that is what makes them usable
          later: dated intentions the agent can hold you to and check against, instead of a
          block of prose it can only quote back. Optional throughout - somebody who does not
          know yet should not be blocked, and a guess entered to get past a required field
          would be worse than an empty one. */}
      <SHead stepNum={9} total={0} title="Where This Is Going" subtitle="Where you see your agent and your organization at each point. Rough is fine - your agent uses these to tell whether things are on track, and you can change them any time." badge="Business" />
      {/* Placeholders are a rollout arc, at David's call: one team, then the company, then the
          business result. They set the scale of answer this wants - "second tier", "throughout
          the company" - which an example about a tidy inbox did not. */}
      <FF label="In three months"><TArea value={s7.horizon3} onChange={v => f7("horizon3", v)} placeholder="e.g. Deployed to a second tier of the team." rows={2} /></FF>
      <FF label="In six months"><TArea value={s7.horizon6} onChange={v => f7("horizon6", v)} placeholder="e.g. Deployment throughout the company." rows={2} /></FF>
      <FF label="In twelve months"><TArea value={s7.horizon12} onChange={v => f7("horizon12", v)} placeholder="e.g. Double the revenue with the same headcount, and the agent owns all first-line support." rows={2} /></FF>
    </Stack>
    ) },
    { key: "scope", label: "Scope", node: (
    <Stack key="s8">
      <SHead stepNum={9} total={0} title="Final Details" subtitle="A few last things so we can start building for you." badge="Business" />
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
  // The check that makes the duplication above safe. A page added without a key - or a key
  // without a page - is a questionnaire that quietly stops advancing partway through, which is
  // the worst kind of bug this form can have: the customer sees a Continue button that does
  // nothing. Loud in development, and never silent again.
  if (process.env.NODE_ENV !== "production") {
    const rendered = allPages.map((p) => p.key).join(",");
    const declared = pageKeys.join(",");
    if (rendered !== declared) {
      console.error(`[onboard] step order mismatch\n  pages:    ${rendered}\n  pageKeys: ${declared}`);
    }
  }

  const stepLabels = allPages.map(p => p.label);
  const cur = allPages[step] || allPages[allPages.length - 1];
  return <Shell steps={stepLabels} step={step} onBack={back} canBack={step > 0 || !!onExit} onNext={next} onSubmit={submit} isLast={step === allPages.length - 1} submitLabel={submitLabel}>{cur.node}{vErr && <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 6, background: "rgba(215,43,43,0.1)", border: `1px solid rgba(215,43,43,0.3)`, fontSize: 13, color: "#dc2626" }}>{vErr}</div>}</Shell>;
}
// ════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════
export type OnboardingFormMode = "lead" | "customer" | "whiteglove";

export interface OnboardingFormProps {
  mode: OnboardingFormMode;
  /** customer mode only */
  agentTypeId?: string;
  agentLabel?: string;
  workspaceId?: string;
  /** customer mode only: which agent this questionnaire is for, when there is more than one. */
  agent37Id?: string;
  justPaid?: boolean;
  /** Stripe checkout session id, from the success URL. Lead mode only. */
  sessionId?: string;
}

// Stripe takes the buyer off-site, so the "Start Here" answers have to survive a full page
// load to still be there when they come back. sessionStorage rather than localStorage: this
// is one sitting, and it should not outlive the tab. Nothing sensitive is stored — the same
// five contact fields they just typed, which are also on the Stripe session.
const GATE_STORAGE_KEY = "apolloclaw.onboard.gate";

const EMPTY_GATE: GateData = { first: "", last: "", email: "", phone: "", linkedin: "", company: "" };

// The three pieces useSyncExternalStore needs. The snapshot is the RAW string, not a parsed
// object: React compares snapshots with Object.is, and parsing here would hand it a fresh
// object every render and loop forever.
function readStoredGateRaw(): string | null {
  try {
    return window.sessionStorage.getItem(GATE_STORAGE_KEY);
  } catch {
    return null;
  }
}

// The server snapshot. There is no sessionStorage there, and saying so explicitly is what
// keeps the first client render identical to the server's.
function readNoStoredGate(): string | null {
  return null;
}

// sessionStorage fires no events for same-tab writes and we only read it once on the way
// back from Stripe, so there is nothing to subscribe to.
function subscribeNever(): () => void {
  return () => {};
}

function parseStoredGate(raw: string | null): GateData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<GateData>;
    // An email is the one field that makes the rest worth restoring.
    return parsed?.email ? { ...EMPTY_GATE, ...parsed } : null;
  } catch {
    return null;
  }
}

function writeStoredGate(gate: GateData): void {
  try {
    window.sessionStorage.setItem(GATE_STORAGE_KEY, JSON.stringify(gate));
  } catch {
    // Private browsing or a full quota. Losing this only costs them retyping five fields
    // after checkout, so it must never block the sale.
  }
}

function clearStoredGate(): void {
  try {
    window.sessionStorage.removeItem(GATE_STORAGE_KEY);
  } catch {
    // Nothing to do — see writeStoredGate.
  }
}

export default function OnboardingForm({ mode, agentTypeId, agentLabel, workspaceId, agent37Id, justPaid, sessionId }: OnboardingFormProps) {
  const isCustomer = mode === "customer";
  // White glove submits down the same unauthenticated /api/intake path as the plain lead
  // form. The difference is what it means: these people have already been sold, offline, so
  // the copy addresses them as clients and the submission is tagged so David can tell the two
  // apart in his inbox and CRM. When the licensing paywall lands on /onboard it goes between
  // the gate and the questionnaire, keyed on mode === "lead" — this mode is exempt by design,
  // which is the entire reason it exists.
  const isWhiteGlove = mode === "whiteglove";
  // THE PAYWALL IS BACK ON, as a choice between two tiers rather than the single $2,500 wall
  // it was. It was off for one deploy while David decided pricing.
  //
  // Payment is what gates provisioning, and that is the point of turning it back on. The
  // paywall is the only thing that reaches /api/onboard/complete, which stores the answers and
  // PROVISIONS THE AGENT while the Stripe webhook creates the account and sends the
  // set-your-password email. Provisioning spends real money on a VPS and API credits, so with
  // no checkout in front of it that endpoint is a bill anyone can run up. The alternative gate
  // we discussed - an invite code - would have made David the bottleneck on every signup,
  // including the ones that arrive at 3am, which is the opposite of what /onboard is for.
  //
  // Basic at $449 is what makes that gate acceptable rather than a wall: it is low enough to
  // buy without a conversation, so somebody can find the site and finish alone.
  //
  // Still a flag rather than an inlined `mode === "lead"`, because the reason to reach for it
  // again (a free tier, a trial) is a live possibility rather than a hypothetical.
  const PAYWALL_ENABLED = true;
  const isPaywalled = PAYWALL_ENABLED && mode === "lead";

  // Coming back from Stripe: `justPaid` is read from ?paid=1 on the SERVER and arrives as a
  // prop, while the answers themselves were stashed in sessionStorage before the redirect.
  //
  // The stash is read through useSyncExternalStore rather than a useState initializer,
  // because the server has no sessionStorage. An initializer would return null on the server
  // (rendering "Start Here") and the stored answers on the client (rendering the
  // questionnaire) — different DOM for the same render, which is a hydration error. This
  // hook hands React a server snapshot of null, so the first client render matches the
  // server's, and the stored value arrives on the render after.
  const storedGateRaw = useSyncExternalStore(subscribeNever, readStoredGateRaw, readNoStoredGate);
  const restored = justPaid ? parseStoredGate(storedGateRaw) : null;

  // `null` means "not chosen yet, use whatever the current state of the world implies".
  // Phase is DERIVED rather than seeded, so it can change when the stored value lands
  // without a setState in an effect. Any explicit setPhase from here on takes over.
  const [chosenPhase, setPhase] = useState<"splash" | "gate" | "paywall" | "confirm" | "personalize" | "form" | "submitting" | "done" | "building" | null>(null);
  const phase =
    chosenPhase ??
    (isCustomer && justPaid
      ? "splash"
      // Back from Stripe: acknowledge the payment before asking for anything else. What
      // follows the confirmation depends on whether the stash survived — normally straight
      // into "Your Business", the step the paywall was standing in front of, but back to
      // the five contact fields if they paid on another device. Either way the paywall is
      // skipped, since justPaid is what gates it.
      : justPaid
        ? "confirm"
        : "gate");

  const [enteredGate, setGate] = useState<GateData | null>(null);
  const gate = enteredGate ?? restored ?? EMPTY_GATE;
  const [personalize, setPersonalize] = useState<PersonalizeData>({ agentName: "", avatarFile: null, avatarPresetColor: null, avatarPresetImage: null });
  const [buildingWorkspaceId, setBuildingWorkspaceId] = useState<string | undefined>(workspaceId);
  // Naming/avatar is a paid-customer thing (matches The College Agent: personalization
  // happens post-payment, never on the free lead form).
  const handleGate = (info: GateData) => {
    setGate(info);
    if (isCustomer) return setPhase("personalize");
    // Persist before the paywall, because the next click leaves the site for Stripe.
    if (isPaywalled && !justPaid) {
      writeStoredGate(info);
      return setPhase("paywall");
    }
    // Already paid but arriving through the gate (they checked out on another device, so
    // the stashed answers were gone). Naming the agent still comes before the questions.
    if (isPaywalled && justPaid) return setPhase("personalize");
    setPhase("form");
  };
  const handlePersonalize = (d: PersonalizeData) => { setPersonalize(d); setPhase("form"); };
  const handleDone = async (data: Record<string, unknown>, trackType: string) => {
    setPhase("submitting");
    try {
      if (isCustomer) {
        let avatar_upload: Awaited<ReturnType<typeof readFileAsBase64>> | undefined;
        let avatar_preset: string | undefined;
        if (personalize.avatarFile) {
          try { avatar_upload = await readFileAsBase64(personalize.avatarFile); } catch { avatar_upload = undefined; }
        } else if (personalize.avatarPresetImage) {
          avatar_preset = personalize.avatarPresetImage;
        } else if (personalize.avatarPresetColor) {
          avatar_preset = initialsAvatarDataUri(personalize.agentName || agentLabel || "Agent", personalize.avatarPresetColor);
        }
        const res = await apiFetch<{ workspace_id?: string }>("/api/agent-setup", {
          method: "POST",
          body: JSON.stringify({
            workspace_id: workspaceId,
            agent37_id: agent37Id,
            agent_type: agentTypeId,
            answers: data,
            agent_name: personalize.agentName || undefined,
            avatar_upload,
            avatar_preset,
          }),
        });
        setBuildingWorkspaceId(workspaceId || res.workspace_id);
        setPhase("building");
        return;
      }
      // Paid license buyer: this is a build brief, not a lead. It goes to
      // /api/onboard/complete, which stores the answers, provisions the agent from them,
      // and writes them in as USER.md. Authorized by the paid Stripe session, since the
      // buyer has an account but has never signed in.
      //
      // A 409 means the Stripe webhook has not created their account yet — it fires in
      // parallel with the browser redirect, so a fast buyer really can arrive first. Retry
      // rather than fail: it resolves itself in seconds and their answers are already typed.
      if (isPaywalled && justPaid && sessionId) {
        let avatar_upload: Awaited<ReturnType<typeof readFileAsBase64>> | undefined;
        let avatar_preset: string | undefined;
        if (personalize.avatarFile) {
          try { avatar_upload = await readFileAsBase64(personalize.avatarFile); } catch { avatar_upload = undefined; }
        } else if (personalize.avatarPresetImage) {
          avatar_preset = personalize.avatarPresetImage;
        } else if (personalize.avatarPresetColor) {
          avatar_preset = initialsAvatarDataUri(personalize.agentName || "Agent", personalize.avatarPresetColor);
        }
        const payload = JSON.stringify({
          session_id: sessionId,
          answers: data,
          agent_name: personalize.agentName || undefined,
          avatar_upload,
          avatar_preset,
        });
        for (let attempt = 0; attempt < 6; attempt++) {
          const r = await fetch("/api/onboard/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
          });
          if (r.ok) {
            clearStoredGate();
            setPhase("building");
            return;
          }
          if (r.status !== 409) throw new Error("Submission failed");
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
        throw new Error("Submission failed");
      }

      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, trackType, leadSource: isWhiteGlove ? "white-glove" : "self-serve", paid: Boolean(justPaid) }),
      });
      if (!res.ok) throw new Error("Submission failed");
      // The questionnaire is in; the stashed contact details have done their job.
      clearStoredGate();
      setPhase("done");
    } catch (err) {
      console.error("Submission error:", err);
      setPhase("form");
      alert("Something went wrong submitting your application. Please try again.");
    }
  };
  if (phase === "splash") return <PaymentSplash agentLabel={agentLabel || "agent"} onStart={() => setPhase("gate")} />;
  if (phase === "gate") return (
    <Gatekeeper
      onPass={handleGate}
      initial={enteredGate ?? undefined}
      heading={isWhiteGlove ? <>Let&apos;s Build <span style={{ color: R }}>Your Agent.</span></> : undefined}
      intro={isWhiteGlove ? "Welcome. This is your onboarding form. Everything you tell us here goes straight into how your agent is built, so the more detail the better. Takes about 15 minutes, and the technical setup follows at the end." : undefined}
    />
  );
  if (phase === "paywall") return <Paywall gate={gate} onBack={() => setPhase("gate")} />;
  if (phase === "confirm") return (
    <PaymentConfirmation
      sessionId={sessionId}
      email={gate.email || undefined}
      onContinue={() => setPhase(restored ? "personalize" : "gate")}
    />
  );
  if (phase === "personalize") return <Personalize agentLabel={agentLabel || "agent"} onNext={handlePersonalize} />;
  if (phase === "submitting") return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 48, height: 48, border: `3px solid ${SRF2}`, borderTopColor: R, borderRadius: "50%", animation: "oc-spin 1s linear infinite", marginBottom: 24 }} />
      <h2 style={{ fontSize: 24, fontWeight: 900, color: TX, margin: "0 0 8px" }}>Submitting Your Application…</h2>
      <p style={{ fontSize: 14, color: TXM }}>This will only take a moment.</p>
      <style>{`@keyframes oc-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (phase === "building") return (
    <BuildScreen
      agentTypeId={agentTypeId || LICENSE_AGENT_TYPE_ID}
      agentLabel={personalize.agentName || agentLabel || "Agent"}
      workspaceId={buildingWorkspaceId}
      // License buyers have no session to poll the dashboard API with; the paid checkout
      // session authorizes their status reads instead.
      sessionId={isCustomer ? undefined : sessionId}
    />
  );
  if (phase === "done") return <Success nextStep={isWhiteGlove} />;
  // White glove is the only flow that reaches the questionnaire straight from the gate, so it
  // is the only one where "back" from step 0 has an unambiguous destination. The paid flows
  // arrive via Personalize, which holds an uploaded avatar this component cannot re-seed —
  // sending them back there would silently drop it, so they keep no Back on step 0.
  if (phase === "form") return <BizTrack gate={gate} submitLabel={isCustomer ? "Finish Setup →" : "Submit Application →"} onDone={handleDone} onExit={isWhiteGlove ? () => setPhase("gate") : undefined} />;
  return null;
}
