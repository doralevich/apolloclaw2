"use client";

const agents = [
  { name: "The CEO Agent",        src: "/agents/the-ceo-agent.png" },
  { name: "The CFO Agent",        src: "/agents/the-cfo-agent.png" },
  { name: "The Insurance Agent",  src: "/agents/the-insurance-agent.png" },
  { name: "The Law Agent",        src: "/agents/the-legal-agent.png" },
  { name: "The Medical Agent",    src: "/agents/the-medical-agent.png" },
  { name: "The Real Estate Agent",src: "/agents/the-real-estate-agent.png" },
  { name: "The Sales Agent",      src: "/agents/the-sales-agent.png" },
  { name: "The Sales Assistant",  src: "/agents/the-sales-assistant.png" },
  { name: "The Accounting Agent", src: "/agents/the-accounting-agent.png" },
  { name: "The Brokers Agent",    src: "/agents/the-brokers-agent.png" },
  { name: "The Finance Agent",    src: "/agents/the-finance-agent.png" },
  { name: "The Personal Agent",   src: "/agents/the-personal-agent.png" },
];

export default function LogoTicker() {
  const doubled = [...agents, ...agents];

  return (
    <div
      style={{
        overflow: "hidden",
        background: "transparent",
        padding: "24px 0",
        position: "relative",
      }}
    >
      {/* Fade edges */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "120px", zIndex: 2,
        background: "linear-gradient(to right, var(--background, #faf7f2), transparent)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "120px", zIndex: 2,
        background: "linear-gradient(to left, var(--background, #faf7f2), transparent)",
        pointerEvents: "none",
      }} />

      <div
        style={{
          display: "flex",
          gap: "64px",
          width: "max-content",
          animation: "ticker-scroll 60s linear infinite",
          alignItems: "center",
        }}
      >
        {doubled.map((agent, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              opacity: 0.8,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.8")}
          >
            <img
              src={agent.src}
              alt={agent.name}
              style={{
                height: "40px",
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
