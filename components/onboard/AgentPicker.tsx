import Link from "next/link";
import ApolloClawLogo from "@/components/ApolloClawLogo";
import { agentBrand } from "@/lib/agentBrand";
import { pickerAgents } from "@/lib/buildFunnel";

// The first screen of a door that was opened without naming an agent: /onboard and
// /white-glove-onboarding with no ?agent=. One card per agent we build; picking one navigates
// to the same door with ?agent=<slug>, so the choice lives in the URL. That is what lets the
// marketing sites, the Stripe return trip and a link David hands out all skip this screen by
// naming the agent up front.
//
// A server component on purpose: there is no state here, just links, and the page that renders
// it is the server component that read the query string.
//
// Same palette as the questionnaire it leads into (components/onboard/OnboardingForm.tsx), so
// the next screen reads as the next step rather than a different site.

const BG = "#FAFAF7";
const SRF = "#F2F1ED";
const BDR = "rgba(0,0,0,0.08)";
const TX = "#1A1A1A";
const TXD = "#4A4A4A";
const R = "#D72B2B";
const FONT = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";

export default function AgentPicker({
  eyebrow,
  title,
  intro,
  hrefFor,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  /** Where a card goes, by slug (lib/buildFunnel.ts). The page keeps its other query params. */
  hrefFor: (slug: string) => string;
}) {
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ marginBottom: 36 }}>
          <ApolloClawLogo ink={TX} height={30} />
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: R, margin: "0 0 12px" }}>
          {eyebrow}
        </p>
        <h1
          className="font-heading"
          style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px", color: TX, textWrap: "balance" }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 15, color: TXD, maxWidth: 620, margin: "0 0 36px", lineHeight: 1.6 }}>{intro}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {pickerAgents().map(({ slug, type }) => {
            const brand = agentBrand(type.id);
            const blurb =
              type.description.length > 160 ? `${type.description.slice(0, 160).trimEnd()}…` : type.description;
            return (
              <Link
                key={slug}
                href={hrefFor(slug)}
                className="transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2"
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
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: TX, margin: 0, letterSpacing: "-0.01em" }}>{type.label}</h2>
                </div>
                <p style={{ fontSize: 13, color: TXD, margin: 0, lineHeight: 1.55 }}>{blurb}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: brand.color, margin: "14px 0 0" }}>Start →</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
