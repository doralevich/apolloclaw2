import "server-only";
import { CONTEXT_FILENAME } from "@/config/agent-workspace";

// The files an OpenClaw agent auto-loads, generated from the setup questionnaire.
//
// OpenClaw reads eight files out of its workspace at session start — SOUL, AGENTS, USER,
// TOOLS, IDENTITY, HEARTBEAT, BOOTSTRAP, MEMORY. We used to fill in exactly one of them
// (USER.md, the owner profile) and let the template's generic text stand for the rest. So
// every Apollo agent knew who its owner was and nothing about how to work for them: same
// operating instructions, same assumed tool stack, same voice, whether it was serving a law
// firm or a warehouse.
//
// The questionnaire already asks all of it. This turns those answers into three more of the
// eight:
//
//   AGENTS.md    how to work for this owner — priorities, voice, boundaries
//   TOOLS.md     the stack they actually run
//   IDENTITY.md  who this agent is and who it serves
//
// SOUL.md is ours too, but it doesn't come from the questionnaire so it isn't built here:
// lib/provision.ts writes the persona from config/personas.ts, then merges a pointer block
// into the same file. Five of the eight are ours in total.
//
// The remaining three stay the runtime's or the template's:
//   MEMORY.md    what the agent learns — never ours to write
//   HEARTBEAT.md, BOOTSTRAP.md  runtime mechanics, nothing to do with the customer
//
// Everything here goes in a fence. The agent is free to write in these files between
// sessions and keep what it writes; only the block between our markers is replaced when the
// customer updates their answers.
//
// Hermes loads a subset (SOUL, AGENTS, USER, MEMORY), so AGENTS.md lands there too and the
// extra files sit harmlessly unread. OpenClaw is the default — David's call, on the strength
// of using both — and this is written for its layout.

// ─── Reading answers ──────────────────────────────────────────────────────────

/** A questionnaire answer as a single trimmed line, or undefined if they skipped it. */
function str(v: unknown): string | undefined {
  if (typeof v === "string") return v.trim() || undefined;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    const items = v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
    return items.length ? items.join(", ") : undefined;
  }
  return undefined;
}

/** `- **Label** — value`, dropped entirely when the answer is empty. Empty bullets read as
 *  "we asked and they had nothing to say", which is not what a blank field means. */
function bullet(label: string, v: unknown): string | null {
  const value = str(v);
  return value ? `- **${label}** - ${value}` : null;
}

/** Swap the literal "Other" out of a multi-select answer for the write-in it stands for.
 *  An agent told its owner sounds like "Other" has learned nothing. */
function withWriteIn(v: unknown, other: unknown): unknown {
  const write = str(other);
  if (!write) return v;
  const list = Array.isArray(v) ? v : typeof v === "string" && v ? [v] : [];
  if (!list.includes("Other")) return v;
  return list.map((x) => (x === "Other" ? write : x));
}

function section(heading: string, lines: (string | null)[], lead?: string): string[] {
  const kept = lines.filter((l): l is string => !!l);
  if (!kept.length) return [];
  return [`## ${heading}`, ``, ...(lead ? [lead, ``] : []), ...kept, ``];
}

// ─── AGENTS.md ────────────────────────────────────────────────────────────────

/**
 * How to work for this particular owner.
 *
 * Not a data dump — USER.md already holds every answer verbatim. This is the subset that
 * changes the agent's BEHAVIOUR: what to push on, how to sound, what not to touch.
 */
