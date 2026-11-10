/**
 * The agent's boundaries line (`autonomyLine`, read into the Boundaries section by
 * lib/agent-files.ts), from a role's guard answer and its fixed `standardGuard`.
 *
 * Most roles have one or the other. Marketing and Recruiting have both since Nov 10, 2026: they
 * still ask how far the agent may go (publish, or screen applicants), and their "check with me
 * first" list became fixed. Then the owner's answer comes first and the fixed list follows it.
 * With no fixed line the answer passes through untouched, exactly as before.
 */
export function guardLine(answer: unknown, standard?: string): unknown {
  if (!standard) return answer;
  const said = Array.isArray(answer)
    ? answer.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((x) => x.trim()).join(", ")
    : typeof answer === "string"
      ? answer.trim()
      : "";
  if (!said) return standard;
  return `${said.replace(/[.\s]+$/, "")}. ${standard}`;
}
