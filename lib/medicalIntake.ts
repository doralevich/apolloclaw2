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
      key: "front_office",
      label: "Who runs the front office today?",
      type: "textarea",
      placeholder:
        "e.g. two receptionists share phones and scheduling, my office manager handles billing and insurance, I answer nothing.",
      helper: "Who does what, and where the work piles up when somebody is out.",
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
      key: "patient_volume",
      label: "Roughly how many patients do you see a week?",
      type: "dropdown",
      options: ["Fewer than 25", "25-75", "75-150", "150-300", "More than 300"],
    },
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
      key: "phone_reality",
      label: "What happens on the phones on a bad day?",
      type: "textarea",
      placeholder:
        "e.g. two lines ring at once during the lunch changeover, voicemails sit until 4pm, people give up and book with somebody else.",
      helper: "Where the front office actually drowns. This is usually what the agent is bought to fix.",
    },
    {
      key: "scheduling_rules",
      label: "How does scheduling really work?",
      type: "textarea",
      placeholder:
        "e.g. new patients need a 40 minute slot and only on Tuesdays and Thursdays, we hold two same-day slots back, Dr Patel never doubles up after 3pm.",
      helper: "The rules your staff know by heart and nobody has written down.",
    },
    {
      key: "no_shows",
      label: "How do you handle no-shows and cancellations?",
      type: "textarea",
      placeholder: "e.g. two reminders, a fee after the second no-show, we call the waitlist to fill the gap.",
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
        "Answering routine practice questions (hours, location, parking)",
        "Insurance and eligibility chasing",
        "Recall and recare outreach",
        "Referral letters and coordination",
        "Reviews and patient feedback requests",
        "Internal notes and handovers",
        "Supply and vendor admin",
      ],
    },
    // The follow-up to the two options that put the agent in front of a patient in writing.
    // Reminders and routine questions are where an administrative agent is most likely to be
    // asked something clinical, and the customer needs to have decided what happens then BEFORE
    // it happens rather than reading it in a transcript afterwards.
    {
      key: "patient_message_rules",
      label: "What may it say to a patient, and what must it hand over?",
      type: "textarea",
      showIf: { key: "owns_work", includes: "Answering routine practice questions (hours, location, parking)" },
      placeholder:
        "e.g. hours, parking, what to bring, and cost estimates are fine. Anything about a symptom, a medication, or whether they should come in goes straight to a nurse and it says so plainly.",
      helper: "Assume a patient will ask it a clinical question. What should happen when they do?",
    },
    {
      key: "clinical_boundary",
      label: "Where must a clinician always take over?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. anything about symptoms, medication, results, or urgency. Anything that sounds like it might be an emergency goes to a person immediately.",
      helper:
        "Be generous here. Your agent is an administrative tool, and it must not drift into clinical territory even when a patient asks it to directly.",
    },
    {
      key: "data_handling",
      label: "Any rules for how patient information must be handled?",
      type: "textarea",
      required: true,
      placeholder:
        "e.g. no PHI in text messages, first name only in reminders, nothing leaves the EHR, a BAA is required before anything is connected.",
      helper: "Anything HIPAA, your state, your malpractice carrier, or your own policy requires.",
    },
    {
      key: "patient_voice",
      label: "How should it sound to a patient?",
      type: "textarea",
      placeholder:
        "e.g. warm and plain, no jargon, never rushed, our patients are mostly elderly so short sentences and no abbreviations.",
    },
    {
      key: "approval_line",
      label: "What must never go out without a person seeing it first?",
      type: "textarea",
      placeholder: "e.g. anything to a patient about money, anything about results, anything to another practice.",
    },
    {
      key: "first_priority",
      label: "If it only fixed one thing in month one, what should it be?",
      type: "text",
      placeholder: "e.g. nobody's voicemail goes unanswered past the same day.",
      helper: "This is what your agent gets configured around first.",
    },
    {
      key: "medical_goals",
      label: "What would a great first 90 days look like?",
      type: "textarea",
      placeholder: "The time back, the empty slots filled, or the calm you want three months from now.",
    },
  ],
};

/** Three pages, one blob. The onboarding form renders these in order. */
export const MEDICAL_BRANCH: IndustryBranch[] = [PRACTICE, FRONT_OFFICE, AGENT];
