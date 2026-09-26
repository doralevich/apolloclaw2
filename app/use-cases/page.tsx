import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { USE_CASES, USE_CASE_GROUPS } from "@/config/useCases";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { CASE_STUDIES, CASE_STUDY_DISCLAIMER, CASE_STUDY_INDUSTRY_LABELS } from "@/config/caseStudies";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "AI Agent Use Cases | Apollo[Claw]" },
  description:
    "What an Apollo[Claw] agent actually does: inbox triage, follow-up, meeting prep, lead follow-up, client intake, renewals, month-end close, invoicing, recruiting, and more.",
  alternates: { canonical: "https://apolloclaw.ai/use-cases" },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Agent Use Cases | Apollo[Claw]",
    description: "The jobs an Apollo[Claw] agent takes off your plate, one page per task.",
    url: "https://apolloclaw.ai/use-cases",
    type: "website",
  },
};

const NAVY = "#0B1729";
const RED = "#D72B2B";

export default function UseCasesHub() {
  return (
    <>
      <PageHero
        title="What Your Agent"
        titleAccent="Actually Does"
        description="One page per job. Pick the work that keeps landing on you and see how an agent takes it over."
      />

      <section style={{ background: "#FAFAF7" }} className="py-16 md:py-20">
        <div className="container mx-auto max-w-6xl space-y-14 px-5 md:px-8">
          {USE_CASE_GROUPS.map((group) => (
            <div key={group}>
              <h2 className="font-display mb-6 text-2xl font-extrabold tracking-tight" style={{ color: NAVY }}>
                {group}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {USE_CASES.filter((u) => u.group === group).map((u) => (
                  <Link
                    key={u.slug}
                    href={`/use-cases/${u.slug}`}
                    className="group flex items-start gap-4 rounded-xl p-5 transition-shadow hover:shadow-[0_6px_20px_rgba(11,23,41,0.08)]"
                    style={{ background: "#fff", border: "1px solid rgba(11,23,41,0.1)", textDecoration: "none" }}
                  >
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "rgba(215,43,43,0.08)" }}
                    >
                      <u.Icon size={20} style={{ color: RED }} />
                    </span>
                    <span className="min-w-0">
                      <span className="font-heading block text-[15px] font-bold" style={{ color: NAVY }}>
                        {u.label}
                      </span>
                      <span className="font-body mt-1 block text-[13px] leading-snug" style={{ color: "rgba(11,23,41,0.6)" }}>
                        {u.summary}
                      </span>
                      <span className="font-mono mt-3 block text-[11px] font-bold uppercase tracking-widest" style={{ color: RED }}>
                        See how &rarr;
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RESULTS - every case study, grouped by industry. This was /case-studies, which now
          redirects here (#results) since Case Studies folded into Use Cases. */}
      <section id="results" style={{ background: "#F2F1ED" }} className="scroll-mt-28 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl space-y-12 px-5 md:px-8">
          <div>
            <p className="font-mono mb-3 text-xs uppercase tracking-widest" style={{ color: RED }}>
              Client Results
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>
              Real businesses. Real results.
            </h2>
          </div>
          {Object.entries(CASE_STUDY_INDUSTRY_LABELS).map(([path, label]) => {
            const studies = CASE_STUDIES.filter((c) => c.industry === path);
            if (!studies.length) return null;
            return (
              <div key={path}>
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-extrabold tracking-tight" style={{ color: NAVY }}>
                    {label}
                  </h3>
                  <Link href={path} className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
                    {label} &rarr;
                  </Link>
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {studies.map((c) => (
                    <CaseStudyCard key={c.role + c.detail} study={c} />
                  ))}
                </div>
              </div>
            );
          })}
          <p className="text-center font-mono text-xs" style={{ color: "rgba(11,23,41,0.35)" }}>
            {CASE_STUDY_DISCLAIMER}
          </p>
        </div>
      </section>
    </>
  );
}
