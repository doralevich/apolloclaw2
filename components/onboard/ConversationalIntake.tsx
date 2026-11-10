"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ApolloClawLogo from "@/components/ApolloClawLogo";
import { BuildScreen } from "@/components/onboard/BuildScreen";
import ClassListInput from "@/components/onboard/ClassListInput";
import { AGENT_NAME_SUGGESTIONS, STACK_LOGOS } from "@/components/onboard/OnboardingForm";
import { AVATAR_PRESETS } from "@/config/avatar-presets";
import { getAgentType } from "@/config/agent-types";
import { agentBrand } from "@/lib/agentBrand";
import { apiFetch } from "@/lib/api";
import {
  buildQuestions,
  fromPayload,
  inlineLabel,
  isAnswered,
  toPayload,
  type Answers,
  type Question,
  type SignedInUser,
} from "@/lib/intake-questions";

// The questionnaire, one question at a time, inside the customer's account.
//
// The second of the two things David asked for on Nov 5 2026, modelled on the college agent's
// conversational intake: the agent asks, the owner answers with a tap or a line of text, and
// every answer is saved as it lands (PUT /api/agent-setup/draft), so a refresh or a closed tab
// resumes at the same question. The questions themselves come from lib/intake-questions.ts,
// which walks the same pages components/onboard/OnboardingForm.tsx renders; the payload the
// final submit sends is the one that form sends, so nothing downstream knows the difference.
//
// This replaces OnboardingForm's customer mode at /onboard/<type> (the form stays for the lead,
// white-glove and demo modes, and behind ?classic=1 here). The shape: a progress line, the
// agent's face and name, one question in large type, one control, Back and Continue. No card
// chrome beyond that, the way the connect flow is drawn.

const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const SRF2 = "#E8E7E3";
const BDR = "rgba(0,0,0,0.08)";
const TX = "#1A1A1A";
const TXM = "#555555";
const TXD = "#888888";
const FONT = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";

const SAVE_DEBOUNCE_MS = 900;

export type ConversationalIntakeProps = {
  agentTypeId: string;
  agentLabel: string;
  workspaceId?: string;
  agent37Id?: string;
  justPaid?: boolean;
  signedInUser?: SignedInUser;
  initialAnswers?: Record<string, unknown>;
  initialAgentName?: string;
  /** Where a saved draft left off, from its `intakeStep`. */
  initialStep?: number;
  /** Test harness only: stand-ins for the two network calls. */
  harness?: {
    save?: (payload: Record<string, unknown>, step: number) => Promise<void>;
    submit?: (body: Record<string, unknown>) => Promise<{ workspace_id?: string }>;
  };
};

