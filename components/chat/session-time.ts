// The timestamp on a thread row.
//
// The value comes from the instance's session list, and its UNIT IS NOT DOCUMENTED — some
// runtimes send seconds, some milliseconds. Sorting doesn't care, which is why this went
// unnoticed while it was only used for ordering; a printed date very much does. Rather than pick
// one and be wrong for half the fleet, normalise by magnitude, then sanity-check the result.
//
// Returns null rather than guessing. A row with no time is a small absence; a row confidently
// labelled "Jan 1970" or a date next year is the kind of wrong that makes someone distrust
// everything else on the screen.

/** Anything before this is a bad parse rather than an old conversation — the product is younger. */
const FLOOR = Date.UTC(2024, 0, 1);

export function toDate(value: number | null | undefined, now: number): Date | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  // Seconds-since-epoch is ~1.7e9 today; milliseconds is ~1.7e12. Nothing sane sits between.
  const ms = value < 1e12 ? value * 1000 : value;
  // A minute of slack: clock skew between us and the instance shouldn't blank the column.
  if (ms < FLOOR || ms > now + 60_000) return null;
  return new Date(ms);
}

/**
 * Short label for a rail row: the time today, "Yesterday" yesterday, a date before that.
 *
 * Mirrors how the mockup labels its chat list, and how anyone reads a message list — the hour
 * matters for something from this morning and not at all for something from last month.
 */
export function sessionTime(value: number | null | undefined, now: number = Date.now()): string | null {
  const date = toDate(value, now);
  if (!date) return null;

  const today = new Date(now);
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  if (sameDay) return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (wasYesterday) return "Yesterday";

  const sameYear = date.getFullYear() === today.getFullYear();
  return date.toLocaleDateString(
    undefined,
    sameYear ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" }
  );
}
