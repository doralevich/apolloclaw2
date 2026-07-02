import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootShell from "@/components/layout/RootShell";
import { Toaster } from "sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apolloclaw.ai"),
  title: {
    default: "Apollo[Claw] — AI Strategy & Implementation for Business",
    template: "%s | Apollo[Claw]",
  },
  description:
    "Apollo Claw helps businesses deploy AI agents that save time, reduce costs, and drive revenue. Custom AI strategy, implementation, and ongoing management for companies ready to lead.",
  keywords: [
    "AI strategy for business",
    "AI consulting",
    "AI agent implementation",
    "AI automation for small business",
    "custom AI agents",
    "AI consultant Long Island",
    "AI consultant NYC",
    "business AI integration",
    "AI agents for executives",
    "AI automation",
    "AI agents for small business",
    "AI implementation NYC",
    "custom AI bots",
    "business automation",
    "digital employee",
    "AI assistant setup",
  ],
  openGraph: {
    siteName: "Apollo[Claw]",
    type: "website",
    locale: "en_US",
    url: "https://apolloclaw.ai",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Apollo[Claw] — AI Strategy & Implementation for Business",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@apolloclaw",
  },
  alternates: {
    canonical: "https://apolloclaw.ai",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Apollo Claw",
    url: "https://apolloclaw.ai",
    logo: "https://apolloclaw.ai/og-image.png",
    description:
      "AI strategy and implementation consultancy serving businesses nationwide.",
    telephone: "+1-917-363-5487",
    email: "hello@apolloclaw.ai",
    address: {
      "@type": "PostalAddress",
      streetAddress: "69 Roslyn Road",
      addressLocality: "Roslyn Heights",
      addressRegion: "NY",
      postalCode: "11577",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: "https://apolloclaw.ai/get-started",
    },
    founder: {
      "@type": "Person",
      name: "David Oralevich",
      jobTitle: "AI Automation Consultant & Founder",
    },
    sameAs: [
      "https://www.linkedin.com/company/apolloclaw/",
      "https://designsbydaveo.com",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Apollo Claw AI Consulting",
    url: "https://apolloclaw.ai",
    description:
      "Custom AI agent strategy, implementation, and management for businesses.",
    serviceType: "AI Strategy and Implementation",
    telephone: "+1-917-363-5487",
    email: "hello@apolloclaw.ai",
    address: {
      "@type": "PostalAddress",
      streetAddress: "69 Roslyn Road",
      addressLocality: "Roslyn Heights",
      addressRegion: "NY",
      postalCode: "11577",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.7998,
      longitude: -73.651,
    },
    areaServed: [
      { "@type": "Place", name: "Long Island, NY" },
      { "@type": "Place", name: "New York City" },
      { "@type": "Place", name: "United States" },
      { "@type": "Place", name: "Nassau County, NY" },
      { "@type": "Place", name: "NYC Metro Area" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AI Consulting Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "AI Strategy Consulting" },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "AI Agent Implementation" },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Custom AI Agent Development" },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "AI Automation for Small Business" },
        },
      ],
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body
        className={`${inter.variable} font-body`}
        style={{ fontFamily: "var(--font-body), Inter, sans-serif", "--font-display": "var(--font-body)", "--font-mono": "'IBM Plex Mono', monospace" } as React.CSSProperties}
      >
        <GoogleAnalytics />
        <RootShell>{children}</RootShell>
        <Toaster richColors />
      </body>
    </html>
  );
}
