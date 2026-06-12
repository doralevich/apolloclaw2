import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
