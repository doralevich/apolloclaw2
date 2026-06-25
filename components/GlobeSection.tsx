"use client";
import { useEffect, useRef } from "react";

const ICON_CARDS = [
  // LEFT outer
  { slug: "gmail",       alt: "Gmail",            size: "lg", left: "2%",   top: "26%" },
  { slug: "slack",       alt: "Slack",            size: "md", left: "-2%",  top: "50%" },
  { slug: "notion",      alt: "Notion",           size: "sm", left: "5%",   top: "72%" },
  { slug: "twitter",     alt: "Twitter/X",        size: "xs", left: "3%",   top: "12%" },
  { slug: "discord",     alt: "Discord",          size: "xs", left: "12%",  top: "86%" },
  // TOP
  { slug: "github",      alt: "GitHub",           size: "md", left: "20%",  top: "6%"  },
  { slug: "googledrive", alt: "Google Drive",     size: "sm", left: "36%",  top: "1%"  },
  { slug: "figma",       alt: "Figma",            size: "md", left: "50%",  top: "-1%" },
  { slug: "linear",      alt: "Linear",           size: "sm", left: "65%",  top: "2%"  },
  { slug: "googlesheets",alt: "Google Sheets",    size: "xs", left: "78%",  top: "8%"  },
  // RIGHT outer
  { slug: "googlecalendar", alt: "Google Calendar", size: "md", left: "84%",  top: "22%" },
  { slug: "hubspot",     alt: "HubSpot",          size: "lg", left: "96%",  top: "42%" },
  { slug: "stripe",      alt: "Stripe",           size: "md", left: "100%", top: "62%" },
  { slug: "shopify",     alt: "Shopify",          size: "sm", left: "90%",  top: "78%" },
  { slug: "outlook",     alt: "Outlook",          size: "xs", left: "98%",  top: "18%" },
  // BOTTOM
  { slug: "jira",        alt: "Jira",             size: "sm", left: "76%",  top: "90%" },
  { slug: "zendesk",     alt: "Zendesk",          size: "xs", left: "85%",  top: "96%" },
  { slug: "airtable",    alt: "Airtable",         size: "md", left: "60%",  top: "97%" },
  { slug: "salesforce",  alt: "Salesforce",       size: "md", left: "42%",  top: "99%" },
  { slug: "supabase",    alt: "Supabase",         size: "sm", left: "26%",  top: "92%" },
  { slug: "linkedin",    alt: "LinkedIn",         size: "xs", left: "14%",  top: "97%" },
  // ON-GLOBE
  { slug: "googledocs",  alt: "Google Docs",      size: "md", left: "38%",  top: "28%" },
  { slug: "intercom",    alt: "Intercom",         size: "sm", left: "63%",  top: "36%" },
  { slug: "posthog",     alt: "PostHog",          size: "md", left: "55%",  top: "63%" },
  { slug: "bitbucket",   alt: "Bitbucket",        size: "sm", left: "40%",  top: "68%" },
  { slug: "youtube",     alt: "YouTube",          size: "sm", left: "68%",  top: "54%" },
  { slug: "sentry",      alt: "Sentry",           size: "xs", left: "45%",  top: "44%" },
  { slug: "datadog",     alt: "Datadog",          size: "xs", left: "58%",  top: "76%" },
  { slug: "mailchimp",   alt: "Mailchimp",        size: "xs", left: "34%",  top: "50%" },
];

const ALL_LOGOS = [
  { slug: "notion", label: "Notion" }, { slug: "slack", label: "Slack" },
  { slug: "github", label: "GitHub" }, { slug: "gmail", label: "Gmail" },
  { slug: "figma", label: "Figma" }, { slug: "linear", label: "Linear" },
  { slug: "hubspot", label: "HubSpot" }, { slug: "googlecalendar", label: "Google Calendar" },
  { slug: "googledrive", label: "Google Drive" }, { slug: "googledocs", label: "Google Docs" },
  { slug: "googlesheets", label: "Google Sheets" }, { slug: "discord", label: "Discord" },
  { slug: "stripe", label: "Stripe" }, { slug: "shopify", label: "Shopify" },
  { slug: "airtable", label: "Airtable" }, { slug: "salesforce", label: "Salesforce" },
  { slug: "jira", label: "Jira" }, { slug: "supabase", label: "Supabase" },
  { slug: "outlook", label: "Outlook" }, { slug: "twitter", label: "Twitter / X" },
  { slug: "linkedin", label: "LinkedIn" }, { slug: "youtube", label: "YouTube" },
  { slug: "intercom", label: "Intercom" }, { slug: "zendesk", label: "Zendesk" },
  { slug: "mailchimp", label: "Mailchimp" }, { slug: "klaviyo", label: "Klaviyo" },
  { slug: "google_analytics", label: "Google Analytics" }, { slug: "posthog", label: "PostHog" },
  { slug: "sentry", label: "Sentry" }, { slug: "datadog", label: "Datadog" },
  { slug: "brex", label: "Brex" }, { slug: "xero", label: "Xero" },
  { slug: "googleads", label: "Google Ads" }, { slug: "bamboohr", label: "BambooHR" },
  { slug: "perplexityai", label: "Perplexity" }, { slug: "googletasks", label: "Google Tasks" },
];