export function ConversationalIntake(props: ConversationalIntakeProps) {
  const { agentTypeId, agentLabel, workspaceId, agent37Id, signedInUser, harness } = props;
  const brand = agentBrand(agentTypeId);
  const accent = brand.color;
  const accentRgb = brand.colorRgb;
  const type = getAgentType(agentTypeId);

  const [answers, setAnswers] = useState<Answers>(() => fromPayload(agentTypeId, props.initialAnswers, props.initialAgentName));
  const questions = useMemo(() => buildQuestions(agentTypeId, answers), [agentTypeId, answers]);
  // The questions actually asked, given the answers so far: a "which other industry" question
  // only exists once "Other" was picked, and the count the progress line shows is of these.
  const asked = useMemo(() => questions.filter((q) => !q.showIf || q.showIf(answers)), [questions, answers]);
  const [step, setStep] = useState(() => Math.max(0, Math.min(props.initialStep ?? 0, Math.max(0, asked.length - 1))));
  const current: Question | undefined = asked[Math.min(step, asked.length - 1)];

  const [phase, setPhase] = useState<"ask" | "submitting" | "building">("ask");
  const [error, setError] = useState("");
  const [buildWorkspace, setBuildWorkspace] = useState<string | undefined>(workspaceId);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  // An uploaded face for the agent (Nov 10 2026: David building a CEO Agent found no way to use
  // his own image; the ten-page form had "Upload your own", this did not). Kept here rather than
  // in the answers, because the answers autosave to the draft every few seconds and a picture is
  // megabytes. So it is sent once, with the build, as `avatar_upload`, which /api/agent-setup
  // has always accepted; a draft resumed later has the preset or the agent's own face instead.
  const [upload, setUpload] = useState<AvatarUploadPick | null>(null);
  // Documents for the agent to read. Like the face upload, the bytes stay in memory only: they
  // are sent once with the build and never autosaved.
  const [docs, setDocs] = useState<DocPick[]>([]);

  const first = signedInUser?.first?.trim() || "";
  const agentName = (typeof answers.top.agentName === "string" && answers.top.agentName.trim()) || inlineLabel(agentTypeId);
  const avatar = upload?.preview || (typeof answers.top.avatarPreset === "string" && answers.top.avatarPreset ? answers.top.avatarPreset : brand.mascot);

  // ── Autosave ────────────────────────────────────────────────────────────────────────────
  // Every change and every step lands on the server after a short pause, as a draft row the
  // page reads back on the next visit. A failed save is retried by the next change; nothing is
  // lost in the meantime because the answers are still on screen.
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);
  const save = useCallback(async () => {
    if (!workspaceId && !harness?.save) return;
    const payload = toPayload(agentTypeId, answers, signedInUser);
    setSaved("saving");
    try {
      if (harness?.save) await harness.save(payload, step);
      else {
        await apiFetch("/api/agent-setup/draft", {
          method: "PUT",
          body: JSON.stringify({
            workspace_id: workspaceId,
            agent_type: agentTypeId,
            agent37_id: agent37Id,
            answers: payload,
            agent_name: typeof answers.top.agentName === "string" ? answers.top.agentName : undefined,
            step,
          }),
        });
      }
      setSaved("saved");
    } catch {
      setSaved("idle");
    }
  }, [agentTypeId, agent37Id, answers, harness, signedInUser, step, workspaceId]);

  useEffect(() => {
    if (!dirty.current) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => void save(), SAVE_DEBOUNCE_MS);
    return () => {
      if (saveRef.current) clearTimeout(saveRef.current);
    };
  }, [answers, step, save]);

  const set = (q: Question, value: unknown) => {
    dirty.current = true;
    setAnswers((prev) => {
      if (q.bucket === "top") return { ...prev, top: { ...prev.top, [q.id]: value } };
      return { ...prev, [q.bucket]: { ...prev[q.bucket], [q.id]: value as string | string[] } };
    });
  };
  const get = (q: Question): unknown => (q.bucket === "top" ? answers.top[q.id] : answers[q.bucket][q.id]);
  const getOther = (q: Question): string => {
    const v = q.bucket === "top" ? answers.top[`${q.id}_other`] : answers[q.bucket][`${q.id}_other`];
    return typeof v === "string" ? v : "";
  };
  const setOther = (q: Question, value: string) => set({ ...q, id: `${q.id}_other` }, value);

  const canContinue = !current || !current.required || isAnswered(current, answers);
  const isLast = step >= asked.length - 1;

  const next = () => {
    if (!current) return;
    if (!canContinue) {
      setError("This one is needed before we go on.");
      return;
    }
    setError("");
    if (isLast) {
      void submit();
      return;
    }
    dirty.current = true;
    setStep((s) => Math.min(s + 1, asked.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setError("");
    dirty.current = true;
    setStep((s) => Math.max(0, s - 1));
  };

  // ── Submit: the same request OnboardingForm's customer mode sends ──────────────────────
  const submit = async () => {
    setPhase("submitting");
    setError("");
    if (saveRef.current) clearTimeout(saveRef.current);
    const payload = toPayload(agentTypeId, answers, signedInUser);
    const preset = typeof answers.top.avatarPreset === "string" && answers.top.avatarPreset ? answers.top.avatarPreset : undefined;
    const body = {
      workspace_id: workspaceId,
      agent37_id: agent37Id,
      agent_type: agentTypeId,
      answers: docs.length ? { ...payload, uploadedFiles: docs } : payload,
      agent_name: (typeof answers.top.agentName === "string" && answers.top.agentName.trim()) || undefined,
      // An upload and a preset are exclusive (picking one clears the other), so at most one goes.
      ...(upload ? { avatar_upload: { name: upload.name, type: upload.type, size: upload.size, dataBase64: upload.dataBase64 } } : { avatar_preset: preset }),
    };
    try {
      const res = harness?.submit
        ? await harness.submit(body)
        : await apiFetch<{ workspace_id?: string }>("/api/agent-setup", { method: "POST", body: JSON.stringify(body) });
      setBuildWorkspace(workspaceId || res.workspace_id);
      setPhase("building");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setPhase("ask");
    }
  };

  if (phase === "building") {
    return <BuildScreen agentTypeId={agentTypeId} agentLabel={agentLabel} workspaceId={buildWorkspace} />;
  }
  if (!current) return null;

  const sectionIndex = asked.findIndex((q) => q.section === current.section);
  const sectionCount = asked.filter((q) => q.section === current.section).length;
  const inSection = step - sectionIndex + 1;
  const progress = Math.round(((step + 1) / asked.length) * 100);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${BDR}`, background: "#fff" }}>
        <ApolloClawLogo ink={TX} height={24} />
        <span style={{ fontSize: 12, color: TXD }}>{saved === "saving" ? "Saving…" : saved === "saved" ? "Saved" : type?.label ?? "Setup"}</span>
      </header>
      {/* The progress bar is the whole questionnaire; the line under the question is the section. */}
      <div style={{ height: 3, background: SRF2 }}>
        <div style={{ height: 3, width: `${progress}%`, background: accent, transition: "width 0.3s" }} />
      </div>

      <main style={{ flex: 1, display: "flex", justifyContent: "center", padding: "40px 20px 60px" }}>
        <div style={{ width: "100%", maxWidth: 680 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: TXD, margin: "0 0 18px" }}>
            {current.section} · {inSection} of {sectionCount}
          </p>

          {/* The question sits on its own white card: everything from the agent's name to the
              Continue button belongs to one question. */}
          <section style={{ background: "#fff", border: "1px solid #DDDDDD", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            {avatar ? (
              // A photo fills the circle. The agent's own mascot is a full standing figure: a circle
              // either cut its arms off (cover) or shrank it to a speck (contain), so it stands
              // uncropped and unframed at the full row height.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" style={avatar === brand.mascot
                ? { width: "auto", height: 60, objectFit: "contain" }
                : { width: 52, height: 52, borderRadius: "50%", objectFit: "cover", background: SRF }} />
            ) : (
              <span style={{ width: 52, height: 52, fontSize: 20, borderRadius: "50%", background: accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{agentName[0]?.toUpperCase()}</span>
            )}
            <span style={{ fontSize: 15, fontWeight: 600, color: TXM }}>{agentName}</span>
          </div>

          {/* The question runs the full width of the card. "balance" split even a short question
              into two half-width lines; "pretty" fills each line and only avoids a lone last word. */}
          <h1 className="font-heading" style={{ fontSize: "clamp(24px,3.4vw,32px)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.15, color: TX, margin: "0 0 10px", textWrap: "pretty" }}>
            {step === 0 && first ? `${first}, ${current.ask.charAt(0).toLowerCase()}${current.ask.slice(1)}` : current.ask}
            {current.required && current.kind !== "confirm" && <span style={{ color: accent, marginLeft: 6, fontSize: "0.6em", verticalAlign: "top" }}>*</span>}
          </h1>
          {current.help && <p style={{ fontSize: 15, color: TXM, lineHeight: 1.6, margin: "0 0 26px" }}>{current.help}</p>}
          {!current.help && <div style={{ height: 18 }} />}

          {current.kind === "files" ? (
            <DocumentsPick docs={docs} onDocs={setDocs} budget={UPLOAD_BUDGET_BYTES - (upload?.size ?? 0)} accent={accent} accentRgb={accentRgb} onError={setError} />
          ) : (
          <Control q={current} value={get(current)} other={getOther(current)} onChange={(v) => set(current, v)} onOther={(v) => setOther(current, v)} onEnter={next} accent={accent} accentRgb={accentRgb} agentLabel={agentLabel} mascot={brand.mascot} upload={upload} onUpload={(u) => { setUpload(u); if (u) set(current, ""); }} onUploadError={setError} />
          )}

          {error && <p style={{ marginTop: 14, fontSize: 13, color: "#dc2626" }}>{error}</p>}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 34, gap: 12, flexWrap: "wrap" }}>
            <button type="button" onClick={back} disabled={step === 0 || phase === "submitting"} style={{ background: "transparent", border: `1px solid ${BDR}`, color: step === 0 ? TXD : TXM, fontFamily: "inherit", fontWeight: 600, fontSize: 14, padding: "11px 20px", borderRadius: 6, cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.5 : 1 }}>
              ← Back
            </button>
            <button type="button" onClick={next} disabled={phase === "submitting"} style={{ background: canContinue ? accent : SRF2, color: canContinue ? "#fff" : TXD, border: "none", fontFamily: "inherit", fontWeight: 800, fontSize: 15, padding: "13px 28px", borderRadius: 6, cursor: canContinue ? "pointer" : "default", boxShadow: canContinue ? `0 8px 20px rgba(${accentRgb},0.25)` : "none" }}>
              {phase === "submitting" ? "Building…" : isLast ? `Build my ${inlineLabel(agentTypeId)} →` : current.required ? "Continue →" : "Continue →"}
            </button>
          </div>
          {!current.required && current.kind !== "confirm" && !(current.kind === "files" && docs.length > 0) && (
            <p style={{ textAlign: "right", marginTop: 10, fontSize: 13 }}>
              <button type="button" onClick={next} style={{ background: "transparent", border: "none", color: TXD, fontFamily: "inherit", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Skip this one</button>
            </p>
          )}
          </section>
          <p style={{ marginTop: 28, fontSize: 12, color: TXD, textAlign: "center" }}>
            Saves as you go. Close this tab and come back any time.
          </p>
        </div>
      </main>
    </div>
  );
}

// ── One control per question kind ──────────────────────────────────────────────────────────

/** An image picked from the visitor's device for the agent's face. */
type AvatarUploadPick = { name: string; type: string; size: number; dataBase64: string; preview: string };

// The storage bucket refuses anything over 3 MB (lib/supabase/avatar-storage.ts), so a bigger
// file is turned away here with a reason instead of failing quietly at the build.
const AVATAR_MAX_BYTES = 3 * 1024 * 1024;

/** A document picked for the agent to read, in the shape lib/agent-setup.ts reads. */
type DocPick = { name: string; type: string; size: number; dataBase64: string };

// Everything the build request carries in bytes: the face upload and the documents together.
// Base64 grows a file by a third, and the request has to stay under the hosting limit of 4.5 MB,
// so 3.2 MB of files is the most one build can take.
const UPLOAD_BUDGET_BYTES = Math.round(3.2 * 1024 * 1024);

const mb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/** "Any documents your agent should read?": add several, remove any, within the byte budget. */
function DocumentsPick({ docs, onDocs, budget, accent, accentRgb, onError }: {
  docs: DocPick[];
  onDocs: (d: DocPick[]) => void;
  budget: number;
  accent: string;
  accentRgb: string;
  onError: (message: string) => void;
}) {
  const used = docs.reduce((n, d) => n + d.size, 0);
  const add = async (list: FileList | null) => {
    const files = list ? Array.from(list) : [];
    if (!files.length) return;
    const total = used + files.reduce((n, f) => n + f.size, 0);
    if (total > budget) {
      onError(`Documents can total ${mb(Math.max(0, budget))} here. Larger files can go to hello@apolloclaw.ai after you build.`);
      return;
    }
    try {
      const read = await Promise.all(files.map((file) => new Promise<DocPick>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, type: file.type || "application/octet-stream", size: file.size, dataBase64: String(reader.result).split(",")[1] || "" });
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      })));
      onError("");
      onDocs([...docs, ...read]);
    } catch {
      onError("That file could not be read. Please try another.");
    }
  };
  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1.5px dashed ${docs.length ? accent : "rgba(0,0,0,0.25)"}`, borderRadius: 8, padding: "18px", cursor: "pointer", background: docs.length ? `rgba(${accentRgb},0.06)` : "#fff", color: TXM, fontSize: 15, fontWeight: 700 }}>
        + {docs.length ? "Add more documents" : "Add documents"}
        <input type="file" multiple accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,text/*" style={{ display: "none" }} onChange={(e) => { void add(e.target.files); e.currentTarget.value = ""; }} />
      </label>
      {docs.length > 0 && (
        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
          {docs.map((d, i) => (
            <div key={`${d.name}-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: SRF2, border: `1px solid ${BDR}`, fontSize: 14, color: TX }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name} <span style={{ color: TXD }}>({Math.max(1, Math.round(d.size / 1024))} KB)</span></span>
              <button type="button" onClick={() => onDocs(docs.filter((_, idx) => idx !== i))} aria-label={`Remove ${d.name}`} style={{ border: "none", background: "none", color: TXD, cursor: "pointer", fontSize: 18, lineHeight: 1, flexShrink: 0, padding: 4 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <p style={{ fontSize: 13, color: TXD, margin: "10px 0 0" }}>Up to {mb(Math.max(0, budget))} in all. They go with your answers when you build.</p>
    </div>
  );
}

function Control({ q, value, other, onChange, onOther, onEnter, accent, accentRgb, agentLabel, mascot, upload, onUpload, onUploadError }: {
  q: Question;
  value: unknown;
  other: string;
  onChange: (v: unknown) => void;
  onOther: (v: string) => void;
  onEnter: () => void;
  accent: string;
  accentRgb: string;
  agentLabel: string;
  mascot?: string;
  upload: AvatarUploadPick | null;
  onUpload: (u: AvatarUploadPick | null) => void;
  onUploadError: (message: string) => void;
}) {
  const str = typeof value === "string" ? value : "";
  const list = Array.isArray(value) ? (value as string[]) : typeof value === "string" && value && q.kind !== "text" && q.kind !== "textarea" && q.kind !== "name" && q.kind !== "select" && q.kind !== "single" ? [value] : [];
  const input: React.CSSProperties = { width: "100%", background: "#fff", border: `1px solid ${BDR}`, borderRadius: 8, color: TX, fontSize: 17, fontFamily: "inherit", padding: "14px 16px", outline: "none", boxSizing: "border-box" };
  const chip = (on: boolean): React.CSSProperties => ({ display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left", padding: "12px 14px", borderRadius: 8, cursor: "pointer", fontSize: 15, fontFamily: "inherit", background: on ? `rgba(${accentRgb},0.1)` : "#fff", border: `1.5px solid ${on ? accent : BDR}`, color: TX, transition: "all 0.12s", width: "100%" });
  const otherBox = q.other && (q.kind === "single" ? str === q.other : list.includes(q.other)) && (
    <input value={other} onChange={(e) => onOther(e.target.value)} placeholder="Tell us more" style={{ ...input, marginTop: 10, fontSize: 15 }} />
  );
  const enterSubmits = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }
  };

  switch (q.kind) {
    case "name":
      return (
        <div>
          <input autoFocus value={str} onChange={(e) => onChange(e.target.value)} onKeyDown={enterSubmits} placeholder={agentLabel.replace(/^The\s+/i, "")} style={input} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {AGENT_NAME_SUGGESTIONS.slice(0, 6).map((n) => (
              <button key={n} type="button" onClick={() => onChange(n)} style={{ background: str === n ? `rgba(${accentRgb},0.1)` : SRF2, border: `1px solid ${str === n ? accent : BDR}`, color: TXM, fontFamily: "inherit", fontWeight: 600, fontSize: 13, padding: "6px 14px", borderRadius: 20, cursor: "pointer" }}>{n}</button>
            ))}
            <button type="button" onClick={() => onChange(AGENT_NAME_SUGGESTIONS[Math.floor(Math.random() * AGENT_NAME_SUGGESTIONS.length)])} style={{ background: "transparent", border: `1px dashed ${BDR}`, color: TXD, fontFamily: "inherit", fontSize: 13, padding: "6px 14px", borderRadius: 20, cursor: "pointer" }}>Surprise me</button>
          </div>
        </div>
      );
    case "avatar": {
      const pickFile = (file: File | undefined) => {
        if (!file) return;
        if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
          onUploadError("Please choose a PNG, JPG or WebP image.");
          return;
        }
        if (file.size > AVATAR_MAX_BYTES) {
          onUploadError("That image is over 3 MB. Please choose a smaller one.");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result);
          onUploadError("");
          onUpload({ name: file.name, type: file.type, size: file.size, dataBase64: dataUrl.split(",")[1] || "", preview: dataUrl });
        };
        reader.readAsDataURL(file);
      };
      const tile = (on: boolean): React.CSSProperties => ({ padding: 0, border: `2.5px solid ${on ? accent : "transparent"}`, borderRadius: "50%", overflow: "hidden", aspectRatio: "1", background: SRF, cursor: "pointer" });
      return (
        <div>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `1.5px dashed ${upload ? accent : "rgba(0,0,0,0.25)"}`, borderRadius: 8, padding: "11px 18px", cursor: "pointer", background: upload ? `rgba(${accentRgb},0.06)` : "#fff", color: TXM, fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
            {upload ? "Upload a different image" : "Upload your own"}
            <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={(e) => { pickFile(e.target.files?.[0]); e.currentTarget.value = ""; }} />
          </label>
          <p style={{ fontSize: 13, color: TXD, margin: "0 0 10px" }}>Or choose one of these</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 10 }}>
            {upload && (
              <button type="button" onClick={() => undefined} aria-label="Your uploaded image" aria-pressed style={tile(true)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={upload.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            )}
            {mascot && (
              <button type="button" onClick={() => { onUpload(null); onChange(""); }} aria-label="The agent's own face" style={tile(!upload && !str)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mascot} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              </button>
            )}
            {AVATAR_PRESETS.map((p) => (
              <button key={p.id} type="button" onClick={() => { onUpload(null); onChange(p.src); }} aria-label={p.label} style={tile(!upload && str === p.src)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            ))}
          </div>
        </div>
      );
    }
    case "text":
      return <input autoFocus value={str} onChange={(e) => onChange(e.target.value)} onKeyDown={enterSubmits} placeholder={q.placeholder} style={input} />;
    case "textarea":
      return <textarea autoFocus value={str} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder} rows={5} style={{ ...input, resize: "vertical", lineHeight: 1.6 }} />;
    case "classes":
      return <ClassListInput value={list} onChange={onChange} colors={{ accent, surface: SRF, border: BDR, text: TX, muted: TXM }} />;
    case "people":
      return <textarea autoFocus value={list.join("\n")} onChange={(e) => onChange(e.target.value.split("\n").filter((l) => l.trim()))} placeholder={q.placeholder ?? "Name (age)"} rows={4} style={{ ...input, resize: "vertical", lineHeight: 1.6 }} />;
    case "select":
      return (
        <select autoFocus value={str} onChange={(e) => onChange(e.target.value)} style={{ ...input, appearance: "auto", cursor: "pointer" }}>
          <option value="">Select one…</option>
          {(q.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case "single":
      return (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: (q.options?.length ?? 0) > 4 ? "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" : "1fr", gap: 8 }}>
            {(q.options ?? []).map((o) => {
              const on = str === o;
              return (
                <button key={o} type="button" onClick={() => onChange(o)} style={chip(on)}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 2, border: `1.5px solid ${on ? accent : "rgba(0,0,0,0.25)"}`, background: on ? accent : "#fff" }} />
                  {o}
                </button>
              );
            })}
          </div>
          {otherBox}
        </div>
      );
    case "multi": {
      const toggle = (o: string) => {
        const next = list.includes(o) ? list.filter((x) => x !== o) : [...list, o];
        onChange(q.max ? next.slice(-q.max) : next);
      };
      return (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 8 }}>
            {(q.options ?? []).map((o) => {
              const on = list.includes(o);
              return (
                <button key={o} type="button" onClick={() => toggle(o)} style={chip(on)}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 2, border: `1.5px solid ${on ? accent : "rgba(0,0,0,0.25)"}`, background: on ? accent : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {on && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </span>
                  {o}
                </button>
              );
            })}
          </div>
          {otherBox}
        </div>
      );
    }
    case "tiles": {
      const picked = q.single ? (str ? [str] : []) : list;
      const toggle = (o: string) => {
        if (q.single) return onChange(str === o ? "" : o);
        onChange(picked.includes(o) ? picked.filter((x) => x !== o) : [...picked, o]);
      };
      return (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))", gap: 8 }}>
            {(q.options ?? []).map((o) => {
              const on = picked.includes(o);
              const slug = STACK_LOGOS[o];
              return (
                <button key={o} type="button" onClick={() => toggle(o)} style={{ ...chip(on), alignItems: "center", padding: "10px 12px", fontSize: 14 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, background: "#fff", border: `1px solid ${BDR}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {slug ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`https://logos.composio.dev/api/${slug}`} alt="" loading="lazy" style={{ width: 18, height: 18, objectFit: "contain" }} />
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, color: TXD }}>{o[0]}</span>
                    )}
                  </span>
                  <span style={{ lineHeight: 1.3, minWidth: 0 }}>{o}</span>
                </button>
              );
            })}
          </div>
          {q.other && picked.includes(q.other) && <input value={other} onChange={(e) => onOther(e.target.value)} placeholder="Name the tool" style={{ ...input, marginTop: 10, fontSize: 15 }} />}
        </div>
      );
    }
    case "scale": {
      const n = typeof value === "number" ? value : typeof value === "string" && value ? Number(value) : null;
      const max = q.max ?? 10;
      return (
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: max }, (_, i) => i + 1).map((k) => (
            <button key={k} type="button" onClick={() => onChange(k)} style={{ flex: 1, padding: "14px 0", borderRadius: 8, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", background: n === k ? accent : "#fff", border: `1.5px solid ${n === k ? accent : BDR}`, color: n === k ? "#fff" : TXM }}>{k}</button>
          ))}
        </div>
      );
    }
    case "confirm":
      return (
        <button type="button" onClick={() => onChange(value !== true)} style={{ ...chip(value === true), padding: "18px 20px", fontSize: 16, fontWeight: 600 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `2px solid ${value === true ? accent : "rgba(0,0,0,0.28)"}`, background: value === true ? accent : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {value === true && <svg width="14" height="14" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </span>
          I&apos;ve answered honestly and I&apos;m ready to get started.
        </button>
      );
    default:
      return null;
  }
}
