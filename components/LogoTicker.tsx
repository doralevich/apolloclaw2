"use client";

const logos = [
  { name: "WhatsApp",    slug: "whatsapp/25D366" },
  { name: "Gmail",       slug: "gmail/EA4335" },
  { name: "Outlook",     slug: "microsoftoutlook/0078D4" },
  { name: "Calendly",    slug: "calendly/006BFF" },
  { name: "Telegram",    slug: "telegram/26A5E4" },
  { name: "HubSpot",     slug: "hubspot/FF7A59" },
  { name: "Salesforce",  slug: "salesforce/00A1E0" },
  { name: "Slack",       slug: "slack/4A154B" },
  { name: "Shopify",     slug: "shopify/96BF48" },
  { name: "Zapier",      slug: "zapier/FF4A00" },
  { name: "Stripe",      slug: "stripe/635BFF" },
  { name: "OpenAI",      slug: "openai/412991" },
  { name: "Google Drive",slug: "googledrive/4285F4" },
  { name: "Notion",      slug: "notion/000000" },
  { name: "Zoom",        slug: "zoom/2D8CFF" },
  { name: "Dropbox",     slug: "dropbox/0061FF" },
  { name: "Pipedrive",   slug: "pipedrive/1A1F36" },
  { name: "Twilio",      slug: "twilio/F22F46" },
];

export default function LogoTicker() {
  const doubled = [...logos, ...logos];

  return (
    <div
      style={{
        overflow: "hidden",
        background: "transparent",
        padding: "20px 0",
        position: "relative",
      }}
    >
      {/* Fade edges */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", zIndex: 2,
        background: "linear-gradient(to right, var(--background, #faf7f2), transparent)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", zIndex: 2,
        background: "linear-gradient(to left, var(--background, #faf7f2), transparent)",
        pointerEvents: "none",
      }} />

      <div
        style={{
          display: "flex",
          gap: "48px",
          width: "max-content",
          animation: "ticker-scroll 35s linear infinite",
          alignItems: "center",
        }}
      >
        {doubled.map((logo, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              opacity: 0.65,
              flexShrink: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.65")}
          >
            <img
              src={`https://cdn.simpleicons.org/${logo.slug}`}
              alt={logo.name}
              width={32}
              height={32}
              style={{ width: "32px", height: "32px", objectFit: "contain" }}
            />
            <span style={{
              fontFamily: "monospace",
              fontSize: "9px",
              color: "#9ca3af",
              whiteSpace: "nowrap",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}>
              {logo.name}
            </span>
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
