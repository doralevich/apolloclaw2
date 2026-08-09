import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Apollo[Claw]" },
  description:
    "How Apollo[Claw] collects, uses, shares, and retains personal information, the third-party processors involved, and how to exercise your privacy rights.",
  alternates: { canonical: "https://apolloclaw.ai/privacy" },
};

const EFFECTIVE = "August 3, 2026";

// Written against what this codebase actually does, not a template: every processor listed
// below corresponds to a real integration (lib/mailchimp.ts, lib/attio.ts, lib/email.ts,
// lib/telegram.ts, lib/sanity.ts, lib/stripe/*, lib/supabase/*, app/api/chat).
const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    blocks: [
      {
        kind: "prose",
        text: "Apollo[Claw] AI Consulting (“Apollo[Claw]”, “we”, “us”) builds and operates AI agents for businesses. Our address is 69 Roslyn Road, Roslyn Heights, NY 11577. For any privacy question, or to exercise a right described below, email david@apolloclaw.ai.",
      },
      {
        kind: "prose",
        text: "This policy covers apolloclaw.ai and the Apollo[Claw] dashboard. It does not cover the separate systems your agent connects to on your instruction, such as your email or CRM, which remain governed by your agreements with those providers.",
      },
    ],
  },
  {
    heading: "Information we collect",
    blocks: [
      { kind: "prose", text: "We collect the following, and only for the purposes described in the next section." },
      {
        kind: "bullets",
        items: [
          "Information you submit in a form. Our contact, discovery-call, intake, and onboarding forms ask for your name, email, phone number, company, industry, and details about your business operations and goals. The onboarding questionnaire is the most detailed of these and may include any documents you choose to upload.",
          "Account information. If you create an account, we store your email address and an authentication session. Passwords are handled by our authentication provider and are never visible to us.",
          "Billing information. If you purchase an agent, our payment processor collects and stores your card details. We never see or store full card numbers.",
          "Messages you send us. Anything you type into the site assistant, plus email and phone correspondence.",
          "Usage data. If you accept analytics cookies, we collect pages viewed, approximate location derived from IP address, referring site, and device and browser type.",
          "Technical data. Server logs recording IP address, timestamp, and requested URL, which we use to keep the site running and to investigate abuse.",
        ],
      },
      {
        kind: "prose",
        text: "We do not knowingly collect information from children under 16, and we do not sell personal information.",
      },
    ],
  },
  {
    heading: "How we use it",
    blocks: [
      {
        kind: "bullets",
        items: [
          "To respond to you, prepare for a call, and answer questions you have asked.",
          "To configure, build, and operate an agent you have engaged us to deliver. The onboarding questionnaire exists specifically to give your agent the business context it needs to be useful.",
          "To process payments and manage subscriptions.",
          "To send you the Weekly Claw newsletter, if you subscribed. Every edition contains an unsubscribe link.",
          "To keep our own records of the engagement in our CRM.",
          "To understand which pages are useful and improve the site, where you have accepted analytics cookies.",
          "To meet legal, tax, and accounting obligations.",
        ],
      },
      {
        kind: "prose",
        text: "We do not use your business information to train general-purpose AI models, and we do not share it with other clients.",
      },
    ],
  },
  {
    heading: "Who we share it with",
    blocks: [
      {
        kind: "prose",
        text: "We share personal information only with service providers that help us operate, each of which processes it on our instructions. We do not sell personal information or share it for cross-context behavioral advertising.",
      },
      {
        kind: "table",
        head: ["Provider", "What it handles"],
        rows: [
          ["Supabase", "Account records, authentication sessions, agent configuration, and uploaded files"],
          ["Stripe", "Payment processing and subscription billing"],
          ["Mailchimp", "Newsletter subscriptions and marketing email"],
          ["Mandrill (Mailchimp Transactional)", "Transactional email, including confirmations and the PDF summary of your intake form"],
          ["Attio", "Our sales CRM record of your enquiry"],
          ["Anthropic", "Processing messages you send to the site assistant so it can reply"],
          ["Google Analytics", "Aggregate site usage measurement, only after you accept analytics cookies"],
          ["Sanity", "Hosting our blog content"],
          ["Vercel", "Website hosting and server logs"],
          ["Telegram", "An internal alert to our team that a form was submitted"],
        ],
      },
      {
        kind: "prose",
        text: "We may also disclose information if required by law, to enforce our agreements, or to protect the rights and safety of Apollo[Claw], our clients, or others. If our business is acquired, information may transfer as part of that transaction; we will say so here before it takes effect.",
      },
    ],
  },
  {
    heading: "International transfers",
    blocks: [
      {
        kind: "prose",
        text: "We are based in the United States and our providers may process information in the United States and other countries. If you are in a jurisdiction with different data protection rules, understand that your information will be processed in the United States.",
      },
    ],
  },
  {
    heading: "How long we keep it",
    blocks: [
      {
        kind: "bullets",
        items: [
          "Enquiries and form submissions: retained in our CRM while there is an active or prospective relationship, and deleted on request.",
          "Client and agent configuration data: retained for the life of the engagement and for a reasonable period afterwards so an agent can be restored, then deleted on request.",
          "Billing records: retained as long as tax and accounting law requires.",
          "Newsletter subscriptions: retained until you unsubscribe.",
          "Analytics data: retained according to our Google Analytics configuration.",
        ],
      },
    ],
  },
  {
    heading: "Your rights",
    blocks: [
      {
        kind: "prose",
        text: "Depending on where you live, you may have the right to access the personal information we hold about you, correct it, delete it, obtain a portable copy, object to or restrict certain processing, withdraw consent you previously gave, and not be discriminated against for exercising any of these rights.",
      },
      {
        kind: "prose",
        text: "To exercise any of them, email david@apolloclaw.ai. We will respond within the timeframe the applicable law requires, and we may need to verify your identity first. Deletion is available on request today; a self-service export is not yet built. You can withdraw analytics consent at any time by clearing this site's cookies and data in your browser, which brings the cookie banner back.",
      },
    ],
  },
  {
    heading: "Security",
    blocks: [
      {
        kind: "prose",
        text: "We describe our security practices, including what is fully in place and what is still in progress, on our Security page. If you believe you have found a vulnerability, email david@apolloclaw.ai.",
      },
    ],
  },
  {
    heading: "Changes to this policy",
    blocks: [
      {
        kind: "prose",
        text: "If we change this policy we will update the effective date above. For material changes we will give notice on the site before the change takes effect.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      label="Legal"
      title="Privacy"
      titleAccent="Policy"
      description="What we collect, why we collect it, who processes it, and how to get it deleted."
      effective={EFFECTIVE}
      sections={SECTIONS}
    />
  );
}
