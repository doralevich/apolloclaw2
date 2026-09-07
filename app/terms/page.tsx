import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | Apollo[Claw]" },
  description:
    "The agreement for buying and using an Apollo[Claw] agent: what you get, what it costs, how billing and cancellation work, what the agent may do, and where our responsibility ends.",
  alternates: { canonical: "https://apolloclaw.ai/terms" },
};

// WRITTEN AGAINST WHAT THIS PRODUCT ACTUALLY DOES, not a template. Every number and every
// timescale below is read out of the code, so it can be checked rather than trusted:
//
//   $449 license / $189 a month / $25 of included usage  lib/pricing/catalog.ts
//   Credit packs and the 7% service fee inside them      lib/pricing/catalog.ts (CREDIT_MARKUP)
//   10-day grace window after cancellation               lib/entitlement.ts (GRACE_PERIOD_DAYS)
//   30-day retention before an agent is purged           lib/agent-lifecycle.ts (RETENTION_DAYS)
//   Subprocessors                                        app/privacy/page.tsx, kept in step
//
// IF ANY OF THOSE CHANGE, THIS PAGE CHANGES IN THE SAME COMMIT. A terms page that quotes a
// stale price is worse than one that quotes none, because a customer can hold us to it.
//
// NOT REVIEWED BY A LAWYER. It is an accurate description of the service and a conventional set
// of terms for it, written so a customer can actually read it. Two clauses are business
// decisions rather than drafting - the refund position and the liability cap - and both are
// flagged to David rather than quietly chosen. Have counsel read this before relying on it.
const EFFECTIVE = "September 7, 2026";

