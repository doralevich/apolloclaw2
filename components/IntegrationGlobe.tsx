"use client";

/* ------------------------------------------------------------------------------------------------
 * IntegrationGlobe — self-contained cobe globe with floating app logos + a scrolling marquee.
 *
 * SETUP (one dependency):
 *     npm install cobe
 *
 * USAGE:
 *     import IntegrationGlobe from "@/components/IntegrationGlobe";
 *     <IntegrationGlobe />
 *     // Optional props to match Apollo Claw copy / CTA:
 *     <IntegrationGlobe
 *       kicker="Integrations"
 *       title={<>Works with the tools<br />you already use</>}
 *       subtitle="Connect to 250+ apps, from Gmail and Slack to Salesforce and Stripe."
 *       ctaHref="/get-started"
 *       ctaLabel="Get Started"
 *     />
 *
 * NOTES:
 * - App logos are loaded from https://logos.composio.dev/api/<slug> (public logo CDN).
 * - Colors are plain hex values below (BRAND / CREAM / INK) — tweak to Apollo Claw's palette.
 * - The globe's own colors live in the createGlobe({...}) options (baseColor/markerColor/glowColor).
 * - Requires "use client" (Next.js App Router) because it renders to a <canvas> on mount.
 * ---------------------------------------------------------------------------------------------- */

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, type ReactNode } from "react";
import createGlobe from "cobe";

// ---- Palette (Apollo Claw: red accent, cream section for contrast against the dark homepage) -----
const BRAND = "#E12E30"; // accent (kicker + CTA) - true logo red
const CREAM = "#F2F0EB"; // section background - same cream token as --color-cream in globals.css
const INK = "#0B1729"; // headings / body - same navy as the dark sections' ink

const logoUrl = (slug: string) => `https://logos.composio.dev/api/${slug}`;

// Logos that float around the globe. left/top are % positions within the square globe wrap.
// Curated to business/corporate tools (David's call, dropped the dev-infra-heavy defaults
// like Sentry/Datadog/PagerDuty/Bitbucket/Figma/Linear) — every slug here is one already used
// elsewhere in this codebase (lib/integration-catalog.ts, GlobeSection.tsx), so the logo is
// confirmed to resolve rather than guessed.
const FEATURED_LOGOS = [
  { slug: "gmail", label: "Gmail", size: "lg", left: "2%", top: "26%" },
  { slug: "slack", label: "Slack", size: "md", left: "-2%", top: "50%" },
  { slug: "notion", label: "Notion", size: "sm", left: "5%", top: "72%" },
  { slug: "microsoft_teams", label: "Microsoft Teams", size: "xs", left: "3%", top: "12%" },
  { slug: "whatsapp", label: "WhatsApp", size: "xs", left: "12%", top: "86%" },
  { slug: "asana", label: "Asana", size: "md", left: "20%", top: "6%" },
  { slug: "googledrive", label: "Google Drive", size: "sm", left: "36%", top: "1%" },
  { slug: "trello", label: "Trello", size: "md", left: "50%", top: "-1%" },
  { slug: "one_drive", label: "OneDrive", size: "sm", left: "65%", top: "2%" },
  { slug: "googlesheets", label: "Google Sheets", size: "xs", left: "78%", top: "8%" },
  { slug: "googlecalendar", label: "Google Calendar", size: "md", left: "84%", top: "22%" },
  { slug: "hubspot", label: "HubSpot", size: "lg", left: "96%", top: "42%" },
  { slug: "stripe", label: "Stripe", size: "md", left: "100%", top: "62%" },
  { slug: "shopify", label: "Shopify", size: "sm", left: "90%", top: "78%" },
  { slug: "outlook", label: "Outlook", size: "xs", left: "98%", top: "18%" },
  { slug: "jira", label: "Jira", size: "sm", left: "76%", top: "90%" },
  { slug: "calendly", label: "Calendly", size: "xs", left: "85%", top: "96%" },
  { slug: "airtable", label: "Airtable", size: "md", left: "60%", top: "97%" },
  { slug: "salesforce", label: "Salesforce", size: "md", left: "42%", top: "99%" },
  { slug: "box", label: "Box", size: "sm", left: "26%", top: "92%" },
  { slug: "linkedin", label: "LinkedIn", size: "xs", left: "14%", top: "97%" },
  { slug: "googledocs", label: "Google Docs", size: "md", left: "38%", top: "28%" },
  { slug: "zoom", label: "Zoom", size: "sm", left: "63%", top: "36%" },
  { slug: "dropbox", label: "Dropbox", size: "md", left: "55%", top: "63%" },
  { slug: "xero", label: "Xero", size: "sm", left: "40%", top: "68%" },
  { slug: "youtube", label: "YouTube", size: "sm", left: "68%", top: "54%" },
  { slug: "klaviyo", label: "Klaviyo", size: "xs", left: "45%", top: "44%" },
  { slug: "brex", label: "Brex", size: "xs", left: "58%", top: "76%" },
  { slug: "mailchimp", label: "Mailchimp", size: "xs", left: "34%", top: "50%" },
];