export function buildAgentsMd(answers: Record<string, unknown>, contextSummary?: string): string {
  const company = str(answers.companyName);
  const owner = [str(answers.firstName), str(answers.lastName)].filter(Boolean).join(" ");
  const what = str(answers.businessDescription);

  const out: string[] = [
    `# Working for ${company || "your owner"}`,
    ``,
    owner || company
      ? `You work for ${owner || "the owner"}${company ? ` at ${company}` : ""}.${
          what ? ` ${what}` : ""
        }`
      : `Written from your owner's setup questionnaire.`,
    ``,
    `This file is how to work for them. USER.md is who they are; read both.`,
    ``,
  ];

  out.push(
    ...section(
      "What to push on",
      [
        bullet("The problem they hired you for", answers.mainPain),
        bullet("What they want most in the next 12 months", answers.strategicBet),
        bullet("What's holding growth back", answers.growthBottleneck),
        bullet("Work they hate doing", answers.hatedTasks),
        bullet("Hours a week lost to manual work", answers.manualHours),
        bullet("Parts of the business that are breaking", answers.brokenAreas),
        bullet("How they'll judge whether you're working", answers.successMetric),
        bullet("What they want from an AI agent", answers.aiGoals),
      ],
      `Bias your attention here. When you have a choice about what to raise, raise these.`
    )
  );

  out.push(
    ...section(
      "How to sound",
      [
        bullet("Tone", answers.writingTone),
        bullet("How they'd describe their voice", answers.voiceDescription),
        bullet("Brands whose voice they like", withWriteIn(answers.brandVoiceLike, answers.brandVoiceLikeOther)),
        bullet("Words and phrases they like", answers.loveWords),
        bullet("Words and styles they hate", answers.hateWords),
        bullet("Their comfort writing themselves", answers.writingComfort),
        bullet("Where they post", answers.platforms),
      ],
      `Anything you draft in their name follows this. The words they hate are a hard rule, not` +
        ` a preference.`
    )
  );

  const sample = str(answers.writingSample);
  if (sample) {
    out.push(
      `### How they write`,
      ``,
      `A sample they gave us. Match this rhythm when you write as them:`,
      ``,
      `> ${sample.replace(/\n+/g, "\n> ")}`,
      ``
    );
  }

  out.push(
    ...section(
      "How they decide",
      [
        bullet("Decision style", answers.decisionStyle),
        bullet("Under pressure", answers.stressResponse),
        bullet("What motivates them", answers.motivators),
        bullet("What gets in their own way", answers.blockers),
        bullet("How they think about money", answers.moneyMindset),
        bullet("Trust in technology (1–10)", answers.techTrust),
        bullet("Comfort handing over control (1–10)", answers.controlComfort),
        bullet("Past experience with agencies", answers.agencyHistory),
        bullet("Past experience with AI", answers.pastExperience),
      ],
      `Read the room with this. A low control-comfort score means propose and wait; a high one` +
        ` means act and report.`
    )
  );

  out.push(
    ...section(
      "Boundaries",
      [
        bullet("Compliance they're under", answers.compliance),
        bullet("Sensitive data in the business", answers.dataTypes),
        bullet("Security measures in place", answers.securityMeasures),
        bullet("Stated constraints", answers.constraints),
        bullet("Who signs off on decisions", answers.decisionAuthority),
        bullet("In-house technical help", answers.internalTech),
      ],
      `Treat these as limits on what you do unprompted, not trivia. If a task would touch` +
        ` regulated data or commit money, say what you're about to do and wait to be told yes.`
    )
  );

  out.push(
    ...section("Life around the work", [
      bullet("Family", [str(answers.maritalStatus), str(answers.children)].filter(Boolean).join("; ")),
      bullet("Children's ages", answers.childrenAges),
      bullet("Caregiving", answers.caretaking),
      bullet("Home and work setup", answers.homeLife),
      bullet("What they're protecting", answers.protecting),
      bullet("Where they are in life", answers.lifeStage),
      bullet("Three-year goals", answers.threeYearGoals),
      bullet("What makes it worth it", answers.worthIt),
    ], `They told us this so you'd hold it, not so you'd bring it up. Let it shape your timing and` +
      ` your judgement about what's urgent.`)
  );

  // Only claim something is written down when it is. A near-empty questionnaire producing a
  // file that insists "it's written down" is the exact failure this whole line of work exists
  // to stop — an agent confidently pointing at nothing.
  const wroteSomething = out.some((line) => line.startsWith("- **"));

  out.push(
    `## Where to look`,
    ``,
    `- **USER.md** - every answer they gave, in full. Ground truth about them.`,
    ...(contextSummary
      ? [`- **${CONTEXT_FILENAME}** - ${contextSummary}, in their own words. Read it before you` +
         ` guess at what they sell or how they describe themselves.`]
      : []),
    `- **TOOLS.md** - the software their business runs on.`,
    ``,
    wroteSomething
      ? `Never tell them you don't know who they are or what they do. It's written down.`
      : `They skipped most of the questionnaire, so there is less here than usual. Ask them` +
        ` directly rather than guessing, and write what you learn outside this block.`
  );

  return out.join("\n");
}

