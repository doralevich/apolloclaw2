import { CHANNELS } from "@/config/channels";
import { composioLogoUrl } from "@/lib/integration-catalog";
import type { ChannelId } from "@/lib/types";

// The three shelves on Start Here: where the agent answers you, and what it can reach.
//
// This is a SHORTCUT SURFACE, not a second setup screen. Every tile links to the page that
// actually does the work — Channels for the chat apps, Connections for the toolkits — and shows
// nothing but a logo, a name, and whether it's on. The point is that the first screen after
// provisioning names the specific apps a small business already has, instead of saying "connect
// your tools" and leaving the customer to guess which ones matter.
//
// Deliberately short. These twelve are the ones that change what an agent can do on day one;
// the full catalogue of eighty is one click away and belongs there, not here.

export type SetupTile =
  /** A chat channel — status comes from /api/agents/{id}/channels. */
  | { kind: "channel"; id: ChannelId; name: string; logo: string }
  /** A Composio toolkit — status comes from /api/agents/{id}/integrations/connections. */
  | { kind: "toolkit"; slug: string; name: string; logo: string };

export type SetupRow = {
  title: string;
  blurb: string;
  /** Where a tile in this row takes you. */
  href: string;
  tiles: SetupTile[];
};

// Built from CHANNELS rather than retyped, so a channel added or renamed there shows up here
// with the right logo and never drifts out of sync.
const CHAT_TILES: SetupTile[] = CHANNELS.map((c) => ({
  kind: "channel",
  id: c.id,
  name: c.name,
  logo: c.logo,
}));

function toolkitTile(slug: string, name: string): SetupTile {
  return { kind: "toolkit", slug, name, logo: composioLogoUrl(slug) };
}

export const CHAT_ROW: SetupRow = {
  title: "Chat anywhere",
  blurb: "Answers you in a chat app you already have open — to you and nobody else.",
  href: "/dashboard/channels",
  tiles: CHAT_TILES,
};

export const SETUP_ROWS: SetupRow[] = [
  {
    title: "Google",
    blurb: "Your mail, your files, your diary. This is what turns advice into work done.",
    href: "/dashboard/integrations",
    tiles: [
      toolkitTile("googledrive", "Drive"),
      // UNVERIFIED SLUG. Composio's Google toolkits are unseparated (googledrive, googlecalendar,
      // googledocs, googletasks), so this follows the same pattern — but it is the one tile here
      // not already proven by the Connections catalogue. Because tiles only LINK to Connections
      // and never connect anything themselves, the cost of being wrong is a fallback initial
      // where the logo should be, not a setup that fails. If that letter shows up, fix the slug.
      toolkitTile("googlecontacts", "Contacts"),
      toolkitTile("gmail", "Email"),
      toolkitTile("googlecalendar", "Calendar"),
    ],
  },
  {
    // Three, not four. Microsoft puts mail, calendar and contacts behind one Outlook connection,
    // so a fourth tile would either be the same toolkit twice or a slug guessed to fill a gap.
    title: "Microsoft",
    blurb: "Outlook covers mail, calendar and contacts in a single connection.",
    href: "/dashboard/integrations",
    tiles: [
      toolkitTile("one_drive", "OneDrive"),
      toolkitTile("outlook", "Outlook"),
      toolkitTile("microsoft_teams", "Teams"),
    ],
  },
];
