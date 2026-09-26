import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { CASE_STUDIES, CASE_STUDY_DISCLAIMER, CASE_STUDY_INDUSTRY_LABELS } from "@/config/caseStudies";

export const metadata: Metadata = {
  alternates: { canonical: "https://apolloclaw.ai/case-studies" },
  title: { absolute: "Case Studies | Apollo[Claw]" },
  description: "Real businesses. Real results. See how Apollo[Claw] AI agents are transforming operations across industries.",
};


const NAVY = "#0B1729";
const CREAM2 = "#FAFAF7";
const RED = "#D72B2B";

export default function CaseStudiesPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: NAVY, color: "#ffffff" }} className="relative overflow-hidden">
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "120%", background: "radial-gradient(ellipse at center, rgba(215,43,43,0.09) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="container mx-auto px-5 md:px-8 py-10 md:py-14 text-center max-w-6xl relative z-10">
          <p className="font-mono text-xs uppercase tracking-widest mb-6" style={{ color: RED }}>Client Results</p>
          <h1 className="font-display leading-[1.05] tracking-tight text-white mb-6" style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800 }}>
            Real Businesses.<br />Real Results.
          </h1>
          <p className="font-body" style={{ fontSize: "clamp(15px, 1.15vw, 18px)", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 640, margin: "0 auto" }}>
            These are outcomes from actual Apollo[Claw] deployments across industries. Names and identifying details have been changed or withheld at client request.
          </p>
        </div>
      </section>

      {/* Grouped by industry: the same studies each industry page shows at its foot
          (config/caseStudies.ts), collected here with a link through to each industry. */}
      <section style={{ background: CREAM2 }} className="py-16 md:py-20">
        <div className="container mx-auto max-w-6xl space-y-14 px-5 md:px-8">
          {Object.entries(CASE_STUDY_INDUSTRY_LABELS).map(([path, label]) => {
            const studies = CASE_STUDIES.filter((c) => c.industry === path);
            if (!studies.length) return null;
            return (
              <div key={path} id={path.split("/").pop()} className="scroll-mt-28">
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="font-display text-2xl font-extrabold tracking-tight" style={{ color: NAVY }}>
                    {label}
                  </h2>
                  <Link href={path} className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>
                    {label} solutions &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {studies.map((c) => (
                    <CaseStudyCard key={c.role + c.detail} study={c} />
                  ))}
                </div>
              </div>
            );
          })}
          <p className="text-center font-mono text-xs" style={{ color: "rgba(11,23,41,0.3)" }}>
            {CASE_STUDY_DISCLAIMER}
          </p>
        </div>
      </section>
    </>
  );
}