// ─── TOOLS.md ─────────────────────────────────────────────────────────────────

/**
 * The stack the business actually runs on.
 *
 * With the honest caveat attached: this is what they SAID they use, not what you have been
 * wired into. An agent that assumes it can post to a CRM because the CRM is named here will
 * promise something it cannot do — which is worse than asking.
 */
export function buildToolsMd(answers: Record<string, unknown>): string {
  const rows = [
    bullet("Website platform", answers.webPlatform),
    bullet("CRM", [str(answers.crmTools), str(answers.crmToolsOther)].filter(Boolean).join(", ")),
    bullet("E-commerce", answers.ecomTools),
    bullet("Communications", answers.commsTools),
    bullet("Project management", answers.pmTools),
    bullet("Billing and invoicing", answers.billingTools),
    bullet("Marketing", answers.mktgTools),
    bullet("Automation", answers.autoTools),
    bullet("Support and helpdesk", answers.supportTools),
    bullet("Hosting / cloud", answers.hosting),
    bullet("Operating system", answers.os),
  ].filter((r): r is string => !!r);

  if (!rows.length) {
    return [
      `# Their stack`,
      ``,
      `Your owner didn't list the software they use during setup. Ask before assuming anything` +
        ` about their tools - and write what you learn below, outside this block.`,
    ].join("\n");
  }

  return [
    `# Their stack`,
    ``,
    `The software ${str(answers.companyName) || "your owner's business"} runs on, from their`,
    `setup questionnaire.`,
    ``,
    ...rows,
    ``,
    `## What this list is and isn't`,
    ``,
    `This is what they told us they use. It is NOT a list of things you are connected to.`,
    `Unless you have been given a working integration or credentials, you cannot read from or`,
    `write to any of it.`,
    ``,
    `So: use these names to talk about their business the way they do - reference their actual`,
    `CRM, not "your CRM" - and ask before promising to do anything inside one of them.`,
  ].join("\n");
}

// ─── IDENTITY.md ──────────────────────────────────────────────────────────────

/** Who this agent is. Short by design: the persona lives in SOUL.md. */
export function buildIdentityMd(
  agentName: string | undefined,
  answers: Record<string, unknown>
): string {
  const name = agentName?.trim();
  const company = str(answers.companyName);
  const owner = [str(answers.firstName), str(answers.lastName)].filter(Boolean).join(" ");
  const role = str(answers.primaryRole);

  return [
    `# Who you are`,
    ``,
    name
      ? `Your name is **${name}**. Your owner chose it - use it when you introduce yourself.`
      : `Your owner didn't name you during setup. If they call you something, take it.`,
    ``,
    `You are a private AI agent. You serve ${owner || "your owner"}${
      role && company ? `, ${role} at ${company}` : company ? ` at ${company}` : ""
    } - one person and one business, not a general assistant and not a product with other`,
    `users. Nothing you know about them goes anywhere else.`,
    ``,
    `You were built by ApolloClaw from a questionnaire your owner filled out. That's where`,
    `USER.md, AGENTS.md and TOOLS.md came from, and why you knew who they were before they`,
    `told you.`,
  ].join("\n");
}
