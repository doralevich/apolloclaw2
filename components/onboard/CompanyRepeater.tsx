// components/onboard/CompanyRepeater.tsx
// Apollo[Claw] onboarding - Step 2 multi-company capture.
//
// Design: light per-company rows (name, industry, role) plus ONE
// portfolio block that only appears when there is more than one company.
// The PRIMARY company drives the Industry Deep-Dive step and all downstream
// framing. Fully controlled by the parent wizard so the parent can read
// companies[primaryIndex].industry to select the branch.
//
// Styling matches the /onboard form (Inter, #000000 ink, cream surfaces) rather
// than the standalone tokens from the spec, so the step reads as part of the
// existing questionnaire.
//
// Brand rule: no em dashes in any user-facing string.

"use client";

import { useCallback } from "react";
import { INDUSTRY_OPTIONS } from "@/lib/industryConfig";

// ---- Types ----------------------------------------------------------------

export interface Company {
  name: string;
  industry: string;
  industryOther: string; // written-in industry when `industry` === "Other"
  role: string;
  roleOther: string; // written-in role when `role` === "Other"
  ownership: string; // how much of the business is theirs, asked separately from the job
}

export interface PortfolioMeta {
  structure: string;
  sharedOps: string;
  ambition: string;
}

// ---- Options --------------------------------------------------------------

// What the person actually DOES. The previous list was six ownership positions (Owner,
// CEO, Partner, Investor, Operator, Advisor), which told us their stake and nothing about
// their job. That was survivable while we sold named agents, because "the CFO Agent"
// carried the signal. Selling customization, this field IS the signal: it is the single
// biggest determinant of what the agent should spend its day on.
//
// Ownership moved to its own question below, so someone can be a non-owner COO or an
// owner who never touches operations, and we learn both instead of guessing from one word.
const ROLE_OPTIONS = [
  "Owner / Founder",
  "CEO",
  "President",
  "COO / Head of Operations",
  "CFO / Head of Finance",
  "Managing Partner",
  "Partner",
  "General Manager",
  "Practice Manager",
  "Office Manager",
  "Head of Sales",
  "Head of Marketing",
  "Head of People / HR",
  "Chief of Staff",
  "Director / Department Head",
  "Investor / Board",
  "Advisor / Consultant",
  "Other",
];

const STRUCTURE_OPTIONS = [
  "Holding company / umbrella",
  "Independent businesses I own",
  "Parent with subsidiaries",
  "A mix of the above",
];

const SHARED_OPS_OPTIONS = [
  "Fully shared (same team and tools)",
  "Partly shared",
  "Fully separate",
];

const AMBITION_OPTIONS = [
  "One agent for now",
  "An agent per company over time",
  "One agent across all my businesses",
];


// ---- Tokens (match app/onboard/page.tsx) ----------------------------------

const T = {
  ink: "#000000",
  red: "#D72B2B",
  line: "rgba(0,0,0,0.08)",
  grey: "#1A1A1A",
  surface: "#E8E7E3",
  body: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
};

export const emptyCompany = (): Company => ({
  name: "",
  industry: "",
  industryOther: "",
  role: "",
  roleOther: "",
  ownership: "",
});

export const emptyPortfolio = (): PortfolioMeta => ({
  structure: "",
  sharedOps: "",
  ambition: "",
});

// ---- Props ----------------------------------------------------------------

interface Props {
  companies: Company[];
  onCompaniesChange: (next: Company[]) => void;
  primaryIndex: number;
  onPrimaryChange: (index: number) => void;
  portfolio: PortfolioMeta;
  onPortfolioChange: (next: PortfolioMeta) => void;
}

// ---- Component ------------------------------------------------------------

