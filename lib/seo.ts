// The social-share image, in one place.
//
// WHY THIS EXISTS. Next does not deep-merge `openGraph`: a page that declares its own
// `openGraph` block REPLACES the layout's entirely, images and all. Every page here that set an
// og:title also silently dropped the og:image, so 23 of 41 pages shipped with no share image at
// all — and a scraper with no og:image falls back to whatever picture it finds on the page. The
// homepage's was the phone mockup from the product demo, which is how a link to apolloclaw.ai
// came out looking like a screenshot of somebody's chat.
//
// Nothing warns you about this. The build passes, the page looks right, and you only find out
// when someone shares a link. So the rule is: any page that declares `openGraph` spreads
// OG_IMAGES into it. Adding a page without it is the one mistake worth guarding against here,
// and the audit in the PR that introduced this file is how to check.

export const OG_IMAGE_URL = "/og-image.png";

export const OG_IMAGES = [
  {
    url: OG_IMAGE_URL,
    width: 1200,
    height: 630,
    alt: "Apollo[Claw] | AI Strategy & Implementation for Business",
  },
];
