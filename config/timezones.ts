// WHERE THE CUSTOMER IS IN TIME, in one place.
//
// AGENTS.md carries a "Their day" section built from answers.timezone, and it tells the agent
// that "today" means today where the customer is and to trust that line over the box clock.
// Until the onboarding gate started asking, nothing ever collected the answer, so that
// instruction shipped blank on every agent while half the skills we sell are time-shaped - the
// daily brief, the end-of-day summary, the weekly plan, every follow-up with "by Thursday" in it.
// applyInstanceDefaults reads the same key to set the box clock, so that step never ran either.
//
// Two surfaces offer this list now - the onboarding gate a customer fills in, and the admin
// control that corrects an agent set up before the question existed. They must not drift, which
// is the whole reason this is a module and not a literal in a component.
//
// Values are IANA ids because that is what Intl and /etc/localtime need; labels are what
// somebody actually calls the zone they live in. US zones first because that is who buys, then
// the rest of the common list. A zone we have not listed still works: both surfaces append one
// that is missing rather than forcing somebody in Lisbon to claim London.

export type TimezoneOption = { value: string; label: string };

export const TIMEZONES: TimezoneOption[] = [
  { value: "America/New_York", label: "Eastern - New York" },
  { value: "America/Chicago", label: "Central - Chicago" },
  { value: "America/Denver", label: "Mountain - Denver" },
  { value: "America/Phoenix", label: "Mountain, no DST - Phoenix" },
  { value: "America/Los_Angeles", label: "Pacific - Los Angeles" },
  { value: "America/Anchorage", label: "Alaska - Anchorage" },
  { value: "Pacific/Honolulu", label: "Hawaii - Honolulu" },
  { value: "America/Toronto", label: "Eastern - Toronto" },
  { value: "America/Vancouver", label: "Pacific - Vancouver" },
  { value: "America/Mexico_City", label: "Central - Mexico City" },
  { value: "America/Sao_Paulo", label: "Brasilia - Sao Paulo" },
  { value: "Europe/London", label: "UK - London" },
  { value: "Europe/Dublin", label: "Ireland - Dublin" },
  { value: "Europe/Paris", label: "Central European - Paris" },
  { value: "Europe/Berlin", label: "Central European - Berlin" },
  { value: "Europe/Madrid", label: "Central European - Madrid" },
  { value: "Europe/Athens", label: "Eastern European - Athens" },
  { value: "Asia/Dubai", label: "Gulf - Dubai" },
  { value: "Asia/Kolkata", label: "India - Kolkata" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Tokyo", label: "Japan - Tokyo" },
  { value: "Australia/Sydney", label: "Eastern - Sydney" },
  { value: "Australia/Perth", label: "Western - Perth" },
  { value: "Pacific/Auckland", label: "New Zealand - Auckland" },
];

/** The list, with `tz` appended when it is a real zone we do not carry. Both surfaces need this:
 *  a customer whose browser reports an unlisted zone, and an admin looking at an agent already
 *  set to one. */
export function timezoneOptions(tz?: string | null): TimezoneOption[] {
  if (!tz || TIMEZONES.some((t) => t.value === tz)) return TIMEZONES;
  return [...TIMEZONES, { value: tz, label: tz }];
}
