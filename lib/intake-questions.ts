import { getAgentType, LICENSE_AGENT_TYPE_ID } from "@/config/agent-types";
import {
  AI_GOALS,
  AI_TOOLS,
  BIZ_AGE,
  BIZ_SIZES,
  BRAND_LIKE,
  GROWTH_BOTTLENECK,
  INTERNAL_TECH,
  ROLE_INTAKES,
  STACK_BILLING,
  STACK_COMMS,
  STACK_CRM,
  STACK_DOCS,
  STACK_PM,
  SUCCESS_MET,
  TEAM_SENT,
  WRITING_TONE,
} from "@/components/onboard/OnboardingForm";
import {
  fieldVisible,
  getIndustryBranch,
  INDUSTRY_OPTIONS,
  takeOnField,
  type IndustryBranch,
  type IndustryField,
  type StackSection,
} from "@/lib/industryConfig";

// The questionnaire as a list of questions, one at a time.
//
// components/onboard/OnboardingForm.tsx asks the same things as ten pages of form. This file
// walks those pages in their order and turns every field into one question, so
// components/onboard/ConversationalIntake.tsx can ask them one by one, the way the college
// agent's intake does (David, Nov 5 2026: "do both"). The ANSWERS are the same: toPayload()
// below produces the exact object the form's buildData() sends to /api/agent-setup, so USER.md,
// TOOLS.md, the intake email and the edit pre-fill are untouched by the change of UI.
//
// Three answer buckets, because the payload keeps them apart: `top` is the flat business
// profile (companyName, crmTools, aiGoals...), `ind` is the industry deep-dive (industryDetails)
// and `role` is the role agent's own deep-dive (cfoDetails, legalDetails...). A question names
// its bucket; the industry and role branches are already data (lib/industryConfig.ts and
// lib/*Intake.ts), so their questions are generated rather than retyped.

export type Bucket = "top" | "ind" | "role";

export type Answers = {
  top: Record<string, unknown>;
  ind: Record<string, string | string[]>;
  role: Record<string, string | string[]>;
};

export type Question = {
  /** The answer key inside its bucket. */
  id: string;
  bucket: Bucket;
  /** The group the progress line names: "Your business", "Tech stack"... */
  section: string;
  /** What the agent asks. */
  ask: string;
  help?: string;
  placeholder?: string;
  kind: "name" | "avatar" | "text" | "textarea" | "single" | "multi" | "select" | "scale" | "tiles" | "people" | "classes" | "confirm";
  options?: readonly string[];
  required?: boolean;
  /** Scale: the top of the range. Multi: the most picks allowed. */
  max?: number;
  /** "Other" (or the named option) opens a write-in stored under `${id}_other`. */
  other?: string;
  /** Tiles: one pick, stored as a string. */
  single?: boolean;
  /** Only asked when this says so, given the answers so far. */
  showIf?: (a: Answers) => boolean;
};

export const EMPTY_ANSWERS: Answers = { top: {}, ind: {}, role: {} };

type RoleIntake = (typeof ROLE_INTAKES)[string];

