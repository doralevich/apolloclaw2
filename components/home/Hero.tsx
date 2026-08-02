import HeroAssistantInput from "@/components/HeroAssistantInput";
import { NAVY, PAPER, PAPER_MUTED, PrimaryButton, SecondaryButton, TextureBackground } from "@/components/home/ui";

const GET_STARTED_URL = "/agents"; // see TODO(GET_STARTED_URL) in components/layout/Navbar.tsx
const CONSULT_URL = "https://calendly.com/therealdaveo/apolloai";

// Real, confirmed-supported integrations only (master brief section 4b) — floating chips,
// echoing the "connects to your tools" line, not a fabricated tool list.
const CHIPS = [
  { label: "Slack", top: "14%", left: "8%" },
  { label: "WhatsApp", top: "62%", left: "5%" },
  { label: "Gmail", top: "10%", left: "84%" },
  { label: "HubSpot", top: "68%", left: "88%" },
  { label: "QuickBooks", top: "38%", left: "3%" },
  { label: "Salesforce", top: "40%", left: "90%" },
];

function Chip({ label }: { label: string }) {
  return (
    <span
      className="hidden whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold lg:inline-flex lg:items-center lg:gap-1.5"
      style={{ background: "rgba(245,246,248,0.05)", border: "1px solid rgba(245,246,248,0.1)", color: PAPER_MUTED }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E12E30" }} />
      {label}
    </span>
  );
}

export function Hero() {
  return (
    <section style={{ background: NAVY }} className="relative overflow-hidden">
      <TextureBackground />
      {CHIPS.map((c) => (
        <div key={c.label} className="absolute z-10" style={{ top: c.top, left: c.left }}>
          <Chip label={c.label} />
        </div>
      ))}
      <div className="container relative z-20 mx-auto max-w-3xl px-5 py-20 text-center md:px-8 md:py-28">
        <h1
          className="font-heading text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold leading-[1.05] tracking-tight"
          style={{ color: PAPER, textWrap: "balance" }}
        >
          AI employees that do real work in your business.
        </h1>
        <p
          className="font-body mx-auto mt-6 text-[1.125rem] leading-[1.65]"
          style={{ color: PAPER_MUTED, maxWidth: 560 }}
        >
          Apollo[Claw] builds AI agents that connect to your tools, work in Slack, WhatsApp, and
          email, and get real work done with your approval. Run one yourself, or have us build it
          for you.
        </p>

        {/* Donna, the existing hero chat widget/persona (components/HeroAssistantInput.tsx +
            components/ChatWidget.tsx), reused as-is, now the hero's centered focal element
            (stackhaus.ai reference: the search bar as the visual centerpiece). */}
        <div className="mx-auto mt-10 max-w-xl">
          <p className="mb-3 text-[13px]" style={{ color: PAPER_MUTED }}>
            Ask me anything about what an agent can do for your business.
          </p>
          <div
            style={{
              background: "rgba(245,246,248,0.04)",
              border: "1px solid rgba(245,246,248,0.1)",
              borderRadius: 12,
              padding: 6,
            }}
          >
            <HeroAssistantInput />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <PrimaryButton href={GET_STARTED_URL}>Get Started</PrimaryButton>
          <SecondaryButton href={CONSULT_URL} external>
            Schedule a Consultation
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}
