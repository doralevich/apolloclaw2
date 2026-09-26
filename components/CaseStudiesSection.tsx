import Link from "next/link";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { CASE_STUDY_DISCLAIMER, caseStudiesFor } from "@/config/caseStudies";

// The case studies filed under one industry, placed at the bottom of that industry's page.
// Renders nothing for an industry with no studies yet.
export function CaseStudiesSection({ industryPath }: { industryPath: string }) {
  const studies = caseStudiesFor(industryPath);
  if (!studies.length) return null;
  return (
    <section style={{ background: "#FAFAF7" }} className="py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-5 md:px-8">
        <p className="font-mono mb-3 text-xs uppercase tracking-widest" style={{ color: "#D72B2B" }}>
          Case Studies
        </p>
        <h2
          className="font-display mb-10 leading-[1.1] tracking-tight"
          style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#0B1729" }}
        >
          Real results in this industry
        </h2>
        <div className={`grid gap-6 ${studies.length === 1 ? "max-w-2xl" : "md:grid-cols-2"} ${studies.length >= 3 ? "lg:grid-cols-3" : ""}`}>
          {studies.map((c) => (
            <CaseStudyCard key={c.role + c.detail} study={c} />
          ))}
        </div>
        <p className="mt-8 font-mono text-xs" style={{ color: "rgba(11,23,41,0.35)" }}>
          {CASE_STUDY_DISCLAIMER}{" "}
          <Link href="/case-studies" className="underline underline-offset-2" style={{ color: "rgba(11,23,41,0.55)" }}>
            All case studies
          </Link>
        </p>
      </div>
    </section>
  );
}
