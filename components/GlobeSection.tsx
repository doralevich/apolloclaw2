"use client";
import { useEffect, useRef } from "react";
import createGlobe from "cobe";

const ICON_CARDS = [
  // FAR LEFT edge
  { slug: "gmail",          alt: "Gmail",             size: "lg", left: "1%",   top: "30%" },
  { slug: "slack",          alt: "Slack",             size: "md", left: "3%",   top: "55%" },
  { slug: "twitter",        alt: "Twitter/X",         size: "xs", left: "6%",   top: "15%" },
  { slug: "discord",        alt: "Discord",           size: "sm", left: "5%",   top: "78%" },
  // LEFT mid
  { slug: "github",         alt: "GitHub",            size: "md", left: "14%",  top: "20%" },
  { slug: "notion",         alt: "Notion",            size: "sm", left: "16%",  top: "65%" },
  { slug: "linkedin",       alt: "LinkedIn",          size: "xs", left: "11%",  top: "42%" },
  { slug: "supabase",       alt: "Supabase",          size: "xs", left: "18%",  top: "87%" },
  // TOP
  { slug: "googledrive",    alt: "Google Drive",      size: "sm", left: "28%",  top: "4%"  },
  { slug: "figma",          alt: "Figma",             size: "md", left: "40%",  top: "1%"  },
  { slug: "linear",         alt: "Linear",            size: "sm", left: "60%",  top: "3%"  },
  { slug: "googlesheets",   alt: "Google Sheets",     size: "xs", left: "72%",  top: "6%"  },
  // ON GLOBE / center zone
  { slug: "googledocs",     alt: "Google Docs",       size: "md", left: "36%",  top: "26%" },
  { slug: "intercom",       alt: "Intercom",          size: "sm", left: "62%",  top: "34%" },
  { slug: "bitbucket",      alt: "Bitbucket",         size: "sm", left: "42%",  top: "68%" },
  { slug: "posthog",        alt: "PostHog",           size: "md", left: "56%",  top: "62%" },
  { slug: "sentry",         alt: "Sentry",            size: "xs", left: "46%",  top: "44%" },
  { slug: "youtube",        alt: "YouTube",           size: "sm", left: "66%",  top: "52%" },
  { slug: "mailchimp",      alt: "Mailchimp",         size: "xs", left: "35%",  top: "50%" },
  { slug: "datadog",        alt: "Datadog",           size: "xs", left: "58%",  top: "76%" },
  // BOTTOM
  { slug: "salesforce",     alt: "Salesforce",        size: "md", left: "30%",  top: "94%" },
  { slug: "airtable",       alt: "Airtable",          size: "sm", left: "44%",  top: "97%" },
  { slug: "jira",           alt: "Jira",              size: "sm", left: "58%",  top: "93%" },
  { slug: "zendesk",        alt: "Zendesk",           size: "xs", left: "70%",  top: "96%" },
  // RIGHT mid
  { slug: "googlecalendar", alt: "Google Calendar",   size: "md", left: "82%",  top: "20%" },
  { slug: "shopify",        alt: "Shopify",           size: "sm", left: "84%",  top: "65%" },
  { slug: "outlook",        alt: "Outlook",           size: "xs", left: "88%",  top: "42%" },
  { slug: "xero",           alt: "Xero",              size: "xs", left: "79%",  top: "85%" },
  // FAR RIGHT edge
  { slug: "hubspot",        alt: "HubSpot",           size: "lg", left: "94%",  top: "38%" },
  { slug: "stripe",         alt: "Stripe",            size: "md", left: "97%",  top: "60%" },
  { slug: "brex",           alt: "Brex",              size: "xs", left: "92%",  top: "18%" },
  { slug: "klaviyo",        alt: "Klaviyo",           size: "sm", left: "96%",  top: "80%" },
];

const SIZE_MAP: Record<string, { width: number; borderRadius: number }> = {
  lg: { width: 60, borderRadius: 14 },
  md: { width: 48, borderRadius: 14 },
  sm: { width: 38, borderRadius: 14 },
  xs: { width: 30, borderRadius: 8 },
};

