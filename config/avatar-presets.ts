// The pictures a customer can pick for their agent.
//
// Forty portraits, replacing the seven mascot poses that were here. The mascot read correctly in
// a picker - a robot IS the thing being chosen - but it gave every agent the same face, and a
// business that has named its agent and told it how it writes wants it to look like somebody
// rather than like our logo. The mascot still owns the marketing site and the app icon.
//
// NOTHING IS SELECTED BY DEFAULT. An agent with no picture shows its initial, and the picker is
// one click away. This briefly fell back to the mascot, which was wrong in a way worth naming:
// it made every unconfigured agent look like it had been given a face, so the picker's selected
// ring was the only thing separating "chose the mascot" from "chose nothing".
//
// A whitelist rather than a directory scan, because these paths are accepted by the server as an
// agent's avatar_url: "any file under /avatars" would let a future asset become a valid avatar by
// accident. Adding one is a line here plus the file.

export interface AvatarPreset {
  id: string;
  /** Public path, served from /public. Also what gets stored as the agent's avatar_url. */
  src: string;
  /**
   * Screen-reader label. Deliberately just a number.
   *
   * The alternative is describing the person in the photograph, and there is no version of that
   * which is both useful and appropriate - naming apparent age, race or gender to label a
   * picker option is exactly the kind of guess software should not be making out loud.
   */
  label: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "person-1", src: "/avatars/people/person-1.webp", label: "Portrait 1" },
  { id: "person-2", src: "/avatars/people/person-2.webp", label: "Portrait 2" },
  { id: "person-3", src: "/avatars/people/person-3.webp", label: "Portrait 3" },
  { id: "person-4", src: "/avatars/people/person-4.webp", label: "Portrait 4" },
  { id: "person-5", src: "/avatars/people/person-5.webp", label: "Portrait 5" },
  { id: "person-6", src: "/avatars/people/person-6.webp", label: "Portrait 6" },
  { id: "person-7", src: "/avatars/people/person-7.webp", label: "Portrait 7" },
  { id: "person-8", src: "/avatars/people/person-8.webp", label: "Portrait 8" },
  { id: "person-9", src: "/avatars/people/person-9.webp", label: "Portrait 9" },
  { id: "person-10", src: "/avatars/people/person-10.webp", label: "Portrait 10" },
  { id: "person-11", src: "/avatars/people/person-11.webp", label: "Portrait 11" },
  { id: "person-12", src: "/avatars/people/person-12.webp", label: "Portrait 12" },
  { id: "person-13", src: "/avatars/people/person-13.webp", label: "Portrait 13" },
  { id: "person-14", src: "/avatars/people/person-14.webp", label: "Portrait 14" },
  { id: "person-15", src: "/avatars/people/person-15.webp", label: "Portrait 15" },
  { id: "person-16", src: "/avatars/people/person-16.webp", label: "Portrait 16" },
  { id: "person-17", src: "/avatars/people/person-17.webp", label: "Portrait 17" },
  { id: "person-18", src: "/avatars/people/person-18.webp", label: "Portrait 18" },
  { id: "person-19", src: "/avatars/people/person-19.webp", label: "Portrait 19" },
  { id: "person-20", src: "/avatars/people/person-20.webp", label: "Portrait 20" },
  { id: "person-21", src: "/avatars/people/person-21.webp", label: "Portrait 21" },
  { id: "person-22", src: "/avatars/people/person-22.webp", label: "Portrait 22" },
  { id: "person-23", src: "/avatars/people/person-23.webp", label: "Portrait 23" },
  { id: "person-24", src: "/avatars/people/person-24.webp", label: "Portrait 24" },
  { id: "person-25", src: "/avatars/people/person-25.webp", label: "Portrait 25" },
  { id: "person-26", src: "/avatars/people/person-26.webp", label: "Portrait 26" },
  { id: "person-27", src: "/avatars/people/person-27.webp", label: "Portrait 27" },
  { id: "person-28", src: "/avatars/people/person-28.webp", label: "Portrait 28" },
  { id: "person-29", src: "/avatars/people/person-29.webp", label: "Portrait 29" },
  { id: "person-30", src: "/avatars/people/person-30.webp", label: "Portrait 30" },
  { id: "person-31", src: "/avatars/people/person-31.webp", label: "Portrait 31" },
  { id: "person-32", src: "/avatars/people/person-32.webp", label: "Portrait 32" },
  { id: "person-33", src: "/avatars/people/person-33.webp", label: "Portrait 33" },
  { id: "person-34", src: "/avatars/people/person-34.webp", label: "Portrait 34" },
  { id: "person-35", src: "/avatars/people/person-35.webp", label: "Portrait 35" },
  { id: "person-36", src: "/avatars/people/person-36.webp", label: "Portrait 36" },
  { id: "person-37", src: "/avatars/people/person-37.webp", label: "Portrait 37" },
  { id: "person-38", src: "/avatars/people/person-38.webp", label: "Portrait 38" },
  { id: "person-39", src: "/avatars/people/person-39.webp", label: "Portrait 39" },
  { id: "person-40", src: "/avatars/people/person-40.webp", label: "Portrait 40" },
];

/**
 * Retired presets, still valid so they still render.
 *
 * The mascot poses are no longer offered, but agents that picked one carry that path in
 * avatar_url. Dropping them from the whitelist entirely would fail isAvatarPresetPath and blank
 * the picture of every customer who chose one - so they stay accepted, just not offered. The
 * files stay in /public for the same reason.
 */
const LEGACY_PRESET_SRCS = [
  "/avatars/apollo-1.webp",
  "/avatars/apollo-2.webp",
  "/avatars/apollo-3.webp",
  "/avatars/apollo-4.webp",
  "/avatars/apollo-5.webp",
  "/avatars/apollo-6.webp",
  "/avatars/apollo-7.webp",
  "/avatars/ac-guy-full.png",
];

const PRESET_SRCS = new Set([...AVATAR_PRESETS.map((p) => p.src), ...LEGACY_PRESET_SRCS]);

/** Is this string one of our shipped avatars? Guards what the API will store as an avatar_url. */
export function isAvatarPresetPath(value: string): boolean {
  return PRESET_SRCS.has(value);
}
