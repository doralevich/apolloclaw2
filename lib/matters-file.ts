import { MATTER_STATUSES, matterStatusLabel, type MatterStatus } from "@/config/matters";

// A matter row, and the markdown the agent reads.
//
// Split from lib/matters.ts for the same reason lib/listings-file.ts is split from lib/listings.ts:
// matters writes the file through injectAgentFile in lib/provision.ts, and provisioning needs to
// write an EMPTY version the moment a Law Agent is created, because USER.md points at it. Both
// directions are legitimate, so the shared half lives down here rather than one importing the other.
//
// Nothing here touches the database or the network, which is also why it can be tested directly.

export interface MatterRow {
  id: number;
  agent37_id: string;
  title: string;
  matter_number: string | null;
  client_name: string | null;
  practice_area: string | null;
  status: MatterStatus;
  jurisdiction: string | null;
  opposing_party: string | null;
  opened_on: string | null;
  next_action_on: string | null;
  next_action: string | null;
  closed_on: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * The file the agent reads.
 *
 * Grouped by status, and within a group sorted by the next action date rather than by when the
 * matter was opened. That ordering is the document's opinion: what the agent is asked about is
 * almost always what is due next, and a list sorted by age buries the filing due Thursday under
 * six matters opened last year.
 *
 * Dates in full rather than as "in 3 days", since relative time in a file written at noon is
 * wrong by evening and this file is read for days between rewrites.
 */
export function buildMattersMd(rows: MatterRow[], generatedAt = new Date()): string {
  const out: string[] = [
    `# Matters`,
    ``,
    `The open matters in this practice, from the Matters page in the dashboard. This is ground` +
      ` truth: when you are asked about "my matters", "the file" or a deadline, these are them.`,
    ``,
    `Last updated ${generatedAt.toISOString().slice(0, 10)}. If the owner says something here is` +
      ` out of date, believe them and say it needs changing on the Matters page - you cannot edit` +
      ` this file yourself.`,
    ``,
    `This is an INDEX, not a case file. It holds who, what kind and what is due. Nothing here is` +
      ` the substance of a matter or anybody's advice on one, so do not treat a thin entry as a` +
      ` sign that little is happening, and do not write privileged detail back into it.`,
    ``,
  ];

  if (!rows.length) {
    out.push(
      `Nothing here yet. The owner has not added any matters, so if they ask about "my matters",` +
        ` say the list is empty rather than guessing, and point them at the Matters page in the` +
        ` dashboard.`,
      ``
    );
    return out.join("\n");
  }

  // Soonest deadline first, and matters with no date after the ones that have one: an undated
  // matter is not urgent by default, and sorting it to the top would push a real deadline down.
  const byDeadline = (a: MatterRow, b: MatterRow) => {
    if (a.next_action_on && b.next_action_on) return a.next_action_on < b.next_action_on ? -1 : 1;
    if (a.next_action_on) return -1;
    if (b.next_action_on) return 1;
    return 0;
  };

  for (const status of MATTER_STATUSES) {
    const group = rows.filter((r) => r.status === status).sort(byDeadline);
    if (!group.length) continue;

    out.push(`## ${matterStatusLabel(status)} (${group.length})`, ``);
    for (const row of group) {
      const facts = [
        row.matter_number ? `ref ${row.matter_number}` : null,
        row.client_name ? `client: ${row.client_name}` : null,
        row.practice_area,
        row.jurisdiction ? `governed by ${row.jurisdiction}` : null,
        row.opposing_party ? `against ${row.opposing_party}` : null,
      ].filter(Boolean);

      out.push(`### ${row.title}`);
      if (facts.length) out.push(facts.join(" | "));

      // The next action gets its own line rather than joining the facts. It is the single most
      // asked-about thing in this file, and burying it in a pipe-separated run is how it gets
      // skimmed past.
      if (row.next_action_on || row.next_action) {
        const due = row.next_action_on ? `by ${row.next_action_on}` : "no date set";
        out.push(`**Next: ${row.next_action ?? "not specified"} (${due})**`);
      }

      const dates = [
        row.opened_on ? `opened ${row.opened_on}` : null,
        row.closed_on ? `closed ${row.closed_on}` : null,
      ].filter(Boolean);
      if (dates.length) out.push(dates.join(" | "));

      if (row.notes?.trim()) out.push(``, row.notes.trim());
      out.push(``);
    }
  }

  return out.join("\n");
}