/** The role registry entry for an agent type, or undefined for the generic Apollo agent. */
export function roleIntakeFor(agentTypeId: string): RoleIntake | undefined {
  return ROLE_INTAKES[agentTypeId];
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/** A deep-dive field as a question. The shapes map one to one onto the form's own controls. */
function fromField(f: IndustryField, bucket: Bucket, section: string, values: Record<string, string | string[]>): Question {
  const base = { id: f.key, bucket, section, ask: f.label, help: f.helper, placeholder: f.placeholder, required: f.required };
  const showIf = f.showIf ? () => fieldVisible(f, values) : undefined;
  switch (f.type) {
    case "dropdown":
    case "radio":
      return { ...base, kind: "single", options: f.options ?? [], other: f.options?.includes("Other") ? "Other" : undefined, showIf };
    case "multiselect":
      return { ...base, kind: "multi", options: f.options ?? [], other: f.options?.includes("Other") ? "Other" : undefined, showIf };
    case "scale":
      return { ...base, kind: "scale", max: 10, showIf };
    case "textarea":
      return { ...base, kind: "textarea", showIf };
    case "people":
      return { ...base, kind: "people", help: f.helper ?? "One per line, with an age if you like.", showIf };
    case "classes":
      return { ...base, kind: "classes", showIf };
    default:
      return { ...base, kind: "text", showIf };
  }
}

/** A Tech Stack section as a question: a row of tiles, or one type-in. */
function fromStack(s: StackSection, bucket: Bucket): Question {
  if ("text" in s) {
    return { id: s.key, bucket, section: "Tech stack", ask: s.question, help: s.text.helper, placeholder: s.text.placeholder, kind: "text" };
  }
  return {
    id: s.key,
    bucket,
    section: "Tech stack",
    ask: s.label,
    kind: "tiles",
    options: s.options,
    single: s.single,
    required: s.required,
    other: s.options.includes("Other") ? "Other" : undefined,
  };
}

const GENERIC_STACK: Array<{ skip: "crm" | "comms" | "docs" | "pm" | "billing"; id: string; ask: string; options: readonly string[] }> = [
  { skip: "crm", id: "crmTools", ask: "Sales and CRM", options: STACK_CRM },
  { skip: "comms", id: "commsTools", ask: "Communication", options: STACK_COMMS },
  { skip: "docs", id: "docsTools", ask: "Documents and files", options: STACK_DOCS },
  { skip: "pm", id: "pmTools", ask: "Projects and operations", options: STACK_PM },
  { skip: "billing", id: "billingTools", ask: "Finance and billing", options: STACK_BILLING },
];

/**
 * Every question for this agent, in order, given the answers so far (the industry picked on an
 * early question decides the deep-dive and the stack sections later on). Questions with a
 * `showIf` are kept in the list and skipped at ask time, so the count stays stable.
 */
export function buildQuestions(agentTypeId: string, a: Answers): Question[] {
  const role = roleIntakeFor(agentTypeId);
  const isRole = !!role;
  const dropped = new Set(role?.dropPages ?? []);
  const personal = !!role?.personalScale;
  const industryName = str(a.top.industry);
  const branch: IndustryBranch | null = isRole ? null : getIndustryBranch(industryName);
  const q: Question[] = [];

  // ── Your agent ──────────────────────────────────────────────────────────────────────────
  q.push({ id: "agentName", bucket: "top", section: "Your agent", ask: "What should we call your agent?", help: "A first name. You can change it any time.", kind: "name", required: true });
  q.push({ id: "avatarPreset", bucket: "top", section: "Your agent", ask: "Select a face for your agent", help: "Upload your own image or choose one below. Optional: skip and it keeps its own.", kind: "avatar" });

  // ── Your business ───────────────────────────────────────────────────────────────────────
  if (!dropped.has("biz")) {
    const nameAsk = role?.nameLabel ?? (personal ? "Where do you work, if anywhere?" : "What is the name of your business?");
    q.push({ id: "companyName", bucket: "top", section: personal ? "About you" : "Your business", ask: nameAsk, placeholder: role?.namePlaceholder ?? "Acme Corp", kind: "text", required: !personal });
    if (!isRole) {
      q.push({ id: "industry", bucket: "top", section: "Your business", ask: "Which industry are you in?", kind: "select", options: INDUSTRY_OPTIONS, required: true });
      q.push({ id: "industryOther", bucket: "top", section: "Your business", ask: "Which industry is that?", placeholder: "e.g. Veterinary services, Event production, Franchising", kind: "text", required: true, showIf: (x) => str(x.top.industry) === "Other" });
    }
    q.push({ id: "primaryRole", bucket: "top", section: personal ? "About you" : "Your business", ask: "What is your role there?", placeholder: "e.g. Owner, CEO, Office Manager, Clinical Director", kind: "text", required: !personal });
    if (!personal) {
      q.push({ id: "website", bucket: "top", section: "Your business", ask: "Your website?", help: "Optional. I read it to learn how you describe yourselves.", placeholder: "yourcompany.com", kind: "text" });
      q.push({ id: "companySize", bucket: "top", section: "Your business", ask: "How big is the team?", kind: "single", options: BIZ_SIZES });
      q.push({ id: "businessAge", bucket: "top", section: "Your business", ask: "How long has the business been running?", kind: "single", options: BIZ_AGE });
    }
  }

  // ── What you do ─────────────────────────────────────────────────────────────────────────
  if (!dropped.has("whatyoudo")) {
    q.push({ id: "businessDescription", bucket: "top", section: "What you do", ask: "Describe your business in a few sentences.", help: "Who do you serve, and what do you deliver for them?", placeholder: "We help [who] do [what] by [how]...", kind: "textarea", required: true });
  }

  // ── The role's own deep-dive, in its own words ──────────────────────────────────────────
  const rolePages = role ? (Array.isArray(role.branch) ? role.branch : [role.branch]) : [];
  for (const page of rolePages) {
    for (const f of page.fields) q.push(fromField(f, "role", page.stepLabel ?? role!.stepLabel, a.role));
  }

  // ── The industry deep-dive (generic agent only) ─────────────────────────────────────────
  // Its "Biggest bottleneck" is asked later, folded into "What should I take off your plate
  // first?", so the same question is not put twice in two vocabularies (lib/industryConfig.ts
  // takeOnField).
  const takeOn = takeOnField(branch);
  if (branch) {
    for (const f of branch.fields) {
      if (f === takeOn) continue;
      q.push(fromField(f, "ind", "Your industry", a.ind));
    }
  }

  // ── Exec (generic: before the stack; role flows ask it after voice, as the form does) ───
  const exec: Question[] = dropped.has("exec")
    ? []
    : [
        { id: "strategicBet", bucket: "top", section: "The year ahead", ask: "What is your biggest goal for the next 12 months?", placeholder: "The move that matters most - a new market, a product, a key hire, more revenue, an acquisition...", kind: "textarea" },
        { id: "growthBottleneck", bucket: "top", section: "The year ahead", ask: "Where is the real bottleneck to growth right now?", kind: "multi", options: GROWTH_BOTTLENECK, other: "Other" },
      ];
  if (!isRole) q.push(...exec);

  // ── Tech stack ──────────────────────────────────────────────────────────────────────────
  if (!dropped.has("stack")) {
    if (role?.stackSections) {
      for (const s of role.stackSections) q.push(fromStack(s, "role"));
    } else {
      for (const s of branch?.stack ?? []) q.push(fromStack(s, "ind"));
      if (!branch?.stackReplaces) {
        const skip = new Set([...(role?.stackSkip ?? []), ...(branch?.stackSkip ?? [])]);
        for (const g of GENERIC_STACK) {
          if (skip.has(g.skip)) continue;
          q.push({ id: g.id, bucket: "top", section: "Tech stack", ask: g.ask, kind: "tiles", options: g.options, other: "Other" });
        }
      }
    }
    q.push({ id: "internalTech", bucket: "top", section: "Tech stack", ask: "Who looks after the technical side after launch?", kind: "single", options: INTERNAL_TECH });
  }

  // ── Voice ───────────────────────────────────────────────────────────────────────────────
  if (!dropped.has("voice")) {
    q.push({ id: "writingTone", bucket: "top", section: "Your voice", ask: "How do you naturally sound?", help: "Pick all that fit.", kind: "multi", options: WRITING_TONE });
    q.push({ id: "brandVoiceLike", bucket: "top", section: "Your voice", ask: "Whose voice do you sound most like?", help: "Up to three.", kind: "multi", options: BRAND_LIKE, max: 3, other: "Other" });
  }

  if (isRole) q.push(...exec);

  // ── Where you are with AI, and what it should take on ───────────────────────────────────
  if (!dropped.has("goals")) {
    q.push({ id: "priorAI", bucket: "top", section: "Where you are with AI", ask: "Have you tried AI or automation before?", kind: "single", options: ["Yes", "No"] });
    q.push({ id: "aiTools", bucket: "top", section: "Where you are with AI", ask: "Which AI tools have you used?", kind: "multi", options: AI_TOOLS, other: "Other", showIf: (x) => str(x.top.priorAI) === "Yes" });
    q.push({ id: "aiProficiency", bucket: "top", section: "Where you are with AI", ask: "How comfortable are you with AI tools?", help: "1 is just getting started, 5 is power user.", kind: "scale", max: 5, showIf: (x) => str(x.top.priorAI) === "Yes" });
    q.push({ id: "aiKeepProcesses", bucket: "top", section: "Where you are with AI", ask: "Any processes you use today and want to keep?", help: "Optional. Anything that works and should stay as it is.", placeholder: "e.g. The Zapier flow that posts new leads to Slack...", kind: "textarea", showIf: (x) => str(x.top.priorAI) === "Yes" });
    q.push({ id: "teamSentiment", bucket: "top", section: "Where you are with AI", ask: "How does your team feel about bringing me in?", kind: "single", options: TEAM_SENT });
  }
  if (!role?.coversScope && !dropped.has("scopeai")) {
    // The industry's own tasks first, in its own words, then the generic list. The chat opener
    // and the checklist read these by exact string for the generic list and by keyword for
    // the rest, and fall back to a plain "Hand over <task>" row for anything else.
    const takeOnOptions = [...(takeOn?.options ?? []).filter((o) => o !== "Other"), ...AI_GOALS];
    q.push({ id: "aiGoals", bucket: "top", section: "What I should take on", ask: "What should I take off your plate first?", help: "Pick all that apply.", kind: "multi", options: takeOnOptions, other: "Other" });
    // Up to two (David, Nov 5 2026): a priority rather than everything ticked, so the agent
    // knows what it is being judged on.
    q.push({ id: "successMetric", bucket: "top", section: "What I should take on", ask: "What does winning look like?", help: "Pick up to two.", kind: "multi", max: 2, options: SUCCESS_MET, other: "Something else" });
  }

  // ── Final details ───────────────────────────────────────────────────────────────────────
  if (role?.finalNote) {
    q.push({ id: role.finalNote.key, bucket: "role", section: "Last thing", ask: role.finalNote.label, placeholder: role.finalNote.placeholder, kind: "textarea" });
  } else {
    q.push({ id: "anythingElse", bucket: "top", section: "Last thing", ask: "Anything else I should know?", help: "Optional. Whatever did not fit a question above.", placeholder: "Context, quirks, a thing you have been meaning to fix, how you want to be kept in the loop...", kind: "textarea" });
  }
  q.push({ id: "agree", bucket: "top", section: "Build", ask: "That is everything. Ready to build?", kind: "confirm", required: true });

  return q;
}

/** Is a question answered? Empty strings and empty lists are not answers. */
export function isAnswered(q: Question, a: Answers): boolean {
  const v = q.bucket === "top" ? a.top[q.id] : a[q.bucket][q.id];
  if (q.kind === "confirm") return v === true;
  if (q.kind === "scale") return typeof v === "number" || (typeof v === "string" && v !== "");
  if (Array.isArray(v)) return v.length > 0;
  return typeof v === "string" ? v.trim() !== "" : v !== undefined && v !== null;
}

/** "Other" ticked, with the write-in in its place, for the answers that feed the agent's own
 *  instructions, where a bare "Other" tells it nothing. */
function withWriteIn(v: unknown, other: unknown): unknown {
  const w = typeof other === "string" ? other.trim() : "";
  if (!w) return v;
  if (Array.isArray(v)) return v.map((x) => (x === "Other" ? w : x));
  return v === "Other" ? w : v;
}

export type SignedInUser = { first: string; last: string; email: string };

/**
 * The payload /api/agent-setup expects: byte for byte the shape OnboardingForm's buildData()
 * sends in customer mode, so everything downstream reads it the same way. Keys the form sends
 * empty (differentiator, hatedTasks, the writing sample) are sent empty here too.
 */
export function toPayload(agentTypeId: string, a: Answers, user: SignedInUser | undefined): Record<string, unknown> {
  const role = roleIntakeFor(agentTypeId);
  const t = a.top;
  const scope = role?.coversScope;
  const roleAnswer = (key: string) => withWriteIn(a.role[key], a.role[`${key}_other`]);
  const industry = str(t.industry);
  const company = {
    name: str(t.companyName),
    industry,
    industryOther: str(t.industryOther),
    role: str(t.primaryRole),
    roleOther: "",
    ownership: "",
  };
  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "" : "";
  // The industry's take-on picks go back under the industry key too, so USER.md's industry
  // section reads as it did when the question lived on that page.
  const takeOn = role ? null : takeOnField(getIndustryBranch(industry));
  const goals = arr(t.aiGoals);
  const industryDetails = takeOn
    ? { ...a.ind, [takeOn.key]: goals.filter((g) => (takeOn.options ?? []).includes(g)) }
    : a.ind;
  return {
    firstName: user?.first ?? "",
    lastName: user?.last ?? "",
    email: user?.email ?? "",
    phone: "",
    companies: company.name || company.industry || company.role ? [company] : [],
    primaryCompanyIndex: 0,
    portfolio: {},
    industryDetails,
    ...(role ? { [role.detailsKey]: a.role } : {}),
    timezone: tz,
    bestTime: "",
    linkedin: "",
    companyName: company.name,
    primaryRole: company.role,
    primaryOwnership: "",
    website: str(t.website),
    webPresence: str(t.website),
    industry,
    companySize: str(t.companySize),
    businessAge: str(t.businessAge),
    keyPeople: [],
    businessDescription: role?.businessDescField ? a.role[role.businessDescField] : str(t.businessDescription),
    differentiator: "",
    crmTools: arr(t.crmTools),
    crmToolsOther: str(t.crmTools_other),
    commsTools: arr(t.commsTools),
    pmTools: arr(t.pmTools),
    billingTools: arr(t.billingTools),
    docsTools: arr(t.docsTools),
    docsToolsOther: str(t.docsTools_other),
    hatedTasks: "",
    partnerName: "",
    children: "",
    childrenDetails: "",
    household: "",
    strategicBet: str(t.strategicBet),
    growthBottleneck: arr(t.growthBottleneck),
    growthBottleneckOther: str(t.growthBottleneck_other),
    writingTone: arr(t.writingTone),
    brandVoiceLike: arr(t.brandVoiceLike),
    brandVoiceLikeOther: str(t.brandVoiceLike_other),
    voiceDescription: "",
    loveWords: "",
    hateWords: "",
    writingSample: "",
    autonomyLine: scope?.guard ? roleAnswer(scope.guard) : role?.standardGuard,
    aiGoals: scope ? roleAnswer(scope.owns) : arr(t.aiGoals),
    aiGoalsOther: str(t.aiGoals_other),
    successMetric: scope ? roleAnswer(scope.win) : arr(t.successMetric),
    successMetricOther: str(t.successMetric_other),
    priorAI: str(t.priorAI),
    aiTools: arr(t.aiTools),
    aiToolsOther: str(t.aiTools_other),
    aiProficiency: typeof t.aiProficiency === "number" ? t.aiProficiency : null,
    aiKeepProcesses: str(t.aiKeepProcesses),
    teamSentiment: str(t.teamSentiment),
    internalTech: str(t.internalTech),
    constraints: "",
    serviceRequests: [],
    serviceRequestsNotes: "",
    anythingElse: str(t.anythingElse),
  };
}

/**
 * Saved answers (a draft, or a finished questionnaire being edited) back into the three
 * buckets. The reverse of toPayload for the keys that round-trip; the form's own pre-fill does
 * the same thing with its own state (OnboardingForm's seed).
 */
export function fromPayload(agentTypeId: string, p: Record<string, unknown> | undefined, agentName?: string): Answers {
  if (!p) return { top: agentName ? { agentName } : {}, ind: {}, role: {} };
  const role = roleIntakeFor(agentTypeId);
  const companies = Array.isArray(p.companies) ? (p.companies as Array<Record<string, unknown>>) : [];
  const c = companies[Number(p.primaryCompanyIndex) || 0] ?? companies[0] ?? {};
  const top: Record<string, unknown> = {
    agentName: agentName ?? "",
    companyName: str(c.name) || str(p.companyName),
    industry: str(c.industry) || str(p.industry),
    industryOther: str(c.industryOther),
    primaryRole: (str(c.role) === "Other" ? str(c.roleOther) : str(c.role)) || str(p.primaryRole),
    website: str(p.webPresence) || str(p.website),
    companySize: str(p.companySize),
    businessAge: str(p.businessAge),
    businessDescription: role?.businessDescField ? "" : str(p.businessDescription),
    crmTools: arr(p.crmTools),
    crmTools_other: str(p.crmToolsOther),
    commsTools: arr(p.commsTools),
    pmTools: arr(p.pmTools),
    billingTools: arr(p.billingTools),
    docsTools: arr(p.docsTools),
    docsTools_other: str(p.docsToolsOther),
    strategicBet: str(p.strategicBet),
    growthBottleneck: arr(p.growthBottleneck),
    growthBottleneck_other: str(p.growthBottleneckOther),
    writingTone: arr(p.writingTone),
    brandVoiceLike: arr(p.brandVoiceLike),
    brandVoiceLike_other: str(p.brandVoiceLikeOther),
    aiGoals: role?.coversScope ? [] : arr(p.aiGoals),
    aiGoals_other: str(p.aiGoalsOther),
    successMetric: role?.coversScope ? [] : arr(p.successMetric),
    successMetric_other: str(p.successMetricOther),
    priorAI: str(p.priorAI),
    aiTools: arr(p.aiTools),
    aiTools_other: str(p.aiToolsOther),
    aiProficiency: typeof p.aiProficiency === "number" ? p.aiProficiency : undefined,
    aiKeepProcesses: str(p.aiKeepProcesses),
    teamSentiment: str(p.teamSentiment),
    internalTech: str(p.internalTech),
    anythingElse: str(p.anythingElse),
  };
  const blob = (v: unknown): Record<string, string | string[]> =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).filter(([, x]) => typeof x === "string" || Array.isArray(x))) as Record<string, string | string[]>
      : {};
  return {
    top,
    ind: blob(p.industryDetails),
    role: role ? blob(p[role.detailsKey]) : {},
  };
}

/** The agent's label, with "The " dropped for inline copy ("your CFO Agent"). */
export function inlineLabel(agentTypeId: string): string {
  const label = getAgentType(agentTypeId)?.label ?? "agent";
  return agentTypeId === LICENSE_AGENT_TYPE_ID ? "agent" : label.replace(/^The\s+/i, "");
}