const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are, and what this covers",
    blocks: [
      {
        kind: "prose",
        text: "Apollo[Claw] AI Consulting (“Apollo[Claw]”, “we”, “us”) builds and hosts AI agents for businesses. Our address is 69 Roslyn Road, Roslyn Heights, NY 11577, and you can reach us at david@apolloclaw.ai.",
      },
      {
        kind: "prose",
        text: "These terms are the agreement between you and us for buying and using an agent, and for using apolloclaw.ai and the Apollo[Claw] dashboard. By buying an agent or using the dashboard you agree to them. If you are agreeing on behalf of a company, you are confirming you have the authority to bind it.",
      },
      {
        kind: "prose",
        text: "Two related documents sit alongside these terms and are part of this agreement: our Privacy Policy, which covers what we collect and who processes it, and our Cookie Policy. Where we have signed a separate written agreement with you, that agreement wins over anything here that conflicts with it.",
      },
    ],
  },
  {
    heading: "What you are buying",
    blocks: [
      {
        kind: "prose",
        text: "An Apollo[Claw] agent is three things bought together, and it is worth being precise about which is which:",
      },
      {
        kind: "bullets",
        items: [
          "A licence, paid once. This covers building your agent: the questionnaire, the configuration, and the setup work that turns your answers into a working assistant.",
          "Hosting, paid monthly. Your agent runs on a server we manage, keep patched, and keep running. This is the recurring cost and it does not stop being incurred when you are not using it.",
          "Usage. Every conversation your agent has costs money in AI model tokens. Your hosting includes an allowance each month; beyond that you buy credit as you need it.",
        ],
      },
      {
        kind: "prose",
        text: "Current prices are shown at checkout and are what binds. At the time of writing, self-serve is a $449 licence plus $189 a month for hosting, which includes $25 of token usage each month. A higher tier with setup done together on calls is arranged by conversation rather than sold through checkout.",
      },
      {
        kind: "prose",
        text: "What we do not sell is a fixed feature list. What your agent does is decided by your questionnaire answers and by what you connect it to, which means two customers on the same plan get materially different agents. That is the design, not a gap in it.",
      },
    ],
  },
  {
    heading: "Billing, renewal and cancellation",
    blocks: [
      {
        kind: "bullets",
        items: [
          "Payments are processed by Stripe. We never see or store your full card details.",
          "The licence fee is charged once, at purchase. Hosting is charged monthly in advance and renews automatically until you cancel.",
          "You can cancel hosting at any time. Cancellation stops the next renewal; it does not refund the month you are in.",
          "After cancellation you keep dashboard access for 10 days, so you can export what you need. After that the account is closed to sign-in.",
          "If a payment fails we may suspend the agent until it is settled. We will tell you before we do.",
          "Taxes are yours where they apply, and are added at checkout where we are required to collect them.",
        ],
      },
      {
        kind: "prose",
        text: "Fees are non-refundable except where the law requires otherwise or where we agree otherwise in writing. If something has gone genuinely wrong, write to us before assuming that sentence is the end of the conversation, because it is not how we would rather handle it.",
      },
    ],
  },
  {
    heading: "Usage credit",
    blocks: [
      {
        kind: "prose",
        text: "Your monthly hosting includes an allowance of token usage. If your agent works harder than that, you can buy additional credit in the dashboard rather than being cut off mid-month.",
      },
      {
        kind: "bullets",
        items: [
          "Credit packs are one-time purchases, delivered to your agent's runtime balance.",
          "The amount of usage credit a pack delivers is shown before you buy. It is slightly less than the price, because the price includes a service fee on top of the underlying model cost. We would rather state that plainly here than have you work it out from a balance.",
          "Credit is consumed as your agent works and does not expire while your account is active.",
          "Unused credit is not refundable for cash, and does not survive the closure of your account.",
        ],
      },
      {
        kind: "prose",
        text: "Model prices are set by the AI providers, not by us. If those change materially, the amount of work a given credit buys changes with them.",
      },
    ],
  },
  {
    heading: "Your account and your team",
    blocks: [
      {
        kind: "bullets",
        items: [
          "You are responsible for what happens under your account, including by anyone you invite into your workspace.",
          "Keep your sign-in details to yourself, and tell us promptly if you think someone else has them.",
          "Workspace admins can add and remove members, and can see and change the agent's configuration. Choose admins accordingly.",
          "You must be at least 18 and able to enter a contract.",
        ],
      },
    ],
  },
  {
    heading: "What the agent is, and what it is not",
    blocks: [
      {
        kind: "prose",
        text: "This is the most important section here, and the one we would most like you to actually read.",
      },
      {
        kind: "bullets",
        items: [
          "Your agent is built on large language models. It can be confidently wrong, it can miss things, and it can produce output that reads authoritative and is not. That is a property of the technology, not a defect we have failed to fix.",
          "It is a drafting, research and coordination tool. It is not a lawyer, an accountant, a doctor, a licensed real estate professional, a financial adviser, or a recruiter of record, whatever the agent is named and whatever it is configured to help with.",
          "Nothing it produces is legal, financial, tax, medical, or professional advice, and using it does not create a professional relationship with anyone.",
          "Decisions remain yours. Where a decision is regulated, binding, or high-stakes, a qualified human should make it and should check the work first.",
          "Where you have configured the agent to act on its own - sending, scheduling, posting, filing - those actions are taken on your instruction and are your responsibility. The setup questionnaire asks you to name what it must never do without asking, and we would encourage you to be generous with that answer.",
        ],
      },
      {
        kind: "prose",
        text: "Several agent types carry additional limits in their own configuration, and those limits are part of this agreement too. Compliance with the rules of your own profession, industry, and jurisdiction stays with you.",
      },
    ],
  },
  {
    heading: "Your content, and the accounts you connect",
    blocks: [
      {
        kind: "prose",
        text: "Everything you put in stays yours: your questionnaire answers, the documents you upload, your conversations, and anything your agent works on. We do not claim ownership of any of it.",
      },
      {
        kind: "bullets",
        items: [
          "You grant us the permission we need to host, process and transmit that content for the sole purpose of running the service for you. That permission ends when your content is deleted.",
          "We do not use your business content to train general-purpose AI models, and we do not share it with other customers.",
          "When you connect a third-party account, you are giving your agent access to that account under your own credentials. You are responsible for having the right to do that, and you can revoke it from that provider at any time.",
          "Where you supply your own API keys, they are encrypted at rest and used only to run your agent.",
          "You must have the right to whatever you put in, and it must not break the law or somebody else's rights.",
        ],
      },
      {
        kind: "prose",
        text: "As between you and us, output your agent produces for you is yours to use. AI output is not always eligible for copyright protection, and similar output may be generated for someone else, so we cannot promise it is unique or that you can register it.",
      },
    ],
  },
  {
    heading: "What belongs to us",
    blocks: [
      {
        kind: "prose",
        text: "The platform itself - the software, the dashboard, the agent templates and configuration system, the site, and the Apollo[Claw] name and artwork - belongs to us or our licensors. Buying an agent buys the right to use the service, not a copy of the software.",
      },
      {
        kind: "prose",
        text: "Please do not copy, resell, or white-label the service, attempt to extract its underlying prompts or code, or use it to build a competing product. If you want to resell what we make, that is a conversation we are happy to have, and it needs a different agreement.",
      },
    ],
  },
  {
    heading: "Acceptable use",
    blocks: [
      { kind: "prose", text: "Do not use an Apollo[Claw] agent to:" },
      {
        kind: "bullets",
        items: [
          "Break the law, or help anyone else do so.",
          "Send spam or bulk unsolicited messaging, or anything that breaks anti-spam or telemarketing rules.",
          "Impersonate a real person or organisation, or produce material designed to deceive people about who is speaking.",
          "Harass, threaten, defame, or discriminate against anyone, including through automated screening or outreach.",
          "Handle regulated data the service is not set up for, without agreeing that with us first.",
          "Attack, overload, or reverse-engineer the service, or work around its limits and safeguards.",
        ],
      },
      {
        kind: "prose",
        text: "We may suspend an agent immediately where we believe it is being used this way, or where leaving it running risks harm to somebody. We will tell you why.",
      },
    ],
  },
  {
    heading: "Availability",
    blocks: [
      {
        kind: "prose",
        text: "We work to keep the service up and we will tell you about planned interruptions where we can. We do not offer an uptime guarantee or service credits, and we would rather say so than print a number we have not committed to standing behind.",
      },
      {
        kind: "prose",
        text: "The service depends on providers we do not control - AI model providers, our hosting, the third-party apps you connect. An outage or a change at one of those can interrupt your agent, and we will do what we reasonably can to restore it.",
      },
      {
        kind: "prose",
        text: "The service changes over time. We may add, change or remove features. Where a change materially reduces what you are paying for, we will tell you before it happens.",
      },
    ],
  },
  {
    heading: "Ending the agreement, and what happens to your agent",
    blocks: [
      {
        kind: "prose",
        text: "You can stop at any time by cancelling in the dashboard or writing to us. We may end the agreement if you break these terms, if fees go unpaid, or on reasonable notice.",
      },
      {
        kind: "bullets",
        items: [
          "Deleting an agent stops it immediately and moves it to a recoverable state for 30 days, so a mistake is not final. Ask us within that window and we can bring it back.",
          "After 30 days it is permanently destroyed, along with its configuration and its instance.",
          "Export anything you want to keep before you cancel or delete. Do not rely on the recovery window as a backup.",
          "Sections that are meant to outlast the agreement - what belongs to whom, disclaimers, liability, governing law - survive it.",
        ],
      },
    ],
  },
  {
    heading: "Warranties and liability",
    blocks: [
      {
        kind: "prose",
        text: "The service is provided as it is. To the extent the law allows, we disclaim implied warranties of merchantability, fitness for a particular purpose, and non-infringement, and we do not warrant that the service will be uninterrupted, error-free, or that its output will be accurate or suitable for any particular use.",
      },
      {
        kind: "prose",
        text: "To the extent the law allows, neither party is liable for indirect or consequential loss, including lost profits, lost revenue, lost business, or lost or corrupted data. Our total liability arising out of this agreement is limited to the amount you paid us in the 12 months before the claim arose.",
      },
      {
        kind: "prose",
        text: "Nothing here limits liability that cannot be limited by law, including for fraud, or for death or personal injury caused by negligence. Some jurisdictions do not allow some of these limits, in which case they apply to you only as far as the law permits.",
      },
      {
        kind: "prose",
        text: "You will cover us against claims arising from your use of the service in breach of these terms, from content you put in, or from your use of what the agent produced.",
      },
    ],
  },
  {
    heading: "Changes to these terms",
    blocks: [
      {
        kind: "prose",
        text: "We may update these terms. The effective date above says when they last changed. For a material change we will give notice by email or in the dashboard before it takes effect, and continuing to use the service after that means accepting the new version. If you do not accept it, you can cancel.",
      },
    ],
  },
  {
    heading: "Governing law",
    blocks: [
      {
        kind: "prose",
        text: "This agreement is governed by the laws of the State of New York, without regard to its conflict of laws rules. The state and federal courts sitting in Nassau County, New York have exclusive jurisdiction over any dispute, and both of us consent to that.",
      },
      {
        kind: "prose",
        text: "Before filing anything, please email david@apolloclaw.ai. Almost everything is faster to fix that way.",
      },
    ],
  },
  {
    heading: "The rest",
    blocks: [
      {
        kind: "bullets",
        items: [
          "If any part of these terms is unenforceable, the rest still stands.",
          "Not enforcing something once does not waive it.",
          "You may not transfer this agreement without our consent. We may transfer it as part of a merger, acquisition, or sale of the business.",
          "Nothing here creates a partnership, employment, or agency relationship between us.",
          "These terms, with the Privacy Policy and Cookie Policy, are the whole agreement between us, except where we have signed something separate with you.",
        ],
      },
      {
        kind: "prose",
        text: "Questions about any of this: david@apolloclaw.ai.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      label="Legal"
      title="Terms of"
      titleAccent="Service"
      description="What you are buying, how billing works, what your agent may and may not do, and where our responsibility ends."
      effective={EFFECTIVE}
      sections={SECTIONS}
    />
  );
}
