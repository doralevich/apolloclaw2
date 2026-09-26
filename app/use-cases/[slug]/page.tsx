import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import UseCaseTemplate from "@/components/UseCaseTemplate";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { CASE_STUDIES, CASE_STUDY_DISCLAIMER } from "@/config/caseStudies";
import { USE_CASES, findUseCase } from "@/config/useCases";
import { OG_IMAGES } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const uc = findUseCase((await params).slug);
  if (!uc) return {};
  const title = `${uc.label} | AI Use Cases | Apollo[Claw]`;
  const url = `https://apolloclaw.ai/use-cases/${uc.slug}`;
  return {
    title: { absolute: title },
    description: uc.description,
    alternates: { canonical: url },
    openGraph: { images: OG_IMAGES, title, description: uc.summary, url, type: "website" },
  };
}

export default async function UseCasePage({ params }: Props) {
  const uc = findUseCase((await params).slug);
  if (!uc) notFound();

  const study = uc.caseStudy
    ? CASE_STUDIES.find((c) => c.industry === uc.caseStudy!.industry && c.sector === uc.caseStudy!.sector)
    : undefined;
  const others = USE_CASES.filter((u) => u.group === uc.group && u.slug !== uc.slug);

  return (
    <>
      <UseCaseTemplate uc={uc} />

      <section style={{ background: "#F2F1ED" }} className="py-16 md:py-20">
        <div className="container mx-auto grid max-w-6xl gap-10 px-5 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            {study ? (
              <>
                <p className="font-mono mb-3 text-xs uppercase tracking-widest" style={{ color: "#D72B2B" }}>
                  Case Study
                </p>
                <CaseStudyCard study={study} />
                <p className="mt-4 font-mono text-xs" style={{ color: "rgba(11,23,41,0.35)" }}>
                  {CASE_STUDY_DISCLAIMER}
                </p>
              </>
            ) : (
              <>
                <p className="font-mono mb-3 text-xs uppercase tracking-widest" style={{ color: "#D72B2B" }}>
                  Where It Fits
                </p>
                <p className="font-body text-[15px] leading-relaxed" style={{ color: "rgba(11,23,41,0.7)" }}>
                  Every agent is set up around how your business already works. Book a short call and we&apos;ll
                  show you what {uc.label.toLowerCase()} would look like with your tools and your team.
                </p>
              </>
            )}
          </div>
          <div className="space-y-8">
            <div>
              <p className="font-mono mb-3 text-xs uppercase tracking-widest" style={{ color: "rgba(11,23,41,0.5)" }}>
                Used By
              </p>
              <ul className="flex flex-wrap gap-2">
                {uc.related.map((r) => (
                  <li key={r.to}>
                    <Link
                      href={r.to}
                      className="font-body inline-block rounded-full px-4 py-2 text-[13px] font-semibold transition-colors hover:border-black/30"
                      style={{ border: "1px solid rgba(11,23,41,0.15)", background: "#fff", color: "#0B1729" }}
                    >
                      {r.label} &rarr;
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {others.length > 0 && (
              <div>
                <p className="font-mono mb-3 text-xs uppercase tracking-widest" style={{ color: "rgba(11,23,41,0.5)" }}>
                  More in {uc.group}
                </p>
                <ul className="space-y-2">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <Link href={`/use-cases/${o.slug}`} className="font-body text-[14px] font-semibold underline-offset-2 hover:underline" style={{ color: "#0B1729" }}>
                        {o.label}
                      </Link>
                      <span className="font-body text-[13px]" style={{ color: "rgba(11,23,41,0.55)" }}>
                        {" "}
                        &mdash; {o.summary}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link href="/use-cases" className="font-mono inline-block text-xs font-bold uppercase tracking-widest" style={{ color: "#D72B2B" }}>
              All use cases &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
