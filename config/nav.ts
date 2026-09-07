// Sections switched off for the WHOLE PRODUCT: every workspace, every user, every device.
//
// David's call, and the scope is the point. There is a per-person control in Settings > General
// that hides a row for one person on one device, which is a convenience. This is a different
// thing: a decision about what ApolloClaw ships with. A section named here is not in anyone's
// sidebar, and no customer setting can bring it back.
//
// The two compose in the only direction that makes sense. This one wins, and Settings stops
// offering a section it has taken away - a checkbox that cannot change anything is worse than no
// checkbox, because somebody will tick it and believe it worked.
//
// SAME SHAPE AS CHANNELS_ENABLED, deliberately: an env var read through a config module, so the
// decision is greppable and lives in one file rather than being spread across the components that
// happen to render a rail.
//
// WORTH KNOWING IF YOU SET IT: NEXT_PUBLIC_* is inlined at BUILD time, not read at runtime, so
// changing this in Vercel does nothing until the next deploy. That is the same caveat the
// channels flag carries, and it bites the same way.
//
// HIDING IS STILL NOT DISABLING. The routes keep working when typed or linked; this removes the
// way in from the rail, not the page. Anything that hard-blocks a route needs to say so at the
// route, not here.

/** Rows that can be hidden, by href, with the labels a person would actually type. */
export const HIDEABLE_NAV = [
  { href: "/dashboard/checklist", label: "Checklist" },
  { href: "/dashboard/integrations", label: "Connections" },
  { href: "/dashboard/schedule", label: "My Schedule" },
] as const;

/**
 * Resolve one entry from the env var to an href.
 *
 * Takes either the href or the label, case- and space-insensitively, because the person setting
 * this is typing into a Vercel form from memory: "Connections", "connections" and
 * "/dashboard/integrations" should all work, and "My Schedule" should not depend on the space.
 * An entry that matches nothing is ignored rather than throwing - a typo in an env var should
 * cost a section staying visible, not the dashboard failing to render.
 */
function resolve(entry: string): string | null {
  const want = entry.trim().toLowerCase().replace(/\s+/g, "");
  if (!want) return null;
  for (const item of HIDEABLE_NAV) {
    if (item.href.toLowerCase() === want) return item.href;
    if (item.label.toLowerCase().replace(/\s+/g, "") === want) return item.href;
  }
  return null;
}

/**
 * Hidden for everyone. Comma-separated, e.g. NEXT_PUBLIC_HIDDEN_NAV="Checklist,Connections".
 * Empty or unset means nothing is hidden, which is the shipping default.
 */
export const PLATFORM_HIDDEN_NAV: readonly string[] = Object.freeze(
  Array.from(
    new Set(
      (process.env.NEXT_PUBLIC_HIDDEN_NAV ?? "")
        .split(",")
        .map(resolve)
        .filter((h): h is string => h !== null)
    )
  )
);

/** True when this row is switched off product-wide. */
export function hiddenForEveryone(href: string): boolean {
  return PLATFORM_HIDDEN_NAV.includes(href);
}

/** The rows a person may still choose about: the hideable ones the platform has left in. */
export const PERSONALLY_HIDEABLE_NAV = HIDEABLE_NAV.filter((i) => !hiddenForEveryone(i.href));
