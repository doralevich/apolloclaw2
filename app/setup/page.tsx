"use client";
import { useState } from "react";
import { suggestBotUsername } from "@/lib/telegram-username";
const R = "#D72B2B";
const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const SRF2 = "#E8E7E3";
const BDR = "rgba(0,0,0,0.08)";
const TX = "#1A1A1A";
const TXM = "#555555";
const TXD = "#888888";
const SETUP_ENDPOINT = "/api/submit-setup";
interface Step1Fields {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  assistant_name: string;
  timezone: string;
  computer_name: string;
}
interface Step2Fields {
  anthropic_api_key: string;
  telegram_bot_token: string;
  telegram_bot_username: string;
}
// A second Telegram bot, for a second person (David, Nov 10 2026). Shown only when the client
// asks for it, and sent only then.
interface SecondBotFields {
  telegram2_for: string;
  telegram_bot_token_2: string;
  telegram_bot_username_2: string;
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
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: R }}>{number}: {label}</span>
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
// A value the client copies into Telegram, with a Copy button: /newbot, then the username. The
// same pair the dashboard's channel setup offers (components/channels/pieces.tsx), drawn in this
// page's own styling.
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false)
    );
  };
  return (
    <div>
      <p style={{ fontSize: 12, color: TXM, marginBottom: 6 }}>{label}</p>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <code style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", background: SRF2, border: `1px solid ${BDR}`, borderRadius: 6, padding: "10px 14px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, color: TX }}>{value}</code>
        <button type="button" onClick={copy} aria-label={`Copy ${value}`} style={{ flexShrink: 0, background: "#fff", border: `1px solid ${BDR}`, borderRadius: 6, padding: "10px 16px", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: TX, cursor: "pointer" }}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
