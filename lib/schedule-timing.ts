// When a schedule is due. Pure arithmetic, deliberately separated from lib/schedules.ts.
//
// This is the part most likely to be quietly wrong — weekday names, midnight, the last Sunday in
// March — and the part with no I/O in it. Splitting it out means it can be exercised directly
// rather than only by waiting until 8am and seeing what happens.

export interface ScheduleTiming {
  hour: number;
  days: string;
  timezone: string;
  enabled: boolean;
  last_run_on: string | null;
}

export interface LocalNow {
  /** YYYY-MM-DD in the schedule's own timezone. */
  date: string;
  /** 0-23, local. */
  hour: number;
  /** Lowercase English weekday name. */
  weekday: string;
}

/**
 * The local wall-clock date, hour and weekday in a given timezone.
 *
 * Done with Intl rather than offset arithmetic on purpose: it knows about DST, and every attempt
 * to do this by hand is correct until the clocks change.
 *
 * Returns null for a timezone Intl rejects. A bad row should be skipped, not throw once an hour
 * forever and take the whole sweep with it.
 */
export function localNow(timeZone: string, at: Date = new Date()): LocalNow | null {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      weekday: "long",
    }).formatToParts(at);

    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    const year = get("year");
    const hour = Number(get("hour"));
    const weekday = get("weekday").toLowerCase();
    if (!year || Number.isNaN(hour) || !weekday) return null;

    return {
      date: `${year}-${get("month")}-${get("day")}`,
      // Some locales render midnight as "24" under hour12: false.
      hour: hour % 24,
      weekday,
    };
  } catch {
    return null;
  }
}

const WEEKEND = new Set(["saturday", "sunday"]);

/** The weekday names dayMatches will accept as a "just this day" selection, in week order. */
export const WEEKDAY_NAMES = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

/**
 * Every value the `days` column may hold.
 *
 * ONE LIST, exported, because there were three of them and they disagreed. The API accepted
 * monday through friday, the timing logic here accepted any weekday name including the weekend,
 * and the dropdown offered three options. So a realtor who works Saturdays - which is most of
 * them, and Saturday is the day the showings happen - could not pick Saturday, even though both
 * the database and this file would have handled it perfectly. The narrowest of the three won by
 * accident rather than by decision.
 *
 * The UI renders from this, the API validates against it, and dayMatches implements it.
 */
export const SCHEDULE_DAYS = ["daily", "weekdays", "weekends", ...WEEKDAY_NAMES] as const;

export type ScheduleDays = (typeof SCHEDULE_DAYS)[number];

export function isScheduleDays(value: string): value is ScheduleDays {
  return (SCHEDULE_DAYS as readonly string[]).includes(value);
}

export function dayMatches(days: string, weekday: string): boolean {
  if (days === "daily") return true;
  if (days === "weekdays") return !WEEKEND.has(weekday);
  if (days === "weekends") return WEEKEND.has(weekday);
  // A specific day name, e.g. "monday" for a weekly planning session.
  return days === weekday;
}

/**
 * Is this schedule due right now?
 *
 * Conservative in one direction on purpose: a schedule that already ran today does not run again,
 * even if the cron fires twice or a retry lands. Two morning briefs is far more visible to a
 * customer than one arriving an hour late.
 *
 * The cost of that choice: an hour missed entirely — a cron outage spanning it — is skipped for
 * the day rather than caught up later. That is the right trade for a morning brief, which is
 * worthless at 2pm.
 */
export function isDue(row: ScheduleTiming, now: LocalNow | null = localNow(row.timezone)): boolean {
  if (!row.enabled) return false;
  if (!now) return false;
  if (now.hour !== row.hour) return false;
  if (!dayMatches(row.days, now.weekday)) return false;
  if (row.last_run_on === now.date) return false;
  return true;
}
