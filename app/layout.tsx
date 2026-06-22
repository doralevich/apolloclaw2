import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootShell from "@/components/layout/RootShell";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apolloclaw.ai"),
  title: {
    default: "Apollo[Claw] — AI Consulting & Automation",
    template: "%s | Apollo[Claw]",
  },
  description:
    "Apollo[Claw] delivers custom AI implementation for small businesses. We set up and manage AI agents that save 20+ hours weekly. Serving Long Island, NYC Metro and beyond.",
  keywords: [
    "AI automation",
    "AI consultant Long Island",
    "AI agents for small business",
    "AI implementation NYC",
    "custom AI bots",
    "business automation",
    "AI strategy",
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
        alt: "Apollo[Claw] — AI Consulting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@apolloclaw",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Apollo[Claw]",
  url: "https://apolloclaw.ai",
  description:
    "AI automation consulting and bot implementation for small businesses. Based on Long Island, NY, serving the NYC metro area.",
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
    { "@type": "Place", name: "Nassau County, NY" },
    { "@type": "Place", name: "New York City, NY" },
    { "@type": "Place", name: "NYC Metro Area" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "AI Consulting Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "AI Automation Consulting" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "AI Bot Setup & Implementation" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Custom AI Agent Development" },
      },
    ],
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
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} font-body`}
        style={{ fontFamily: "var(--font-body), Inter, sans-serif", "--font-display": "var(--font-body)", "--font-mono": "'IBM Plex Mono', monospace" } as React.CSSProperties}
      >
        <RootShell>{children}</RootShell>
        <Toaster richColors />
      </body>
    </html>
  );
}
