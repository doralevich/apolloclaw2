import type { LucideIcon } from "lucide-react";
import {
  BarChart3, BellRing, ClipboardList, FileSignature, Inbox, Newspaper, PhoneCall, Receipt,
  RefreshCw, Repeat, UserSearch, Users, Zap,
} from "lucide-react";

// The Use Cases section: one page per job an agent does, grouped by kind of work - David's call
// ("by task") over grouping by role or by outcome. Rendered by app/use-cases/[slug]/page.tsx on
// components/UseCaseTemplate.tsx, the same template the industry pages use, and listed by the
// /use-cases hub and the "Use Cases" dropdown in the top nav.
//
// Copy is drawn from what the agent and industry pages already say the agents do, and a page
// cites a case study only where config/caseStudies.ts has one for that job. Starter copy for
// David to edit, not final.

export type UseCase = {
  slug: string;
  group: string;
  label: string;
  Icon: LucideIcon;
  /** One line, for the nav dropdown and the hub cards. */
  summary: string;
  /** H1 is `${title} ${subtitle}`, the subtitle in red. */
  title: string;
  subtitle: string;
  description: string;
  challenges: string[];
  solutions: { title: string; desc: string }[];
  results: string[];
  /** Agent and industry pages where this job comes up. */
  related: { label: string; to: string }[];
  /** A case study for this job, looked up in config/caseStudies.ts by industry page + sector. */
  caseStudy?: { industry: string; sector: string };
};

export const USE_CASE_GROUPS = [
  "Inbox & Communication",
  "Meetings & Scheduling",
  "Sales & Growth",
  "Finance & Operations",
  "People",
] as const;

