// A Telegram bot username to suggest to a customer creating their bot in BotFather, in the form
// apollo_agent_<name>_<three digits>_bot (David, Oct 4 2026: "something normal, like
// apollo_agent_NAME_001").
//
// Telegram's rules: 5-32 characters, letters digits and underscores only, must end in "bot", and
// globally unique. A fixed "001" would collide the second time two customers both call their
// agent Nova, so the three digits come from a SEED (an agent id, or the setup form's email): the
// same seed gives the same number every time, and different customers get different ones. Never
// random: a random number would differ between the server and client renders and change on every
// re-render, which is no way to treat a value somebody is about to copy.
//
// Used by the dashboard's channel setup (components/channels/pieces.tsx) and /setup.
const PREFIX = "apollo_agent_";
const SUFFIX_LEN = "_000_bot".length;
const MAX_LEN = 32;

export function suggestBotUsername(name: string | null | undefined, seed: string): string {
  const room = MAX_LEN - PREFIX.length - SUFFIX_LEN;
  const base =
    (name || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, room) || "assistant".slice(0, room);
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const num = String((h % 999) + 1).padStart(3, "0");
  return `${PREFIX}${base}_${num}_bot`;
}