function Code({ children }: { children: React.ReactNode }) {
  return <code style={{ background: SRF2, padding: "1px 5px", borderRadius: 3, fontFamily: "monospace", fontSize: 11, color: TX }}>{children}</code>;
}
// ONE PAGE (David, Nov 10 2026). This used to be two steps, "Your Setup" then "Credentials",
// with a "Corporate / Enterprise Setup" section on the first: an IT contact, known
// restrictions, a checklist for IT, and pre-written emails to a Google Workspace or Microsoft
// 365 admin. That section is gone, and the two steps are one form with one submit.
//
// The single submit is the old second step's ("apollo_setup_2"), which already carried every
// field and does the whole handoff: the CRM deal at deployment_ready, the credentials encrypted
// for Super Admin, the summary email and the Telegram ping (app/api/submit-setup/route.ts). The
// first step's only job was a silent CRM upsert of a half-finished setup, which a one-page form
// has no use for. The endpoint still answers "apollo_setup_1" and still prints IT contact fields
// when they arrive, so a tab left open on the old page submits cleanly.
export default function SetupPage() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [s1, setS1] = useState<Step1Fields>({ first_name: "", last_name: "", email: "", phone: "", assistant_name: "", timezone: "", computer_name: "" });
  const [s2, setS2] = useState<Step2Fields>({ anthropic_api_key: "", telegram_bot_token: "", telegram_bot_username: "" });
  // The optional second Telegram account. Its username is suggested the same way as the first,
  // from the name of whoever it is for (else the assistant's), seeded differently so the two
  // never collide.
  const [second, setSecond] = useState(false);
  const [b2, setB2] = useState<SecondBotFields>({ telegram2_for: "", telegram_bot_token_2: "", telegram_bot_username_2: "" });
  const [username2Typed, setUsername2Typed] = useState(false);
  // The bot username is suggested from the assistant's name and the email
  // (apollo_agent_<name>_<nnn>_bot, lib/telegram-username.ts) until the client types their own.
  // It used to be filled in when step 1 was saved; on one page it follows those two fields live.
  const [usernameTyped, setUsernameTyped] = useState(false);
  const suggestedUsername =
    s1.assistant_name.trim() && validateEmail(s1.email.trim())
      ? `@${suggestBotUsername(s1.assistant_name, s1.email.trim().toLowerCase())}`
      : "";
  const botUsername = usernameTyped ? s2.telegram_bot_username : suggestedUsername;
  const suggestedUsername2 =
    (b2.telegram2_for.trim() || s1.assistant_name.trim()) && validateEmail(s1.email.trim())
      ? `@${suggestBotUsername(b2.telegram2_for.trim() || s1.assistant_name, `${s1.email.trim().toLowerCase()}#2`)}`
      : "";
  const botUsername2 = username2Typed ? b2.telegram_bot_username_2 : suggestedUsername2;
  const updateB2 = (key: keyof SecondBotFields, value: string) => setB2(p => ({ ...p, [key]: value }));
  const updateS1 = (key: keyof Step1Fields, value: string) => setS1(p => ({ ...p, [key]: value }));
  const updateS2 = (key: keyof Step2Fields, value: string) => setS2(p => ({ ...p, [key]: value }));
  async function submit() {
    setError("");
    const { first_name, last_name, email, assistant_name, timezone, computer_name } = s1;
    const { anthropic_api_key, telegram_bot_token } = s2;
    // A missing leading @ is added rather than refused.
    const typed = botUsername.trim().replace(/^@/, "");
    const telegram_bot_username = typed ? `@${typed}` : "";
    if (!first_name || !last_name || !email || !assistant_name || !timezone || !computer_name || !telegram_bot_token || !telegram_bot_username) {
      setError("Please complete all required fields before submitting.");
      return;
    }
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    // The Anthropic key is optional (David, Sept 28 2026); it is checked only when one is given.
    if (anthropic_api_key && !anthropic_api_key.trim().startsWith("sk-ant-")) {
      setError("Your Anthropic API key should start with sk-ant-... Please double-check it.");
      return;
    }
    if (!/^@[A-Za-z0-9_]{2,29}bot$/i.test(telegram_bot_username)) {
      setError("Please check the bot username: Telegram usernames use letters, numbers and underscores, and end in bot.");
      return;
    }
    // The second account, only when it was opened. Opened means wanted, so its token and
    // username are required like the first's.
    const typed2 = botUsername2.trim().replace(/^@/, "");
    const telegram_bot_username_2 = second && typed2 ? `@${typed2}` : "";
    if (second) {
      if (!b2.telegram_bot_token_2.trim() || !telegram_bot_username_2) {
        setError("Please add the second bot's token and username, or remove the second account.");
        return;
      }
      if (!/^@[A-Za-z0-9_]{2,29}bot$/i.test(telegram_bot_username_2)) {
        setError("Please check the second bot's username: letters, numbers and underscores, ending in bot.");
        return;
      }
      if (telegram_bot_username_2.toLowerCase() === telegram_bot_username.toLowerCase()) {
        setError("The two bots need different usernames.");
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch(SETUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "apollo_setup_2",
          email,
          fields: { ...s1, ...s2, telegram_bot_username, ...(second ? { ...b2, telegram_bot_username_2 } : {}) },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Submission failed.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setDone(true);
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
          {done ? "You're all set." : <>Technical <span style={{ color: R }}>Setup</span></>}
        </h1>
        <p style={{ fontSize: 14, color: TXM, lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
          {done
            ? "David will be in touch within 2 business days to schedule your first Zoom session."
            : "One page, and your AI assistant is ready to deploy. Each section says exactly where to find what it asks for."}
        </p>
      </div>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 24px 100px" }}>
        {/* THE FORM: who you are, your assistant, your machine, then the three credentials. */}
        {!done && (
          <Stack>
            <Card>
              <SectionHeader number="01" label="Your Info" />
              <Stack gap={16}>
                <Row2>
                  <FF label="First Name" required><TInput value={s1.first_name} onChange={v => updateS1("first_name", v)} placeholder="Jane" /></FF>
                  <FF label="Last Name" required><TInput value={s1.last_name} onChange={v => updateS1("last_name", v)} placeholder="Smith" /></FF>
                </Row2>
                <FF label="Email" required><TInput type="email" value={s1.email} onChange={v => updateS1("email", v)} placeholder="jane@example.com" /></FF>
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
                      <option value="America/New_York">Eastern Time (ET): UTC-5/4</option>
                      <option value="America/Chicago">Central Time (CT): UTC-6/5</option>
                      <option value="America/Denver">Mountain Time (MT): UTC-7/6</option>
                      <option value="America/Los_Angeles">Pacific Time (PT): UTC-8/7</option>
                      <option value="America/Anchorage">Alaska Time (AKT): UTC-9/8</option>
                      <option value="Pacific/Honolulu">Hawaii Time (HST): UTC-10</option>
                    </optgroup>
                    <optgroup label="International">
                      <option value="Europe/London">London (GMT/BST): UTC+0/1</option>
                      <option value="Europe/Paris">Central Europe (CET): UTC+1/2</option>
                      <option value="Asia/Jerusalem">Israel (IST): UTC+2/3</option>
                      <option value="Asia/Kolkata">India (IST): UTC+5:30</option>
                      <option value="Australia/Sydney">Australia Eastern (AEST): UTC+10/11</option>
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
              <SectionHeader number="04" label="Anthropic API Key" />
              <Disclosure title="How to get your Anthropic API key">
                <Step>Go to <strong>console.anthropic.com</strong> and sign in (or create an account).</Step>
                <Step>Click your name in the top right → <strong>API Keys</strong>.</Step>
                <Step>Click <strong>Create Key</strong>, give it a name (e.g. <Code>My AI Assistant</Code>), and copy the key immediately; it won&apos;t be shown again.</Step>
                <Step>The key starts with <Code>sk-ant-api03-...</Code>; paste it below.</Step>
                <Step>You&apos;ll need to add a payment method and purchase credits. We recommend starting with $20–$50.</Step>
              </Disclosure>
              <FF label="Anthropic API Key (optional)" hint="Starts with sk-ant-... Leave blank and we can set this up with you.">
                <TInput value={s2.anthropic_api_key} onChange={v => updateS2("anthropic_api_key", v)} placeholder="sk-ant-api03-..." />
              </FF>
            </Card>
            <Card>
              <SectionHeader number="05" label="Telegram Bot" />
              <p style={{ fontSize: 14, color: TXM, lineHeight: 1.7, margin: "0 0 16px" }}>Your assistant&apos;s own private bot. Follow these in Telegram, then bring the token back here.</p>
              <ol style={{ listStyle: "decimal", paddingLeft: 22, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: TX, lineHeight: 1.6 }}>
                <li>Open BotFather and send it <Code>/newbot</Code>.</li>
                <li>Name your bot anything, then send it the username below.</li>
                <li>Paste the token it sends back.</li>
              </ol>
              <div style={{ background: "#fff", border: `1px solid ${BDR}`, borderRadius: 10, padding: 18, display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 14px" }}>
                  {/* ?start= opens the BotFather chat itself; a bare t.me/BotFather often lands on a
                      chat list or a landing page instead. */}
                  <a href="https://t.me/BotFather?start=newbot" target="_blank" rel="noopener noreferrer" style={{ background: TX, color: "#fff", borderRadius: 999, padding: "10px 16px", fontSize: 14, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                    Open BotFather in Telegram
                  </a>
                  <span style={{ fontSize: 13, color: TXM }}>
                    No Telegram yet?{" "}
                    <a href="https://telegram.org/dl" target="_blank" rel="noopener noreferrer" style={{ color: TX, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>Get it here</a>
                  </span>
                </div>
                <CopyRow label="Send it this" value="/newbot" />
                {botUsername.trim() ? (
                  <CopyRow label="Then this username" value={botUsername.trim().replace(/^@/, "")} />
                ) : (
                  <p style={{ fontSize: 12, color: TXM, margin: 0 }}>Fill in your assistant&apos;s name and your email above and a username appears here, ready to copy.</p>
                )}
              </div>
              <Stack gap={16}>
                <FF label="Telegram Bot Token" hint="BotFather sends it after you choose the username. It looks like 123456789:ABCdef..." required>
                  <TInput value={s2.telegram_bot_token} onChange={v => updateS2("telegram_bot_token", v)} placeholder="Paste your bot token" />
                </FF>
                <FF label="Telegram Bot Username" hint="Filled in for you. Change it only if BotFather asked you for a different one." required>
                  <TInput value={botUsername} onChange={v => { setUsernameTyped(true); updateS2("telegram_bot_username", v); }} placeholder="@YourBotName_bot" />
                </FF>
              </Stack>
              {/* A second bot, for a second person: a business partner, an assistant, a spouse.
                  Each Telegram bot talks to whoever it is set up for, so a second person gets
                  their own. Closed until asked for; closing it clears what was typed. */}
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${BDR}` }}>
                <button
                  type="button"
                  onClick={() => {
                    if (second) { setB2({ telegram2_for: "", telegram_bot_token_2: "", telegram_bot_username_2: "" }); setUsername2Typed(false); }
                    setSecond(!second);
                  }}
                  aria-expanded={second}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", background: second ? "rgba(215,43,43,0.06)" : "#fff", border: `1px dashed ${second ? R : "rgba(0,0,0,0.25)"}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: TX }}
                >
                  <span aria-hidden style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: R, color: "#fff", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{second ? "−" : "+"}</span>
                  {second ? "Remove the additional Telegram account" : "Do you need an additional Telegram account?"}
                </button>
                {second && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 13, color: TXM, lineHeight: 1.6, margin: "0 0 14px" }}>A second bot, for a second person. Make it in BotFather the same way: send <Code>/newbot</Code>, then the username below, and paste the token it sends back.</p>
                    <Stack gap={16}>
                      <FF label="Who Is It For?" hint="Their name, so we set the bot up for the right person.">
                        <TInput value={b2.telegram2_for} onChange={v => updateB2("telegram2_for", v)} placeholder="e.g. Sam, my business partner" />
                      </FF>
                      {botUsername2.trim() && (
                        <CopyRow label="Username for the second bot" value={botUsername2.trim().replace(/^@/, "")} />
                      )}
                      <FF label="Second Bot Token" hint="From BotFather, after you choose the username." required>
                        <TInput value={b2.telegram_bot_token_2} onChange={v => updateB2("telegram_bot_token_2", v)} placeholder="Paste the second bot's token" />
                      </FF>
                      <FF label="Second Bot Username" hint="Filled in for you. Change it only if BotFather asked for a different one." required>
                        <TInput value={botUsername2} onChange={v => { setUsername2Typed(true); updateB2("telegram_bot_username_2", v); }} placeholder="@SecondBotName_bot" />
                      </FF>
                    </Stack>
                  </div>
                )}
              </div>
            </Card>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fffdf9", border: `1px solid ${BDR}`, borderLeft: `3px solid ${R}`, borderRadius: "0 6px 6px 0", padding: "12px 14px" }}>
              <span style={{ color: R, fontSize: 12, marginTop: 1, flexShrink: 0 }}>■</span>
              <p style={{ fontSize: 11, color: TXD, lineHeight: 1.6, margin: 0 }}>Your credentials are transmitted securely over HTTPS and used solely to configure your deployment. They are never shared, sold, or stored beyond setup. Questions? <strong style={{ color: TX }}>hello@apolloclaw.ai</strong></p>
            </div>
            {error && <div style={{ padding: "10px 14px", borderRadius: 6, background: "rgba(232,52,42,0.08)", border: `1px solid rgba(232,52,42,0.3)`, fontSize: 13, color: "#b91c1c" }}>{error}</div>}
            <button onClick={submit} disabled={loading} style={{ width: "100%", background: loading ? SRF2 : R, color: loading ? TXD : "#fff", fontFamily: "inherit", fontWeight: 800, fontSize: 15, padding: "14px", borderRadius: 6, border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
              {loading ? "Submitting…" : "Complete My Setup →"}
            </button>
          </Stack>
        )}
        {/* SUCCESS */}
        {done && (
          <div style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 12, padding: "60px 40px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid #16a34a`, background: "rgba(22,163,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 13.5L10 18.5L21 8" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: TX, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Setup complete.</h2>
            <p style={{ fontSize: 14, color: TXM, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 8px" }}>David will configure your Mac Mini and reach out to schedule your first Zoom session within 2 business days.</p>
            <p style={{ fontSize: 14, color: TXM, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 36px" }}>Questions in the meantime: <a href="mailto:hello@apolloclaw.ai" style={{ color: R, textDecoration: "none", fontWeight: 600 }}>hello@apolloclaw.ai</a></p>
            <a href="https://apolloclaw.ai" style={{ display: "inline-block", background: R, color: "#fff", fontWeight: 800, fontSize: 15, padding: "14px 36px", borderRadius: 6, textDecoration: "none" }}>Return to Apollo[Claw] →</a>
          </div>
        )}
        <p style={{ fontSize: 12, color: TXD, textAlign: "center", marginTop: 32 }}>Apollo[Claw], apolloclaw.ai, Your Business. Your Data. Your AI.</p>
      </div>
      <div style={{ borderTop: `1px solid ${BDR}`, padding: "16px 32px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: TXD }}>© {new Date().getFullYear()} Apollo[Claw]</span>
        <span style={{ fontSize: 12, color: TXD }}>hello@apolloclaw.ai</span>
      </div>
    </div>
  );
}