export default function CompanyRepeater({
  companies,
  onCompaniesChange,
  primaryIndex,
  onPrimaryChange,
  portfolio,
  onPortfolioChange,
}: Props) {
  const multi = companies.length > 1;

  const updateCompany = useCallback(
    (index: number, patch: Partial<Company>) => {
      onCompaniesChange(
        companies.map((c, i) => (i === index ? { ...c, ...patch } : c))
      );
    },
    [companies, onCompaniesChange]
  );

  const removeCompany = useCallback(
    (index: number) => {
      const next = companies.filter((_, i) => i !== index);
      onCompaniesChange(next);
      // Keep primaryIndex valid after a removal.
      if (index === primaryIndex) onPrimaryChange(0);
      else if (index < primaryIndex) onPrimaryChange(primaryIndex - 1);
    },
    [companies, onCompaniesChange, primaryIndex, onPrimaryChange]
  );

  return (
    <div style={{ fontFamily: T.body, color: T.ink }}>
      {companies.map((company, i) => (
        <div
          key={i}
          style={{
            border: `1px solid ${T.line}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
            position: "relative",
            background: "transparent",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: T.body,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: i === primaryIndex ? T.red : T.grey,
              }}
            >
              {i === primaryIndex ? "Primary business" : `Business ${i + 1}`}
            </span>
            {companies.length > 1 && i !== 0 && (
              <button
                type="button"
                onClick={() => removeCompany(i)}
                aria-label={`Remove business ${i + 1}`}
                style={{
                  border: "none",
                  background: "none",
                  color: T.grey,
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                x
              </button>
            )}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <Field label="Company / business name" required>
              <input
                type="text"
                value={company.name}
                placeholder="Acme Corp"
                onChange={(e) => updateCompany(i, { name: e.target.value })}
                style={inputStyle}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <Field label="Industry" required>
                <Select
                  value={company.industry}
                  onChange={(v) =>
                    updateCompany(i, {
                      industry: v,
                      // keep any write-in only while "Other" stays selected
                      industryOther: v === "Other" ? company.industryOther : "",
                    })
                  }
                  options={INDUSTRY_OPTIONS}
                />
              </Field>
              <Field label="Your role" required>
                <Select
                  value={company.role}
                  onChange={(v) =>
                    updateCompany(i, {
                      role: v,
                      // keep any write-in only while "Other" stays selected
                      roleOther: v === "Other" ? company.roleOther : "",
                    })
                  }
                  options={ROLE_OPTIONS}
                />
              </Field>
            </div>

            {company.role === "Other" && (
              <Field label="Tell us your role" required>
                <input
                  type="text"
                  value={company.roleOther}
                  placeholder="e.g. Clinical Director, Head of Studio, Franchise Owner"
                  onChange={(e) => updateCompany(i, { roleOther: e.target.value })}
                  style={inputStyle}
                />
              </Field>
            )}

            {/* "Your stake" was here and is gone at David's call. It asked how much of the
                business someone owned in order to infer how much the agent could decide alone -
                a real signal, but an uncomfortable question to be asked in the first two minutes
                by a company you have just paid, and one people round or decline to answer. The
                same latitude is settled better in conversation with the agent than by a
                dropdown before it has said a word.

                The `ownership` field stays on the Company type and in the payload as an empty
                string: it is read by buildData and by the intake email, and dropping it would
                mean touching both for a value nothing decides on. */}

            {company.industry === "Other" && (
              <Field label="Tell us your industry" required>
                <input
                  type="text"
                  value={company.industryOther}
                  placeholder="e.g. Veterinary services, Event production, Franchising"
                  onChange={(e) =>
                    updateCompany(i, { industryOther: e.target.value })
                  }
                  style={inputStyle}
                />
              </Field>
            )}
          </div>
        </div>
      ))}

      {/* "+ Add another business" was here and is gone at David's call.
          Almost nobody has a second business, and offering the option in the first minutes
          implied the questionnaire was longer than it is - which is the wrong impression to
          give on the screen people are most likely to abandon. The repeater itself, the
          portfolio block and MAX_COMPANIES all stay: a workspace can still hold more than one
          company, and putting the control back is this block, not a rebuild. */}

      {/* Portfolio block: only when more than one company. */}
      {multi && (
        <div
          style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: `1px solid ${T.line}`,
            display: "grid",
            gap: 16,
          }}
        >
          <p style={{ fontFamily: T.body, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.grey, margin: 0 }}>
            About your portfolio
          </p>

          <Field label="Which business should your agent focus on first?" required>
            <Select
              value={companies[primaryIndex]?.name || ""}
              onChange={(v) => {
                const idx = companies.findIndex((c) => c.name === v);
                if (idx >= 0) onPrimaryChange(idx);
              }}
              options={companies.map((c) => c.name).filter(Boolean)}
              placeholder="Select one..."
            />
          </Field>

          <Field label="How are these businesses connected?" required>
            <RadioGroup
              value={portfolio.structure}
              onChange={(v) => onPortfolioChange({ ...portfolio, structure: v })}
              options={STRUCTURE_OPTIONS}
            />
          </Field>

          <Field label="Do they share teams, tools, or operations?" required>
            <RadioGroup
              value={portfolio.sharedOps}
              onChange={(v) => onPortfolioChange({ ...portfolio, sharedOps: v })}
              options={SHARED_OPS_OPTIONS}
            />
          </Field>

          <Field label="Beyond the first, what is the ambition?">
            <RadioGroup
              value={portfolio.ambition}
              onChange={(v) => onPortfolioChange({ ...portfolio, ambition: v })}
              options={AMBITION_OPTIONS}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

// ---- Primitives (styled to match the form) --------------------------------

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: `1px solid ${T.line}`,
  borderRadius: 6,
  fontFamily: T.body,
  fontSize: 14,
  color: T.ink,
  background: T.surface,
  boxSizing: "border-box",
  outline: "none",
};

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          fontFamily: T.body,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: T.grey,
          marginBottom: hint ? 3 : 7,
        }}
      >
        {label} {required && <span style={{ color: T.red }}>*</span>}
      </span>
      {hint && (
        <span
          style={{
            display: "block",
            fontFamily: T.body,
            fontSize: 12,
            color: T.grey,
            marginBottom: 7,
            textTransform: "none",
            letterSpacing: 0,
          }}
        >
          {hint}
        </span>
      )}
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder = "Select one...",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: "pointer" }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function RadioGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            style={{
              textAlign: "left",
              padding: "11px 14px",
              border: `1px solid ${active ? "rgba(215,43,43,0.45)" : T.line}`,
              borderRadius: 6,
              background: active ? "rgba(215,43,43,0.1)" : T.surface,
              color: T.ink,
              fontFamily: T.body,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
