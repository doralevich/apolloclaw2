import { composioLogoUrl } from "@/lib/integration-catalog";
import type { ChannelId } from "@/lib/types";

// The four chat channels, and what the customer has to do to set each one up.
//
// These are the same four apps that just came out of Connections, and that is the point: where
// you TALK to your agent and what your agent can REACH are different questions. Connections is
// a catalogue of tools an agent acts on. This is a short, fixed list of places it can answer
// you — your own WhatsApp, your own bot, an app in your own workspace. Nobody else can reach
// the agent through them; messages from anyone but the account holder are ignored.
//
// The setup copy is deliberately literal. Every one of these flows sends someone off to another
// product's developer settings, and vague instructions there cost far more than the two lines
// they save here.

export type ChannelField = {
  key: string;
  label: string;
  placeholder: string;
};

export type ChannelDef = {
  id: ChannelId;
  name: string;
  /** One line under the name: whose account this is, so "is this shared?" never has to be asked. */
  tagline: string;
  logo: string;
  /**
   * "qr" links a device by scanning, and has no fields — the customer's phone does the
   * authenticating. "token" is a paste-your-credentials form.
   */
  kind: "qr" | "token";
  /** Numbered setup steps, rendered above the form. Plain strings; no markup. */
  steps: string[];
  /** Empty for the QR flows. */
  fields: ChannelField[];
  /** Shown once connected, when there's something worth saying about living with it. */
  connectedNote?: string;
};

export const CHANNELS: ChannelDef[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    tagline: "Your own account — only you can use it",
    logo: composioLogoUrl("whatsapp"),
    kind: "qr",
    steps: [
      "On your phone, open WhatsApp.",
      "Go to Settings → Linked devices → Link a device.",
      "Point your phone at the code below.",
    ],
    fields: [],
    connectedNote:
      "Talk to your agent in your own Message yourself chat — or, if you have a second phone, from that number instead. Messages from other people are ignored.",
  },
  {
    id: "telegram",
    name: "Telegram",
    tagline: "Your own private bot",
    logo: composioLogoUrl("telegram"),
    kind: "token",
    steps: [
      "In Telegram, open @BotFather and send /newbot to create a bot.",
      "Copy the bot token it gives you and paste it below.",
    ],
    fields: [
      { key: "botToken", label: "Bot token", placeholder: "Paste your bot token (e.g. 123456:ABC-DEF...)" },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    tagline: "A private app in your workspace",
    logo: composioLogoUrl("slack"),
    kind: "token",
    steps: [
      "Create an app at api.slack.com/apps.",
      "Turn on Socket Mode — that gives you an app-level token starting xapp-.",
      "Under OAuth & Permissions, add the chat:write, im:history and users:read scopes, then install the app. That gives you a bot token starting xoxb-.",
      "Under Event Subscriptions, subscribe to the message.im bot event.",
    ],
    fields: [
      { key: "botToken", label: "Bot token", placeholder: "Bot token (xoxb-...)" },
      { key: "appToken", label: "App-level token", placeholder: "App-level token (xapp-...)" },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    tagline: "Your own bot, direct messages only",
    logo: composioLogoUrl("discord"),
    kind: "token",
    steps: [
      "Create an application at discord.com/developers.",
      "Open its Bot page, choose Reset Token, and copy the token.",
      "Paste it below — we'll give you a link to add the bot to one of your servers.",
    ],
    fields: [{ key: "botToken", label: "Bot token", placeholder: "Paste your bot token" }],
  },
];

const BY_ID = new Map<ChannelId, ChannelDef>(CHANNELS.map((c) => [c.id, c]));

export function channelDef(id: string): ChannelDef | undefined {
  return BY_ID.get(id as ChannelId);
}

/** Guard for route params — the only way a ChannelId enters the server from a URL. */
export function isChannelId(value: string): value is ChannelId {
  return BY_ID.has(value as ChannelId);
}

// Channels ships dark until the runtime endpoints are confirmed (see lib/agent37.ts). Off means
// the nav entry and the page are not there at all, rather than present and failing — a tab that
// takes you somewhere broken is worse than a tab that isn't there yet.
export const CHANNELS_ENABLED = process.env.NEXT_PUBLIC_CHANNELS_ENABLED === "true";
