import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { CASE_STUDIES, CASE_STUDY_DISCLAIMER, CASE_STUDY_INDUSTRY_LABELS } from "@/config/caseStudies";
import { OG_IMAGES } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "AI Agent Use Cases | Apollo[Claw]" },
  description:
    "Apollo[Claw] agents at work: client results from insurance, medical practices, real estate, law firms, personal injury, and professional services.",
  alternates: { canonical: "https://apolloclaw.ai/use-cases" },
  openGraph: {
    images: OG_IMAGES,
    title: "AI Agent Use Cases | Apollo[Claw]",
    description: "Apollo[Claw] agents at work, with client results grouped by industry.",
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
        title="Real Businesses."
        titleAccent="Real Results."
        description="How Apollo[Claw] agents are running inside firms, practices, and companies today, grouped by industry."
      />

      {/* RESULTS - every case study, grouped by industry. This was /case-studies, which now
          redirects here (#results) since Case Studies folded into Use Cases. The grid of task
          cards that used to sit above it came out at David's call: the Use Cases menu already
          links each task page, so the hub is just the results. */}
      <section id="results" style={{ background: "#F2F1ED" }} className="scroll-mt-28 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl space-y-12 px-5 md:px-8">
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