// The scrolling marquee below the globe, same business-tool curation as above.
const MARQUEE_LOGOS = [
  { slug: "gmail", label: "Gmail" },
  { slug: "outlook", label: "Outlook" },
  { slug: "slack", label: "Slack" },
  { slug: "microsoft_teams", label: "Microsoft Teams" },
  { slug: "whatsapp", label: "WhatsApp" },
  { slug: "googlecalendar", label: "Google Calendar" },
  { slug: "googledrive", label: "Google Drive" },
  { slug: "googledocs", label: "Google Docs" },
  { slug: "googlesheets", label: "Google Sheets" },
  { slug: "one_drive", label: "OneDrive" },
  { slug: "dropbox", label: "Dropbox" },
  { slug: "box", label: "Box" },
  { slug: "notion", label: "Notion" },
  { slug: "asana", label: "Asana" },
  { slug: "trello", label: "Trello" },
  { slug: "airtable", label: "Airtable" },
  { slug: "jira", label: "Jira" },
  { slug: "hubspot", label: "HubSpot" },
  { slug: "salesforce", label: "Salesforce" },
  { slug: "linkedin", label: "LinkedIn" },
  { slug: "youtube", label: "YouTube" },
  { slug: "zoom", label: "Zoom" },
  { slug: "calendly", label: "Calendly" },
  { slug: "stripe", label: "Stripe" },
  { slug: "shopify", label: "Shopify" },
  { slug: "xero", label: "Xero" },
  { slug: "brex", label: "Brex" },
  { slug: "mailchimp", label: "Mailchimp" },
  { slug: "klaviyo", label: "Klaviyo" },
];

