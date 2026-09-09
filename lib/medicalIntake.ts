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
      type: "textarea",
      required: true,
      placeholder: "e.g. a two-location dental practice, or a solo dermatology clinic, or a physical therapy group.",
    },
    {
      key: "specialty",
      label: "What is your specialty or focus?",
      type: "text",
      placeholder: "e.g. paediatric dentistry, sports medicine, cosmetic dermatology",
    },
    {
      key: "practice_size",
      label: "How big is the practice?",
      type: "dropdown",
      options: [
        "Solo provider, no staff",
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
        "Not in the US, but under equivalent rules",
        "Not sure",
      ],
      helper:
        "This decides what your agent may touch at all. If you are not sure, say so and we will work it out before anything is connected.",
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
    "How patients actually reach you and how the day runs. The more specific here, the less your agent has to guess.",
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
      label: "How does scheduling really work, including no-shows and cancellations?",
      type: "textarea",
      placeholder:
        "e.g. new patients need a 40 minute slot and only on Tuesdays and Thursdays, we hold two same-day slots back, Dr Patel never doubles up after 3pm.",
      helper: "The rules your staff know by heart and nobody has written down.",
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
    "The last page. Administrative work only, and the lines it must never cross.",
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
        "New patient intake paperwork",
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
    // it happens rather than reading it in a transcript afterwards.
    {
      key: "clinical_boundary",
      label: "Where must a clinician take over, what may it say to a patient, and how must records be handled?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. anything about symptoms, medication, results or urgency goes to a person immediately. It may confirm appointments and send reminders. No PHI in SMS, no chart detail in anything outside the EHR, and nothing goes to a patient without a person reading it.",
      helper:
        "Three rules in one answer: where a clinician must step in, what the agent may say to a patient on its own, and how patient information must be handled. They were separate questions and each got a shorter answer than this one deserves. Be generous - your agent is an administrative tool and must not drift into clinical territory even when a patient asks it to directly.",
    },
    {
      key: "patient_voice",
      label: "How should it sound to a patient?",
      type: "textarea",
      placeholder:
        "e.g. warm and plain, no jargon, never rushed, our patients are mostly elderly so short sentences and no abbreviations.",
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in the first 90 days, what should it be?",
      type: "textarea",
      placeholder: "e.g. nobody's voicemail goes unanswered past the same day.",
      helper: "This is what your agent gets configured around first.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const MEDICAL_BRANCH: IndustryBranch[] = [PRACTICE, FRONT_OFFICE, AGENT];
