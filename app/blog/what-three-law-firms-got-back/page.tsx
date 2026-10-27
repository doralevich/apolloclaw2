import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FOUNDER_BYLINE, OG_IMAGES, ORG_REF, PERSON_REF, breadcrumbJsonLd, humanDate } from "@/lib/seo";

// The write-up the Client Results section on /industries/law-firms points at (David, Oct 27
// 2026). Three firms, told by practice type and by what changed in their first month. No firm
// names, no figures in dollars, no detail that would identify a firm: head counts, cities and
// regions are left out on purpose. Hand-built like app/blog/ai-assistant-for-ceo/page.tsx, so it
// lives in the repo beside the page that links to it rather than in Sanity.

const URL = "https://apolloclaw.ai/blog/what-three-law-firms-got-back";
const TITLE = "What Three Law Firms Got Back in Their First 30 Days With a Law Agent";
const DESCRIPTION =
  "A litigation firm, a corporate practice and a family law practice put a private Law Agent on intake, documents and client updates. Here is what each one got back.";
const PUBLISHED = "2026-10-27";
const UPDATED = "2026-10-27";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | Apollo Claw` },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    images: OG_IMAGES,
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: "article",
    publishedTime: `${PUBLISHED}T12:00:00Z`,
    modifiedTime: `${UPDATED}T12:00:00Z`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": `${URL}#article`,
      headline: TITLE,
      description: DESCRIPTION,
      url: URL,
      mainEntityOfPage: URL,
      datePublished: PUBLISHED,
      dateModified: UPDATED,
      author: PERSON_REF,
      publisher: ORG_REF,
      isPartOf: { "@id": "https://apolloclaw.ai/#website" },
      inLanguage: "en-US",
      about: { "@id": "https://apolloclaw.ai/industries/law-firms#service" },
    },
    breadcrumbJsonLd([
      { name: "Home", url: "https://apolloclaw.ai/" },
      { name: "Blog", url: "https://apolloclaw.ai/blog" },
      { name: TITLE, url: URL },
    ]),
  ],
};

const NAVY = "#0B1729";
const CREAM = "#F2F1ED";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";

const firms = [
  {
    kicker: "Firm One · Litigation",
    title: "The Managing Partner Who Was Running the Inbox",
    paragraphs: [
      "The managing partner of a litigation firm was the firm's best biller and its busiest administrator at once. Mornings went to inbox triage, afternoons to meeting prep, evenings to the follow-ups that fell out of the day. The hours were real and the firm was paying for them twice: once in the partner's time and once in the work that went unbilled because it was done in fragments.",
      "The Law Agent took the inbox first. It reads every message as it arrives, sorts what needs the partner from what needs a paralegal or a reply in the partner's voice, and drafts the reply for approval. Before each meeting it assembles the matter summary, the open items and the last three exchanges with the client. At the end of the day it lists every matter the partner touched so the time gets captured while it is still fresh.",
      "What came back: about ten hours a week, by the partner's own count, and those hours went to billable work that had been sitting in the queue. The partner described it as billable time the firm had been leaving on the table.",
    ],
  },
  {
    kicker: "Firm Two · Corporate",
    title: "The Deal Team That Started From a Blank Page",
    paragraphs: [
      "A corporate practice handling mergers and acquisitions spends its weeks in due diligence, and due diligence means hundreds of documents per deal. Associates opened each one cold, categorized it by hand, and built the issues list from scratch. The work was careful and slow, and every deal timeline carried that slowness.",
      "The agent now pre-processes the data room as documents land. It categorizes each file, flags the clauses and dates that match the firm's own diligence checklist, and hands the associate a starting point: a sorted set, a first issues list and the open questions. Every flag is a draft for an attorney to confirm, and the agent runs on a private server reserved for the firm, so the data room stays where the firm keeps it.",
      "What came back: shorter deal timelines, because associates began each review with the sorting already done. The partner's phrase was that his associates now start from a starting point instead of a blank page.",
    ],
  },
  {
    kicker: "Firm Three · Family Law",
    title: "The Paralegal Who Spent Three Hours a Day on the Phone",
    paragraphs: [
      "Family law clients are anxious, and anxious clients call. At this practice the status calls landed on one paralegal, who spent about three hours of every day explaining where a matter stood and what came next. The explanations were the same ones, to different people, and each call interrupted the substantive work the paralegal was there to do.",
      "The agent took on proactive updates. At every milestone in a matter it drafts a plain-language status note from what changed in the file, in the firm's voice, and queues it for the paralegal to approve and send. Clients hear from the firm before they feel the need to ask. When a client does call, the paralegal already has the current summary on screen.",
      "What came back: the three hours a day became under thirty minutes, by the partner's count, and the paralegal's day went back to the casework.",
    ],
  },
];

const useCaseLinks = [
  { label: "AI for Law Firms", href: "/industries/law-firms" },
  { label: "The Law Agent", href: "/ai-agents/legal" },
  { label: "Personal Injury Intake", href: "/industries/personal-injury-law" },
  { label: "Family Law", href: "/industries/law-firms/family-law" },
  { label: "Commercial Litigation", href: "/industries/law-firms/commercial-litigation" },
];

