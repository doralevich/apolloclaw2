"use client";

import { useState } from "react";
import OnboardingForm from "@/components/onboard/OnboardingForm";
import { DemoResult, type DemoPreview } from "@/components/demo/DemoResult";
import { apiFetch } from "@/lib/api";

// Runs the real questionnaire in demo mode, then swaps to the result.
//
// This component holds the ONLY difference between a demo and a purchase: `onDemoComplete`.
// OnboardingForm gets no other special treatment - same questions, same validation, same page
// order, same brand - which is what makes walking this a fair rehearsal of the real thing.

export function DemoRunner({ typeId, typeLabel }: { typeId: string; typeLabel: string }) {
  const [preview, setPreview] = useState<DemoPreview | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState("");

  const finish = async ({ answers, agentName }: { answers: Record<string, unknown>; agentName: string }) => {
    setPending(true);
    setErr("");
    try {
      const res = await apiFetch<DemoPreview>("/api/demo/preview", {
        method: "POST",
        body: JSON.stringify({ agent_type: typeId, answers, agent_name: agentName }),
      });
      setPreview(res);
    } catch (e) {
      // A failed preview must not eat the answers - the person just spent ten minutes typing
      // them. The error renders over the form, which still holds everything.
      setErr(e instanceof Error ? e.message : "Could not build the preview.");
    } finally {
      setPending(false);
    }
  };

  if (preview) return <DemoResult preview={preview} typeLabel={typeLabel} />;

  return (
    <>
      <OnboardingForm mode="demo" agentTypeId={typeId} agentLabel={typeLabel} onDemoComplete={finish} />
      {(pending || err) && (
        <div
          role="status"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 60,
          }}
        >
          <div style={{ background: "#FAFAF7", borderRadius: 10, padding: "28px 32px", maxWidth: 460, textAlign: "center", fontFamily: "'Inter',-apple-system,sans-serif" }}>
            {pending ? (
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#000" }}>Working out what this would build…</p>
            ) : (
              <>
                <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: "#dc2626" }}>Preview failed</p>
                <p style={{ margin: "0 0 16px", fontSize: 13, color: "#4A4A4A", lineHeight: 1.55 }}>{err}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#4A4A4A" }}>
                  Your answers are still on the form behind this. Close and press the button again.
                </p>
                <button
                  type="button"
                  onClick={() => setErr("")}
                  style={{ marginTop: 16, padding: "9px 20px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.12)", background: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
