// The Medical Agent's intake deep-dive.
//
// Three pages rather than one: the practice, the front office, and what the agent should own.
//
// Same shape as an industry branch (lib/industryConfig.ts) so each page renders through the exact
// same generic step in the onboarding form (IndustryStep). All three write into ONE blob
// (`medicalDetails`), so USER.md, the intake email and the edit pre-fill are unchanged.
//
// THIS IS THE MOST CONSTRAINED ROLE AGENT WE SELL, and the intake says so rather than discovering
// it later. Two lines run through every question here:
//
//   1. It is an ADMINISTRATIVE agent. It does not practise medicine, it does not triage, and it
//      does not tell a patient what to do about a symptom. The clinical-boundary question on page
//      three is required for that reason.
//   2. Patient information is regulated. Whether the customer is a HIPAA covered entity changes
//      what may be touched at all, so it is asked directly and early rather than assumed.
//
// DROPDOWNS AND CHECKBOXES, David's call (Sept 29, 2026): the free-text boxes made setup feel slow
// and corporate. One short text field is left, for specialty. The clinical boundary is now a
// required checklist with the dangerous cases listed first, so a customer who ticks only the top
// few still gets a safe agent. The patient-voice question moved to the shared Voice page.
//
// WHAT IS DELIBERATELY NOT ASKED, same rule as the other role intakes: does the agent need this
// before its first useful action, or can it just ask? No payer mix, no procedure codes, no
// clinical protocols, and no "biggest administrative headache" - the Executive Profile page asks
// about the bottleneck two steps later and the second ask got the shorter answer.
//
// Brand rule: no em dashes in any user-facing string. Use hyphens or commas.

import type { IndustryBranch } from "@/lib/industryConfig";

// ─── Page 1: the practice ────────────────────────────────────────────────────
const PRACTICE: IndustryBranch = {
  stepTitle: "Your Practice",
  stepSubtitle:
    "What kind of practice this is and who works in it. This sets what your agent may go anywhere near.",
  stepLabel: "Practice",
  fields: [
    {
      key: "practice_type",
      label: "What kind of practice is it?",
      type: "dropdown",
      required: true,
      options: [
        "Primary care / family medicine",
        "Dental",
        "Orthodontics",
        "Dermatology",
        "Physical therapy / rehab",
        "Chiropractic",
        "Mental and behavioral health",
        "Pediatrics",
        "Optometry / eye care",
        "Specialist clinic",
        "Med spa / aesthetics",
        "Urgent care",
        "Other",
      ],
    },
    {
      key: "specialty",
      label: "What is your specialty or focus?",
      type: "text",
      placeholder: "e.g. pediatric dentistry, sports medicine, cosmetic dermatology",
    },
    {
      key: "practice_size",
      label: "How big is the practice?",
      type: "dropdown",
      options: [
        "Solo provider, working alone",
        "Solo provider with support staff",
        "2-5 providers",
        "6-15 providers",
        "More than 15 providers",
        "Multi-location group",
      ],
    },
    {
      key: "regulated_status",
      label: "Are you a HIPAA covered entity?",
      type: "dropdown",
      required: true,
      options: [
        "Yes",
        "No",
        "Outside the US, under equivalent rules",
        "Unsure",
      ],
      helper:
        "This decides what your agent may touch at all. Unsure is a fine answer, and we will work it out before anything is connected.",
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
        "Dentrix",
        "Open Dental",
        "Kareo / Tebra",
        "SimplePractice",
        "Paper charts",
        "Other",
      ],
    },
  ],
};

// ─── Page 2: the front office ────────────────────────────────────────────────
const FRONT_OFFICE: IndustryBranch = {
  stepTitle: "Your Front Office",
  stepSubtitle:
    "How patients reach you and how the day runs. The more specific here, the less your agent has to guess.",
  stepLabel: "Front Office",
  fields: [
    {
      key: "patient_comms",
      label: "How does the practice communicate with patients?",
      type: "multiselect",
      options: [
        "Phone",
        "Text / SMS",
        "Patient portal",
        "Email",
        "Automated appointment reminders",
        "Post",
        "Other",
      ],
    },
    {
      key: "scheduling_rules",
      label: "Which scheduling rules apply at your practice?",
      type: "multiselect",
      options: [
        "First-time patients need longer slots",
        "Some visit types only on certain days",
        "Same-day slots held back for urgent visits",
        "Each provider keeps their own schedule rules",
        "Waitlist for earlier openings",
        "Cancellation or late fee policy",
        "Card on file or deposit to book",
        "Patients can self-book online",
        "Other",
      ],
      helper: "Your agent asks for the details on each one once it is connected.",
    },
    {
      key: "billing",
      label: "How is billing and insurance handled?",
      type: "dropdown",
      options: [
        "In-house billing staff",
        "Outsourced billing company",
        "The office manager does it",
        "Cash or self-pay only",
        "Other",
      ],
    },
  ],
};

// ─── Page 3: what the agent owns ─────────────────────────────────────────────
const AGENT: IndustryBranch = {
  stepTitle: "What Your Agent Should Own",
  stepSubtitle:
    "The last page. Administrative work only, and where a clinician takes over.",
  stepLabel: "Your Agent",
  art: true,
  fields: [
    {
      key: "owns_work",
      label: "What administrative work should your agent own?",
      type: "multiselect",
      options: [
        "Appointment reminders and confirmations",
        "Rescheduling and waitlist filling",
        "First-time patient intake paperwork",
        "Answering routine practice questions",
        "Insurance and eligibility chasing",
        "Recall and recare outreach",
        "Referral letters and coordination",
        "Reviews and feedback requests",
      ],
    },
    // The follow-up to the two options that put the agent in front of a patient in writing.
    // Reminders and routine questions are where an administrative agent is most likely to be
    // asked something clinical, and the customer needs to have decided what happens then BEFORE
    // it happens rather than reading it in a transcript afterwards. Clinical and PHI cases are
    // listed first on purpose: the persona holds this line too, and this answer adds to it.
    {
      key: "clinical_boundary",
      label: "Always hand to a clinician or your staff when it involves...",
      type: "multiselect",
      required: true,
      options: [
        "Symptoms, diagnosis or medical advice",
        "Urgent or emergency situations",
        "Mental health crisis or self-harm risk",
        "Medications, prescriptions and refills",
        "Test results and lab values",
        "Chart details and protected health information (PHI)",
        "Patient information outside the EHR or portal",
        "Billing disputes and payment plans",
        "Complaints and upset patients",
        "Every outgoing patient message, reviewed first",
        "Other",
      ],
      helper:
        "Tick generously. Your agent handles scheduling and admin, and hands anything clinical or sensitive to your team.",
    },
    {
      key: "first_priority",
      label: "What should it tackle first?",
      type: "dropdown",
      options: [
        "Same-day callbacks and voicemail replies",
        "Appointment reminders and confirmations",
        "Filling cancellations from a waitlist",
        "First-time patient intake paperwork",
        "Insurance verification before visits",
        "Recall and recare outreach",
        "Referral coordination",
        "More reviews from happy patients",
        "Other",
      ],
      helper: "This is what your agent gets configured around first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const MEDICAL_BRANCH: IndustryBranch[] = [PRACTICE, FRONT_OFFICE, AGENT];
