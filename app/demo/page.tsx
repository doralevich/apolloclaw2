import Link from "next/link";
import { AGENT_TYPES, LICENSE_AGENT_TYPE_ID } from "@/config/agent-types";
import { agentBrand } from "@/lib/agentBrand";

// Step one of the demo: pick an agent.
//
// The list is the registry itself, filtered the way /onboard/[agent] filters it, so this page
// cannot offer a walkthrough that 404s on the next click: externalUrl types are sold elsewhere
// and noSetup types have no questionnaire at all. Everything else here has a real flow behind it.
//
// Not filtered on `internal`. That flag is about who may BUY one from the create modal, and this
// page is already admin-only - hiding the internal types here would hide nine of the eleven role
// agents, which are the ones worth showing.

const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const BDR = "rgba(0,0,0,0.08)";
const TX = "#000000";
const TXD = "#4A4A4A";

export const metadata = { title: "Demo" };

export default function DemoPickerPage() {
  const types = AGENT_TYPES.filter((t) => t.available && !t.externalUrl && !t.noSetup);
  // The generic Apollo agent last. It is the thing that actually sells, but it is also the one
  // whose walkthrough looks like every other SaaS onboarding - the role agents are what a demo
  // is for, so they go first.
  const ordered = [
    ...types.filter((t) => t.id !== LICENSE_AGENT_TYPE_ID),
    ...types.filter((t) => t.id === LICENSE_AGENT_TYPE_ID),
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "64px 32px 80px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: TXD, margin: "0 0 12px" }}>
          Demo
        </p>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px", color: TX }}>
          Pick an agent and walk it.
        </h1>
        <p style={{ fontSize: 15, color: TXD, maxWidth: 620, margin: "0 0 40px", lineHeight: 1.6 }}>
          The real questionnaire, every question and dropdown a customer gets. At the end you see
          the files it would write, the persona it would install and the skills it would carry.
          Nothing is charged and no agent is created, so walk it as many times as you like.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {ordered.map((t) => {
            const brand = agentBrand(t.id);
            return (
              <Link
                key={t.id}
                href={`/demo/${t.id}`}
                style={{
                  display: "block",
                  textDecoration: "none",
                  background: SRF,
                  border: `1px solid ${BDR}`,
                  borderLeft: `3px solid ${brand.color}`,
                  borderRadius: 8,
                  padding: "20px 22px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                  {brand.mascot && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.mascot} alt="" aria-hidden="true" style={{ width: 40, height: "auto", display: "block", flexShrink: 0 }} />
                  )}
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: TX, margin: 0, letterSpacing: "-0.01em" }}>{t.label}</h2>
                </div>
                <p style={{ fontSize: 13, color: TXD, margin: 0, lineHeight: 1.55 }}>
                  {t.description.length > 190 ? `${t.description.slice(0, 190).trimEnd()}…` : t.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
