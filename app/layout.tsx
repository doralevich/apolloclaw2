import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import RootShell from "@/components/layout/RootShell";
import { Toaster } from "sonner";
import PageViewTracker from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";
import { OG_IMAGES, ORG_ID, ORG_REF } from "@/lib/seo";

// The GA4 property the site actually reports into.
//
// G-4ZR38XGEME is the apolloclaw.ai web stream in the "Apollo Claw" property (534279936),
// read off GA Admin > Data streams by David on Oct 6, 2026. The constant had been G-54RFVNJSSN
// since before Sep 4, with a note here claiming the opposite history, so the tag was firing
// correctly the whole time into a property nobody was looking at. That is the failure that
// looks exactly like working, which is why there is one constant for both the loader and the
// config call, and why the id is confirmed against the stream page rather than remembered.
const GA_MEASUREMENT_ID = "G-4ZR38XGEME";

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
  // The SEO brief's rules (Donna, Oct 9 2026; David said yes): a title is 50 to 60 characters,
  // one primary phrase, the brand once at the end, spelled "Apollo Claw" rather than the
  // bracketed wordmark, which reads as noise in a search result. A description is 140 to 160
  // characters with a reason to click. The suffix was "| Apollo Claw AI Consulting", which on a
  // blog post whose own title already ended in the brand put it there twice.
  title: {
    default: "Apollo Claw | AI Consulting for NYC & Long Island Businesses",
    template: "%s | Apollo Claw",
  },
  description:
    "Apollo Claw builds private AI agents for owners and executives: a chief of staff that handles email, calendar, follow-ups and reports. Book a discovery call.",
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
    siteName: "Apollo Claw",
    type: "website",
    locale: "en_US",
    url: "https://apolloclaw.ai",
    images: OG_IMAGES,
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

// The business, once. This used to be three separate top-level blocks (Organization,
// ProfessionalService, LocalBusiness) with two different names, the same address typed three
// times, and a list of "places served" that included "Universities and Colleges" and "Enterprise
// Organizations", which are customers rather than places. Twelve pages then added their own
// inline Organization as `provider`. A crawler saw up to fifteen organizations per page and had
// to guess which was real (the SEO brief, Donna, Oct 9 2026).
//
// ProfessionalService is a LocalBusiness is an Organization in schema.org, so one node with that
// type carries everything the three said. It has an @id (lib/seo.ts ORG_ID) and every other
// page's structured data points at it with ORG_REF instead of restating it. The WebSite node
// names the publisher the same way.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": ORG_ID,
      name: "Apollo Claw",
      alternateName: "Apollo Claw AI Consulting",
      url: "https://apolloclaw.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://apolloclaw.ai/og-image.png",
        width: 1200,
        height: 630,
      },
      image: "https://apolloclaw.ai/og-image.png",
      description:
        "AI consulting and implementation for owner-led businesses: private AI agents set up on your own infrastructure, with hands-on training and support after launch.",
      serviceType: "AI Strategy and Implementation",
      priceRange: "$$$$",
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
        { "@type": "Country", name: "United States" },
        { "@type": "Place", name: "Long Island, NY" },
        { "@type": "AdministrativeArea", name: "Nassau County, NY" },
        { "@type": "AdministrativeArea", name: "Suffolk County, NY" },
        { "@type": "City", name: "New York City" },
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: "+1-917-363-5487",
        email: "hello@apolloclaw.ai",
        url: "https://apolloclaw.ai/contact",
      },
      founder: {
        "@type": "Person",
        "@id": "https://apolloclaw.ai/company#david",
        name: "David Oralevich",
        jobTitle: "Founder, AI Automation Consultant",
        url: "https://apolloclaw.ai/company",
      },
      sameAs: [
        "https://www.linkedin.com/company/apolloclaw/",
        "https://designsbydaveo.com",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "AI Consulting Services",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Strategy Consulting" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Agent Implementation" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom AI Agent Development" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Automation for Small Business" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Consulting for Universities" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Consulting for Enterprise Organizations" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Consulting for Nonprofits" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fractional Chief AI Officer" } },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://apolloclaw.ai/#website",
      url: "https://apolloclaw.ai",
      name: "Apollo Claw",
      publisher: ORG_REF,
      inLanguage: "en-US",
    },
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
        {/* Applies the saved dashboard theme BEFORE first paint. Without it the page renders
            light, React mounts, and the effect flips it to dark a frame later — a white flash
            on every load for anyone who chose dark. Has to be inline and synchronous in <head>
            for that reason; it is the one thing a component cannot do.

            Dashboard paths only, matching ThemeProvider's scope: the marketing pages carry
            literal hex and have no dark styling to switch to. The key and the light/dark/system
            values are duplicated from components/ThemeProvider.tsx — change one, change both. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!location.pathname.startsWith("/dashboard"))return;var m=localStorage.getItem("apolloclaw-theme")||"light";if(m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
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
        className={`${inter.variable} ${bricolage.variable} font-body`}
        style={{ fontFamily: "var(--font-body), Inter, sans-serif", "--font-display": "var(--font-body)", "--font-mono": "'IBM Plex Mono', monospace" } as React.CSSProperties}
      >
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        {/* Google Consent Mode v2. Analytics storage starts DENIED, so no analytics cookie or
            identifier is written until the visitor accepts in the banner (components/
            CookieConsent.tsx, which calls gtag('consent','update',...)). A returning visitor's
            stored choice is replayed here synchronously, before the config call, so they don't
            spend the first 500ms of every page in the denied state.

            send_page_view is NOT disabled any more, and that was the bug. It was off because
            PageViewTracker sends page_view itself — but that component's effect runs at
            hydration, while both of these scripts are afterInteractive and may not have defined
            window.gtag yet. When they had not, the tracker hit its `typeof gtagFn !== 'function'`
            guard, returned, and never retried: its deps are [pathname, searchParams], neither of
            which changes on a cold load. So the FIRST page view of every visit was dropped, and
            with GA's own one disabled, a visitor who landed and left recorded nothing at all.

            The config call handles the first view now — it is queued into dataLayer by the inline
            gtag shim above, so it cannot lose the race — and the tracker covers soft navigations
            only. */}
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
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}</Script>
        <PageViewTracker />
        {/* CHAT_API_TOKEN travels from here to Donna, in both places she renders. Read in one
            spot so the value the browser sends and the value app/api/chat/route.ts checks are
            the same variable and cannot drift; unset, both sides go quiet together. */}
        <RootShell chatToken={process.env.CHAT_API_TOKEN ?? ""}>{children}</RootShell>
        {/* Outside RootShell so it also shows on the dashboard/login surfaces, which render
            bare children but still load the analytics script from this layout. */}
        <CookieConsent />
        <Toaster richColors />
      </body>
    </html>
  );
}
