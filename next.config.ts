import type { NextConfig } from "next";

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
        source: "/use-cases/healthcare",
        destination: "/use-cases/health",
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
    ];
  },
};

export default nextConfig;
