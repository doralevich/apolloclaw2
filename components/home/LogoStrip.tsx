/* eslint-disable @next/next/no-img-element */
// Scrolling logo strip, extracted from components/IntegrationGlobe.tsx's marquee (dropped the
// cobe globe + floating icon cards per David's call, kept just the scrolling row). Sits right
// above the Footer's "Weekly Claw" newsletter box, same cream background for continuity.
// Logos load from https://logos.composio.dev/api/<slug>, the same CDN the live
// /dashboard/integrations page already loads images from in production.

const CREAM = "#F2F0EB";
const INK = "#0B1729";

const logoUrl = (slug: string) => `https://logos.composio.dev/api/${slug}`;

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

export function LogoStrip() {
  const items = [...MARQUEE_LOGOS, ...MARQUEE_LOGOS];
  return (
    <section style={{ background: CREAM }}>
      <style>{`
        .ls-marquee { width: 100%; overflow: hidden; position: relative; }
        .ls-marquee::before, .ls-marquee::after {
          content: ""; position: absolute; top: 0; bottom: 0; width: 80px; z-index: 2; pointer-events: none;
        }
        .ls-marquee::before { left: 0; background: linear-gradient(to right, ${CREAM}, transparent); }
        .ls-marquee::after { right: 0; background: linear-gradient(to left, ${CREAM}, transparent); }
        .ls-track { display: flex; gap: 12px; width: max-content; animation: ls-scroll 32s linear infinite; }
        .ls-track:hover { animation-play-state: paused; }
        .ls-item {
          display: flex; align-items: center; gap: 8px; padding: 8px 14px;
          background: #fff; border: 1px solid rgba(11,23,41,0.07); border-radius: 10px;
          box-shadow: 0 1px 4px rgba(11,23,41,0.06); white-space: nowrap; flex-shrink: 0;
        }
        .ls-item img { width: 20px; height: 20px; object-fit: contain; }
        .ls-item span { font-size: 13px; font-weight: 500; color: ${INK}; }
        @keyframes ls-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px" }}>
        <p
          className="mb-5 text-center"
          style={{ fontSize: 13, color: "rgba(11,23,41,0.55)", fontWeight: 600 }}
        >
          Works with the tools you already use
        </p>
        <div className="ls-marquee">
          <div className="ls-track">
            {items.map((logo, i) => (
              <div className="ls-item" key={`${logo.slug}-${i}`}>
                <img src={logoUrl(logo.slug)} alt="" loading="lazy" aria-hidden="true" />
                <span>{logo.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
