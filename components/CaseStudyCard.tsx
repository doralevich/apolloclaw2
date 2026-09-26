import type { CaseStudy } from "@/config/caseStudies";

const NAVY = "#0B1729";

export function CaseStudyCard({ study: c }: { study: CaseStudy }) {
  return (
    <div
      className="flex flex-col rounded-xl p-8"
      style={{ background: "#ffffff", border: "1px solid rgba(11,23,41,0.08)", boxShadow: "0 2px 12px rgba(11,23,41,0.04)" }}
    >
      <span className="mb-4 font-mono text-xs uppercase tracking-widest" style={{ color: "rgba(11,23,41,0.4)" }}>
        {c.sector}
      </span>
      <p className="font-display mb-4 text-base font-bold" style={{ color: NAVY }}>
        {c.result}
      </p>
      <p className="font-body mb-6 flex-1 text-sm leading-relaxed" style={{ color: "rgba(11,23,41,0.65)" }}>
        &ldquo;{c.quote}&rdquo;
      </p>
      <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(11,23,41,0.07)" }}>
        <p className="font-mono text-xs font-bold" style={{ color: NAVY }}>
          {c.role}
        </p>
        <p className="mt-0.5 font-mono text-xs" style={{ color: "rgba(11,23,41,0.4)" }}>
          {c.detail}
        </p>
      </div>
    </div>
  );
}
