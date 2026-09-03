// The Medical Agent's intake deep-dive.
//
// Same shape as an industry branch (lib/industryConfig.ts) so it renders through the exact same
// generic step in the onboarding form (IndustryStep) and saves into its own JSONB blob. It shows
// only when the agent type is `medical` (config/agent-types.ts), on top of the standard business
// questions, so a medical-practice agent is set up around the practice's actual administrative
// work from day one.
//
// All fields are optional: answer what applies, skip the rest.
//
// This agent is ADMINISTRATIVE ONLY. It supports the people who deliver care; it does not deliver
// care, diagnose, or make clinical decisions (see the `medical` persona in config/personas.ts).
// Every question below asks about the practice's admin, communications, and paperwork - never
// about clinical judgment.
//
// Answers land under the `medicalDetails` key and are surfaced in USER.md / the intake email via
// the "Medical Deep-Dive" section (lib/onboardingSections.ts).
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

export const MEDICAL_BRANCH: IndustryBranch = {
  stepTitle: "Your Practice",
  stepSubtitle: "A few specifics so your medical agent handles your admin work the way your practice runs it. This agent supports your team; it does not diagnose or make clinical decisions.",
  fields: [
    {
      key: "practice_type",
      label: "What kind of practice is it?",
      type: "textarea",
      placeholder: "e.g. a two-doctor family medicine clinic, a solo dermatology practice, a physical therapy group.",
    },
    {
      key: "specialty",
      label: "What is your specialty or focus?",
      type: "text",
      placeholder: "e.g. primary care, pediatrics, dental, mental health, PT",
    },
    {
      key: "practice_size",
      label: "How big is the practice?",
      type: "dropdown",
      options: [
        "Solo provider",
        "2-5 providers",
        "6-20 providers",
        "20+ providers",
        "Part of a larger system",
      ],
    },
    {
      key: "patient_volume",
      label: "Roughly how many patients do you see a week?",
      type: "dropdown",
      options: ["Under 50", "50-150", "150-400", "400+", "Not sure"],
    },
    {
      key: "ehr",
      label: "What EHR or practice-management system do you use?",
      type: "dropdown",
      options: [
        "Epic",
        "Cerner / Oracle Health",
        "athenahealth",
        "eClinicalWorks",
        "NextGen",
        "DrChrono",
        "Kareo / Tebra",
        "SimplePractice",
        "Paper / none yet",
        "Other",
      ],
    },
    {
      key: "admin_work",
      label: "What administrative work should the agent help with?",
      type: "multiselect",
      options: [
        "Patient reminders & follow-ups",
        "Appointment scheduling support",
        "Plain-language patient explanations",
        "Insurance & billing paperwork",
        "Prior authorization drafts",
        "Records & documentation organization",
        "Summarizing medical literature for clinicians",
        "Intake & new-patient forms",
        "Front-desk communications",
      ],
    },
    {
      key: "patient_comms",
      label: "How does your practice communicate with patients?",
      type: "multiselect",
      options: [
        "Patient portal",
        "Email",
        "Text / SMS",
        "Phone",
        "Mailed letters",
        "Other",
      ],
    },
    {
      key: "billing",
      label: "How is billing and insurance handled?",
      type: "dropdown",
      options: [
        "In-house billing staff",
        "Outsourced billing company",
        "A mix",
        "Cash / self-pay only",
        "Not sure",
      ],
    },
    {
      key: "data_handling",
      label: "Any rules for how patient information must be handled?",
      type: "textarea",
      placeholder: "e.g. PHI stays inside the EHR, nothing patient-identifying leaves our systems, staff-only access.",
      helper: "The agent treats these as hard rules and stays HIPAA-mindful with anything patient-related.",
    },
    {
      key: "medical_pain",
      label: "Biggest administrative headache right now?",
      type: "textarea",
      placeholder: "e.g. the front desk is buried in calls, prior auths take forever, patient no-shows, paperwork backlog.",
    },
    {
      key: "medical_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The time back for your staff, the smoother patient experience, or the paperwork off your plate three months from now.",
    },
  ],
};
