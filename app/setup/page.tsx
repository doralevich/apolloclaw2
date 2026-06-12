"use client";
import { useState } from "react";
const R = "#D72B2B";
const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const SRF2 = "#E8E7E3";
const BDR = "rgba(0,0,0,0.08)";
const TX = "#1A1A1A";
const TXM = "#555555";
const TXD = "#888888";
const SETUP_ENDPOINT = "/api/submit-setup";
type Step = 1 | 2 | "done";
interface Step1Fields {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  assistant_name: string;
  timezone: string;
  computer_name: string;
  it_contact_name: string;
  it_contact_email: string;
  it_notes: string;
}
interface Step2Fields {
  anthropic_api_key: string;
  telegram_bot_token: string;
  telegram_bot_username: string;
  meeting_recorder: "fathom" | "fireflies" | "";
  fathom_email: string;
  fathom_password: string;
  fireflies_api_key: string;
  tavily_api_key: string;
  calendly_url: string;
}
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
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
function TSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  const { onFocus, onBlur, focused } = useF();
  return <select value={value} onChange={e => onChange(e.target.value)} style={{ ...iBase, cursor: "pointer", borderColor: focused ? R : BDR, boxShadow: focused ? `0 0 0 3px rgba(232,52,42,0.1)` : "none" }} onFocus={onFocus} onBlur={onBlur}>{children}</select>;
}
function FF({ label, hint, required, children }: { label?: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      {label && <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TXM, marginBottom: 7 }}>{label}{required && <span style={{ color: R, marginLeft: 4 }}>*</span>}</p>}
      {hint && <p style={{ fontSize: 11, color: TXD, marginBottom: 7, lineHeight: 1.5 }}>{hint}</p>}
      {children}
    </div>
  );
}
function Stack({ children, gap = 22 }: { children: React.ReactNode; gap?: number }) {
  return <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>;
}
function Row2({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`.oc-row2{display:grid;grid-template-columns:1fr 1fr;gap:16px}@media(max-width:600px){.oc-row2{grid-template-columns:1fr}}`}</style>
      <div className="oc-row2">{children}</div>
    </>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "32px 36px" }}>{children}</div>;
}
function SectionHeader({ number, label }: { number: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${BDR}` }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R }}>{number} — {label}</span>
    </div>
  );
}
function Disclosure({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${BDR}`, borderLeft: `3px solid ${R}`, borderRadius: "0 6px 6px 0", background: "#fffdf9", marginBottom: 16, overflow: "hidden" }}>
      <button type="button" onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", cursor: "pointer", background: "transparent", border: "none", fontFamily: "inherit" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: TX }}>{open ? "▼" : "▶"} {title}</span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: R }}>{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          <ol style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>{children}</ol>
        </div>
      )}
    </div>
  );
}
function Step({ children }: { children: React.ReactNode }) {
  return <li style={{ fontSize: 12, color: TXM, lineHeight: 1.7 }}>{children}</li>;
}
function Code({ children }: { children: React.ReactNode }) {
  return <code style={{ background: SRF2, padding: "1px 5px", borderRadius: 3, fontFamily: "monospace", fontSize: 11, color: TX }}>{children}</code>;
}
export default function SetupPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [s1, setS1] = useState<Step1Fields>({ first_name: "", last_name: "", email: "", phone: "", assistant_name: "", timezone: "", computer_name: "", it_contact_name: "", it_contact_email: "", it_notes: "" });
  const [s2, setS2] = useState<Step2Fields>({ anthropic_api_key: "", telegram_bot_token: "", telegram_bot_username: "", meeting_recorder: "", fathom_email: "", fathom_password: "", fireflies_api_key: "", tavily_api_key: "", calendly_url: "" });
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [itEmailCopied, setItEmailCopied] = useState<"google"|"ms365"|null>(null);
  const updateS1 = (key: keyof Step1Fields, value: string) => setS1(p => ({ ...p, [key]: value }));
  const updateS2 = (key: keyof Step2Fields, value: string) => setS2(p => ({ ...p, [key]: value }));
  const copyItEmail = (platform: "google"|"ms365") => {
    const name = s1.first_name ? `${s1.first_name} ${s1.last_name}`.trim() : "[Client Name]";
    const company = "[Your Company Name]";
    const googleEmail = `Subject: AI Assistant Integration Request — Google Workspace Access Needed

Hi [IT Contact Name],

I am setting up an AI Chief of Staff through Apollo[Claw] (apolloclaw.ai) that will integrate with my Google Workspace account. Before the technical team completes installation, please confirm the following is in place.

GOOGLE API SCOPES REQUIRED (my account only — OAuth 2.0)
Email & Communication:
- gmail.readonly — read incoming emails
- gmail.send — send emails on my behalf
- gmail.modify — label, archive, and organize messages

Calendar & Scheduling:
- calendar.events — read/create/update/delete calendar events
- calendar.readonly — read calendar details for meeting briefs

Drive & Documents:
- drive.file — read/write files created by the assistant
- docs — read/write Google Docs (proposals, SOWs, summaries)
- spreadsheets — read/write Google Sheets (reports, trackers)

Contacts & People:
- contacts.readonly — read contacts for relationship intelligence
- people.readonly — read profile data for meeting prep

Tasks:
- tasks — read/write Google Tasks (task management and follow-ups)

ADMIN CONSOLE ACTION REQUIRED (if your org restricts third-party OAuth apps)
If your Google Workspace admin has restricted OAuth app access, you will need to whitelist the Apollo[Claw] integration. Please go to:
Admin Console > Security > API Controls > App Access Control
and allow access for the Apollo[Claw] application, or set the trust level to "Trusted" for the OAuth client ID provided during setup.

OUTBOUND NETWORK REQUIREMENTS (port 443 / HTTPS only)
- api.anthropic.com — AI model (Claude)
- api.telegram.org — delivery channel
- api.tavily.com — web research
- fathom.video — meeting intelligence
- oauth2.googleapis.com / accounts.google.com — Google OAuth
- www.googleapis.com — Google API calls

WHAT IT DOES NOT DO
- Does not store OAuth tokens or credentials on any external server
- Does not share data outside the API endpoints listed above
- All processing runs on a dedicated Mac Mini inside the local environment
- No access to other users' accounts, shared drives, or admin settings
- No data leaves the approved endpoints

INSTALLATION SCOPE
- One dedicated Mac Mini assigned to ${name}
- No software installed on any other machine
- No VPN or inbound access required — outbound HTTPS only

Please advise if any of the above requires a formal app approval request or if there are additional steps needed for your environment. David Oralevich at Apollo[Claw] can speak directly with your team if helpful.

david@apolloclaw.ai | 917.363.5487 | apolloclaw.ai

Thank you,
${name}`;

    const ms365Email = `Subject: AI Assistant Integration Request — Microsoft 365 Access Needed

Hi [IT Contact Name],

I am setting up an AI Chief of Staff through Apollo[Claw] (apolloclaw.ai) that will integrate with my Microsoft 365 account. Before the technical team completes installation, please confirm the following is in place.

MICROSOFT GRAPH API PERMISSIONS REQUIRED (my account only — delegated permissions)
Email & Communication:
- Mail.ReadWrite — read, organize, and label incoming emails
- Mail.Send — send emails on my behalf

Calendar & Scheduling:
- Calendars.ReadWrite — read/create/update/delete calendar events

Contacts & People:
- Contacts.Read — read contacts for relationship intelligence
- User.Read — basic profile (required for all Graph API connections)

Files & Documents:
- Files.ReadWrite — read/write OneDrive files (proposals, SOWs, summaries)
- Sites.ReadWrite.All — read/write SharePoint document libraries (if company uses SharePoint for file storage)

Tasks:
- Tasks.ReadWrite — read/write Microsoft To-Do / Planner tasks

AZURE AD / ENTRA ID ACTION REQUIRED (if your org restricts app consent)
If your organization has disabled user consent for OAuth applications or requires admin pre-approval, an IT administrator will need to grant tenant-wide admin consent for the Apollo[Claw] Microsoft Graph application.

Steps:
1. Go to Azure Portal > Azure Active Directory > Enterprise Applications
2. Find or register the Apollo[Claw] app (Client ID provided during setup)
3. Grant admin consent for the delegated permissions listed above
4. If Conditional Access policies restrict external OAuth apps, add an exception for this application

All permissions are delegated (user-level only) — no application-level or admin permissions are requested.

OUTBOUND NETWORK REQUIREMENTS (port 443 / HTTPS only)
- api.anthropic.com — AI model (Claude)
- api.telegram.org — delivery channel
- api.tavily.com — web research
- fathom.video — meeting intelligence
- login.microsoftonline.com — Microsoft OAuth
- graph.microsoft.com — Microsoft Graph API calls

WHAT IT DOES NOT DO
- Does not store OAuth tokens or credentials on any external server
- Does not share data outside the API endpoints listed above
- All processing runs on a dedicated Mac Mini inside the local environment
- No access to other users' mailboxes, SharePoint sites, or admin settings
- No data leaves the approved endpoints

INSTALLATION SCOPE
- One dedicated Mac Mini assigned to ${name}
- No software installed on any other machine
- No VPN or inbound access required — outbound HTTPS only

Apollo[Claw] can provide additional technical documentation, an app manifest, or join a call with your IT team if needed.

david@apolloclaw.ai | 917.363.5487 | apolloclaw.ai

Thank you,
${name}`;

    const text = platform === "google" ? googleEmail : ms365Email;
    navigator.clipboard.writeText(text).then(() => {
      setItEmailCopied(platform);
      setTimeout(() => setItEmailCopied(null), 3000);
    });
  };
  async function submitStep1() {
    setError("");
    const { first_name, last_name, email, assistant_name, timezone, computer_name } = s1;
    if (!first_name || !last_name || !email || !assistant_name || !timezone || !computer_name) {
      setError("Please complete all required fields before continuing.");
      return;
    }
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    try {
      const res = await fetch(SETUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "apollo_setup_1", email, fields: s1 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Submission failed.");
      setClientEmail(email);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStep(2);
    } catch {
      setError("Something went wrong. Please try again or email hello@apolloclaw.ai");
    } finally {
      setLoading(false);
    }
  }
  async function submitStep2() {
    setError("");
    const { anthropic_api_key, telegram_bot_token, telegram_bot_username } = s2;
    if (!anthropic_api_key || !telegram_bot_token || !telegram_bot_username) {
      setError("Please complete all required fields before submitting.");
      return;
    }
    if (!anthropic_api_key.startsWith("sk-ant-")) {
      setError("Your Anthropic API key should start with sk-ant-... Please double-check it.");
      return;
    }
    if (!telegram_bot_username.startsWith("@")) {
      setError("Your Telegram bot username should start with @ (e.g. @NovaAssistant_bot).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(SETUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "apollo_setup_2", email: clientEmail, fields: { ...s1, ...s2 } }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Submission failed.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStep("done");
    } catch {
      setError("Something went wrong. Please try again or email hello@apolloclaw.ai");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <style>{`.oc-ph::placeholder{color:#9ca3af!important}`}</style>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: 64, borderBottom: `1px solid ${BDR}`, background: "rgba(17,18,20,0.97)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Apollo</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: R }}>[</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Claw</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: R }}>]</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Technical Setup</span>
      </nav>
      {/* Hero */}
      <div style={{ background: `radial-gradient(ellipse 80% 50% at 50% -5%,rgba(232,52,42,0.14) 0%,transparent 70%),${SRF}`, borderBottom: `1px solid ${BDR}`, padding: "40px 32px 32px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 10px", color: TX }}>
          {step === "done" ? "You're all set." : <>Technical <span style={{ color: R }}>Setup</span></>}
        </h1>
        <p style={{ fontSize: 14, color: TXM, lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
          {step === 1 && "Two quick steps and your AI assistant is ready to deploy."}
          {step === 2 && "Almost done. Enter your API credentials and we'll handle the rest."}
          {step === "done" && "David will be in touch within 2 business days to schedule your first Zoom session."}
        </p>
      </div>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 24px 100px" }}>
        {/* Progress */}
        {step !== "done" && (
          <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: step === 1 ? R : "#16a34a", color: "#fff", border: `2px solid ${step === 1 ? R : "#16a34a"}`, transition: "all 0.2s" }}>
                {step === 1 ? "1" : "✓"}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: step === 1 ? TX : TXD }}>Your Setup</span>
            </div>
            <div style={{ flex: 1, height: 1, background: BDR, margin: "0 16px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: step === 2 ? R : "transparent", color: step === 2 ? "#fff" : TXD, border: `2px solid ${step === 2 ? R : BDR}`, transition: "all 0.2s" }}>
                2
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: step === 2 ? TX : TXD }}>Credentials</span>
            </div>
          </div>
        )}
        {/* STEP 1 */}
        {step === 1 && (
          <Stack>
            <Card>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: R, marginBottom: 12 }}>Step 1 of 2</p>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: TX, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Let&apos;s get your AI ready to deploy.</h2>
              <p style={{ fontSize: 14, color: TXM, lineHeight: 1.7, margin: 0 }}>This first step covers the basics — who you are, what you want to call your AI, and your machine details. Credentials come next, and we&apos;ll walk you through each one.</p>
            </Card>
            <Card>
              <SectionHeader number="01" label="Your Info" />
              <Stack gap={16}>
                <Row2>
                  <FF label="First Name" required><TInput value={s1.first_name} onChange={v => updateS1("first_name", v)} placeholder="Jane" /></FF>
                  <FF label="Last Name" required><TInput value={s1.last_name} onChange={v => updateS1("last_name", v)} placeholder="Smith" /></FF>
                </Row2>
                <FF label="Business Email" required><TInput type="email" value={s1.email} onChange={v => updateS1("email", v)} placeholder="jane@yourbusiness.com" /></FF>
                <FF label="Phone Number" required><TInput type="tel" value={s1.phone || ""} onChange={v => updateS1("phone", v)} placeholder="+1 (___) ___-____" /></FF>
              </Stack>
            </Card>
            <Card>
              <SectionHeader number="02" label="Your AI Assistant" />
              <Stack gap={16}>
                <FF label="Preferred Assistant Name" hint="What do you want to call your AI? (e.g. Donna, Atlas, Nova)" required>
                  <TInput value={s1.assistant_name} onChange={v => updateS1("assistant_name", v)} placeholder="e.g. Nova" />
                </FF>
                <FF label="Preferred Timezone" hint="Used for scheduling, reminders, and heartbeat functions." required>
                  <TSelect value={s1.timezone} onChange={v => updateS1("timezone", v)}>
                    <option value="">Select your timezone...</option>
                    <optgroup label="United States">
                      <option value="America/New_York">Eastern Time (ET) — UTC-5/4</option>
                      <option value="America/Chicago">Central Time (CT) — UTC-6/5</option>
                      <option value="America/Denver">Mountain Time (MT) — UTC-7/6</option>
                      <option value="America/Los_Angeles">Pacific Time (PT) — UTC-8/7</option>
                      <option value="America/Anchorage">Alaska Time (AKT) — UTC-9/8</option>
                      <option value="Pacific/Honolulu">Hawaii Time (HST) — UTC-10</option>
                    </optgroup>
                    <optgroup label="International">
                      <option value="Europe/London">London (GMT/BST) — UTC+0/1</option>
                      <option value="Europe/Paris">Central Europe (CET) — UTC+1/2</option>
                      <option value="Asia/Jerusalem">Israel (IST) — UTC+2/3</option>
                      <option value="Asia/Kolkata">India (IST) — UTC+5:30</option>
                      <option value="Australia/Sydney">Australia Eastern (AEST) — UTC+10/11</option>
                    </optgroup>
                  </TSelect>
                </FF>
              </Stack>
            </Card>
            <Card>
              <SectionHeader number="03" label="Your Machine" />
              <FF label="Computer Name" hint="The name your Mac uses on your local network (found in System Settings → General → About)." required>
                <TInput value={s1.computer_name} onChange={v => updateS1("computer_name", v)} placeholder="e.g. Janes-MacBook-Pro" />
              </FF>
            </Card>
            <Card>
              <SectionHeader number="04" label="Corporate / Enterprise Setup" />
              <p style={{ fontSize: 12, color: TXM, marginBottom: 16, lineHeight: 1.6 }}>Deploying inside a managed corporate environment? IT may need to be involved for VPN access, firewall rules, SSO, or procurement approval. Check the box below so we can coordinate directly with your team.</p>
              <button type="button" onClick={() => setIsEnterprise(!isEnterprise)} style={{ display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left", padding: "14px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit", lineHeight: 1.55, width: "100%", background: isEnterprise ? "rgba(215,43,43,0.1)" : SRF2, border: `1px solid ${isEnterprise ? "rgba(215,43,43,0.45)" : BDR}`, color: isEnterprise ? TX : TXM, marginBottom: 16 }}>
                <span style={{ flexShrink: 0, marginTop: 2, fontSize: 16 }}>{isEnterprise ? "☑" : "☐"}</span>
                <span><strong>This is a Corporate / Enterprise deployment.</strong> Our IT team needs to be involved, or there are managed network restrictions that may affect the setup.</span>
              </button>
              {isEnterprise && (
                <Stack gap={16}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: R, marginBottom: 4 }}>IT Contact — Who Mike Reaches Out To</p>
                  <p style={{ fontSize: 12, color: TXM, marginBottom: 12, lineHeight: 1.6 }}>Once you submit, Mike will contact this person directly to coordinate the setup. This is your IT manager, MSP, or the person who handles system access at your company.</p>
                  <Row2>
                    <FF label="IT Contact Name">
                      <TInput value={s1.it_contact_name} onChange={v => updateS1("it_contact_name", v)} placeholder="IT Manager or MSP contact" />
                    </FF>
                    <FF label="IT Contact Email">
                      <TInput type="email" value={s1.it_contact_email} onChange={v => updateS1("it_contact_email", v)} placeholder="it@company.com" />
                    </FF>
                  </Row2>
                  <FF label="Known Restrictions or Notes">
                    <textarea value={s1.it_notes} onChange={e => updateS1("it_notes", e.target.value)} placeholder="Anything you already know: firewall rules, VPN requirements, managed device policy, procurement process, Azure AD restrictions..." style={{ width: "100%", background: SRF2, border: `1px solid ${BDR}`, borderRadius: 6, color: TX, fontSize: 14, fontFamily: "inherit", padding: "10px 14px", outline: "none", minHeight: 80, resize: "vertical", boxSizing: "border-box" }} />
                  </FF>
                  <div style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 6, padding: "14px 16px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: R, marginBottom: 10 }}>What We Need IT to Confirm</p>
                    <p style={{ fontSize: 12, color: TXM, marginBottom: 10, lineHeight: 1.6 }}>When IT replies to the email above, we need the following confirmed. Mike will follow up on anything not addressed.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      <ul style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      {[
                        "OAuth app authorization — allowed, requires admin approval, or blocked",
                        "Outbound HTTPS (port 443) permitted to: api.anthropic.com, api.telegram.org, api.tavily.com, fathom.video",
                        "Google Admin Console or Azure AD consent policy — approval process if required",
                        "Managed device policy — any restrictions on installing software on the Mac Mini",
                        "Procurement or vendor approval requirements (contracts, insurance, DPA)",
                        "Preferred timeline and IT availability for the pre-setup call"
                      ].map((item, i) => (
                        <li key={i} style={{ fontSize: 12, color: TX, lineHeight: 1.65 }}>{item}</li>
                      ))}
                      </ul>
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${BDR}`, paddingTop: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: R, marginBottom: 8 }}>Pre-Written IT Department Email</p>
                    <p style={{ fontSize: 12, color: TXM, marginBottom: 12, lineHeight: 1.6 }}>Copy and send this to your IT team. It covers exactly what Apollo[Claw] needs — API access, outbound endpoints, and what we do not touch. Choose your platform:</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button type="button" onClick={() => copyItEmail("google")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 6, border: `1px solid ${itEmailCopied === "google" ? "#16a34a" : BDR}`, background: itEmailCopied === "google" ? "rgba(22,163,74,0.1)" : SRF2, color: itEmailCopied === "google" ? "#16a34a" : TXM, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
                        <span style={{ fontSize: 16 }}>{itEmailCopied === "google" ? "✓" : "📋"}</span>
                        {itEmailCopied === "google" ? "Copied!" : "Copy — Google Workspace"}
                      </button>
                      <button type="button" onClick={() => copyItEmail("ms365")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 6, border: `1px solid ${itEmailCopied === "ms365" ? "#16a34a" : BDR}`, background: itEmailCopied === "ms365" ? "rgba(22,163,74,0.1)" : SRF2, color: itEmailCopied === "ms365" ? "#16a34a" : TXM, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
                        <span style={{ fontSize: 16 }}>{itEmailCopied === "ms365" ? "✓" : "📋"}</span>
                        {itEmailCopied === "ms365" ? "Copied!" : "Copy — Microsoft 365"}
                      </button>
                    </div>
                    <p style={{ fontSize: 11, color: TXD, marginTop: 8, lineHeight: 1.5 }}>The email includes required API scopes, outbound endpoint list, and what the assistant does not access. Edit [brackets] before sending.</p>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fffdf9", border: `1px solid ${BDR}`, borderLeft: `3px solid ${R}`, borderRadius: "0 6px 6px 0", padding: "12px 14px" }}>
                    <span style={{ color: R, fontSize: 12, marginTop: 1, flexShrink: 0 }}>■</span>
                    <p style={{ fontSize: 11, color: TXD, lineHeight: 1.6, margin: 0 }}>We will reach out to you and your IT contact before scheduling any installation. Enterprise deployments include a dedicated pre-setup call to map the environment and confirm requirements.</p>
                  </div>
                </Stack>
              )}
            </Card>
            {error && <div style={{ padding: "10px 14px", borderRadius: 6, background: "rgba(232,52,42,0.08)", border: `1px solid rgba(232,52,42,0.3)`, fontSize: 13, color: "#b91c1c" }}>{error}</div>}
            <button onClick={submitStep1} disabled={loading} style={{ width: "100%", background: loading ? SRF2 : R, color: loading ? TXD : "#fff", fontFamily: "inherit", fontWeight: 800, fontSize: 15, padding: "14px", borderRadius: 6, border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
              {loading ? "Saving…" : "Continue to Step 2 →"}
            </button>
          </Stack>
        )}
        {/* STEP 2 */}
        {step === 2 && (
          <Stack>
            <Card>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: R, marginBottom: 12 }}>Step 2 of 2</p>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: TX, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Your API Credentials</h2>
              <p style={{ fontSize: 14, color: TXM, lineHeight: 1.7, margin: 0 }}>These keys connect your AI to the services it needs. Each instruction block below walks you through exactly where to find them.</p>
            </Card>
            <Card>
              <SectionHeader number="01" label="Anthropic API Key" />
              <Disclosure title="How to get your Anthropic API key">
                <Step>Go to <strong>console.anthropic.com</strong> and sign in (or create an account).</Step>
                <Step>Click your name in the top right → <strong>API Keys</strong>.</Step>
                <Step>Click <strong>Create Key</strong>, give it a name (e.g. <Code>My AI Assistant</Code>), and copy the key immediately — it won&apos;t be shown again.</Step>
                <Step>The key starts with <Code>sk-ant-api03-...</Code> — paste it below.</Step>
                <Step>You&apos;ll need to add a payment method and purchase credits. We recommend starting with $20–$50.</Step>
              </Disclosure>
              <FF label="Anthropic API Key" hint="Starts with sk-ant-..." required>
                <TInput value={s2.anthropic_api_key} onChange={v => updateS2("anthropic_api_key", v)} placeholder="sk-ant-api03-..." />
              </FF>
            </Card>
            <Card>
              <SectionHeader number="02" label="Telegram Bot" />
              <Disclosure title="How to create your Telegram bot">
                <Step>Open Telegram and search for <strong>@BotFather</strong> — the official blue-check bot.</Step>
                <Step>Start a chat and send the command <Code>/newbot</Code>.</Step>
                <Step>BotFather asks for a <strong>display name</strong> (e.g. <Code>Nova Assistant</Code>) — this is what users see.</Step>
                <Step>Then it asks for a <strong>username</strong> — must end in <Code>bot</Code> (e.g. <Code>NovaAssistant_bot</Code>).</Step>
                <Step>BotFather gives you a <strong>Token</strong> — a long string like <Code>123456789:ABCdef...</Code> — copy it.</Step>
                <Step>Paste both the Token and the Username (@) into the fields below.</Step>
              </Disclosure>
              <Stack gap={16}>
                <FF label="Telegram Bot Token" hint="Format: 123456789:ABCdef..." required>
                  <TInput value={s2.telegram_bot_token} onChange={v => updateS2("telegram_bot_token", v)} placeholder="123456789:ABCdef..." />
                </FF>
                <FF label="Telegram Bot Username" hint="Starts with @ and ends in bot (e.g. @NovaAssistant_bot)" required>
                  <TInput value={s2.telegram_bot_username} onChange={v => updateS2("telegram_bot_username", v)} placeholder="@YourBotName_bot" />
                </FF>
              </Stack>
            </Card>
            <Card>
              <SectionHeader number="2B" label="Meeting Intelligence" />
              <p style={{ fontSize: 12, color: TXM, marginBottom: 16, lineHeight: 1.6 }}>Required for post-call workflow, pre-meeting briefs, and contact intelligence. Select which platform you use.</p>
              <Stack gap={16}>
                <FF label="Which meeting recorder do you use?" required>
                  <div style={{ display: "flex", gap: 12 }}>
                    {(["fathom", "fireflies"] as const).map(opt => (
                      <button key={opt} type="button" onClick={() => updateS2("meeting_recorder", opt)}
                        style={{ flex: 1, padding: "10px 0", borderRadius: 6, border: `2px solid ${s2.meeting_recorder === opt ? R : BDR}`, background: s2.meeting_recorder === opt ? "rgba(232,52,42,0.06)" : "transparent", color: s2.meeting_recorder === opt ? R : TXM, fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "capitalize", letterSpacing: "0.05em" }}>
                        {opt === "fathom" ? "Fathom" : "Fireflies"}
                      </button>
                    ))}
                  </div>
                </FF>
                {s2.meeting_recorder === "fathom" && (<>
                  <p style={{ fontSize: 11, color: TXM, margin: 0, lineHeight: 1.6 }}>Get a free account at <a href="https://fathom.video" target="_blank" rel="noopener noreferrer" style={{ color: R, textDecoration: "none", fontWeight: 600 }}>fathom.video</a></p>
                  <FF label="Fathom Account Email" hint="The email you use to log into Fathom">
                    <TInput type="email" value={s2.fathom_email} onChange={v => updateS2("fathom_email", v)} placeholder="you@company.com" />
                  </FF>
                  <FF label="Fathom Account Password" hint="Used to connect the integration during setup">
                    <TInput type="password" value={s2.fathom_password} onChange={v => updateS2("fathom_password", v)} placeholder="••••••••••••" />
                  </FF>
                </>)}
                {s2.meeting_recorder === "fireflies" && (<>
                  <p style={{ fontSize: 11, color: TXM, margin: 0, lineHeight: 1.6 }}>Get your API key at <a href="https://app.fireflies.ai/integrations/custom/fireflies" target="_blank" rel="noopener noreferrer" style={{ color: R, textDecoration: "none", fontWeight: 600 }}>fireflies.ai</a> → Integrations → API</p>
                  <FF label="Fireflies API Key" hint="Found in Fireflies → Integrations → API Key">
                    <TInput value={s2.fireflies_api_key} onChange={v => updateS2("fireflies_api_key", v)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                  </FF>
                </>)}
              </Stack>
            </Card>
            <Card>
              <SectionHeader number="2C" label="Tavily — Web Search & Research" />
              <p style={{ fontSize: 12, color: TXM, marginBottom: 16, lineHeight: 1.6 }}>Powers real-time research, competitive intelligence, and market monitoring. Get your free API key at <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" style={{ color: R, textDecoration: "none", fontWeight: 600 }}>tavily.com</a> — takes 2 minutes.</p>
              <Stack gap={16}>
                <FF label="Tavily API Key" hint="Format: tvly-...">
                  <TInput value={s2.tavily_api_key} onChange={v => updateS2("tavily_api_key", v)} placeholder="tvly-..." />
                </FF>
              </Stack>
            </Card>
            <Card>
              <SectionHeader number="2D" label="Calendly — Scheduling" />
              <p style={{ fontSize: 12, color: TXM, marginBottom: 16, lineHeight: 1.6 }}>Required for automated scheduling and calendar management. Leave blank if you don&apos;t use Calendly.</p>
              <Stack gap={16}>
                <FF label="Calendly Link" hint="Your personal or team scheduling URL">
                  <TInput type="url" value={s2.calendly_url} onChange={v => updateS2("calendly_url", v)} placeholder="https://calendly.com/yourname" />
                </FF>
              </Stack>
            </Card>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fffdf9", border: `1px solid ${BDR}`, borderLeft: `3px solid ${R}`, borderRadius: "0 6px 6px 0", padding: "12px 14px" }}>
              <span style={{ color: R, fontSize: 12, marginTop: 1, flexShrink: 0 }}>■</span>
              <p style={{ fontSize: 11, color: TXD, lineHeight: 1.6, margin: 0 }}>Your credentials are transmitted securely over HTTPS and used solely to configure your deployment. They are never shared, sold, or stored beyond setup. Questions? <strong style={{ color: TX }}>hello@apolloclaw.ai</strong></p>
            </div>
            {error && <div style={{ padding: "10px 14px", borderRadius: 6, background: "rgba(232,52,42,0.08)", border: `1px solid rgba(232,52,42,0.3)`, fontSize: 13, color: "#b91c1c" }}>{error}</div>}
            <button onClick={submitStep2} disabled={loading} style={{ width: "100%", background: loading ? SRF2 : R, color: loading ? TXD : "#fff", fontFamily: "inherit", fontWeight: 800, fontSize: 15, padding: "14px", borderRadius: 6, border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
              {loading ? "Submitting…" : "Complete My Setup →"}
            </button>
          </Stack>
        )}
        {/* SUCCESS */}
        {step === "done" && (
          <div style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "60px 40px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid #16a34a`, background: "rgba(22,163,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13.5L10 18.5L21 8" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: TX, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Setup complete.</h2>
            <p style={{ fontSize: 14, color: TXM, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 8px" }}>David will configure your Mac Mini and reach out to schedule your first Zoom session within 2 business days.</p>
            <p style={{ fontSize: 14, color: TXM, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 36px" }}>Questions in the meantime: <a href="mailto:david@apolloclaw.ai" style={{ color: R, textDecoration: "none", fontWeight: 600 }}>david@apolloclaw.ai</a></p>
            <a href="https://apolloclaw.ai" style={{ display: "inline-block", background: R, color: "#fff", fontWeight: 800, fontSize: 15, padding: "14px 36px", borderRadius: 6, textDecoration: "none" }}>Return to Apollo[Claw] →</a>
          </div>
        )}
        <p style={{ fontSize: 12, color: TXD, textAlign: "center", marginTop: 32 }}>Apollo[Claw] — apolloclaw.ai — Your Business. Your Data. Your AI.</p>
      </div>
      <div style={{ borderTop: `1px solid ${BDR}`, padding: "16px 32px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: TXD }}>© {new Date().getFullYear()} Apollo[Claw]</span>
        <span style={{ fontSize: 12, color: TXD }}>hello@apolloclaw.ai</span>
      </div>
    </div>
  );
}