const MARKERS: { location: [number, number]; size: number }[] = [
  // USA
  { location: [37.78, -122.41], size: 0.05 }, // San Francisco
  { location: [34.05, -118.24], size: 0.06 }, // Los Angeles
  { location: [47.61, -122.33], size: 0.05 }, // Seattle
  { location: [45.52, -122.68], size: 0.04 }, // Portland
  { location: [36.17, -115.14], size: 0.04 }, // Las Vegas
  { location: [33.45, -112.07], size: 0.05 }, // Phoenix
  { location: [32.72, -117.15], size: 0.04 }, // San Diego
  { location: [39.74, -104.98], size: 0.05 }, // Denver
  { location: [35.47, -97.52],  size: 0.04 }, // Oklahoma City
  { location: [29.76, -95.37],  size: 0.05 }, // Houston
  { location: [30.27, -97.74],  size: 0.04 }, // Austin
  { location: [29.42, -98.49],  size: 0.04 }, // San Antonio
  { location: [32.78, -96.80],  size: 0.05 }, // Dallas
  { location: [32.75, -97.33],  size: 0.04 }, // Fort Worth
  { location: [31.76, -106.49], size: 0.04 }, // El Paso
  { location: [33.58, -101.86], size: 0.03 }, // Lubbock
  { location: [35.22, -101.83], size: 0.03 }, // Amarillo
  { location: [27.80, -97.40],  size: 0.03 }, // Corpus Christi
  { location: [26.20, -98.23],  size: 0.03 }, // McAllen
  { location: [31.84, -102.37], size: 0.03 }, // Midland
  { location: [31.55, -97.15],  size: 0.03 }, // Waco
  { location: [30.07, -94.10],  size: 0.03 }, // Beaumont
  { location: [44.98, -93.27],  size: 0.05 }, // Minneapolis
  { location: [41.88, -87.63],  size: 0.06 }, // Chicago
  { location: [39.77, -86.16],  size: 0.04 }, // Indianapolis
  { location: [43.05, -76.15],  size: 0.04 }, // Syracuse
  { location: [40.71, -74.00],  size: 0.06 }, // New York
  { location: [42.36, -71.06],  size: 0.05 }, // Boston
  { location: [39.95, -75.17],  size: 0.05 }, // Philadelphia
  { location: [38.91, -77.04],  size: 0.05 }, // Washington DC
  { location: [35.23, -80.84],  size: 0.04 }, // Charlotte
  { location: [33.75, -84.39],  size: 0.05 }, // Atlanta
  { location: [25.77, -80.19],  size: 0.05 }, // Miami
  { location: [27.95, -82.46],  size: 0.04 }, // Tampa
  { location: [30.33, -81.66],  size: 0.04 }, // Jacksonville
  { location: [35.15, -90.05],  size: 0.04 }, // Memphis
  { location: [29.95, -90.07],  size: 0.04 }, // New Orleans
  { location: [38.25, -85.76],  size: 0.04 }, // Louisville
  { location: [39.96, -82.99],  size: 0.04 }, // Columbus
  { location: [41.50, -81.69],  size: 0.04 }, // Cleveland
  { location: [42.33, -83.05],  size: 0.05 }, // Detroit
  { location: [43.05, -88.00],  size: 0.04 }, // Milwaukee
  { location: [38.63, -90.20],  size: 0.05 }, // St. Louis
  { location: [41.26, -95.94],  size: 0.04 }, // Omaha
  { location: [37.69, -97.34],  size: 0.04 }, // Wichita
  { location: [39.10, -94.58],  size: 0.04 }, // Kansas City
  { location: [41.60, -93.61],  size: 0.03 }, // Des Moines
  { location: [40.81, -96.68],  size: 0.03 }, // Lincoln
  { location: [46.88, -96.79],  size: 0.03 }, // Fargo
  { location: [43.55, -116.56], size: 0.04 }, // Boise
  { location: [40.76, -111.89], size: 0.04 }, // Salt Lake City
  { location: [35.08, -106.65], size: 0.04 }, // Albuquerque
  { location: [32.22, -110.93], size: 0.04 }, // Tucson
  { location: [46.60, -112.03], size: 0.03 }, // Helena
  { location: [35.47, -86.49],  size: 0.04 }, // Nashville
  { location: [33.52, -86.80],  size: 0.04 }, // Birmingham
  { location: [35.78, -78.64],  size: 0.04 }, // Raleigh
  { location: [37.54, -77.43],  size: 0.04 }, // Richmond
  { location: [36.85, -75.98],  size: 0.03 }, // Virginia Beach
  { location: [40.44, -79.99],  size: 0.04 }, // Pittsburgh
  { location: [42.89, -78.86],  size: 0.03 }, // Buffalo
  { location: [41.76, -72.68],  size: 0.03 }, // Hartford
  { location: [41.82, -71.41],  size: 0.03 }, // Providence
  { location: [61.22, -149.90], size: 0.04 }, // Anchorage
  // Israel
  { location: [32.08, 34.78],   size: 0.05 }, // Tel Aviv
  { location: [31.78, 35.22],   size: 0.04 }, // Jerusalem
  { location: [32.79, 34.99],   size: 0.04 }, // Haifa
  // Rest of world
  { location: [51.51, -0.13],   size: 0.04 }, // London
  { location: [48.86, 2.35],    size: 0.04 }, // Paris
  { location: [52.52, 13.40],   size: 0.04 }, // Berlin
  { location: [35.68, 139.69],  size: 0.04 }, // Tokyo
  { location: [1.35, 103.82],   size: 0.04 }, // Singapore
  { location: [-33.87, 151.21], size: 0.04 }, // Sydney
  { location: [19.07, 72.88],   size: 0.04 }, // Mumbai
  { location: [-23.55, -46.63], size: 0.04 }, // São Paulo
];

export default function GlobeSection() {
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
      markerColor: [0.85, 0.17, 0.17],
      glowColor: [0.88, 0.88, 1.0],
      markers: MARKERS,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onRender: (state: any) => {
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

  return (
    <section style={{ background: "#FAFAF7", color: "#1A1A1A" }}>
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
        ${Array.from({ length: 32 }, (_, i) => `.globe-icon-card:nth-child(${i + 1}) { animation-delay: ${(i * 0.25) % 4}s; }`).join("\n")}
        @media (max-width: 600px) { .globe-icon-card-xs { display: none !important; } }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 48px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: "#0f0f11", lineHeight: 1.15, marginBottom: 12, whiteSpace: "nowrap" }}>
            Works with the tools you already use
          </h2>
          <p style={{ fontSize: 17, color: "#6b7280", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            From Gmail and Slack to Salesforce and Stripe, ready to go!
          </p>
        </div>

        {/* Full-width stage: icons span the entire section, globe centered */}
        <div style={{ position: "relative", width: "100%", height: "min(420px, 70vw)" }}>
          {/* Globe */}
          <div ref={wrapRef} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(420px, 55vw)", aspectRatio: "1", zIndex: 1 }}>
            <canvas ref={canvasRef} style={{ width: "100% !important" as "100%", height: "100% !important" as "100%", borderRadius: "50%", display: "block" }} />
          </div>

          {/* Icon cards — positioned relative to full-width stage */}
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
    </section>
  );
}
