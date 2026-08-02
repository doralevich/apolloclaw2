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
  construction: "/industries/construction",
  restaurants: "/industries/restaurants",
  ceo: "/ai-agents/ceo",
  cfo: "/ai-agents/cfo",
  sales: "/ai-agents/sales",
  recruiting: "/ai-agents/recruiting",
  brokers: "/ai-agents/brokers",
  personal: "/ai-agents/personal",
  college: "/ai-agents/college",
};

const USE_CASE_REDIRECTS = Object.entries(USE_CASE_MAP).map(([slug, destination]) => ({
  source: `/use-cases/${slug}`,
  destination,
  permanent: true,
}));

const nextConfig: NextConfig = {
  // Keep large native dependencies out of the serverless bundle;
  // they’re available in /var/task/node_modules at runtime on Vercel.
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium'],
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
      {
        source: "/pricing",
        destination: "/agents",
        permanent: true,
      },
      {
        source: "/cost-estimator",
        destination: "/agents",
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
