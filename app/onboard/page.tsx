"use client";
import { useState } from "react";
// ════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ════════════════════════════════════════════════════════════
const R = "#D72B2B";
const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const SRF2 = "#E8E7E3";
const BDR = "rgba(0,0,0,0.08)";
const TX = "#1A1A1A";
const TXM = "#555555";
const TXD = "#888888";
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
const HOW_HEARD = ["Google / Search","LinkedIn","Facebook / Instagram","YouTube","Podcast","Friend / Colleague referral","Client referral","Conference or event","Cold email / DM","Blog post / Article","Reddit","Twitter / X","Agency or partner","Other"];
const CONTACT_PREF = ["Email","Phone call","Text / SMS","Telegram","WhatsApp","Video call (Zoom/Meet)"];
const BEST_TIME    = ["Early morning (6–9am)","Morning (9am–12pm)","Early afternoon (12–3pm)","Late afternoon (3–6pm)","Evening (6–9pm)","Flexible / Anytime"];
const TIMEZONES    = ["Eastern (ET)","Central (CT)","Mountain (MT)","Pacific (PT)","Alaska (AKT)","Hawaii (HST)","GMT / London","CET / Europe","IST / India","AEST / Australia","Other"];
const INDUSTRIES   = ["E-commerce / Retail","Professional Services","Healthcare / Medical","Real Estate","SaaS / Software","Marketing / Ad Agency","Finance / Accounting / Legal","Hospitality / Food & Beverage","Education / Coaching","Manufacturing / Logistics","Construction / Trades","Non-profit","Consulting","Media / Entertainment","Other"];
const BIZ_SIZES    = ["Just me (Solo)","2–5 people","6–10 people","11–25 people","26–50 people","51–100 people","100+ people"];
const REVENUE      = ["Pre-revenue","Under $5k/mo","$5k–$10k/mo","$10k–$25k/mo","$25k–$50k/mo","$50k–$100k/mo","$100k–$250k/mo","$250k–$500k/mo","$500k+/mo","Prefer not to say"];
const BIZ_AGE      = ["Less than 6 months","6–12 months","1–2 years","2–5 years","5–10 years","10+ years"];
const BIZ_MODEL    = ["Service-based (sell time/expertise)","Physical product","SaaS / Digital product","Marketplace / Platform","Subscription / Membership","Hybrid (products + services)","Agency / Reseller","Franchise / Licensed model"];
const STACK_CRM    = ["Salesforce","HubSpot","Pipedrive","Zoho CRM","Microsoft Dynamics 365","Freshsales","SugarCRM","Insightly","Creatio","Bitrix24","Close","Copper","Nutshell","Keap","Salesflare","Pipeline CRM","Zoho Bigin","Less Annoying CRM","Capsule CRM","Vtiger","Nimble","Agile CRM","Streak","Folk","Attio","Affinity","EngageBay","Maximizer","SuiteCRM","No CRM currently","Other"];
const STACK_COMMS  = ["Google Workspace","Microsoft Office 365","Google Meet","Microsoft Teams","Granola","Zoom","Slack","Telegram","Discord","Loom","Fathom","Fireflies","Otter.ai","WhisperFlow","Other"];
const STACK_PM     = ["Notion","Asana","ClickUp","Trello","Monday.com","Basecamp","Jira","Linear","No PM tool","Other"];
const STACK_BILLING= [
  "QuickBooks Online","QuickBooks Desktop","Xero","FreshBooks","Wave","Sage Intacct","Oracle NetSuite","SAP S/4HANA","Microsoft Dynamics 365 Finance","Workday Financial Management",
  "Stripe","Square","PayPal","Braintree","Adyen","Authorize.net",
  "Bill.com","Tipalti","Coupa","Airbase","Ramp","Brex","Divvy / BILL Spend","Expensify","SAP Concur","Zip",
  "Chargebee","Recurly","Zuora","Avalara (tax compliance)",
  "None","Other"
];
const STACK_MKTG   = ["Mailchimp","Klaviyo","ConvertKit","ActiveCampaign","Drip","Constant Contact","Brevo","None","Other"];
const STACK_AUTO   = ["Zapier","Make (Integromat)","n8n","Pipedream","Power Automate","None","Other"];
const STACK_SUPPORT= ["Zendesk","Intercom","Freshdesk","Help Scout","Gorgias","Front","None","Other"];
const WEB_PLATFORM = ["WordPress / Divi","WordPress / Elementor","Shopify","Wix","Squarespace","Webflow","Framer","Custom-built","No website","Other"];
const IT_HOSTING   = ["Google Cloud (GCP)","Amazon Web Services (AWS)","Microsoft Azure","Shared hosting (GoDaddy, Bluehost, etc.)","VPS (DigitalOcean, Linode)","Dedicated server","On-premise / Self-hosted","All SaaS - no self-hosted infra","Not sure","Other"];
const IT_OS        = ["Windows PCs","Mac (Apple / macOS)","Linux","Chromebooks","iOS (iPhone / iPad)","Android","Mix of Windows and Mac","Remote / Virtual Desktops (VDI)","Other"];
const IT_SECURITY  = ["We have a dedicated IT team or MSP","We use a password manager","2FA is enabled everywhere","We have a VPN","We run regular backups","Basic antivirus only","No formal IT security","Not sure what we have"];
const IT_DATA      = ["Customer contact data","Credit card / payment info","Health / medical records","Legal documents","Employee records","Financial records","Proprietary IP / trade secrets","Nothing particularly sensitive"];
const IT_COMPLY    = ["HIPAA (healthcare)","PCI-DSS (payments)","GDPR (EU data)","CCPA (California)","SOC 2","None / Not applicable","Not sure","Multiple"];
const BROKEN_AREAS = ["Sales / Lead Generation","Customer Support / Service","Operations / Admin","Marketing & Content","Invoicing & Finance","Scheduling & Calendar","Hiring & HR","Reporting & Analytics","Order Fulfillment / Shipping","Email & Inbox","Team Communication","Vendor / Supplier Management","Project Management","Customer Onboarding","Contracts & Proposals"];
const HOURS_WASTED = ["Less than 5 hrs/wk","5–10 hrs/wk","10–20 hrs/wk","20–30 hrs/wk","30–40 hrs/wk","40+ hrs/wk (a full-time job)","Not sure - it's everywhere"];
const PAIN_DURATION= ["Under 3 months","3–6 months","6–12 months","1–2 years","2+ years","Since the business launched"];
const TRIED_BEFORE = ["Nothing - haven't addressed it yet","Hired employees to handle it","Tried software tools","Hired a consultant or agency","Built internal tools","Used basic AI (ChatGPT, etc.)","Multiple approaches - nothing worked","Currently patching it together"];
const COST_IMPACT  = ["Minor inconvenience","Moderate - costing real money","Significant - blocking growth","Critical - threatening the business","Unknown - hard to quantify"];
const MARITAL      = ["Single","In a relationship","Engaged","Married","Domestic partnership","Divorced / Separated","Widowed","Prefer not to say"];
const KIDS_COUNT   = ["No children","1 child","2 children","3 children","4+ children","Children are grown / adults","Expecting / planning for children"];
const CARETAKING   = ["No caregiving responsibilities","Caring for aging parent(s)","Caring for a family member with illness / disability","Young children at home","Shared custody arrangement","Multiple caregiving roles","Other"];
const HOME_LIFE    = ["I work from home full-time","I have a separate office outside the home","I split time between home and office","I travel frequently / location-independent","My family is involved in the business","Other"];
const LIFE_STAGE   = ["Building - early, grinding hard","Scaling - growing fast, feeling stretched","Optimizing - established, refining","Exiting - preparing to sell or step back","Pivoting - changing direction","Surviving - navigating a hard period"];
const TIMELINE_3YR = ["Sell or exit the business","Build it to run without me","Double or triple revenue","Buy back my time","Expand into new markets","Launch new products / services","Build a team and step out of daily ops","Retire or semi-retire"];
const DECISION_STYLE = ["Data-first - I need numbers before I commit","Gut-first - I move on instinct, validate later","Consensus - I loop in my team / advisors first","Vision-first - I decide based on my 3-year picture","Risk-averse - I need proof it works elsewhere first","Opportunity-driven - big upside = fast move"];
const STRESS_RESP  = ["Push harder and work longer hours","Get paralyzed and delay decisions","Delegate and step back immediately","Research obsessively before acting","Talk it through with a trusted advisor","Pivot quickly to something else","Get anxious but eventually work through it","Shut down and need time to reset"];
const MOTIVATORS   = ["Freedom - time, location, financial independence","Legacy - building something that outlasts me","Recognition - being seen as a leader / expert","Security - stability for my family","Impact - real difference for my clients","Growth - constant learning and expanding","Wealth - building real equity","Simplicity - removing chaos from my life"];
const BLOCKERS     = ["I don't fully trust tech to handle critical tasks","I've been burned by agencies or vendors before","My team resists change","I don't have time to manage a new system","Budget is tight right now","I don't know where to start","Data privacy / security concerns","Not sure it will actually work for my specific business"];
const MONEY_MIND   = ["I invest aggressively when I see ROI potential","I'm cautious - every dollar needs justifying","Comfortable spending on things that save me time","I bootstrap everything and hate outside spend","In growth mode - willing to invest in infrastructure"];
const AGENCY_HIST  = ["Never hired an agency or consultant before","Had great experiences - agencies have delivered","Mixed - some good, some bad","Mostly bad - agencies have let me down","Got burned badly - very hesitant now","Currently working with another agency"];
const WRITING_TONE = ["Professional & formal","Conversational & warm","Direct & punchy","Educational & detailed","Bold & provocative","Humble & approachable","Witty & clever","Empathetic & supportive"];
const CONTENT_COMF = ["I love writing - it comes naturally","I can write but it takes effort","I write when I have to, hate it","I dictate and have someone clean it up","I avoid writing at all costs - I prefer talking"];
const BRAND_LIKE   = ["Gary Vaynerchuk - raw, loud, authentic","Alex Hormozi - direct, value-packed, no fluff","Simon Sinek - thoughtful, story-driven, purposeful","Seth Godin - pithy, philosophical, surprising","Brené Brown - vulnerable, human, research-backed","Tim Ferriss - experimental, optimizing, tactical","Donald Miller - clear, simple, customer-focused","Marie Forleo - energetic, fun, empowering","Mel Robbins - direct, actionable, no excuses","Amy Porterfield - educational, warm, step-by-step","Oprah Winfrey - empathetic, inspirational, grounded","Sara Blakely - authentic, scrappy, entrepreneurial","Rachel Hollis - bold, personal, motivational","Jasmine Star - relatable, social-savvy, aspirational","Jenna Kutcher - warm, personal brand, purpose-driven","None of these - I'll describe my own"];
const SOCIAL_ACTIVE= ["Very active - post daily or near-daily","Moderate - a few times per week","Inconsistent - when I remember","Minimal - profiles exist but rarely post","Non-existent - I don't do social media"];
const PLATFORMS    = ["Email / Newsletter","LinkedIn","Instagram","Facebook","TikTok","Twitter / X","YouTube","Blog / SEO","Podcast","SMS / Text campaigns","None - internal use only"];
const AI_GOALS     = ["Inbox management","Lead qualification","Auto follow-up sequences","Customer support / chat","Appointment scheduling","Proposal & quote generation","Social media content creation","Research & competitive intel","Order management","Internal workflow automation","CRM data entry & updates","Employee onboarding","Invoice & billing automation","SEO & content creation","Market research","Custom - I'll describe below"];
const SUCCESS_MET  = ["Save time - get hours back every week","Increase revenue - close more, faster","Reduce headcount or overhead costs","Scale without hiring more people","Improve customer experience & response speed","Improve consistency across my team","Reduce errors and manual mistakes","All of the above"];
const PRIOR_AI     = ["No - first time exploring this","Yes - Zapier / Make / n8n","Yes - ChatGPT or similar chatbots","Yes - custom development work","Yes - hired another agency","Yes - multiple tools, nothing stuck"];
const TEAM_SENT    = ["Very excited - they've been asking for this","Mostly positive - open to change","Neutral - they'll adapt when it's here","Skeptical - they worry about job security","Resistant - there will be pushback","Just me - no team involved"];
const BUDGETS      = ["Under $2,500","$2,500–$5,000","$5,000–$10,000","$10,000–$25,000","$25,000–$50,000","$50,000+","Not sure - need a scoping call first"];
const TIMELINES    = ["ASAP - this is urgent","Within 30 days","1–3 months","3–6 months","No hard deadline","Just exploring / planning stage"];
const ENGAGEMENTS  = ["One-time build - deploy and hand off to my team","Build + ongoing support / optimization retainer","Full-service - you manage and run everything","Consulting only - guide my internal team","White-label - I want to resell this to my clients","Not sure - open to your recommendation"];
const INTERNAL_TECH= ["Yes — we have internal IT or a developer","We have a tech-savvy person who can help","We prefer Apollo[Claw] to manage everything after launch","We'll figure it out as we go","Not sure yet"];
const COL_ROLE     = ["Undergraduate student","Graduate / PhD student","Student athlete","Student organization leader","Academic advisor","Department administrator","Faculty / Professor","Dean / Associate Dean","IT staff","Enrollment / Admissions staff","Financial aid staff","Library staff","Registrar staff","Other administrator"];
const COL_SCHOOL_TYPE = ["Community college","4-year public university","4-year private university","Liberal arts college","Technical / Vocational school","Online-only institution","Graduate / Professional school","K-12 school or district","Other"];
const COL_SCHOOL_SIZE = ["Under 1,000 students","1,000–5,000 students","5,000–15,000 students","15,000–30,000 students","30,000–60,000 students","60,000+ students"];
const COL_YEAR     = ["Freshman (1st year)","Sophomore (2nd year)","Junior (3rd year)","Senior (4th year)","5th year / Super senior","Graduate student - Master's","Graduate student - PhD / Doctoral","Not applicable"];
const COL_MAJOR    = ["Business / Finance / Economics","Computer Science / IT","Engineering","Pre-med / Health Sciences","Law / Pre-law","Education","Arts / Humanities","Social Sciences","Communications / Media","Natural Sciences","Undecided","Other"];
const COL_BOT_USE_STUD = ["Study help & tutoring","Essay drafting & writing assistance","Research assistance","Note-taking & summarization","Exam prep & flashcards","Citation & bibliography help","Time management & scheduling","Mental health & wellness support","Career advising & job prep","Campus navigation & resources","Financial aid questions","Course registration help","Other"];
const COL_BOT_USE_ADMIN = ["Student advising & support","Enrollment & admissions","Course scheduling & registration","Financial aid processing","Faculty support","Campus communications","IT helpdesk","Library & research support","Events & campus life","Compliance & reporting","HR & staff onboarding","Alumni & donor engagement","Other"];
const COL_LMS      = ["Canvas","Blackboard","Moodle","D2L / Brightspace","Google Classroom","Schoology","Sakai","No LMS / Not applicable","Other"];
const COL_CURR_TOOLS = ["ChatGPT (personal use)","Grammarly","Google Bard / Gemini","Microsoft Copilot","Turnitin (AI detection)","No AI tools currently","Our institution has licensed AI tools","Other"];
const COL_CONCERN_STUD = ["Academic integrity / plagiarism concerns","Privacy of my data","Accuracy of AI responses","Over-reliance on AI","Cost / accessibility","Professors banning AI use","None - I'm comfortable with AI","Other"];
const COL_CONCERN_ADMIN = ["FERPA / student data privacy","Accreditation implications","Faculty acceptance / adoption","Budget and procurement","Integration with existing LMS/SIS","AI accuracy for student support","Academic integrity policies","IT security and compliance","None - we're ready to move forward","Other"];
const COL_SIS      = ["Banner (Ellucian)","PeopleSoft / Oracle","Colleague (Ellucian)","Jenzabar","PowerSchool","Skyward","Not sure what system we use","Other"];
const COL_BUDGET_ADMIN = ["Under $5,000","$5,000–$15,000","$15,000–$50,000","$50,000–$150,000","$150,000+","No budget allocated yet","Need to apply for a grant or funding"];
const COL_TIMELINE_ADMIN = ["This semester","Next semester","This academic year","Next academic year","Planning stage only","Tied to grant / funding approval"];
const COL_DECISION_ROLE = ["I am the sole decision-maker","I influence but need approval","I'm part of a committee","I'm researching for someone else","Faculty champion - need admin buy-in","IT must approve first"];
const COL_PILOT    = ["Yes - I want a small pilot first","Yes - one department before campus-wide","No - we want full implementation","Not sure yet"];
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
function CheckGroup({ label, hint, options, value = [], onChange, cols = 2 }: { label?: string; hint?: string; options: string[]; value: string[]; onChange: (v: string[]) => void; cols?: number }) {
  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  return (
    <FF label={label} hint={hint}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 8, marginTop: 4 }}>
        {options.map(opt => {
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
function Row2({ children }: { children: React.ReactNode }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>; }
function Stack({ children }: { children: React.ReactNode }) { return <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>{children}</div>; }
function SHead({ stepNum, total, title, subtitle, badge }: { stepNum: number; total: number; title: string; subtitle?: string; badge?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R }}>Step {stepNum} of {total}</span>
        {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(215,43,43,0.15)", color: R, border: `1px solid rgba(215,43,43,0.3)`, letterSpacing: "0.08em", textTransform: "uppercase" }}>{badge}</span>}
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: TX, margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: TXM, lineHeight: 1.65, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// GATEKEEPER
// ════════════════════════════════════════════════════════════
interface GateData { first: string; last: string; email: string; personalEmail: string; phone: string; heard: string[]; tz: string; title: string; linkedin: string; company: string }
function Gatekeeper({ onPass }: { onPass: (d: GateData) => void }) {
  const [d, setD] = useState<GateData>({ first: "", last: "", email: "", personalEmail: "", phone: "", heard: [], tz: "", title: "", linkedin: "", company: "" });

  const [err, setErr] = useState("");
  const set = (k: keyof GateData, v: string | string[]) => setD(p => ({ ...p, [k]: v }));
  const submit = () => {
    if (!d.first.trim() || !d.last.trim() || !d.email.trim() || !d.phone.trim()) { setErr("Please fill in all required fields to continue."); return; }
    if (!/\S+@\S+\.\S+/.test(d.email)) { setErr("Please enter a valid email address."); return; }
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
        <div style={{ width: "100%", maxWidth: 700, background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "36px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${R},transparent)`, opacity: 0.6 }} />
          <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${BDR}` }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: TX, margin: "0 0 4px" }}>Start here</p>
            <p style={{ fontSize: 13, color: TXD, margin: 0 }}>Tell us about yourself so we can personalize your experience.</p>
          </div>
          <Stack>
            <Row2>
              <FF label="First Name" required><TInput value={d.first} onChange={v => set("first", v)} placeholder="Jane" /></FF>
              <FF label="Last Name" required><TInput value={d.last} onChange={v => set("last", v)} placeholder="Smith" /></FF>
            </Row2>
            <Row2>
              <FF label="Business Email" required><TInput type="email" value={d.email} onChange={v => set("email", v)} placeholder="jane@yourcompany.com" /></FF>
              <FF label="Personal Email"><TInput type="email" value={d.personalEmail} onChange={v => set("personalEmail", v)} placeholder="jane@gmail.com" /></FF>
            </Row2>
            <FF label="Phone Number" required><TInput type="tel" value={d.phone} onChange={v => set("phone", v)} placeholder="+1 (___) ___-____" /></FF>
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
// TRACK SELECTOR
// ════════════════════════════════════════════════════════════
const TRACKS = [
  { id: "collegiate", title: "Collegiate", desc: "I'm a student, administrator, or staff member at an educational institution looking for AI solutions." },
  { id: "personal", title: "Personal CEO", desc: "I want a personal AI assistant to manage my schedule, tasks, and daily life." },
  { id: "business", title: "Business Owner / Executive", desc: "I run or lead a company and want AI to automate my operations, sales, or support." },
  { id: "agency", title: "Agency / Reseller", desc: "I want to white-label or partner with Apollo[Claw] to offer AI solutions to my own clients." },
];
function TrackSelector({ gate, onSelect }: { gate: GateData; onSelect: (t: string) => void }) {
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: R, marginBottom: 14 }}>Access Granted</div>
          <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: TX, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 14px" }}>What Best <span style={{ color: R }}>Describes You?</span></h1>
          <p style={{ fontSize: 15, color: TXM, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>Select your path below. Your intake form will be tailored specifically to your situation.</p>
          
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TRACKS.map(t => (
            <button key={t.id} type="button" onClick={() => onSelect(t.id)} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", background: SRF, border: `1px solid ${BDR}`, textAlign: "left", width: "100%" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: 16, color: TX, margin: "0 0 4px" }}>{t.title}</p>
                <p style={{ fontSize: 13, color: TXM, margin: 0, lineHeight: 1.5 }}>{t.desc}</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 10h6m-3-3l3 3-3 3" stroke={R} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// SHELL
// ════════════════════════════════════════════════════════════
function Shell({ steps, step, gate, children, onBack, onNext, onSubmit, isLast }: { steps: string[]; step: number; gate: GateData; children: React.ReactNode; onBack: () => void; onNext: () => void; onSubmit: () => void; isLast: boolean }) {
  const pct = Math.round(((step + 1) / steps.length) * 100);
  const timeEst = steps.length >= 12 ? "~12 min" : steps.length >= 8 ? "~8 min" : "~5 min";
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <style>{`.oc-ph::placeholder{color:#6b7280!important}`}</style>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 60, borderBottom: `1px solid ${BDR}`, background: "rgba(250,250,247,0.97)", position: "sticky", top: 0, zIndex: 50 }}>
        <ApolloWordmark size={17} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        </div>
        <span style={{ fontSize: 12, color: TXM }}>Apollo[Claw] Onboarding</span>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px 100px" }}>
        <div style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "36px 40px" }}>{children}</div>
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
function Success({ track }: { track: string }) {
  const msgs: Record<string, string> = {
    business: "This is one of the most comprehensive applications we receive. That tells us you're serious — and we take that seriously.",
    student: "Thanks for sharing your academic goals. We'll match you with the right tools to make your studies more efficient.",
    admin: "We understand the weight of an institutional deployment. We'll review your submission and come prepared.",
    agency: "White-label partner applications are reviewed within 48 hours. We'll reach out with next steps.",
  };
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${R}`, background: "rgba(215,43,43,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 0 24px" }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13.5L10 18.5L21 8" stroke={R} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <h2 style={{ fontSize: 32, fontWeight: 900, color: TX, margin: "0 0 12px", letterSpacing: "-0.025em" }}>Application Submitted</h2>
      <p style={{ fontSize: 15, color: TXM, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 10px" }}>{msgs[track] || msgs.business}</p>
      
      <a href="https://apolloclaw.ai" style={{ display: "inline-block", background: R, color: "#fff", fontWeight: 800, fontSize: 15, padding: "15px 40px", borderRadius: 8, textDecoration: "none" }}>Return to Apollo[Claw] →</a>
    </div>
  );
}
// ════════════════════════════════════════════════════════════
// BUSINESS TRACK
// ════════════════════════════════════════════════════════════
const BIZ_STEPS = Array.from({length: 23}, (_, i) => `Step ${i + 1}`);
function BizTrack({ gate, onDone }: { gate: GateData; onDone: (data: Record<string, unknown>, track: string) => void }) {
  const [step, setStep] = useState(0);
  const [s1, setS1] = useState({ first: "", last: "", email: "", phone: "", heard: [] as string[], contact: "", besttime: "", tz: "", title: "", linkedin: "" });
  const [s2, setS2] = useState({ biz: "", url: "", industry: "", size: "", revenue: "", age: "", model: "", proud: [] as string[], crm: [] as string[], crmOther: "", ecom: [] as string[], ecomOther: "", comms: [] as string[], commsOther: "", pm: [] as string[], pmOther: "", billing: [] as string[], billingOther: "", mktg: [] as string[], auto: [] as string[], autoOther: "", support: [] as string[], supportOther: "", webplat: "", desc: "", differentiate: "" });
  const [s3, setS3] = useState({ pain: "", depts: [] as string[], hours: "", duration: "", hate: "", tried: [] as string[], triedDetail: "", costImpact: "", fixed: "" });
  const [s4, setS4] = useState({ marital: "", kids: "", kidsAges: [] as string[], caretaking: [] as string[], homeLife: "", protect: [] as string[], lifeStage: "", timeline3yr: [] as string[], personalGoal: "" });
  const [s5, setS5] = useState({ decStyle: "", stressResp: "", motivators: [] as string[], blockers: [] as string[], moneyMind: "", agencyHist: "", techTrust: null as number | null, controlComfort: null as number | null, worthIt: "" });
  const [s6, setS6] = useState({ tone: "", writingComf: "", brandLike: "", voiceDesc: "", loveWords: "", hateWords: "", socialActive: "", platforms: [] as string[], sample: "" });
  const [s7, setS7] = useState({ goals: [] as string[], metric: "", priority: "", prior: "", past: "", teamSent: "" });
  const [s8, setS8] = useState({ hosting: [] as string[], os: "", security: [] as string[], data: [] as string[], comply: [] as string[], budget: "", timeline: "", engagement: "", internalTech: "", itInvolved: "", constraints: "", agree: false });
  const [agreeErr, setAgreeErr] = useState(false);
  const [stepErr, setStepErr] = useState<number | null>(null);
  const f1 = (k: string, v: unknown) => setS1(p => ({ ...p, [k]: v }));
  const f2 = (k: string, v: unknown) => setS2(p => ({ ...p, [k]: v }));
  const f3 = (k: string, v: unknown) => setS3(p => ({ ...p, [k]: v }));
  const f4 = (k: string, v: unknown) => setS4(p => ({ ...p, [k]: v }));
  const f5 = (k: string, v: unknown) => setS5(p => ({ ...p, [k]: v }));
  const f6 = (k: string, v: unknown) => setS6(p => ({ ...p, [k]: v }));
  const f7 = (k: string, v: unknown) => setS7(p => ({ ...p, [k]: v }));
  const f8 = (k: string, v: unknown) => setS8(p => ({ ...p, [k]: v }));
  const buildData = () => ({ firstName: gate.first, lastName: gate.last, email: gate.email, phone: gate.phone, source: s1.heard, contactMethod: s1.contact, bestTime: s1.besttime, linkedin: gate.linkedin, companyName: gate.company || s2.biz, website: s2.url, industry: s2.industry, companySize: s2.size, revenue: s2.revenue, businessAge: s2.age, businessModel: s2.model, mostProud: s2.proud, businessDescription: s2.desc, webPlatform: s2.webplat, crmTools: s2.crm, ecomTools: s2.ecom, commsTools: s2.comms, pmTools: s2.pm, billingTools: s2.billing, mktgTools: s2.mktg, autoTools: s2.auto, supportTools: s2.support, mainPain: s3.pain, brokenAreas: s3.depts, manualHours: s3.hours, painDuration: s3.duration, hatedTasks: s3.hate, triedBefore: s3.tried, costImpact: s3.costImpact, fixedLooksLike: s3.fixed, maritalStatus: s4.marital, children: s4.kids, childrenAges: s4.kidsAges, caretaking: s4.caretaking, homeLife: s4.homeLife, protecting: s4.protect, lifeStage: s4.lifeStage, threeYearGoals: s4.timeline3yr, personalGoal: s4.personalGoal, decisionStyle: s5.decStyle, stressResponse: s5.stressResp, motivators: s5.motivators, blockers: s5.blockers, moneyMindset: s5.moneyMind, agencyHistory: s5.agencyHist, techTrust: s5.techTrust, controlComfort: s5.controlComfort, worthIt: s5.worthIt, writingTone: s6.tone, writingComfort: s6.writingComf, brandVoiceLike: s6.brandLike, voiceDescription: s6.voiceDesc, loveWords: s6.loveWords, hateWords: s6.hateWords, socialPresence: s6.socialActive, platforms: s6.platforms, writingSample: s6.sample, aiGoals: s7.goals, successMetric: s7.metric, priorityWorkflow: s7.priority, priorAI: s7.prior, pastExperience: s7.past, teamSentiment: s7.teamSent, hosting: s8.hosting, os: s8.os, securityMeasures: s8.security, dataTypes: s8.data, compliance: s8.comply, budget: s8.budget, timeline: s8.timeline, engagement: s8.engagement, internalTech: s8.internalTech, constraints: s8.constraints });
  const next = () => {
    if (step === 1 && !s2.desc.trim()) { setStepErr(1); return; }
    setStepErr(null);
    setStep(s => Math.min(s + 1, pages.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => { setStep(s => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const submit = () => { if (!s8.agree) { setAgreeErr(true); return; } setAgreeErr(false); onDone(buildData(), "business"); };
  const pages = [

    <Stack key="s2a">
      <SHead stepNum={1} total={13} title="Your Business" subtitle="A few quick facts to get us started." badge="Business" />
      <FF label="Company / Business Name" required><TInput value={s2.biz} onChange={v => f2("biz", v)} placeholder="Acme Corp" /></FF>
      <FF label="Your Role / Title"><TInput value={s1.title} onChange={v => f1("title", v)} placeholder="e.g. CEO, Founder, Operations Manager" /></FF>
      <Row2><FF label="Industry" required><TSelect value={s2.industry} onChange={v => f2("industry", v)} options={INDUSTRIES} /></FF><FF label="Team Size" required><TSelect value={s2.size} onChange={v => f2("size", v)} options={BIZ_SIZES} /></FF></Row2>
      <Row2><FF label="Monthly Revenue" required><TSelect value={s2.revenue} onChange={v => f2("revenue", v)} options={REVENUE} /></FF><FF label="Years in Business" required><TSelect value={s2.age} onChange={v => f2("age", v)} options={BIZ_AGE} /></FF></Row2>
      <FF label="Business Model" required><TSelect value={s2.model} onChange={v => f2("model", v)} options={BIZ_MODEL} /></FF>
    </Stack>,
    <Stack key="s2b">
      <SHead stepNum={2} total={13} title="What Do You Do?" subtitle="Tell us about your business. Who you serve, what you deliver, and what makes you stand out." badge="Business" />
      <FF label="Describe your business" hint="Who do you serve, what do you deliver, what makes you stand out?" required><TArea value={s2.desc} onChange={v => f2("desc", v)} placeholder="We help [who] do [what] by [how]. What clients say they love about us is..." rows={10} /></FF>
      {stepErr === 1 && <p style={{ fontSize: 13, color: "#dc2626" }}>Please fill in Company Name and Description before continuing.</p>}
    </Stack>,
    <Stack key="s2c">
      <SHead stepNum={3} total={17} title="CRM / Sales Tools" subtitle="What do you use to manage contacts and sales?" badge="Business" />
      <CheckGroup options={STACK_CRM} value={s2.crm} onChange={v => f2("crm", v)} cols={3} />
      {s2.crm.includes("Other") && <FF label="Which tool?"><TInput value={s2.crmOther || ""} onChange={v => f2("crmOther", v)} placeholder="Name the tool" /></FF>}
    </Stack>,
    <Stack key="s2e">
      <SHead stepNum={4} total={17} title="Communications" subtitle="How does your team communicate internally and with clients?" badge="Business" />
      <CheckGroup options={STACK_COMMS} value={s2.comms} onChange={v => f2("comms", v)} cols={2} />
      {s2.comms.includes("Other") && <FF label="Which tool?"><TInput value={s2.commsOther || ""} onChange={v => f2("commsOther", v)} placeholder="Name the tool" /></FF>}
    </Stack>,
    <Stack key="s2f">
      <SHead stepNum={5} total={17} title="Project Management" subtitle="How do you track work and manage projects?" badge="Business" />
      <CheckGroup options={STACK_PM} value={s2.pm} onChange={v => f2("pm", v)} cols={2} />
      {s2.pm.includes("Other") && <FF label="Which tool?"><TInput value={s2.pmOther || ""} onChange={v => f2("pmOther", v)} placeholder="Name the tool" /></FF>}
    </Stack>,
    <Stack key="s2g">
      <SHead stepNum={6} total={13} title="Billing & Payments" subtitle="What do you use for invoicing and payments?" badge="Business" />
      <CheckGroup options={STACK_BILLING} value={s2.billing} onChange={v => f2("billing", v)} cols={2} />
      {s2.billing.includes("Other") && <FF label="Which tool?"><TInput value={s2.billingOther || ""} onChange={v => f2("billingOther", v)} placeholder="Name the tool" /></FF>}
    </Stack>,
    <Stack key="s2m">
      <SHead stepNum={7} total={12} title="Compliance Requirements" subtitle="Are there regulations your business must follow?" badge="Business" />
      <CheckGroup options={IT_COMPLY} value={s8.comply} onChange={v => f8("comply", v)} cols={2} />
    </Stack>,
    <Stack key="s3">
      <SHead stepNum={8} total={12} title="Pain Points & Operations" subtitle="Be direct. The clearer the problem, the better we can architect the fix." badge="Business" />
      <FF label="Describe Your Biggest Operational Headache Right Now" required><TArea value={s3.pain} onChange={v => f3("pain", v)} placeholder="Walk us through a typical bad day. What breaks, what falls through the cracks?" rows={4} /></FF>
      <CheckGroup label="Which Areas Feel Most Broken?" hint="Select all that apply" options={BROKEN_AREAS} value={s3.depts} onChange={v => f3("depts", v)} cols={2} />
      <FF label="The One Thing You Wish You Could Make Disappear" required><TArea value={s3.hate} onChange={v => f3("hate", v)} placeholder="The task that makes you groan every time." rows={2} /></FF>
      <CheckGroup label="What Have You Already Tried?" hint="Select all that apply" options={TRIED_BEFORE} value={s3.tried} onChange={v => f3("tried", v)} cols={2} />
      <FF label="Tell Us More About What You've Already Done" hint="Free text — what worked, what didn't, what you learned"><TArea value={s3.triedDetail || ""} onChange={v => f3("triedDetail", v)} placeholder="e.g. We tried Zapier for 6 months but it kept breaking. We hired a VA but couldn't get consistent results..." rows={3} /></FF>
      <FF label="What Does 'Fixed' Look Like?" hint="Describe your business in 12 months if this is completely solved."><TArea value={s3.fixed} onChange={v => f3("fixed", v)} placeholder="What does your day look like? What numbers have changed?" rows={3} /></FF>
    </Stack>,
    <Stack key="s4">
      <SHead stepNum={9} total={12} title="Family & Life Context" subtitle="Understanding your life outside the business helps us build something that actually fits." badge="Business" />
      <Row2><FF label="Relationship Status"><TSelect value={s4.marital} onChange={v => f4("marital", v)} options={MARITAL} /></FF><FF label="Children"><TSelect value={s4.kids} onChange={v => f4("kids", v)} options={KIDS_COUNT} /></FF></Row2>
      <CheckGroup label="Ages of Your Children" hint="Skip if no children" options={["Infant / Toddler (0–3)","Young children (4–8)","Pre-teen (9–12)","Teenager (13–17)","Young adults (18–25)","Adult children (25+)","N/A"]} value={s4.kidsAges} onChange={v => f4("kidsAges", v)} cols={3} />
      <RadioGroup label="Your Work / Home Situation" options={HOME_LIFE} value={s4.homeLife} onChange={v => f4("homeLife", v)} />
      <CheckGroup label="What Are You Most Protecting Right Now?" options={["My family's financial security","My health and energy","My time and freedom","My marriage / relationship","My kids' future","My retirement / exit plan","My peace of mind","My reputation"]} value={s4.protect} onChange={v => f4("protect", v)} cols={2} />
      <RadioGroup label="Where Are You in Your Business Journey?" options={LIFE_STAGE} value={s4.lifeStage} onChange={v => f4("lifeStage", v)} />
      <CheckGroup label="What Do You Want Your Business to Do For You in 3 Years?" options={TIMELINE_3YR} value={s4.timeline3yr} onChange={v => f4("timeline3yr", v)} cols={2} />
      <FF label="Describe Your Personal 3-Year Vision" hint="Not metrics — your actual life."><TArea value={s4.personalGoal} onChange={v => f4("personalGoal", v)} placeholder="Be honest. What are you really building toward?" rows={3} /></FF>
    </Stack>,
    <Stack key="s5a">
      <SHead stepNum={10} total={16} title="How Do You Make Big Decisions?" subtitle="Understanding your decision-making style helps us work with you, not against you." badge="Business" />
      <RadioGroup options={DECISION_STYLE} value={s5.decStyle} onChange={v => f5("decStyle", v)} />
    </Stack>,
    <Stack key="s5b">
      <SHead stepNum={11} total={16} title="When Things Get Hard or Uncertain…" subtitle="How you respond under pressure shapes how we'll support you." badge="Business" />
      <RadioGroup options={STRESS_RESP} value={s5.stressResp} onChange={v => f5("stressResp", v)} />
    </Stack>,
    <Stack key="s5c">
      <SHead stepNum={12} total={16} title="Motivation & Resistance" subtitle="What drives you — and what holds you back." badge="Business" />
      <CheckGroup label="What Motivates You at the Deepest Level?" hint="Select your top 3" options={MOTIVATORS} value={s5.motivators} onChange={v => f5("motivators", v)} cols={2} />
      <CheckGroup label="What Creates Internal Resistance?" hint="Select all that are true" options={BLOCKERS} value={s5.blockers} onChange={v => f5("blockers", v)} cols={2} />
    </Stack>,
    <Stack key="s5d">
      <SHead stepNum={13} total={16} title="Your History With Consultants & Agencies" subtitle="We want to know what you've experienced before — good or bad." badge="Business" />
      <RadioGroup options={AGENCY_HIST} value={s5.agencyHist} onChange={v => f5("agencyHist", v)} />
    </Stack>,
    <Stack key="s5e">
      <SHead stepNum={14} total={16} title="Trust & Expectations" subtitle="How you think about technology and what success looks like for you." badge="Business" />
      <ScaleRow label="How Much Do You Trust Technology to Handle Critical Business Tasks?" low="Not at all — want humans involved" high="Fully — automate everything" value={s5.techTrust} onChange={v => f5("techTrust", v)} />
      <ScaleRow label="How Comfortable Are You Giving Up Control to an AI System?" low="Very uncomfortable" high="Completely comfortable" value={s5.controlComfort} onChange={v => f5("controlComfort", v)} />
      <FF label="What Would Make This Engagement 100% Worth It?"><TArea value={s5.worthIt} onChange={v => f5("worthIt", v)} placeholder="Specific outcomes, feelings, changes in your daily life — what's the real bar?" rows={3} /></FF>
    </Stack>,
    <Stack key="s6a">
      <SHead stepNum={15} total={19} title="Your Communication Tone" subtitle="AI that sounds like you is the goal. How would you describe your natural style?" badge="Business" />
      <CheckGroup hint="Select all that apply" options={WRITING_TONE} value={s6.tone ? [s6.tone] : []} onChange={v => f6("tone", v[v.length-1] || "")} cols={2} />
    </Stack>,
    <Stack key="s6b">
      <SHead stepNum={16} total={19} title="Your Relationship With Writing" subtitle="How comfortable are you with written communication?" badge="Business" />
      <CheckGroup hint="Select all that apply" options={CONTENT_COMF} value={s6.writingComf ? [s6.writingComf] : []} onChange={v => f6("writingComf", v[v.length-1] || "")} cols={2} />
    </Stack>,
    <Stack key="s6c">
      <SHead stepNum={17} total={19} title="Who Do You Sound Most Like?" subtitle="Pick up to 3 voices that resonate with how you communicate." badge="Business" />
      <CheckGroup hint="Pick up to 3" options={BRAND_LIKE.filter(b => b !== "None of these - I’ll describe my own")} value={Array.isArray(s6.brandLike) ? s6.brandLike : (s6.brandLike ? [s6.brandLike] : [])} onChange={v => f6("brandLike", v.slice(-3))} cols={2} />
    </Stack>,
    <Stack key="s6d">
      <SHead stepNum={18} total={19} title="Your Voice in Your Own Words" subtitle="Describe how you sound — and share a writing sample if you have one." badge="Business" />
      <FF label="Describe Your Ideal Voice"><TArea value={s6.voiceDesc} onChange={v => f6("voiceDesc", v)} placeholder="e.g. Confident but not arrogant. Clear, direct. Never corporate." rows={3} /></FF>
      <FF label="Share a Sample of Your Voice" hint="Optional. Paste an email, LinkedIn summary, or any writing that sounds like you."><TArea value={s6.sample} onChange={v => f6("sample", v)} placeholder="Ideas: a long email, your LinkedIn About section, a client proposal, or a Slack message that sounds like you..." rows={4} /></FF>
    </Stack>,
    <Stack key="s7a">
      <SHead stepNum={19} total={23} title="Your AI History" subtitle="Tell us what you've already explored — good experiences and bad ones both help." badge="Business" />
      <FF label="Have You Tried AI Automation Before?" hint="Tell us what you've explored or attempted." required><TArea value={s7.prior} onChange={v => f7("prior", v)} placeholder="e.g. We tried ChatGPT for content, used a Zapier automation for leads, hired someone to build a bot..." rows={3} /></FF>
      <FF label="What Happened With Previous Attempts?"><TArea value={s7.past} onChange={v => f7("past", v)} placeholder="What worked, what didn't, what you learned." rows={3} /></FF>
    </Stack>,
    <Stack key="s7b">
      <SHead stepNum={20} total={23} title="What Do You Want AI to Handle?" subtitle="Select every area you'd like AI to take off your plate." badge="Business" />
      <CheckGroup hint="Select all that apply" options={AI_GOALS} value={s7.goals} onChange={v => f7("goals", v)} cols={2} />
    </Stack>,
    <Stack key="s7c">
      <SHead stepNum={21} total={23} title="What Does Winning Look Like?" subtitle="Pick the metric that matters most to you." badge="Business" />
      <CheckGroup hint="Select all that apply" options={SUCCESS_MET} value={s7.metric ? [s7.metric] : []} onChange={v => f7("metric", v[v.length-1] || "")} cols={2} />
    </Stack>,
    <Stack key="s7d">
      <SHead stepNum={22} total={23} title="Your #1 Workflow to Automate" subtitle="Walk us through it from trigger to outcome — the more specific, the better." badge="Business" />
      <FF label="Describe the #1 Workflow You Want Automated First" hint="From trigger to outcome — step by step."><TArea value={s7.priority} onChange={v => f7("priority", v)} placeholder="e.g. 'Lead fills a form → gets an auto-reply → is scored → if qualified, booked on my calendar…'" rows={5} /></FF>
    </Stack>,
    <Stack key="s7e">
      <SHead stepNum={23} total={23} title="Your Team & AI" subtitle="How does your team feel about bringing AI into the business?" badge="Business" />
      <RadioGroup options={TEAM_SENT} value={s7.teamSent} onChange={v => f7("teamSent", v)} />
    </Stack>,
    <Stack key="s8">
      <SHead stepNum={23} total={23} title="IT Infrastructure & Scope" subtitle="Your existing tech environment and project parameters." badge="Business" />
      <FF label="Desired Timeline" required><TSelect value={s8.timeline} onChange={v => f8("timeline", v)} options={TIMELINES} /></FF>
      <RadioGroup label="Type of Engagement" options={ENGAGEMENTS} value={s8.engagement} onChange={v => f8("engagement", v)} />
      <RadioGroup label="Is Anyone From IT Involved in Evaluating This Project?" options={["Yes — IT is actively involved in the decision","IT will need to approve before we move forward","I am the IT person","We don't have a dedicated IT staff","No — this is my decision alone","Not sure yet"]} value={s8.itInvolved} onChange={v => f8("itInvolved", v)} />
      <FF label="Internal Technical Resources After Launch" required><TSelect value={s8.internalTech} onChange={v => f8("internalTech", v)} options={INTERNAL_TECH} /></FF>
      <FF label="Hard Constraints or Non-Negotiables"><TArea value={s8.constraints} onChange={v => f8("constraints", v)} rows={2} /></FF>
      <button type="button" onClick={() => f8("agree", !s8.agree)} style={{ display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left", padding: "14px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit", lineHeight: 1.55, background: s8.agree ? "rgba(215,43,43,0.1)" : agreeErr ? "rgba(215,43,43,0.05)" : SRF2, border: `1px solid ${s8.agree ? "rgba(215,43,43,0.45)" : agreeErr ? "rgba(215,43,43,0.5)" : BDR}`, color: s8.agree ? TX : agreeErr ? "#dc2626" : TXM }}>
        <span style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0, marginTop: 2, border: `1.5px solid ${s8.agree ? R : "rgba(0,0,0,0.2)"}`, background: s8.agree ? R : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {s8.agree && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </span>
        I've answered honestly and I'm ready for a conversation about how Apollo[Claw] can help my business.
      </button>
      {agreeErr && <p style={{ fontSize: 12, color: "#dc2626", marginTop: -14 }}>Please check this box before submitting.</p>}
    </Stack>,
  ];
  return <Shell steps={BIZ_STEPS} step={step} gate={gate} onBack={back} onNext={next} onSubmit={submit} isLast={step === pages.length - 1}>{pages[step]}</Shell>;
}
// ════════════════════════════════════════════════════════════
// COLLEGIATE TRACK
// ════════════════════════════════════════════════════════════
function ColTrack({ gate, onDone }: { gate: GateData; onDone: (data: Record<string, unknown>, track: string) => void }) {
  const [s0, setS0] = useState({ first: "", last: "", email: "", phone: "", heard: [] as string[] });
  const f0 = (k: string, v: unknown) => setS0(p => ({ ...p, [k]: v }));
  const [role, setRole] = useState("");
  const [step, setStep] = useState(0);
  const [stud, setStud] = useState({ year: "", major: "", school: "", schoolType: "", schoolSize: "", uses: [] as string[], currentTools: [] as string[], concerns: [] as string[], lms: "", gpa: "", clubs: "", aiExperience: "", goalShort: "", goalLong: "", budget: "", timeline: "" });
  const [adm, setAdm] = useState({ adminRole: "", school: "", schoolType: "", schoolSize: "", dept: "", uses: [] as string[], lms: [] as string[], sis: "", currentTools: [] as string[], concerns: [] as string[], decisionRole: "", stakeholders: [] as string[], budget: "", timeline: "", pilot: "", compliance: [] as string[], dataTypes: [] as string[], integrations: "", successMetric: "" });
  const ss = (k: string, v: unknown) => setStud(p => ({ ...p, [k]: v }));
  const sa = (k: string, v: unknown) => setAdm(p => ({ ...p, [k]: v }));
  const ADMIN_STAKEHOLDERS = ["President / Provost","VP of Academic Affairs","VP of Student Affairs","Chief Information Officer (CIO)","IT Security / CISO","Department Chair / Dean","Faculty Senate","Student Government","Financial Aid Office","Legal / Compliance","Board of Trustees","No other stakeholders"];
  if (!role) return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: R, marginBottom: 14 }}>Collegiate Track</div>
        <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: TX, letterSpacing: "-0.02em", margin: "0 0 12px" }}>Are You a <span style={{ color: R }}>Student</span> or <span style={{ color: R }}>Administrator?</span></h1>
        <p style={{ fontSize: 15, color: TXM, lineHeight: 1.7, marginBottom: 40 }}>Your intake form will be tailored to your role.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[{ id: "student", title: "Student", desc: "I'm enrolled and want an AI study assistant or academic support bot." }, { id: "admin", title: "Administrator / Staff / Faculty", desc: "I work at the institution and want to deploy AI for students or operations." }].map(t => (
            <button key={t.id} type="button" onClick={() => setRole(t.id)} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", background: SRF, border: `1px solid ${BDR}`, textAlign: "left", width: "100%" }}>
              <div style={{ flex: 1 }}><p style={{ fontWeight: 800, fontSize: 16, color: TX, margin: "0 0 4px" }}>{t.title}</p><p style={{ fontSize: 13, color: TXM, margin: 0 }}>{t.desc}</p></div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 10h6m-3-3l3 3-3 3" stroke={R} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  const isStud = role === "student";
  const STUD_STEPS = ["Your Role", "Academic Profile", "Goals", "Budget"];
  const ADMIN_STEPS = ["Your Role", "Institution", "AI Deployment", "IT & Budget"];
  const curSteps = isStud ? STUD_STEPS : ADMIN_STEPS;
  const studPages = [
    <Stack key="st1"><SHead stepNum={1} total={4} title="Your Academic Role" badge="Student" /><FF label="School / University Name" required><TInput value={stud.school} onChange={v => ss("school", v)} placeholder="e.g. Tulane University" /></FF><Row2><FF label="Institution Type" required><TSelect value={stud.schoolType} onChange={v => ss("schoolType", v)} options={COL_SCHOOL_TYPE} /></FF><FF label="School Size"><TSelect value={stud.schoolSize} onChange={v => ss("schoolSize", v)} options={COL_SCHOOL_SIZE} /></FF></Row2><Row2><FF label="Academic Year" required><TSelect value={stud.year} onChange={v => ss("year", v)} options={COL_YEAR} /></FF><FF label="Major / Field of Study" required><TSelect value={stud.major} onChange={v => ss("major", v)} options={COL_MAJOR} /></FF></Row2><FF label="GPA Range (Optional)"><TSelect value={stud.gpa} onChange={v => ss("gpa", v)} options={["Under 2.0","2.0–2.5","2.5–3.0","3.0–3.5","3.5–4.0","4.0 (Perfect)","Not applicable","Prefer not to say"]} /></FF><FF label="Clubs, Sports, or Activities"><TInput value={stud.clubs} onChange={v => ss("clubs", v)} placeholder="e.g. Debate club, student newspaper, varsity soccer…" /></FF></Stack>,
    <Stack key="st2"><SHead stepNum={2} total={4} title="Academic Profile & AI Experience" badge="Student" /><FF label="Your School's LMS"><TSelect value={stud.lms} onChange={v => ss("lms", v)} options={COL_LMS} /></FF><CheckGroup label="AI Tools You Currently Use" options={COL_CURR_TOOLS} value={stud.currentTools} onChange={v => ss("currentTools", v)} cols={2} /><RadioGroup label="Your Prior Experience With AI Tools" options={["I've never used AI tools","I've tried them once or twice","I use them occasionally","I use AI tools regularly","I'm very experienced - daily power user"]} value={stud.aiExperience} onChange={v => ss("aiExperience", v)} /><CheckGroup label="What Do You Want an AI Bot to Help You With?" options={COL_BOT_USE_STUD} value={stud.uses} onChange={v => ss("uses", v)} cols={2} /><CheckGroup label="Concerns or Hesitations About Using AI" options={COL_CONCERN_STUD} value={stud.concerns} onChange={v => ss("concerns", v)} cols={2} /></Stack>,
    <Stack key="st3"><SHead stepNum={3} total={4} title="Your Academic Goals" badge="Student" /><FF label="What's Your Biggest Academic Challenge Right Now?" required><TArea value={stud.goalShort} onChange={v => ss("goalShort", v)} placeholder="Keeping up with coursework? Study skills? Writing?" rows={3} /></FF><FF label="What's Your Longer-Term Academic or Career Goal?"><TArea value={stud.goalLong} onChange={v => ss("goalLong", v)} rows={2} /></FF></Stack>,
    <Stack key="st4"><SHead stepNum={4} total={4} title="Budget & Timeline" badge="Student" /><FF label="Monthly Budget for AI Tools" required><TSelect value={stud.budget} onChange={v => ss("budget", v)} options={["Free only - I cannot spend anything","Under $10/mo","$10–$20/mo","$20–$50/mo","$50+/mo","My school would pay for it","Not sure yet"]} /></FF><RadioGroup label="When Do You Want to Get Started?" options={["This week - ASAP","This semester","Next semester","Just researching for now"]} value={stud.timeline} onChange={v => ss("timeline", v)} /></Stack>,
  ];
  const admPages = [
    <Stack key="ad1"><SHead stepNum={1} total={4} title="Your Institutional Role" badge="Administrator" /><FF label="Your Role at the Institution" required><TSelect value={adm.adminRole} onChange={v => sa("adminRole", v)} options={COL_ROLE} /></FF><FF label="School / Institution Name" required><TInput value={adm.school} onChange={v => sa("school", v)} placeholder="e.g. University of Texas at Austin" /></FF><Row2><FF label="Institution Type" required><TSelect value={adm.schoolType} onChange={v => sa("schoolType", v)} options={COL_SCHOOL_TYPE} /></FF><FF label="Institution Size" required><TSelect value={adm.schoolSize} onChange={v => sa("schoolSize", v)} options={COL_SCHOOL_SIZE} /></FF></Row2><FF label="Your Department or Division"><TInput value={adm.dept} onChange={v => sa("dept", v)} placeholder="e.g. Office of Student Success, IT, Admissions…" /></FF><RadioGroup label="Your Role in This Decision" options={COL_DECISION_ROLE} value={adm.decisionRole} onChange={v => sa("decisionRole", v)} /><CheckGroup label="Other Stakeholders Involved" options={ADMIN_STAKEHOLDERS} value={adm.stakeholders} onChange={v => sa("stakeholders", v)} cols={2} /></Stack>,
    <Stack key="ad2"><SHead stepNum={2} total={4} title="Institution Profile & Current Tech" badge="Administrator" /><CheckGroup label="Learning Management Systems in Use" options={COL_LMS} value={adm.lms} onChange={v => sa("lms", v)} cols={2} /><FF label="Student Information System (SIS)"><TSelect value={adm.sis} onChange={v => sa("sis", v)} options={COL_SIS} /></FF><CheckGroup label="AI Tools Currently in Use or Evaluated" options={COL_CURR_TOOLS} value={adm.currentTools} onChange={v => sa("currentTools", v)} cols={2} /><CheckGroup label="What Do You Want AI to Handle?" options={COL_BOT_USE_ADMIN} value={adm.uses} onChange={v => sa("uses", v)} cols={2} /><CheckGroup label="Key Concerns or Barriers" options={COL_CONCERN_ADMIN} value={adm.concerns} onChange={v => sa("concerns", v)} cols={2} /></Stack>,
    <Stack key="ad3"><SHead stepNum={3} total={4} title="AI Deployment & Compliance" badge="Administrator" /><CheckGroup label="Compliance Requirements" options={["FERPA (student data privacy)","COPPA (under-13 users)","HIPAA (health/counseling data)","ADA / Section 508 (accessibility)","State privacy laws","Regional accreditation standards","None / Not sure"]} value={adm.compliance} onChange={v => sa("compliance", v)} cols={2} /><CheckGroup label="Types of Student / Institutional Data Involved" options={["Student academic records","Student contact information","Financial aid data","Health / counseling records","Admissions data","Alumni / donor data","Faculty / staff records","Nothing sensitive"]} value={adm.dataTypes} onChange={v => sa("dataTypes", v)} cols={2} /><FF label="Key Systems That Must Be Integrated"><TArea value={adm.integrations} onChange={v => sa("integrations", v)} placeholder="e.g. Must integrate with Canvas LMS, Banner SIS, and Microsoft Azure SSO…" rows={3} /></FF><RadioGroup label="Pilot or Full Deployment?" options={COL_PILOT} value={adm.pilot} onChange={v => sa("pilot", v)} /><FF label="How Will You Measure Success?"><TArea value={adm.successMetric} onChange={v => sa("successMetric", v)} rows={2} /></FF></Stack>,
    <Stack key="ad4"><SHead stepNum={4} total={4} title="Budget & Timeline" badge="Administrator" /><FF label="Projected Budget" required><TSelect value={adm.budget} onChange={v => sa("budget", v)} options={COL_BUDGET_ADMIN} /></FF><FF label="Desired Go-Live Timeline" required><TSelect value={adm.timeline} onChange={v => sa("timeline", v)} options={COL_TIMELINE_ADMIN} /></FF></Stack>,
  ];
  const curPages = isStud ? studPages : admPages;
  const submitData = isStud
    ? { firstName: s0.first, lastName: s0.last, email: s0.email, phone: s0.phone, school: stud.school, schoolType: stud.schoolType, year: stud.year, major: stud.major, uses: stud.uses, currentTools: stud.currentTools, goalShort: stud.goalShort, goalLong: stud.goalLong, budget: stud.budget, timeline: stud.timeline }
    : { firstName: s0.first, lastName: s0.last, email: s0.email, phone: s0.phone, adminRole: adm.adminRole, school: adm.school, schoolType: adm.schoolType, uses: adm.uses, compliance: adm.compliance, budget: adm.budget, timeline: adm.timeline };
  const submitTrack = isStud ? "student" : "admin";
  const next = () => { setStep(s => Math.min(s + 1, 3)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const back = () => { if (step === 0) setRole(""); else { setStep(s => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const submit = () => onDone(submitData, submitTrack);
  return <Shell steps={curSteps} step={step} gate={gate} onBack={back} onNext={next} onSubmit={submit} isLast={step === 3}>{curPages[step]}</Shell>;
}
// ════════════════════════════════════════════════════════════
// AGENCY TRACK
// ════════════════════════════════════════════════════════════
const AGY_STEPS = ["Your Agency", "Your Clients", "Partnership Goals"];
function AgencyTrack({ gate, onDone }: { gate: GateData; onDone: (data: Record<string, unknown>, track: string) => void }) {
  const [s0, setS0] = useState({ first: "", last: "", email: "", phone: "", heard: [] as string[] });
  const f0 = (k: string, v: unknown) => setS0(p => ({ ...p, [k]: v }));
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ agencyName: "", url: "", size: "", model: "", clientTypes: [] as string[], clientCount: "", services: [] as string[], whyPartner: "", revenue: "", timeline: "", questions: "" });
  const sd = (k: string, v: unknown) => setD(p => ({ ...p, [k]: v }));
  const buildData = () => ({ firstName: s0.first, lastName: s0.last, email: s0.email, phone: s0.phone, agencyName: d.agencyName, website: d.url, size: d.size, model: d.model, clientTypes: d.clientTypes, clientCount: d.clientCount, services: d.services, whyPartner: d.whyPartner, revenue: d.revenue, timeline: d.timeline, questions: d.questions });
  const next = () => { setStep(s => Math.min(s + 1, 2)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const back = () => { setStep(s => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const submit = () => onDone(buildData(), "agency");
  const pages = [
    <Stack key="ag1"><SHead stepNum={1} total={3} title="Your Agency" badge="Agency / Reseller" /><FF label="Agency Name" required><TInput value={d.agencyName} onChange={v => sd("agencyName", v)} placeholder="Your Agency LLC" /></FF><FF label="Website"><TInput type="url" value={d.url} onChange={v => sd("url", v)} placeholder="https://youragency.com" /></FF><Row2><FF label="Agency Size"><TSelect value={d.size} onChange={v => sd("size", v)} options={BIZ_SIZES} /></FF><FF label="Agency Model"><TSelect value={d.model} onChange={v => sd("model", v)} options={["Full-service digital agency","Web design / dev shop","Marketing agency","SEO / PPC specialist","Consulting / advisory firm","IT managed services (MSP)","Other"]} /></FF></Row2><CheckGroup label="Services You Currently Offer" options={["Web design & development","SEO & content marketing","Paid advertising (PPC)","Social media management","Email marketing","CRM & automation","AI / chatbot implementation","Business consulting","IT managed services","Other"]} value={d.services} onChange={v => sd("services", v)} cols={2} /></Stack>,
    <Stack key="ag2"><SHead stepNum={2} total={3} title="Your Client Base" badge="Agency / Reseller" /><CheckGroup label="Types of Clients You Serve" options={["Small businesses (under $1M revenue)","Mid-market ($1M–$10M revenue)","Enterprise ($10M+ revenue)","E-commerce brands","Healthcare / medical practices","Law firms","Real estate companies","Restaurants / hospitality","Non-profits","Educational institutions","Other"]} value={d.clientTypes} onChange={v => sd("clientTypes", v)} cols={2} /><FF label="Approximate Number of Active Clients"><TSelect value={d.clientCount} onChange={v => sd("clientCount", v)} options={["1–5 clients","6–15 clients","16–30 clients","31–60 clients","60–100 clients","100+ clients"]} /></FF></Stack>,
    <Stack key="ag3"><SHead stepNum={3} total={3} title="Partnership Goals" badge="Agency / Reseller" /><FF label="Why Do You Want to Partner With Apollo[Claw]?" required><TArea value={d.whyPartner} onChange={v => sd("whyPartner", v)} placeholder="What gap are you trying to fill? What are clients asking for that you can't deliver today?" rows={3} /></FF><FF label="Revenue Goal From This Partnership"><TSelect value={d.revenue} onChange={v => sd("revenue", v)} options={["Under $1k/mo additional revenue","$1k–$5k/mo","$5k–$15k/mo","$15k–$50k/mo","$50k+/mo","Not focused on revenue — it's a client retention play"]} /></FF><FF label="Desired Start Timeline"><TSelect value={d.timeline} onChange={v => sd("timeline", v)} options={["ASAP","Within 30 days","1–3 months","3–6 months","Just exploring"]} /></FF><FF label="Questions or Anything Else We Should Know"><TArea value={d.questions} onChange={v => sd("questions", v)} rows={3} /></FF></Stack>,
  ];
  return <Shell steps={AGY_STEPS} step={step} gate={gate} onBack={back} onNext={next} onSubmit={submit} isLast={step === 2}>{pages[step]}</Shell>;
}
// ════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════
export default function OnboardPage() {
  const [phase, setPhase] = useState<"gate" | "track" | "form" | "submitting" | "done">("gate");
  const [gate, setGate] = useState<GateData>({ first: "", last: "", email: "", phone: "", heard: [], tz: "", title: "", linkedin: "", company: "" });
  const [track, setTrack] = useState("");
  const [doneTrack, setDoneTrack] = useState("");
  const handleGate = (info: GateData) => { setGate(info); setTrack("business"); setPhase("form"); };
  const handleTrack = (t: string) => { setTrack(t); setPhase("form"); };
  const handleDone = async (data: Record<string, unknown>, trackType: string) => {
    setPhase("submitting");
    try {
      const res = await fetch("/api/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, trackType }) });
      if (!res.ok) throw new Error("Submission failed");
      setDoneTrack(trackType);
      setPhase("done");
    } catch (err) {
      console.error("Submission error:", err);
      setPhase("form");
      alert("Something went wrong submitting your application. Please try again.");
    }
  };
  // Gate removed — form starts at track selection directly
  if (phase === "gate") return <Gatekeeper onPass={handleGate} />;
  if (phase === "track") return <TrackSelector gate={gate!} onSelect={handleTrack} />;
  if (phase === "submitting") return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 48, height: 48, border: `3px solid ${SRF2}`, borderTopColor: R, borderRadius: "50%", animation: "oc-spin 1s linear infinite", marginBottom: 24 }} />
      <h2 style={{ fontSize: 24, fontWeight: 900, color: TX, margin: "0 0 8px" }}>Submitting Your Application…</h2>
      <p style={{ fontSize: 14, color: TXM }}>This will only take a moment.</p>
      <style>{`@keyframes oc-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (phase === "done") return <Success track={doneTrack} />;
  if (phase === "form") {
    if (track === "business" || track === "personal") return <BizTrack gate={gate} onDone={handleDone} />;
    if (track === "collegiate") return <ColTrack gate={gate} onDone={handleDone} />;
    if (track === "agency") return <AgencyTrack gate={gate} onDone={handleDone} />;
  }
  return null;
}
