// A Telegram bot username to suggest to a customer creating their bot in BotFather.
//
// Telegram's rules: 5-32 characters, letters digits and underscores only, must end in "bot", and
// globally unique. The clean form of any name is usually taken already, so the suggestion carries
// a short tail, and a suggestion that gets rejected is worse than none.
//
// The tail is DERIVED FROM A SEED (an agent id, or the setup form's email), never random: a random
// tail would differ between the server and client renders and change on every re-render, which is
// no way to treat a value somebody is about to copy. The same seed gives the same four characters
// every time.
//
// Shared by the dashboard's channel setup (components/channels/pieces.tsx) and /setup, so both
// suggest names the same way.
export function suggestBotUsername(name: string | null | undefined, seed: string): string {
  const base = (name || "apollo").replace(/[^a-zA-Z0-9]/g, "").slice(0, 18) || "apollo";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const tail = h.toString(36).slice(0, 4).padStart(4, "0");
  return `${base}_${tail}_bot`;
}