const SIZE_MAP: Record<string, { width: number; borderRadius: number }> = {
  lg: { width: 60, borderRadius: 14 },
  md: { width: 48, borderRadius: 14 },
  sm: { width: 38, borderRadius: 14 },
  xs: { width: 30, borderRadius: 8 },
};

export default function GlobeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let phi = 0.4;
    let width = 0;
    let globe: { destroy: () => void } | null = null;

    const onResize = () => {
      if (!wrapRef.current || !canvasRef.current) return;
      width = wrapRef.current.offsetWidth;
      canvasRef.current.width = width * window.devicePixelRatio;
      canvasRef.current.height = width * window.devicePixelRatio;
    };
    window.addEventListener("resize", onResize);
    onResize();

    import("cobe").then(({ default: createGlobe }) => {
      if (!canvasRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      globe = (createGlobe as any)(canvasRef.current, {
        devicePixelRatio: window.devicePixelRatio || 2,
        width: width * (window.devicePixelRatio || 2),
        height: width * (window.devicePixelRatio || 2),
        phi: 0.4, theta: 0.2, dark: 0, diffuse: 1.4,
        mapSamples: 20000, mapBrightness: 5,
        baseColor: [0.92, 0.92, 0.97],
        markerColor: [0.85, 0.17, 0.17],
        glowColor: [0.88, 0.88, 1.0],
        markers: [
          { location: [37.78, -122.41], size: 0.05 },
          { location: [40.71, -74.00],  size: 0.05 },
          { location: [51.51, -0.13],   size: 0.05 },
          { location: [48.86, 2.35],    size: 0.04 },
          { location: [35.68, 139.69],  size: 0.05 },
          { location: [1.35, 103.82],   size: 0.04 },
          { location: [52.52, 13.40],   size: 0.04 },
          { location: [-33.87, 151.21], size: 0.04 },
          { location: [19.07, 72.88],   size: 0.05 },
          { location: [-23.55, -46.63], size: 0.04 },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRender(state: any) {
          state.phi = phi;
          phi += 0.004;
          if (state.width !== width * (window.devicePixelRatio || 2)) {
            state.width  = width * (window.devicePixelRatio || 2);
            state.height = width * (window.devicePixelRatio || 2);
          }
        },
      });
    });

    return () => {
      window.removeEventListener("resize", onResize);
      globe?.destroy();
    };
  }, []);

  const marqueeItems = [...ALL_LOGOS, ...ALL_LOGOS];

  return (
    <section style={{ background: "#FAFAF7", color: "#1A1A1A", overflow: "hidden" }}>
      <style>{`
        .globe-icon-card {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 1px solid rgba(0,0,0,.08);
          box-shadow: 0 4px 16px rgba(0,0,0,.10), 0 1px 3px rgba(0,0,0,.06);
          overflow: hidden;
          transform: translate(-50%, -50%);
          animation: globe-float 4s ease-in-out infinite;
          z-index: 2;
        }
        .globe-icon-card img { width: 100%; height: 100%; object-fit: contain; padding: 18%; }
        @keyframes globe-float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50%       { transform: translate(-50%, -50%) translateY(-7px); }
        }
        .globe-icon-card:nth-child(odd)  { animation-duration: 3.8s; }
        .globe-icon-card:nth-child(even) { animation-duration: 4.4s; }
        ${Array.from({ length: 28 }, (_, i) => `.globe-icon-card:nth-child(${i + 1}) { animation-delay: ${(i * 0.25) % 4}s; }`).join("\n")}
        @media (max-width: 600px) { .globe-icon-card-xs { display: none !important; } }
        .globe-marquee-track {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: globe-marquee 40s linear infinite;
        }
        .globe-marquee-track:hover { animation-play-state: paused; }
        @keyframes globe-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .globe-marquee-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: #fff;
          border: 1px solid rgba(0,0,0,.07);
          border-radius: 10px;
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .globe-marquee-item img { width: 22px; height: 22px; object-fit: contain; }
        .globe-marquee-item span { font-size: 13px; font-weight: 500; color: #374151; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: "#0f0f11", lineHeight: 1.15, marginBottom: 12 }}>
            Works with the tools<br />you already use
          </h2>
          <p style={{ fontSize: 17, color: "#6b7280", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            Connect to 250+ apps — from Gmail and Slack to Salesforce and Stripe — right out of the box.
          </p>
        </div>

        {/* Globe */}
        <div ref={wrapRef} style={{ position: "relative", aspectRatio: "1", width: "min(620px, 90vw)" }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
          {ICON_CARDS.map((card, i) => {
            const s = SIZE_MAP[card.size];
            return (
              <div
                key={i}
                className={`globe-icon-card${card.size === "xs" ? " globe-icon-card-xs" : ""}`}
                style={{ left: card.left, top: card.top, width: s.width, height: s.width, borderRadius: s.borderRadius }}
              >
                <img src={`https://logos.composio.dev/api/${card.slug}`} alt={card.alt} loading="lazy" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Marquee */}
      <div style={{ width: "100%", overflow: "hidden", padding: "24px 0 56px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 80, background: "linear-gradient(to right, #FAFAF7, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 80, background: "linear-gradient(to left, #FAFAF7, transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div className="globe-marquee-track">
          {marqueeItems.map(({ slug, label }, i) => (
            <div key={i} className="globe-marquee-item">
              <img src={`https://logos.composio.dev/api/${slug}`} alt={label} loading="lazy" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
