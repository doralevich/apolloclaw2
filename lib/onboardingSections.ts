import type { PdfSectionInput } from "@/lib/pdf";

// Shared section/label builder for the Apollo[Claw] business onboarding form
// (components/onboard/OnboardingForm.tsx). One source of truth for how the raw
// buildData() payload turns into human-readable labeled sections, reused by:
//   - /api/intake (free lead-capture submissions -> CRM email + PDF)
//   - /api/agent-setup (paid, post-checkout submissions -> USER.md + notification email)
// Empty rows/sections are dropped by every renderer below, so listing every
// possible field here is safe even when a track only fills in a subset.

const trackLabel: Record<string, string> = {
  business: "Business Owner / Executive",
  personal: "Personal CEO",
  student: "Collegiate — Student",
  admin: "Collegiate — Administrator",
  agency: "Agency / Reseller",
};

export function buildIntakeSections(d: Record<string, unknown>): PdfSectionInput[] {
  const track = String(d.trackType || "");
  const sections: PdfSectionInput[] = [];

  sections.push({
    title: "Contact Information",
    rows: [
      { label: "First Name", value: d.firstName },
      { label: "Last Name", value: d.lastName },
      { label: "Email", value: d.email },
      { label: "Phone", value: d.phone },
      { label: "Track", value: trackLabel[track] || track },
      { label: "Contact Preference", value: d.contactMethod },
      { label: "Best Time to Reach", value: d.bestTime },
      { label: "Timezone", value: d.timezone },
      { label: "Job Title", value: d.jobTitle },
      { label: "LinkedIn", value: d.linkedin },
    ],
  });

  if (track === "business" || track === "personal") {
    const companiesArr = Array.isArray(d.companies) ? (d.companies as Array<Record<string, unknown>>) : [];
    if (companiesArr.length) {
      const pi = Number(d.primaryCompanyIndex) || 0;
      const pf = d.portfolio && typeof d.portfolio === "object" ? (d.portfolio as Record<string, unknown>) : {};
      sections.push({
        title: "Companies & Portfolio",
        rows: [
          ...companiesArr.map((c, i) => ({
            label: i === pi ? `Business ${i + 1} (Primary)` : `Business ${i + 1}`,
            // Role falls back to the write-in when they picked "Other", and the ownership
            // stake rides along: "who they are here" is two facts, not one.
            value: [
              c.name,
              c.industry === "Other" ? c.industryOther : c.industry,
              c.role === "Other" ? c.roleOther : c.role,
              c.ownership,
            ]
              .filter(Boolean)
              .join(" | "),
          })),
          { label: "Portfolio Structure", value: pf.structure },
          { label: "Shared Operations", value: pf.sharedOps },
          { label: "Expansion Ambition", value: pf.ambition },
        ],
      });
    }
    const idet = d.industryDetails && typeof d.industryDetails === "object" ? (d.industryDetails as Record<string, unknown>) : {};
    if (Object.keys(idet).length) {
      sections.push({
        title: "Industry Deep-Dive",
        rows: Object.entries(idet).map(([k, v]) => ({
          label: k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
          value: v as unknown,
        })),
      });
    }
    sections.push({
      title: "Business Profile",
      rows: [
        { label: "Company", value: d.companyName },
        { label: "Website", value: d.website },
        { label: "Industry", value: d.industry },
        { label: "Team Size", value: d.companySize },
        { label: "Monthly Revenue", value: d.revenue },
        { label: "Years in Business", value: d.businessAge },
        { label: "Business Model", value: d.businessModel },
        { label: "Description", value: d.businessDescription },
        { label: "Differentiation", value: d.differentiator },
        { label: "Web Platform", value: d.webPlatform },
        { label: "CRM Tools", value: d.crmTools },
        { label: "CRM (Other)", value: d.crmToolsOther },
        { label: "E-commerce", value: d.ecomTools },
        { label: "Communications", value: d.commsTools },
        { label: "Project Mgmt", value: d.pmTools },
        { label: "Billing Tools", value: d.billingTools },
        { label: "Marketing Tools", value: d.mktgTools },
        { label: "Automation Tools", value: d.autoTools },
        { label: "Support Tools", value: d.supportTools },
      ],
    });
    sections.push({
      title: "Pain Points & Operations",
      rows: [
        { label: "Main Pain Point", value: d.mainPain },
        { label: "Broken Areas", value: d.brokenAreas },
        { label: "Hours/Wk on Manual Tasks", value: d.manualHours },
        { label: "Busiest Workflow Volume", value: d.opsVolume },
        { label: "Pain Duration", value: d.painDuration },
        { label: "Task They Hate Most", value: d.hatedTasks },
        { label: "Already Tried", value: d.triedBefore },
        { label: "Business Impact", value: d.costImpact },
      ],
    });
    sections.push({
      title: "Family & Life Context",
      rows: [
        { label: "Relationship Status", value: d.maritalStatus },
        { label: "Children", value: d.children },
        { label: "Children Ages", value: d.childrenAges },
        { label: "Caregiving", value: d.caretaking },
        { label: "Home / Work Situation", value: d.homeLife },
        { label: "Protecting", value: d.protecting },
        { label: "Life Stage", value: d.lifeStage },
        { label: "3-Year Goals", value: d.threeYearGoals },
        { label: "Personal Vision", value: d.personalGoal },
      ],
    });
    sections.push({
      title: "Psychology & Mindset",
      rows: [
        { label: "Biggest Goal / Priority (12mo)", value: d.strategicBet },
        { label: "Growth Bottleneck", value: d.growthBottleneck },
        { label: "Decision Style", value: d.decisionStyle },
        { label: "Stress Response", value: d.stressResponse },
        { label: "Motivators", value: d.motivators },
        { label: "Internal Blockers", value: d.blockers },
        { label: "Money Mindset", value: d.moneyMindset },
        { label: "Agency History", value: d.agencyHistory },
        { label: "Tech Trust (1–10)", value: d.techTrust },
        { label: "Control Comfort (1–10)", value: d.controlComfort },
        { label: "What Makes It Worth It", value: d.worthIt },
      ],
    });
    sections.push({
      title: "Voice & Communication Style",
      rows: [
        { label: "Writing Tone", value: d.writingTone },
        { label: "Comfort With Writing", value: d.writingComfort },
        { label: "Brand Voice Like", value: d.brandVoiceLike },
        { label: "Voice Description", value: d.voiceDescription },
        { label: "Loves These Words/Phrases", value: d.loveWords },
        { label: "Hates These Words/Styles", value: d.hateWords },
        { label: "Social Presence", value: d.socialPresence },
        { label: "Platforms", value: d.platforms },
        { label: "Writing Sample", value: d.writingSample },
      ],
    });
    sections.push({
      title: "AI Goals & Vision",
      rows: [
        { label: "AI Goals", value: d.aiGoals },
        { label: "Primary Success Metric", value: d.successMetric },
        { label: "Prior AI Experience", value: d.priorAI },
        { label: "Past AI Attempts", value: d.pastExperience },
        { label: "Team's View of Prior AI", value: d.aiThoughts },
        { label: "Prior AI Implementation", value: d.aiStartup },
        { label: "Team Sentiment", value: d.teamSentiment },
      ],
    });
    sections.push({
      title: "IT Infrastructure & Scope",
      rows: [
        { label: "Hosting / Cloud", value: d.hosting },
        { label: "Operating System", value: d.os },
        { label: "Security Measures", value: d.securityMeasures },
        { label: "Data Types Stored", value: d.dataTypes },
        { label: "Compliance", value: d.compliance },
        { label: "Budget Range", value: d.budget },
        { label: "Timeline", value: d.timeline },
        { label: "Decision Authority", value: d.decisionAuthority },
        { label: "Engagement Type", value: d.engagement },
        { label: "Internal Tech Resources", value: d.internalTech },
        { label: "Constraints", value: d.constraints },
      ],
    });
    const ups = Array.isArray(d.uploadedFiles) ? (d.uploadedFiles as Array<Record<string, unknown>>) : [];
    if (ups.length) {
      sections.push({
        title: "Uploaded Materials",
        rows: [{ label: "Files", value: ups.map((u) => String(u.name || "file")).join(", ") }],
      });
    }
  }

  return sections;
}

