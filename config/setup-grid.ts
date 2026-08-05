import { CHANNELS } from "@/config/channels";
import { composioLogoUrl } from "@/lib/integration-catalog";
import type { ChannelId } from "@/lib/types";

// The three shelves on Start Here: where the agent answers you, and what it can reach.
//
// This is a SHORTCUT SURFACE, not a second setup screen. Nothing here holds credentials or owns
// any state — a tile either starts the same OAuth flow Connections starts, or hands off to the
// page that does the setup. The point is that the first screen after provisioning names the
// specific apps a small business already has, instead of saying "connect your tools" and leaving
// the customer to guess which ones matter.
//
// Deliberately short. These twelve are the ones that change what an agent can do on day one; the
// full catalogue of eighty is one click away and belongs there, not here.

type TileBase = {
  /**
   * Unique within its row, and the React key.
   *
   * Not the slug, because Microsoft's mail, calendar and contacts tiles are all one Outlook
   * connection — see the row below.
   */
  key: string;
  name: string;
  logo: string;
};

export type SetupTile = TileBase &
  (
    /** A chat channel — status comes from /api/agents/{id}/channels. */
    | { kind: "channel"; id: ChannelId; soon?: boolean }
    /** A Composio toolkit — status comes from /api/agents/{id}/integrations/connections. */
    | { kind: "toolkit"; slug: string }
  );

export type SetupRow = {
  title: string;
  blurb: string;
  /** Where the row's "Set up" link goes, and where a connected tile goes to be managed. */
  href: string;
  tiles: SetupTile[];
};

// Built from CHANNELS rather than retyped, so a channel added, renamed or finished there shows up
// here with the right logo and never drifts out of sync.
const CHAT_TILES: SetupTile[] = CHANNELS.map((c) => ({
  kind: "channel",
  key: c.id,
  id: c.id,
  name: c.name,
  logo: c.logo,
  soon: c.comingSoon,
}));

function toolkitTile(key: string, name: string, slug: string): SetupTile {
  return { kind: "toolkit", key, name, slug, logo: composioLogoUrl(slug) };
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
    // NO CONTACTS TILE — yet.
    //
    // It shipped as `googlecontacts`, guessed from the pattern of Composio's other Google slugs
    // (googledrive, googlecalendar, googledocs, googletasks) because the machine it was written
    // on can't reach Composio to check. The guess was wrong, and once tiles started connecting
    // directly that stopped costing a missing icon and started costing an error page.
    //
    // Every slug below is one the Connections catalogue already proves. Put Contacts back the
    // moment there's a verified slug for it — from a Connections search, not another guess.
    tiles: [
      toolkitTile("drive", "Drive", "googledrive"),
      toolkitTile("email", "Email", "gmail"),
      toolkitTile("calendar", "Calendar", "googlecalendar"),
    ],
  },
  {
    // Four tiles, three of them the same connection.
    //
    // Microsoft doesn't split mail, calendar and contacts the way Google does — they all arrive
    // with one Outlook connection. The shelf could have said that in one tile, and did; the
    // trouble is that somebody looking for their calendar looks for the word "Calendar", and a
    // row that doesn't contain it reads as a row that can't do it.
    //
    // So all three are here and all three connect Outlook. They go green together, which is the
    // honest picture: connect any one of them and you have all three. Teams came off the shelf
    // rather than making this a row of five — it's a chat app, this row is about the work, and
    // it's still in Connections under Meetings.
    title: "Microsoft",
    blurb: "Contacts, mail and calendar all arrive together with one Outlook connection.",
    href: "/dashboard/integrations",
    tiles: [
      toolkitTile("onedrive", "OneDrive", "one_drive"),
      toolkitTile("contacts", "Contacts", "outlook"),
      toolkitTile("email", "Outlook", "outlook"),
      toolkitTile("calendar", "Calendar", "outlook"),
    ],
  },
];
