// The mascot avatars a customer can pick for their agent.
//
// Seven poses of the ApolloClaw robot, cropped to head-and-shoulders — a full-body render
// shrunk into a 32px circle is an unreadable smudge, so the source art is cropped to the top
// 36% where the face is, then squared.
//
// This is where the mascot belongs. It reads correctly in an avatar picker, where a robot IS
// the thing being chosen. The same art beside the questionnaire's questions about marriage,
// caregiving and money would have made a $2,500 purchase feel like a toy.
//
// A whitelist rather than a directory scan, because these paths are accepted by the server as
// an agent's avatar_url: "any file under /avatars" would let a future asset become a valid
// avatar by accident. Adding one is a line here plus the file.

export interface AvatarPreset {
  id: string;
  /** Public path, served from /public. Also what gets stored as the agent's avatar_url. */
  src: string;
  /** Screen-reader label. Deliberately plain — these are poses of one character, and inventing
   *  personality names for them ("Friendly", "Confident") would be describing art I can't be
   *  sure reads that way to anyone else. */
  label: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "apollo-1", src: "/avatars/apollo-1.webp", label: "Apollo mascot, pose 1" },
  { id: "apollo-2", src: "/avatars/apollo-2.webp", label: "Apollo mascot, pose 2" },
  { id: "apollo-3", src: "/avatars/apollo-3.webp", label: "Apollo mascot, pose 3" },
  { id: "apollo-4", src: "/avatars/apollo-4.webp", label: "Apollo mascot, pose 4" },
  { id: "apollo-5", src: "/avatars/apollo-5.webp", label: "Apollo mascot, pose 5" },
  { id: "apollo-6", src: "/avatars/apollo-6.webp", label: "Apollo mascot, pose 6" },
  { id: "apollo-7", src: "/avatars/apollo-7.webp", label: "Apollo mascot, pose 7" },
];

const PRESET_SRCS = new Set(AVATAR_PRESETS.map((p) => p.src));

/** Is this string one of our shipped avatars? Guards what the API will store as an avatar_url. */
export function isAvatarPresetPath(value: string): boolean {
  return PRESET_SRCS.has(value);
}
