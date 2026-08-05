import { CHANNELS } from "@/config/channels";
import { composioLogoUrl, DEFAULT_INTEGRATION_TOOLKITS } from "@/lib/integration-catalog";
import type { ChannelId } from "@/lib/types";

// The Integrations rail beside the empty chat.
//
// It replaces the shelves that used to sit above the greeting. Every version of those fought the
// composer for the same vertical space; a rail doesn't, and it has room for the search and the
// group counts that made the shelves feel cramped.
//
// SLUGS ARE NOT GUESSED HERE. Every toolkit below is asserted against the Connections catalogue
// at import time, so a typo is a build-time failure rather than a tile that looks fine and then
// dead-ends on "Could not connect app". That check exists because a guessed Google Contacts slug
// shipped and did exactly that.
//
// Short by design. These are the apps a small business already has; the full catalogue of eighty
// is behind "Add more" and belongs there.

export type RailTile =
  /** Opens the provider's consent screen directly, like the Connections cards do. */
  | { kind: "toolkit"; key: string; name: string; slug: string; logo: string }
  /** No OAuth exists — these need a token pasted in someone else's console. Links to Channels. */
  | { kind: "channel"; key: string; name: string; id: ChannelId; logo: string };

export type RailGroup = {
  title: string;
  /** Where "Add more" goes. */
  href: string;
  tiles: RailTile[];
};

const CATALOG = new Set(DEFAULT_INTEGRATION_TOOLKITS.map((t) => t.slug.toLowerCase()));

function tk(name: string, slug: string): RailTile {
  if (!CATALOG.has(slug.toLowerCase())) {
    throw new Error(
      `integration-rail: "${slug}" is not in the Connections catalogue. Add it to ` +
        `lib/integration-catalog.ts first — a slug that isn't there can't be connected.`
    );
  }
  return { kind: "toolkit", key: slug, name, slug, logo: composioLogoUrl(slug) };
}

export const RAIL_GROUPS: RailGroup[] = [
  {
    title: "Google",
    href: "/dashboard/integrations",
    tiles: [
      tk("Drive", "googledrive"),
      tk("Gmail", "gmail"),
      tk("Calendar", "googlecalendar"),
      tk("Docs", "googledocs"),
      tk("Sheets", "googlesheets"),
      tk("Meet", "googlemeet"),
      tk("Tasks", "googletasks"),
    ],
  },
  {
    // Three, not the eight the mockup drew. Word, Excel, PowerPoint and OneNote aren't in the
    // catalogue, and Microsoft serves mail, calendar and contacts from the single Outlook
    // connection — so the missing tiles are mostly capability that's already here under another
    // name, and the rest would be slugs invented to fill a grid.
    title: "Microsoft",
    href: "/dashboard/integrations",
    tiles: [tk("OneDrive", "one_drive"), tk("Outlook", "outlook"), tk("Teams", "microsoft_teams")],
  },
  {
    // Where the agent ANSWERS you, as opposed to what it can reach. Kept in the rail because the
    // shelves carried them and dropping them here would leave Channels with no route in from the
    // place people actually sit.
    title: "Chat apps",
    href: "/dashboard/channels",
    tiles: CHANNELS.map((c) => ({
      kind: "channel" as const,
      key: c.id,
      name: c.name,
      id: c.id,
      logo: c.logo,
    })),
  },
  {
    title: "Other",
    href: "/dashboard/integrations",
    tiles: [
      tk("Notion", "notion"),
      tk("HubSpot", "hubspot"),
      tk("Zoom", "zoom"),
      tk("Dropbox", "dropbox"),
      tk("Asana", "asana"),
      tk("Trello", "trello"),
      tk("Calendly", "calendly"),
    ],
  },
];
