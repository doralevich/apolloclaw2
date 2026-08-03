import type { NextConfig } from "next";

// Old /use-cases/* slug -> new path. "healthcare" is an older alias that used to hop to
// /use-cases/health; it now points straight at the final destination so there is no redirect
// chain.
const USE_CASE_MAP: Record<string, string> = {
  legal: "/industries/law-firms",
  health: "/industries/medical-practices",
  healthcare: "/industries/medical-practices",
  "real-estate": "/industries/real-estate",
  insurance: "/industries/insurance",
  accounting: "/industries/accounting-firms",
  ecommerce: "/industries/ecommerce",
  nonprofit: "/industries/nonprofit",
  finance: "/industries/financial-services",
  ceo: "/ai-agents/ceo",
  cfo: "/ai-agents/cfo",
  sales: "/ai-agents/sales",
  recruiting: "/ai-agents/recruiting",
  personal: "/ai-agents/personal",
  // construction, restaurants, brokers, and college are deliberately absent. Their destination
  // pages were removed (David's call), so a mapping here would 301 an old indexed URL straight
  // into a 404 — a soft-404 to Google, and worse for a visitor than an honest 404. Dropping the
  // entry lets /use-cases/<slug> 404 directly, which is the correct signal for content that is
  // genuinely gone. If any of these should instead point at a surviving page (brokers ->
  // /industries/real-estate is the closest real match), add the line back with that destination.
};

const USE_CASE_REDIRECTS = Object.entries(USE_CASE_MAP).map(([slug, destination]) => ({
  source: `/use-cases/${slug}`,
  destination,
  permanent: true,
}));

// ─── Security headers (playbook Item 8) ──────────────────────────────────────
//
// The allow-list below covers only what the BROWSER loads. Server-side callers
// (api.anthropic.com, mandrillapp.com, api.attio.com, api.telegram.org, api.agent37.com,
// ipapi.co, and the CRM Supabase project) are deliberately absent: CSP governs the page, not
// the Node runtime, and listing them would widen the policy for no benefit.
const SUPABASE_ORIGIN = "https://tbbzlloiigtepdwoquvy.supabase.co";
const SUPABASE_WS = "wss://tbbzlloiigtepdwoquvy.supabase.co";

const CSP_DIRECTIVES = [
  "default-src 'self'",
  // 'unsafe-inline' is required today by the inline GA config script and the JSON-LD blocks in
  // app/layout.tsx; 'unsafe-eval' by the Next.js runtime. Tightening these to a nonce is a
  // follow-up, and is the reason this ships report-only first.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://assets.calendly.com",
  // This codebase styles almost everything with inline `style={{...}}`, so 'unsafe-inline' here
  // is structural rather than incidental.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // cdn.sanity.io: blog imagery. logos.composio.dev: the integration globe and marquee.
  "img-src 'self' data: blob: https://cdn.sanity.io https://logos.composio.dev https://www.googletagmanager.com https://www.google-analytics.com",
  `connect-src 'self' ${SUPABASE_ORIGIN} ${SUPABASE_WS} https://www.google-analytics.com https://region1.google-analytics.com https://calendly.com`,
  // Calendly's inline booking widget on /get-started. 'self' covers the /demo.html lightbox.
  "frame-src 'self' https://calendly.com https://assets.calendly.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // 'self' to match X-Frame-Options above, so the demo lightbox keeps working when this
  // policy is promoted from report-only to enforced.
  "frame-ancestors 'self'",
  // NOTE: `upgrade-insecure-requests` is deliberately absent. Browsers ignore it in a
  // report-only policy and log a warning saying so on every page load, which is exactly the
  // console noise that makes a real violation easy to miss while we are watching for them.
  // ADD IT BACK when this is promoted to an enforced Content-Security-Policy.
].join("; ");

const securityHeaders = [
  // Two years, with preload, matching the playbook. Only meaningful over HTTPS, which Vercel
  // terminates for every deployment.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // SAMEORIGIN rather than DENY, deliberately. DENY blocks framing by ANY origin INCLUDING our
  // own, which broke the "A Day with John" lightbox: it iframes /demo.html from our own pages,
  // and the popup rendered blank. SAMEORIGIN still keeps every other site out, which is the
  // actual threat (clickjacking), while allowing the one same-origin frame we intend.
  //
  // A per-path override for /demo.html was tried first and did not work: when two header rules
  // match the same request, Next.js does not let the later one replace a key set by the
  // earlier catch-all. Verified by curl, not assumed.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // REPORT-ONLY on purpose. This logs violations to the browser console without blocking
  // anything, so a real deployment can be watched for false positives before the policy is
  // enforced. Promoting it means renaming this key to "Content-Security-Policy" — do that only
  // after a preview deploy has been clicked through with the console open.
  { key: "Content-Security-Policy-Report-Only", value: CSP_DIRECTIVES },
];

const nextConfig: NextConfig = {
  // Keep large native dependencies out of the serverless bundle;
  // they’re available in /var/task/node_modules at runtime on Vercel.
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium'],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: `/images/elj68qgu/**`,
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      // /agents (the self-serve storefront) was retired — David's call that it is no longer
      // relevant, alongside removing the Get Started buttons that pointed at it. These two
      // are indexed pricing-intent URLs, so they move to /contact rather than being dropped:
      // someone searching for our pricing still wants to reach a human, and a 301 into a 404
      // is worse than either.
      {
        source: "/pricing",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/cost-estimator",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/agents",
        destination: "/contact",
        permanent: true,
      },
      // /create-an-agent retired too (David's call). It was in the sitemap at priority 0.9, so
      // it may well be indexed; commercial intent, same destination as the storefront.
      {
        source: "/create-an-agent",
        destination: "/contact",
        permanent: true,
      },
      // The /use-cases/* tree was retired and split along the two axes the nav actually
      // presents: /industries/* (the business you run) and /ai-agents/* (the role you're
      // hiring). Every old path was indexed at sitemap priority 0.9, so each one 301s to its
      // new home to carry the ranking over. Do not remove these.
      ...USE_CASE_REDIRECTS,
    ];
  },
};

export default nextConfig;
