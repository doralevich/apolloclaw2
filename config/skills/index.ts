// The skills we install on every agent at provision time, and the file format they ship in.
//
// A stock OpenClaw box already carries 50+ built-ins — diagram-maker, notion, debuggers,
// taskflow. It is not short of capability. What it has no opinion about is how to do the jobs
// this product is sold on, and how to THINK about a decision before answering. Those are the two
// things here.
//
// HOW THEY GET THERE. OpenClaw discovers skills on its own from $OPENCLAW_STATE_DIR/plugin-skills
// — a directory per skill, each holding a SKILL.md — and lists them in the session's
// available_skills. There is no index to maintain: lib/provision.ts writes the files and the
// runtime finds them.
//
// WHAT A SKILL IS, AND ISN'T. A skill is a document the agent consults when it judges the skill
// relevant. It has no trigger and no schedule. So "give me a pre-mortem on this launch" is a
// skill; "brief me every morning at 8" is a scheduled job and belongs somewhere else entirely.
// Writing the second as a skill produces a file that reads well and never fires.

import { PROCEDURE_SKILLS } from "@/config/skills/procedures";
import { REASONING_SKILLS } from "@/config/skills/reasoning";
import { MENTAL_MODEL_SKILLS } from "@/config/skills/mental-models";
import { EXECUTIVE_SKILLS } from "@/config/skills/executive";
import { SALES_SKILLS } from "@/config/skills/sales";
import { WRITING_SKILLS } from "@/config/skills/writing";

export type AgentSkill = {
  /** Directory name under plugin-skills, and the name the runtime lists it under. */
  slug: string;
  /** One line. This is what the agent sees when deciding whether the skill applies. */
  description: string;
  /** Shown beside the skill in OpenClaw's own listings. */
  emoji: string;
  /** The body of SKILL.md, below the frontmatter. */
  body: string;
};

/**
 * SKILL.md as the runtime expects it, copied from a real installed skill rather than guessed:
 *
 *   ---
 *   name: slack
 *   description: "Slack tool actions: send/read/edit/delete messages, react, pin/unpin, …"
 *   metadata: { "openclaw": { "emoji": "💬" } }
 *   ---
 *
 *   # Slack
 *   …
 *
 * THE DESCRIPTION IS QUOTED, and that is not cosmetic. Plenty of ours contain a colon, and a
 * colon in an unquoted YAML scalar either fails the parse or truncates the value at that point —
 * either way the file lands looking fine and the runtime sees a skill with half a description or
 * none. Enforced here rather than left to whoever writes the next skill to remember.
 */
export function skillFile(skill: AgentSkill): string {
  return [
    `---`,
    `name: ${skill.slug}`,
    `description: ${yamlQuote(skill.description)}`,
    `metadata: { "openclaw": { "emoji": ${JSON.stringify(skill.emoji)} } }`,
    `---`,
    ``,
    skill.body.trim(),
    ``,
  ].join("\n");
}

/** A double-quoted YAML scalar. JSON string escaping is a valid subset, so this is exact. */
function yamlQuote(value: string): string {
  return JSON.stringify(value);
}

/**
 * The same skills, kept in their families — for showing a customer what their agent can do.
 *
 * The flat list below is what gets installed; this is what gets read. They come from one place
 * so a skill can never be installed and missing from the list, or listed and never installed.
 *
 * The blurbs answer "why would I care", which is a different question from the `description`
 * field on each skill — that one is written for the runtime deciding whether a skill applies,
 * and reads like a trigger because that is its job.
 */
export type SkillFamily = { title: string; blurb: string; skills: AgentSkill[] };

export const SKILL_FAMILIES: SkillFamily[] = [
  {
    title: "Running the business",
    blurb: "The jobs that come round every week, done the same way each time.",
    skills: PROCEDURE_SKILLS,
  },
  {
    title: "How it thinks",
    blurb: "Method, not knowledge. This is what makes an answer feel like a colleague's.",
    skills: REASONING_SKILLS,
  },
  {
    title: "Mental models",
    blurb: "Frames worth reaching for when a decision is genuinely hard.",
    skills: MENTAL_MODEL_SKILLS,
  },
  {
    title: "The C-suite you don't have",
    blurb: "Finance, operations, people — the questions a bigger company has someone for.",
    skills: EXECUTIVE_SKILLS,
  },
  {
    title: "Winning work",
    blurb: "Proposals, pricing, follow-up. Every one of these ends with you deciding.",
    skills: SALES_SKILLS,
  },
  {
    title: "Writing as you",
    blurb: "Your voice, from what you told us at setup.",
    skills: WRITING_SKILLS,
  },
];

export const AGENT_SKILLS: AgentSkill[] = SKILL_FAMILIES.flatMap((f) => f.skills);

// Two skills sharing a slug would silently overwrite each other on the box — same directory, last
// write wins — and the loss would show up as "why does the agent never use X". Cheap to catch at
// module load, where it fails the build instead of a customer's agent.
const seen = new Set<string>();
for (const skill of AGENT_SKILLS) {
  if (seen.has(skill.slug)) throw new Error(`Duplicate skill slug: ${skill.slug}`);
  seen.add(skill.slug);
}
