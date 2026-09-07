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
  student: "Collegiate - Student",
  admin: "Collegiate - Administrator",
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
    // The role agents' deep-dives (lib/cfoIntake.ts, lib/legalIntake.ts), same generic key/value
    // rendering as the industry block. Each is present only when that role's intake was filled, so
    // it is safe to always list; a given form fills at most one.
    const cdet = d.cfoDetails && typeof d.cfoDetails === "object" ? (d.cfoDetails as Record<string, unknown>) : {};
    if (Object.keys(cdet).length) {
      sections.push({
        title: "CFO Deep-Dive",
        rows: Object.entries(cdet).map(([k, v]) => ({
          label: k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
          value: v as unknown,
        })),
      });
    }
    const ldet = d.legalDetails && typeof d.legalDetails === "object" ? (d.legalDetails as Record<string, unknown>) : {};
    if (Object.keys(ldet).length) {
      sections.push({
        title: "Legal Deep-Dive",
        rows: Object.entries(ldet).map(([k, v]) => ({
          label: k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
          value: v as unknown,
        })),
      });
    }
    const redet = d.realEstateDetails && typeof d.realEstateDetails === "object" ? (d.realEstateDetails as Record<string, unknown>) : {};
    if (Object.keys(redet).length) {
      sections.push({
        title: "Real Estate Deep-Dive",
        rows: Object.entries(redet).map(([k, v]) => ({
          label: k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
          value: v as unknown,
        })),
      });
    }
    const ceodet = d.ceoDetails && typeof d.ceoDetails === "object" ? (d.ceoDetails as Record<string, unknown>) : {};
    if (Object.keys(ceodet).length) {
      sections.push({
        title: "CEO Deep-Dive",
        rows: Object.entries(ceodet).map(([k, v]) => ({
          label: k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
          value: v as unknown,
        })),
      });
    }
    const mktdet = d.marketingDetails && typeof d.marketingDetails === "object" ? (d.marketingDetails as Record<string, unknown>) : {};
    if (Object.keys(mktdet).length) {
      sections.push({
        title: "Marketing Deep-Dive",
        rows: Object.entries(mktdet).map(([k, v]) => ({
          label: k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
          value: v as unknown,
        })),
      });
    }
    const saldet = d.salesDetails && typeof d.salesDetails === "object" ? (d.salesDetails as Record<string, unknown>) : {};
    if (Object.keys(saldet).length) {
      sections.push({
        title: "Sales Deep-Dive",
        rows: Object.entries(saldet).map(([k, v]) => ({
          label: k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
          value: v as unknown,
        })),
      });
    }
    const recdet = d.recruitingDetails && typeof d.recruitingDetails === "object" ? (d.recruitingDetails as Record<string, unknown>) : {};
    if (Object.keys(recdet).length) {
      sections.push({
        title: "Recruiting Deep-Dive",
        rows: Object.entries(recdet).map(([k, v]) => ({
          label: k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
          value: v as unknown,
        })),
      });
    }
    const meddet = d.medicalDetails && typeof d.medicalDetails === "object" ? (d.medicalDetails as Record<string, unknown>) : {};
    if (Object.keys(meddet).length) {
      sections.push({
        title: "Medical Deep-Dive",
        rows: Object.entries(meddet).map(([k, v]) => ({
          label: k.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
          value: v as unknown,
        })),
      });
    }
    const insdet = d.insuranceDetails && typeof d.insuranceDetails === "object" ? (d.insuranceDetails as Record<string, unknown>) : {};
    if (Object.keys(insdet).length) {
      sections.push({
        title: "Insurance Deep-Dive",
        rows: Object.entries(insdet).map(([k, v]) => ({
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
        { label: "Description", value: d.businessDescription },
        { label: "Differentiation", value: d.differentiator },
        { label: "CRM Tools", value: d.crmTools },
        { label: "CRM (Other)", value: d.crmToolsOther },
        { label: "Communications", value: d.commsTools },
        { label: "Project Mgmt", value: d.pmTools },
        { label: "Billing Tools", value: d.billingTools },
      ],
    });
    sections.push({
      title: "Pain Points & Operations",
      rows: [
        { label: "Task They Hate Most", value: d.hatedTasks },
      ],
    });
    sections.push({
      title: "Family & Life Context",
      rows: [
        { label: "Children", value: d.children },
      ],
    });
    sections.push({
      title: "Psychology & Mindset",
      rows: [
        { label: "Biggest Goal / Priority (12mo)", value: d.strategicBet },
        { label: "Growth Bottleneck", value: d.growthBottleneck },
        { label: "Tech Trust (1–10)", value: d.techTrust },
      ],
    });
    sections.push({
      title: "Voice & Communication Style",
      rows: [
        { label: "Writing Tone", value: d.writingTone },
        { label: "Voice Description", value: d.voiceDescription },
        { label: "Loves These Words/Phrases", value: d.loveWords },
        { label: "Hates These Words/Styles", value: d.hateWords },
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