export default function WhatThreeLawFirmsGotBackPost() {
  return (
    <div style={{ background: CREAM2, minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />
        <div className="container mx-auto px-5 md:px-8 py-14 md:py-20 max-w-4xl relative z-10">
          <Link
            href="/blog"
            className="inline-flex items-center font-mono text-xs uppercase tracking-widest mb-8 hover:opacity-80 transition-opacity"
            style={{ color: RED }}
          >
            ← Back to Blog
          </Link>
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: RED }}>
            Law Firms · Client Results
          </p>
          <h1
            className="font-display leading-tight tracking-tight mb-6"
            style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#ffffff", textWrap: "balance" }}
          >
            {TITLE}
          </h1>
          <p
            className="font-body leading-relaxed"
            style={{ fontSize: "clamp(15px, 1.1vw, 18px)", color: "rgba(255,255,255,0.65)", maxWidth: 700 }}
          >
            Three practices, three jobs handed to a private agent, and what each firm measured a
            month later. Told by practice type, with names and identifying details withheld at the
            firms&apos; request.
          </p>
          <div className="font-mono text-xs uppercase tracking-widest mt-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            <p style={{ margin: 0 }}>{FOUNDER_BYLINE}</p>
            <p style={{ margin: "6px 0 0" }}>
              <time dateTime={UPDATED}>Last updated: {humanDate(UPDATED)}</time>
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="container mx-auto max-w-5xl px-5 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          <article className="max-w-none">
            <p className="font-body text-base leading-relaxed mb-6" style={{ color: "rgba(11,23,41,0.75)" }}>
              Every law firm that calls us describes the same shape of problem. The people who bill
              the hours are carrying the administrative work around those hours, and the firm pays
              for it in unbilled time, slow follow-up and tired paralegals. The Law Agent is built for
              that layer: intake, documents, deadlines and client communication, with an attorney
              approving everything that leaves the firm.
            </p>
            <p className="font-body text-base leading-relaxed mb-8" style={{ color: "rgba(11,23,41,0.75)" }}>
              These are three firms in their first month. Each one started with a single job, the one
              costing the most hours, and measured what changed. The quotes on the{" "}
              <Link href="/industries/law-firms" style={{ color: RED, fontWeight: 700 }}>
                law firms page
              </Link>{" "}
              are theirs; this is the longer version.
            </p>

            {firms.map((firm) => (
              <section key={firm.title} className="mb-10">
                <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: RED }}>
                  {firm.kicker}
                </p>
                <h2
                  className="font-display font-bold mb-4"
                  style={{ fontSize: "clamp(20px, 2.2vw, 28px)", color: NAVY }}
                >
                  {firm.title}
                </h2>
                {firm.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="font-body text-base leading-relaxed mb-4" style={{ color: "rgba(11,23,41,0.75)" }}>
                    {p}
                  </p>
                ))}
              </section>
            ))}

            <h2 className="font-display font-bold mt-10 mb-4" style={{ fontSize: "clamp(20px, 2.2vw, 28px)", color: NAVY }}>
              What the Three Have in Common
            </h2>
            <p className="font-body text-base leading-relaxed mb-4" style={{ color: "rgba(11,23,41,0.75)" }}>
              Each firm gave the agent one job, the one that was eating the most hours, and let it
              earn the second. Each agent runs on a Mac Mini on the firm&apos;s network or on a private
              virtual server reserved for the firm, connected to the practice system the firm already
              uses, so client files stay where the firm keeps them. And in each case an attorney or
              paralegal approves what goes out. The agent drafts, sorts, flags and reminds; the firm
              decides.
            </p>
            <p className="font-body text-base leading-relaxed mb-4" style={{ color: "rgba(11,23,41,0.75)" }}>
              The results are the firms&apos; own counts, taken about thirty days in: hours a week
              returned to billable work, deal timelines that shortened, a paralegal&apos;s phone hours
              that fell to a fraction. Your firm&apos;s first job will be different, and the discovery
              call is where we find it.
            </p>

            <div className="mt-16 p-8 text-center rounded-2xl" style={{ background: CREAM, border: "1px solid rgba(11,23,41,0.08)" }}>
              <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: RED }}>
                The Law Agent
              </p>
              <h3 className="font-display text-2xl font-bold mb-3" style={{ color: NAVY }}>
                Which Job Would Your Firm Hand Over First?
              </h3>
              <p className="font-body mb-6" style={{ color: "rgba(11,23,41,0.6)" }}>
                Bring your intake numbers, your deadline calendar or your paralegal&apos;s call log to a
                discovery call. We will show you where the agent takes the first job.
              </p>
              <a href="https://cal.com/therealdaveo/dbdo-consultation" target="_blank" rel="noopener noreferrer">
                <Button variant="cta" size="lg">Book a Discovery Call</Button>
              </a>
            </div>
          </article>

          <aside className="lg:sticky lg:top-28 self-start space-y-6">
            <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid rgba(11,23,41,0.07)" }}>
              <h3 className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(11,23,41,0.4)" }}>
                For Law Firms
              </h3>
              <div className="space-y-2">
                {useCaseLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block font-body text-sm py-0.5 hover:opacity-80 transition-opacity"
                    style={{ color: NAVY }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(215,43,43,0.05)", border: "1px solid rgba(215,43,43,0.15)" }}>
              <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: RED }}>
                Discovery Call
              </div>
              <h3 className="font-display text-base font-bold mb-2" style={{ color: NAVY }}>
                See the Law Agent on your matters
              </h3>
              <p className="font-body text-xs mb-4" style={{ color: "rgba(11,23,41,0.5)" }}>
                30 minutes. Your firm, your systems.
              </p>
              <a href="https://cal.com/therealdaveo/dbdo-consultation" target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="cta" size="sm" className="w-full">
                  Book a Discovery Call
                </Button>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
