import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import RootShell from "@/components/layout/RootShell";
import { Toaster } from "sonner";
import PageViewTracker from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// New brand headline font (site rebuild, Phase 1: nav + homepage only). Loaded sitewide via
// next/font so it's available immediately, but only APPLIED in the new Navbar/homepage for
// now via the `font-heading` utility below, every other page keeps rendering `font-display`
// as Inter until the rebuild reaches them, so this doesn't reskin untouched pages.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apolloclaw.ai"),
  title: {
    default: "Apollo Claw | AI Consulting Firm for Business, Enterprise & Universities",
    template: "%s | Apollo Claw AI Consulting",
  },
  description:
    "Apollo Claw is a leading AI consulting firm serving small businesses, mid-market companies, enterprise organizations, and universities. Strategy, implementation, and AI agents built to perform.",
  keywords: [
    "AI consulting firm",
    "AI consulting company",
    "AI strategy consulting",
    "AI implementation for business",
    "AI consulting for enterprise",
    "AI consulting for universities",
    "AI consulting for organizations",
    "AI consulting for small business",
    "AI consulting for mid-market",
    "AI agent implementation",
    "AI automation consulting",
    "enterprise AI consulting",
    "AI consulting firm New York",
    "AI consulting Long Island",
    "AI consulting NYC",
    "custom AI agents for business",
    "AI strategy for executives",
    "AI consulting for nonprofits",
    "AI consulting for healthcare",
    "AI consulting for legal firms",
    "AI consulting for insurance",
    "AI consulting for real estate",
    "business AI integration",
    "AI digital employee",
    "fractional Chief AI Officer",
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
        alt: "Apollo[Claw] | AI Strategy & Implementation for Business",
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
      { "@type": "Place", name: "United States" },
      { "@type": "Place", name: "Long Island, NY" },
      { "@type": "Place", name: "New York City" },
      { "@type": "Place", name: "Nassau County, NY" },
      { "@type": "Place", name: "NYC Metro Area" },
      { "@type": "Place", name: "Universities and Colleges" },
      { "@type": "Place", name: "Enterprise Organizations" },
      { "@type": "Place", name: "Small and Mid-Market Businesses" },
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
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "AI Consulting for Universities" },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "AI Consulting for Enterprise Organizations" },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "AI Consulting for Nonprofits" },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Fractional Chief AI Officer" },
        },
      ],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Apollo Claw AI Consulting",
    url: "https://apolloclaw.ai",
    description: "Apollo Claw is a leading AI consulting firm serving businesses of all sizes, from small businesses and mid-market companies to enterprise organizations and universities.",
    priceRange: "$$$$",
    telephone: "+1-917-363-5487",
    email: "david@apolloclaw.ai",
    address: {
      "@type": "PostalAddress",
      streetAddress: "69 Roslyn Road",
      addressLocality: "Roslyn Heights",
      addressRegion: "NY",
      postalCode: "11577",
      addressCountry: "US",
    },
    sameAs: [
      "https://www.linkedin.com/company/apolloclaw/",
      "https://designsbydaveo.com",
    ],
  }
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
        className={`${inter.variable} ${bricolage.variable} font-body`}
        style={{ fontFamily: "var(--font-body), Inter, sans-serif", "--font-display": "var(--font-body)", "--font-mono": "'IBM Plex Mono', monospace" } as React.CSSProperties}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4ZR38XGEME"
          strategy="afterInteractive"
        />
        {/* Google Consent Mode v2. Analytics storage starts DENIED, so no analytics cookie or
            identifier is written until the visitor accepts in the banner (components/
            CookieConsent.tsx, which calls gtag('consent','update',...)). A returning visitor's
            stored choice is replayed here synchronously, before the config call, so they don't
            spend the first 500ms of every page in the denied state. */}
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
          try {
            if (localStorage.getItem('ac-cookie-consent') === 'accepted') {
              gtag('consent', 'update', { analytics_storage: 'granted' });
            }
          } catch (e) {}
          gtag('js', new Date());
          gtag('config', 'G-4ZR38XGEME', { send_page_view: false });
        `}</Script>
        <PageViewTracker />
        <RootShell>{children}</RootShell>
        {/* Outside RootShell so it also shows on the dashboard/login surfaces, which render
            bare children but still load the analytics script from this layout. */}
        <CookieConsent />
        <Toaster richColors />
      </body>
    </html>
  );
}