// ─── Render sections as inline email HTML ─────────────────────────────────────
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function normalizeForHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.filter((v) => v != null && String(v).trim()).map((v) => String(v)).join(", ");
  return String(value).trim();
}

export function sectionsToHtml(sections: PdfSectionInput[]): string {
  return sections
    .map((s) => {
      const rows = s.rows
        .map((r) => ({ label: r.label, value: normalizeForHtml(r.value) }))
        .filter((r) => r.value);
      if (!rows.length) return "";
      const rowsHtml = rows
        .map(
          (r) =>
            `<tr><td style="padding:5px 10px 5px 0;color:#6b7280;width:38%;vertical-align:top;font-size:13px;">${escapeHtml(r.label)}</td><td style="padding:5px 0;font-size:13px;color:#1a1a1a;white-space:pre-wrap;">${escapeHtml(r.value)}</td></tr>`
        )
        .join("");
      return `<div style="margin:18px 0 4px;"><p style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#E8342A;margin:0 0 4px;border-bottom:1px solid #f0f0f0;padding-bottom:4px;">${escapeHtml(
        s.title
      )}</p><table style="width:100%;border-collapse:collapse;">${rowsHtml}</table></div>`;
    })
    .join("");
}

// ─── Render sections as USER.md-ready markdown ────────────────────────────────
export function sectionsToMarkdown(sections: PdfSectionInput[]): string {
  return sections
    .map((s) => {
      const rows = s.rows
        .map((r) => ({ label: r.label, value: normalizeForHtml(r.value) }))
        .filter((r) => r.value);
      if (!rows.length) return "";
      return [`## ${s.title}`, "", ...rows.map((r) => `**${r.label}:** ${r.value}`), ""].join("\n");
    })
    .filter(Boolean)
    .join("\n");
}
