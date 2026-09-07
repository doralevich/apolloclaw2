// How a custom report is named and recognised. Split out of lib/schedules.ts for one reason:
// that file is `server-only` (it holds the sweep, the delivery and the database client), and the
// dashboard needs this half to tell a report it has already saved from one still on offer.
//
// The alternative was a second slugify in the component, which is the drift bug this codebase
// keeps warning about: two functions that agree today, and a row the UI cannot find tomorrow.

/** Custom rows are identified by their skill prefix alone, so the sweep, the API guard and the UI
 *  can all recognise one without reading the prompt. The database enforces the pairing. */
export const CUSTOM_PREFIX = "custom:";

export function isCustomSchedule(skill: string): boolean {
  return skill.startsWith(CUSTOM_PREFIX);
}

/** A title to a stable skill key. Lowercase, hyphenated, trimmed to something a column and a URL
 *  can both hold. Two reports with the same name collide on the unique constraint, which is the
 *  intended answer rather than a bug: they are the same report. */
export function customSkillKey(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${CUSTOM_PREFIX}${slug}`;
}