export default function IntegrationGlobe({
  kicker = "Integrations",
  title = (
    <>
      Works with the tools
      <br />
      you already use
    </>
  ),
  subtitle = "Connect to 250+ apps, from Gmail and Slack to Salesforce and Stripe, right out of the box.",
  ctaHref,
  ctaLabel = "Get Started",
}: {
  kicker?: string;
  title?: ReactNode;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let phi = 0.4;
    let width = 0;
    let destroyed = false;

    const devicePixelRatio = window.devicePixelRatio || 2;
    const resize = () => {
      width = wrap.offsetWidth;
      canvas.width = width * devicePixelRatio;
      canvas.height = width * devicePixelRatio;
    };

    resize();
    window.addEventListener("resize", resize);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globe = (createGlobe as any)(canvas, {
      devicePixelRatio,
      width: width * devicePixelRatio,
      height: width * devicePixelRatio,
      phi: 0.4,
      theta: 0.2,
      dark: 0,
      diffuse: 1.4,
      mapSamples: 20000,
      mapBrightness: 5,
      baseColor: [0.92, 0.92, 0.97],
      markerColor: [0.88, 0.18, 0.19],
      glowColor: [0.95, 0.85, 0.84],
      markers: [
        { location: [37.78, -122.41], size: 0.05 },
        { location: [40.71, -74.0], size: 0.05 },
        { location: [51.51, -0.13], size: 0.05 },
        { location: [48.86, 2.35], size: 0.04 },
        { location: [35.68, 139.69], size: 0.05 },
        { location: [1.35, 103.82], size: 0.04 },
        { location: [52.52, 13.4], size: 0.04 },
        { location: [-33.87, 151.21], size: 0.04 },
        { location: [19.07, 72.88], size: 0.05 },
        { location: [-23.55, -46.63], size: 0.04 },
      ],
      onRender: (state: Record<string, number>) => {
        if (destroyed) return;
        state.phi = phi;
        phi += 0.004;
        if (state.width !== width * devicePixelRatio) {
          state.width = width * devicePixelRatio;
          state.height = width * devicePixelRatio;
        }
      },
    });

    return () => {
      destroyed = true;
      window.removeEventListener("resize", resize);
      globe.destroy();
    };
  }, []);

  const marqueeItems = [...MARQUEE_LOGOS, ...MARQUEE_LOGOS];

  return (
    <section className="ig-section">
      <div className="ig-heading">
        <span className="ig-kicker">{kicker}</span>
        <h2 className="ig-title">{title}</h2>
        <p className="ig-sub">{subtitle}</p>
      </div>

      <div className="ig-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="ig-canvas" />
        {FEATURED_LOGOS.map((logo, index) => (
          <div
            className={`ig-icon ${logo.size}`}
            key={`${logo.slug}-${index}`}
            style={{ left: logo.left, top: logo.top }}
          >
            <img src={logoUrl(logo.slug)} alt={logo.label} loading="lazy" />
          </div>
        ))}
      </div>

      <div className="ig-marquee">
        <div className="ig-marquee-track">
          {marqueeItems.map((logo, index) => (
            <div className="ig-marquee-item" key={`${logo.slug}-${index}`}>
              <img src={logoUrl(logo.slug)} alt="" loading="lazy" aria-hidden="true" />
              <span>{logo.label}</span>
            </div>
          ))}
        </div>
      </div>

      {ctaHref && (
        <div className="ig-cta">
          <a href={ctaHref} className="ig-btn">
            {ctaLabel}
          </a>
        </div>
      )}

      <style jsx>{`
        .ig-section {
          position: relative;
          width: 100%;
          background: ${CREAM};
          padding: 78px 0 70px;
          overflow: hidden;
        }
        .ig-heading {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 42px;
          padding: 0 24px;
        }
        .ig-kicker {
          display: block;
          margin-bottom: 14px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${BRAND};
        }
        .ig-title {
          font-size: clamp(26px, 3vw, 40px);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: ${INK};
        }
        .ig-sub {
          max-width: 520px;
          margin: 14px auto 0;
          font-size: 16px;
          line-height: 1.75;
          color: rgba(11, 23, 41, 0.62);
        }
        .ig-wrap {
          position: relative;
          aspect-ratio: 1;
          width: min(620px, 86vw);
          margin: 0 auto;
        }
        .ig-canvas {
          width: 100% !important;
          height: 100% !important;
          border-radius: 50%;
        }
        .ig-icon {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 1px solid rgba(11, 23, 41, 0.08);
          border-radius: 14px;
          box-shadow: 0 4px 16px rgba(11, 23, 41, 0.1), 0 1px 3px rgba(11, 23, 41, 0.06);
          overflow: hidden;
          transform: translate(-50%, -50%);
          animation: ig-float 4s ease-in-out infinite;
          z-index: 2;
        }
        .ig-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 18%;
        }
        .ig-icon.lg { width: 60px; height: 60px; }
        .ig-icon.md { width: 48px; height: 48px; }
        .ig-icon.sm { width: 38px; height: 38px; }
        .ig-icon.xs { width: 30px; height: 30px; border-radius: 8px; }
        .ig-icon:nth-of-type(odd) { animation-duration: 3.8s; }
        .ig-icon:nth-of-type(even) { animation-duration: 4.4s; }
        .ig-marquee {
          width: 100%;
          overflow: hidden;
          padding: 28px 0 30px;
          position: relative;
        }
        .ig-marquee::before,
        .ig-marquee::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 80px;
          z-index: 2;
          pointer-events: none;
        }
        .ig-marquee::before { left: 0; background: linear-gradient(to right, ${CREAM}, transparent); }
        .ig-marquee::after { right: 0; background: linear-gradient(to left, ${CREAM}, transparent); }
        .ig-marquee-track {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: ig-marquee 40s linear infinite;
        }
        .ig-marquee-track:hover { animation-play-state: paused; }
        .ig-marquee-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: #fff;
          border: 1px solid rgba(11, 23, 41, 0.07);
          border-radius: 10px;
          box-shadow: 0 1px 4px rgba(11, 23, 41, 0.06);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .ig-marquee-item img { width: 22px; height: 22px; object-fit: contain; }
        .ig-marquee-item span { font-size: 13px; font-weight: 500; color: #374151; }
        .ig-cta { display: flex; justify-content: center; }
        .ig-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 44px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #fff;
          background: ${BRAND};
          border-radius: 10px;
          text-decoration: none;
          transition: filter 0.15s ease;
        }
        .ig-btn:hover { filter: brightness(1.08); }
        @keyframes ig-float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-7px); }
        }
        @keyframes ig-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (max-width: 600px) {
          .ig-section { padding: 56px 0 54px; }
          .ig-heading { margin-bottom: 28px; }
          .ig-icon.xs { display: none; }
          .ig-icon.lg { width: 50px; height: 50px; }
          .ig-icon.md { width: 42px; height: 42px; }
          .ig-icon.sm { width: 34px; height: 34px; }
          .ig-marquee::before,
          .ig-marquee::after { width: 44px; }
        }
      `}</style>
    </section>
  );
}
