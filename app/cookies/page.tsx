import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: { absolute: "Cookie Policy | Apollo[Claw]" },
  description:
    "The cookies apolloclaw.ai sets, which are strictly necessary, which require your consent, and how to change your choice.",
  alternates: { canonical: "https://apolloclaw.ai/cookies" },
};

const EFFECTIVE = "August 3, 2026";

const SECTIONS: LegalSection[] = [
  {
    heading: "What cookies we use",
    blocks: [
      {
        kind: "prose",
        text: "A cookie is a small file a site stores in your browser. We use very few. This page lists all of them, split into the ones the site cannot work without and the ones you choose.",
      },
    ],
  },
  {
    heading: "Strictly necessary",
    blocks: [
      {
        kind: "prose",
        text: "These are set regardless of your choice, because without them the site cannot do what you asked it to do. They are not used for advertising or tracking across other sites.",
      },
      {
        kind: "table",
        head: ["Cookie", "Purpose"],
        rows: [
          ["Authentication session (set by Supabase)", "Keeps you signed in to the dashboard as you move between pages. Set only if you log in. Cleared when you sign out."],
          ["ac-cookie-consent (browser local storage)", "Remembers whether you accepted or declined analytics, so we stop asking. Strictly speaking this is local storage rather than a cookie, but it is listed here because it works the same way from your point of view."],
        ],
      },
    ],
  },
  {
    heading: "Analytics, only with your consent",
    blocks: [
      {
        kind: "prose",
        text: "We use Google Analytics to see which pages people find useful. It is switched off by default. Until you press Accept, Google Analytics is loaded in a consent-denied state and writes no analytics cookie and no identifier. If you press Accept, the following are set.",
      },
      {
        kind: "table",
        head: ["Cookie", "Purpose"],
        rows: [
          ["_ga", "Distinguishes one visitor from another so visits can be counted. Expires after two years."],
          ["_ga_<container id>", "Maintains the session state for Google Analytics 4. Expires after two years."],
        ],
      },
      {
        kind: "prose",
        text: "We use analytics only in aggregate, to understand traffic. We do not use it to build advertising profiles, and we have not enabled Google Ads features, ad personalization, or ad data sharing.",
      },
    ],
  },
  {
    heading: "What we do not use",
    blocks: [
      {
        kind: "bullets",
        items: [
          "No advertising or retargeting cookies.",
          "No social media tracking pixels.",
          "No cross-site tracking, and we do not sell or share your data for advertising.",
        ],
      },
    ],
  },
  {
    heading: "Changing your mind",
    blocks: [
      {
        kind: "prose",
        text: "If you declined and want to accept, or accepted and want to withdraw, clear this site's cookies and site data in your browser settings. That removes the stored choice and the banner will appear again on your next visit, letting you choose differently. Declining leaves the site fully usable; nothing is withheld from you for saying no.",
      },
      {
        kind: "prose",
        text: "You can also block or delete cookies entirely in your browser settings. If you block the authentication cookie you will not be able to stay signed in to the dashboard.",
      },
    ],
  },
  {
    heading: "Questions",
    blocks: [
      {
        kind: "prose",
        text: "Our Privacy Policy explains what we do with personal information more broadly. For anything not answered there, email david@apolloclaw.ai.",
      },
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      label="Legal"
      title="Cookie"
      titleAccent="Policy"
      description="Every cookie this site sets, which ones you control, and how to change your mind."
      effective={EFFECTIVE}
      sections={SECTIONS}
    />
  );
}