export const USE_CASES: UseCase[] = [
  {
    slug: "inbox-triage",
    group: "Inbox & Communication",
    label: "Inbox Triage",
    Icon: Inbox,
    summary: "Sorted, labeled, and drafted, so only what needs you reaches you.",
    title: "AI Inbox Triage",
    subtitle: "That Clears the Queue",
    description:
      "Your agent reads every incoming email, sorts what matters from what doesn't, labels and files the rest, and drafts replies in your voice for you to approve. You open your inbox to a short list of decisions instead of a wall of messages.",
    challenges: [
      "Hours a day lost to reading, sorting, and filing email",
      "Important messages buried under newsletters and notifications",
      "Replies that sit for days because drafting them takes focus you don't have",
      "No clear view of what is waiting on you versus waiting on someone else",
    ],
    solutions: [
      { title: "Priority Sorting", desc: "Every message classified as needs you, can wait, or FYI, with the ones that need you surfaced first." },
      { title: "Drafted Replies", desc: "Replies drafted in your tone from the thread's context, ready to send or edit. Nothing goes out without your approval unless you allow it." },
      { title: "Labels and Filing", desc: "Messages labeled and archived to your system, so the inbox holds only what is still open." },
    ],
    results: [
      "An inbox that shows decisions, not volume",
      "Replies out the same day instead of the same week",
      "Nothing important lost under routine mail",
      "Hours back every week for the work only you can do",
    ],
    related: [
      { label: "The CEO Agent", to: "/ai-agents/ceo" },
      { label: "The Personal Agent", to: "/ai-agents/personal-assistant" },
      { label: "Law Firms", to: "/industries/law-firms" },
    ],
    caseStudy: { industry: "/industries/law-firms", sector: "Litigation" },
  },
  {
    slug: "follow-up",
    group: "Inbox & Communication",
    label: "Follow-Up That Never Slips",
    Icon: Repeat,
    summary: "Every open thread tracked and nudged on schedule.",
    title: "Follow-Up",
    subtitle: "That Never Slips",
    description:
      "Most lost deals, late payments, and stalled projects come down to a follow-up nobody sent. Your agent tracks every open thread and commitment, and sends the nudge on time, so nothing depends on someone remembering.",
    challenges: [
      "Promises made on calls that nobody writes down",
      "Threads that go quiet because no one owns the next step",
      "Follow-ups sent late, or only when something has already gone wrong",
      "The founder or partner acting as the team's reminder system",
    ],
    solutions: [
      { title: "Commitment Tracking", desc: "Next steps pulled from email and meeting notes into one list, each with an owner and a date." },
      { title: "Scheduled Nudges", desc: "Polite, specific follow-ups sent on your cadence, escalating only when a thread stays quiet." },
      { title: "Status at a Glance", desc: "A daily view of what is waiting on you, what is waiting on others, and what is overdue." },
    ],
    results: [
      "Deals and projects that keep moving without you chasing them",
      "Clients who notice you always come back when you said you would",
      "Fewer things falling through the cracks between people",
      "You stop being the bottleneck on every next step",
    ],
    related: [
      { label: "The CEO Agent", to: "/ai-agents/ceo" },
      { label: "The Personal Agent", to: "/ai-agents/personal-assistant" },
      { label: "Professional Services", to: "/industries/professional-services" },
    ],
    caseStudy: { industry: "/industries/professional-services", sector: "B2B Services" },
  },
  {
    slug: "front-desk",
    group: "Inbox & Communication",
    label: "Front Desk & Call Handling",
    Icon: PhoneCall,
    summary: "Calls answered, messages routed, appointments booked.",
    title: "An AI Front Desk",
    subtitle: "That Never Misses a Call",
    description:
      "Your agent answers the questions a front desk answers all day, takes messages, routes what needs a person to the right person, and books appointments straight into your calendar - after hours and at the busiest times included.",
    challenges: [
      "Calls going to voicemail when the front desk is busy or closed",
      "Staff interrupted all day by the same handful of questions",
      "Messages that reach the wrong person, or no one",
      "Appointments booked by phone tag instead of in one step",
    ],
    solutions: [
      { title: "Answers on Demand", desc: "Hours, directions, pricing basics, and your other common questions answered accurately from what you give it." },
      { title: "Routing and Messages", desc: "Anything that needs a person routed to the right one with a clean summary, instead of a scribbled note." },
      { title: "Booking", desc: "Appointments offered from real availability and booked directly, with confirmations sent automatically." },
    ],
    results: [
      "Fewer missed calls and lost bookings",
      "A front desk team that can focus on the people in front of them",
      "Messages that reach the right person the first time",
      "Coverage after hours without adding staff",
    ],
    related: [
      { label: "Reception & Front Desk", to: "/ai-agents/receptionist" },
      { label: "Medical Practices", to: "/industries/medical-practices" },
    ],
  },
  {
    slug: "meeting-prep",
    group: "Meetings & Scheduling",
    label: "Meeting Prep & Briefings",
    Icon: Newspaper,
    summary: "A morning brief and a one-pager before every meeting.",
    title: "Meeting Prep",
    subtitle: "and Daily Briefings",
    description:
      "Start each day with a short brief: what's on your calendar, what needs a decision, and what changed overnight. Before each meeting, your agent puts together a one-pager on who you're meeting, your history with them, and what to push on.",
    challenges: [
      "Walking into meetings without the context from the last conversation",
      "Mornings spent piecing together the day from email, calendar, and chat",
      "Research on a new contact done in the five minutes before the call",
      "Decisions that wait because nobody put the facts in one place",
    ],
    solutions: [
      { title: "Morning Brief", desc: "Your day, what needs a decision, and what moved overnight, delivered where you want it - email, WhatsApp, Telegram, or Slack." },
      { title: "Meeting One-Pagers", desc: "Who you're meeting, your past threads and notes, open items between you, and relevant news, ready before the call." },
      { title: "Research on Request", desc: "Ask a question about a company, person, or topic and get a sourced summary back, not a list of links." },
    ],
    results: [
      "Every meeting starts with the full picture",
      "Decisions made faster because the facts are already gathered",
      "No more last-minute scrambling for context",
      "A calmer start to the day",
    ],
    related: [
      { label: "The CEO Agent", to: "/ai-agents/ceo" },
      { label: "The Personal Agent", to: "/ai-agents/personal-assistant" },
      { label: "Law Firms", to: "/industries/law-firms" },
    ],
  },
  {
    slug: "appointment-reminders",
    group: "Meetings & Scheduling",
    label: "Appointment Reminders & No-Shows",
    Icon: BellRing,
    summary: "Reminders at 72 hours, 24 hours, and the morning of.",
    title: "Appointment Reminders",
    subtitle: "That Cut No-Shows",
    description:
      "Every no-show is revenue you can't get back. Your agent sends reminders on a schedule that works, handles confirmations and reschedules, and fills the gaps from a waitlist, so the schedule stays full.",
    challenges: [
      "Double-digit no-show rates quietly eating revenue",
      "Staff time spent on reminder calls that go to voicemail",
      "Cancellations that come too late to fill the slot",
      "No follow-up with patients or clients after the visit",
    ],
    solutions: [
      { title: "Multi-Touch Reminders", desc: "Reminders 72 hours out, 24 hours out, and the morning of, by text or email." },
      { title: "Confirm and Reschedule", desc: "Replies handled automatically: confirmations recorded, reschedules offered from real availability." },
      { title: "Post-Visit Follow-Up", desc: "A summary and satisfaction check sent after the visit, which is where good reviews come from." },
    ],
    results: [
      "Fewer no-shows and last-minute gaps",
      "Front desk time back from reminder calls",
      "Better reviews from consistent follow-up",
      "A fuller schedule without adding hours",
    ],
    related: [
      { label: "Medical Practices", to: "/industries/medical-practices" },
      { label: "Reception & Front Desk", to: "/ai-agents/receptionist" },
    ],
    caseStudy: { industry: "/industries/medical-practices", sector: "Primary Care" },
  },
  {
    slug: "lead-follow-up",
    group: "Sales & Growth",
    label: "Lead Follow-Up in Minutes",
    Icon: Zap,
    summary: "New inquiries answered, qualified, and booked within minutes.",
    title: "Lead Follow-Up",
    subtitle: "in Minutes, Not Days",
    description:
      "The first business to respond usually wins. Your agent replies to every new inquiry within minutes, asks the qualifying questions, and books the meeting or showing - then keeps following up with the ones who go quiet.",
    challenges: [
      "Leads that wait hours or days for a first reply",
      "Inconsistent follow-up from one salesperson or agent to the next",
      "Good prospects lost because nobody followed up a second time",
      "No time to qualify before the first call",
    ],
    solutions: [
      { title: "Instant First Response", desc: "Every inquiry answered within minutes, day or night, in your voice." },
      { title: "Qualification", desc: "The questions you'd ask on the first call asked up front, with the answers written to your CRM." },
      { title: "Booked and Nurtured", desc: "Meetings or showings booked straight to the calendar, and a follow-up sequence for everyone who isn't ready yet." },
    ],
    results: [
      "Higher lead-to-meeting conversion",
      "One consistent follow-up standard across the whole team",
      "Pipeline that keeps moving after hours",
      "Salespeople spending time on qualified conversations",
    ],
    related: [
      { label: "The Sales Agent", to: "/ai-agents/sales" },
      { label: "The Real Estate Agent", to: "/industries/real-estate" },
    ],
    caseStudy: { industry: "/industries/real-estate", sector: "Residential" },
  },
  {
    slug: "client-intake",
    group: "Sales & Growth",
    label: "Client Intake & Screening",
    Icon: ClipboardList,
    summary: "Every inquiry screened, facts collected, consult scheduled.",
    title: "Client Intake",
    subtitle: "and Screening",
    description:
      "Your agent screens every inquiry within minutes, collects the basic facts, filters out the ones that aren't a fit, and schedules a consultation with the right person for the ones that are - so no good matter falls through.",
    challenges: [
      "Half of inbound inquiries lost because follow-up is too slow",
      "Senior staff spending time on intake calls that go nowhere",
      "Facts collected inconsistently, then asked for again",
      "Consultations booked with the wrong person",
    ],
    solutions: [
      { title: "Fast Screening", desc: "Every inquiry answered within minutes, with your screening questions asked the same way every time." },
      { title: "Structured Facts", desc: "The details you need collected into a clean summary before anyone gets on a call." },
      { title: "Right-Person Scheduling", desc: "Qualified inquiries booked with the right attorney or advisor, the rest declined politely or referred." },
    ],
    results: [
      "More retained clients from the same inquiry volume",
      "Senior time spent only on qualified consultations",
      "Consistent intake records for every matter",
      "No inquiry left waiting overnight",
    ],
    related: [
      { label: "Personal Injury Law", to: "/industries/personal-injury-law" },
      { label: "Law Firms", to: "/industries/law-firms" },
      { label: "Professional Services", to: "/industries/professional-services" },
    ],
    caseStudy: { industry: "/industries/personal-injury-law", sector: "Personal Injury" },
  },
  {
    slug: "renewal-outreach",
    group: "Sales & Growth",
    label: "Renewal & Retention Outreach",
    Icon: RefreshCw,
    summary: "Renewals flagged 90–120 days out, outreach drafted.",
    title: "Renewal Outreach",
    subtitle: "That Keeps Clients",
    description:
      "Most renewals are lost to silence, not price. Your agent flags every renewal well ahead of the date, gathers what's needed, drafts the outreach, and makes sure it actually goes out.",
    challenges: [
      "Renewals noticed only weeks before they lapse",
      "Outreach that depends on each producer remembering",
      "Information requests for renewals chased by hand",
      "Clients who leave because nobody checked in",
    ],
    solutions: [
      { title: "Early Flags", desc: "Every renewal surfaced 90 to 120 days out, with the account's history attached." },
      { title: "Drafted Outreach", desc: "Personal renewal emails drafted for each client, sent by your team or on their behalf." },
      { title: "Data Gathering", desc: "The information a renewal needs requested and chased on schedule, so submissions go in on time." },
    ],
    results: [
      "Higher retention without micromanaging the process",
      "No renewal lapses because of a missed date",
      "Submissions ready before the deadline",
      "A consistent client experience across every producer",
    ],
    related: [
      { label: "Insurance", to: "/industries/insurance" },
      { label: "Law Firms", to: "/industries/law-firms" },
    ],
    caseStudy: { industry: "/industries/insurance", sector: "Insurance" },
  },
  {
    slug: "month-end-close",
    group: "Finance & Operations",
    label: "Month-End Close & Reporting",
    Icon: BarChart3,
    summary: "Data pulled, variances flagged, narrative drafted.",
    title: "Month-End Close",
    subtitle: "and Reporting",
    description:
      "Your agent pulls the numbers, flags the variances, and drafts the narrative, so your finance team reviews instead of produces. Recurring reports run on schedule and land in your inbox before you ask.",
    challenges: [
      "A close that takes most of the second week of the month",
      "Analysts spending their time producing reports instead of reading them",
      "Variances found late, after the numbers have already gone out",
      "Recurring reports that depend on one person's spreadsheet",
    ],
    solutions: [
      { title: "Data Pull", desc: "Figures gathered from your systems into one place at the start of the close." },
      { title: "Variance Flags", desc: "Movements against budget and prior period flagged with the likely explanation, for a person to confirm." },
      { title: "Drafted Narrative", desc: "The commentary drafted from the numbers, ready for review, and recurring reports run nightly or weekly." },
    ],
    results: [
      "A faster close",
      "A finance team that reviews rather than produces",
      "Variances caught before the numbers go out",
      "Reports on schedule, every time",
    ],
    related: [
      { label: "The CFO Agent", to: "/ai-agents/cfo" },
      { label: "Financial Services", to: "/industries/financial-services" },
      { label: "Accounting Firms", to: "/industries/accounting-firms" },
    ],
    caseStudy: { industry: "/industries/insurance", sector: "Finance" },
  },
  {
    slug: "invoicing-collections",
    group: "Finance & Operations",
    label: "Invoicing & Collections",
    Icon: Receipt,
    summary: "Invoices out and followed up on a predictable schedule.",
    title: "Invoicing",
    subtitle: "and Collections",
    description:
      "Cash flow suffers most from invoices that go out late and follow-ups nobody sends. Your agent prompts time entry, gets invoices out on schedule, and follows up on overdue balances politely and persistently.",
    challenges: [
      "Invoices that go out late because time wasn't entered",
      "Overdue balances nobody wants to chase",
      "Collections follow-up that depends on the owner remembering",
      "No clear view of what's outstanding and for how long",
    ],
    solutions: [
      { title: "Time Capture", desc: "Time entry prompted against actual calendar activity, so billing isn't held up at month end." },
      { title: "Invoices on Schedule", desc: "Invoices prepared and sent on your cycle, with anything unusual held for review." },
      { title: "Polite Persistence", desc: "Overdue reminders sent on a set cadence, escalating tone only as far as you allow." },
    ],
    results: [
      "Invoices out on time",
      "Faster payment on overdue balances",
      "A clear aging view without a spreadsheet",
      "No more awkward chasing by the owner",
    ],
    related: [
      { label: "Professional Services", to: "/industries/professional-services" },
      { label: "Accounting Firms", to: "/industries/accounting-firms" },
      { label: "The CFO Agent", to: "/ai-agents/cfo" },
    ],
  },
  {
    slug: "document-drafting",
    group: "Finance & Operations",
    label: "Document & Contract Drafting",
    Icon: FileSignature,
    summary: "Drafts from your templates, redlines, and key dates tracked.",
    title: "Document and Contract",
    subtitle: "Drafting",
    description:
      "Your agent drafts from your own templates and prior work, redlines what comes in against your standards, and tracks the dates that matter - renewals, notice periods, deadlines - so nothing lapses unnoticed.",
    challenges: [
      "Routine documents drafted from a blank page every time",
      "Incoming contracts reviewed line by line for the same issues",
      "Renewal and notice dates tracked in someone's head",
      "Proposals and scopes that take days to turn around",
    ],
    solutions: [
      { title: "Template Drafting", desc: "First drafts built from your templates and past documents, for a professional to review and finalize." },
      { title: "Redlines", desc: "Incoming documents compared against your standard positions, with the deviations flagged." },
      { title: "Key Date Tracking", desc: "Renewal, notice, and deadline dates pulled out and reminded well ahead of time." },
    ],
    results: [
      "Faster first drafts",
      "Consistent review against your standards",
      "No missed renewal or notice dates",
      "Professionals editing instead of typing",
    ],
    related: [
      { label: "Law Firms", to: "/industries/law-firms" },
      { label: "Insurance", to: "/industries/insurance" },
      { label: "Professional Services", to: "/industries/professional-services" },
    ],
  },
  {
    slug: "recruiting-pipeline",
    group: "People",
    label: "Recruiting & Candidate Pipeline",
    Icon: UserSearch,
    summary: "Screening, scheduling, and candidate follow-up handled.",
    title: "Recruiting",
    subtitle: "and Candidate Pipeline",
    description:
      "Your agent screens applicants against the role, schedules interviews across busy calendars, and keeps every candidate informed, so good people don't drop out while they wait to hear back.",
    challenges: [
      "Hiring managers buried in unscreened applications",
      "Interview scheduling that takes days of back-and-forth",
      "Candidates who go cold because nobody updated them",
      "No consistent record of where each candidate stands",
    ],
    solutions: [
      { title: "Screening", desc: "Applications reviewed against the role's must-haves, with a short summary of each promising candidate." },
      { title: "Interview Scheduling", desc: "Interviews booked across the panel's real availability, with reminders to everyone involved." },
      { title: "Candidate Updates", desc: "Every candidate kept informed at each stage, including a courteous close for those who aren't moving forward." },
    ],
    results: [
      "Shorter time to hire",
      "Hiring managers spending time only on strong candidates",
      "Fewer candidates lost to silence",
      "A clear pipeline view at any moment",
    ],
    related: [{ label: "The Recruiting Agent", to: "/ai-agents/recruiting" }],
  },
  {
    slug: "hr-requests",
    group: "People",
    label: "HR Requests & Onboarding",
    Icon: Users,
    summary: "PTO, onboarding checklists, and policy questions handled.",
    title: "HR Requests",
    subtitle: "and Onboarding",
    description:
      "Your agent answers policy questions from your handbook, handles PTO requests, and runs new hires through onboarding step by step, while keeping records straight.",
    challenges: [
      "The same policy questions answered over and over",
      "PTO requests tracked across email and spreadsheets",
      "Onboarding steps missed for new hires",
      "HR time spent on admin instead of people",
    ],
    solutions: [
      { title: "Policy Answers", desc: "Questions answered from your own handbook and policies, with anything sensitive routed to a person." },
      { title: "PTO Handling", desc: "Requests collected, checked against balances, and routed for approval, with the records updated." },
      { title: "Onboarding Runbooks", desc: "Each new hire walked through their checklist, with reminders until every step is done." },
    ],
    results: [
      "Consistent answers to policy questions",
      "Clean PTO records without the spreadsheet",
      "Complete onboarding for every new hire",
      "HR time back for the work that needs a person",
    ],
    related: [{ label: "Human Resources", to: "/ai-agents/hr" }],
  },
];

export function findUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
