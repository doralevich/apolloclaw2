"use client";

import { useState } from "react";
import Link from "next/link";
import { agentBrand } from "@/lib/agentBrand";

// The last screen, and the reason this is a demo rather than a form preview.
//
// Walking the questions proves the questions exist. This proves they DO something: every file
// here came out of the same generators a real build runs, on the answers just typed. If the
// intake asks a bad question, it shows up here as a bad line in USER.md, which is a much faster
// way to find one than reading the intake file.

const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const BDR = "rgba(0,0,0,0.08)";
const TX = "#000000";
const TXD = "#4A4A4A";

export type DemoPreview = {
  type: { id: string; label: string; template: string; monthlyCapUsd: number };
  agentName: string;
  files: { name: string; body: string }[];
  persona: string | null;
  skills: { slug: string; emoji: string; description: string }[];
};

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: TXD, margin: "0 0 4px" }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: TXD, margin: "0 0 12px", lineHeight: 1.5 }}>{sub}</p>}
      {children}
    </section>
  );
}

// Monospace, wrapped, scrolling inside its own box. These files run to a few hundred lines and
// the point is to be able to read one, not to make the page four screens tall.
function FileBody({ body }: { body: string }) {
  return (
    <pre
      style={{
        margin: 0,
        padding: "14px 16px",
        background: "#fff",
        border: `1px solid ${BDR}`,
        borderRadius: 6,
        fontSize: 12,
        lineHeight: 1.65,
        color: TXD,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        maxHeight: 460,
        overflowY: "auto",
        fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
      }}
    >
      {body}
    </pre>
  );
}

export function DemoResult({ preview, typeLabel }: { preview: DemoPreview; typeLabel: string }) {
  const brand = agentBrand(preview.type.id);
  const [openFile, setOpenFile] = useState(preview.files[0]?.name ?? "");
  const shown = preview.files.find((f) => f.name === openFile) ?? preview.files[0];
  const name = preview.agentName || typeLabel;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 32px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          {brand.mascot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.mascot} alt="" aria-hidden="true" style={{ width: 56, height: "auto", display: "block" }} />
          )}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: brand.color, margin: "0 0 4px" }}>
              Demo, nothing was built
            </p>
            <h1 style={{ fontSize: "clamp(24px,3.4vw,36px)", fontWeight: 900, letterSpacing: "-0.03em", margin: 0, color: TX }}>
              This is what {name} would have been.
            </h1>
          </div>
        </div>
        <p style={{ fontSize: 14, color: TXD, margin: "12px 0 36px", lineHeight: 1.6, maxWidth: 640 }}>
          No agent was created, nothing was charged, and none of these answers were saved. Everything
          below was generated from what you just typed by the same code that runs on a real build.
        </p>

        <Panel
          title="The files it would read"
          sub="Written into the instance at provisioning. The agent loads these at the start of every session."
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {preview.files.map((f) => {
              const on = f.name === shown?.name;
              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setOpenFile(f.name)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 6,
                    border: `1px solid ${on ? brand.color : BDR}`,
                    background: on ? brand.color : "#fff",
                    color: on ? "#fff" : TXD,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
                  }}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
          {shown && <FileBody body={shown.body} />}
        </Panel>

        <Panel
          title="The persona it would run"
          sub={preview.persona ? "Installed as SOUL.md. This is what makes a stock box behave like this role." : undefined}
        >
          {preview.persona ? (
            <FileBody body={preview.persona} />
          ) : (
            <p style={{ fontSize: 13, color: TXD, margin: 0, lineHeight: 1.6 }}>
              This type ships no persona - it keeps whatever the image came with. That is deliberate
              for the blank build and for the generic Apollo agent, whose character comes from the
              answers rather than from a role.
            </p>
          )}
        </Panel>

        <Panel title={`The skills it would carry (${preview.skills.length})`} sub="Installed on the instance at provisioning, filtered to this agent type.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 8 }}>
            {preview.skills.map((s) => (
              <div key={s.slug} style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 6, padding: "10px 12px" }}>
                <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: TX }}>
                  <span aria-hidden="true">{s.emoji}</span> {s.slug}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: TXD, lineHeight: 1.45 }}>{s.description}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="The box it would run on">
          <div style={{ background: SRF, border: `1px solid ${BDR}`, borderRadius: 6, padding: "14px 16px", fontSize: 13, color: TXD, lineHeight: 1.8 }}>
            <div><strong style={{ color: TX }}>Template</strong> · <code>{preview.type.template}</code></div>
            <div><strong style={{ color: TX }}>Monthly spend cap</strong> · ${preview.type.monthlyCapUsd}</div>
            <div><strong style={{ color: TX }}>Agent type</strong> · <code>{preview.type.id}</code></div>
          </div>
        </Panel>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 36 }}>
          <Link
            href={`/demo/${preview.type.id}`}
            style={{ padding: "11px 22px", borderRadius: 6, background: brand.color, color: "#fff", fontSize: 13, fontWeight: 800, textDecoration: "none" }}
          >
            Walk it again
          </Link>
          <Link
            href="/demo"
            style={{ padding: "11px 22px", borderRadius: 6, background: "#fff", border: `1px solid ${BDR}`, color: TXD, fontSize: 13, fontWeight: 700, textDecoration: "none" }}
          >
            Pick another agent
          </Link>
        </div>
      </div>
    </div>
  );
}
