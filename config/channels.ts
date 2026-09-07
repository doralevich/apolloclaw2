import { composioLogoUrl } from "@/lib/integration-catalog";
import type { ChannelId } from "@/lib/types";

// The chat channels, and what the customer has to do to set each one up.
//
// Discord was a fourth. It never worked and was never going to on this architecture: it delivers
// direct messages over a gateway socket, and there is nothing on Vercel to hold a socket open. It
// sat here marked "coming soon" — which is a promise, and one nobody intended to keep. Removed
// rather than left advertising itself.
//
// These are the same apps that came out of Connections, and that is the point: where
// you TALK to your agent and what your agent can REACH are different questions. Connections is
// a catalogue of tools an agent acts on. This is a short, fixed list of places it can answer
// you — your own bot, an app in your own workspace, a business number of your own. Nobody else
// can reach the agent through them: the first person to message it becomes its owner, and every
// message from anyone else is dropped.
//
// The setup copy is deliberately literal. Every one of these flows sends someone off to another
// product's developer settings, and vague instructions there cost far more than the two lines
// they save here.
//
// THESE ARE THE ONLY WAYS IN. David's call, and it is a product decision rather than a technical
// one: every channel connects by pasting a credential the customer created in their own account,
// and nothing else. No "Sign in with Slack", no OAuth redirect, no hosted app the customer joins.
// The reason is the same reason each tagline says "your own" — a token minted in the customer's
// own account is a thing they can see, audit, and revoke without asking us, and an OAuth app in
// the middle would quietly make us the owner of that access instead.
//
// The route enforces this without needing to know about it: it forwards only the fields declared
// below, so adding a redirect flow is not something a caller can improvise — it would take
// editing this file, which is where the decision should be argued with anyway.
//
// WHERE THE MESSAGES ARRIVE. None of this runs on the agent's instance. Every channel delivers to
// a webhook in this app, which runs a turn and sends the answer back. The instance runs OpenClaw,
// which has no inbound receiver of its own — and doing it here means one shape for all of them.

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
  /** Numbered setup steps, rendered above the form. Plain strings; no markup. */
  steps: string[];
  fields: ChannelField[];
  /** Shown once connected, when there's something worth saying about living with it. */
  connectedNote?: string;
  /**
   * Show this agent's inbound webhook URL on the card, with a copy button.
   *
   * Only for channels where the customer has to paste it somewhere themselves. Telegram doesn't
   * need it — we register the URL for them through setWebhook — but Slack and Meta have no
   * equivalent API, so without this their setup simply cannot be completed.
   */
  showWebhookUrl?: boolean;

  /**
   * Mark this as the one to pick.
   *
   * Telegram, David's call, and the setup bears it out: it is the only one of the three needing
   * nothing but a bot token from BotFather — no Meta business verification, no Slack workspace
   * admin, and no webhook URL to paste anywhere, because setWebhook registers it for them.
   * Somebody choosing between three channels with no information picks the logo they recognise,
   * which is WhatsApp, which is the longest setup of the three.
   */
  recommended?: boolean;
};

export const CHANNELS: ChannelDef[] = [
  {
    id: "telegram",
    name: "Telegram",
    recommended: true,
    tagline: "Your own private bot",
    logo: composioLogoUrl("telegram"),
    // WRITTEN FOR A REALTOR, not a developer, David's call. The old version was two lines -
    // "open @BotFather and send /newbot", "copy the token and paste it below" - which is
    // accurate, complete, and useless to somebody who has never met a bot. It assumed the reader
    // knew what BotFather is, that /newbot is typed as a message, that two different names are
    // asked for, and what a token looks like when it arrives.
    //
    // Six steps now, each naming what you will SEE rather than what to do in the abstract. The
    // extra length is the point: this is the one setup in the product that sends somebody into
    // another app to have a conversation with a robot, and vague instructions there cost far
    // more than the four lines they save here.
    steps: [
      "Open Telegram and search for BotFather. Pick the one with the blue check - there are copies.",
      "Tap Start, then send it the message /newbot",
      "It asks for a name first. That is the title you will see at the top of the chat, so anything you like: your agent's name is a good choice.",
      "Then it asks for a username. This one has to be unique across all of Telegram and end in the word bot, which is why the first few you try are usually taken. There is a suggestion below that should be free.",
      "It replies with a long token that looks like 123456789:ABCdef... Copy the whole thing, including the numbers before the colon.",
      "Paste it below and press Connect. One more button appears after that - tap it to say hello to your bot, and you are done.",
    ],
    fields: [
      { key: "botToken", label: "Bot token", placeholder: "Paste your bot token (e.g. 123456:ABC-DEF...)" },
    ],
    connectedNote:
      "Message your bot in Telegram and your agent answers there. The first person to message it becomes its owner - anyone else who finds the bot gets nothing back.",
  },
  {
    id: "slack",
    name: "Slack",
    tagline: "A private app in your workspace",
    logo: composioLogoUrl("slack"),
    // No Socket Mode. It needs a process holding a WebSocket open and there is nothing on Vercel
    // to hold one; the Events API does the same job over a webhook, the way Telegram does.
    steps: [
      "Create an app at api.slack.com/apps - choose From scratch, and pick your workspace.",
      "Under OAuth & Permissions, add the chat:write and im:history bot scopes, then Install to Workspace. Copy the Bot User OAuth Token - it starts xoxb-.",
      "Under Basic Information, copy the Signing Secret.",
      "Paste both below and press Connect.",
      "Back in Slack, under Event Subscriptions, turn events on and paste the Request URL shown here after you connect. Slack will tick it green.",
      "Still under Event Subscriptions, expand Subscribe to bot events and add message.im. Save, then reinstall the app if Slack asks.",
      "Under App Home → Show Tabs, turn on the Messages Tab and tick \"Allow users to send Slash commands and messages from the messages tab\". Without this Slack refuses to send your message at all.",
    ],
    fields: [
      { key: "botToken", label: "Bot token", placeholder: "Bot token (xoxb-...)" },
      { key: "signingSecret", label: "Signing secret", placeholder: "Signing secret from Basic Information" },
    ],
    // Slack has no API for "deliver to this URL" — the customer pastes it themselves, so the card
    // has to show it.
    showWebhookUrl: true,
    connectedNote:
      "Direct-message the app in Slack and your agent answers there. The first person to DM it becomes its owner - anyone else in the workspace gets nothing back.",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    tagline: "A business number of your own, through Meta",
    logo: composioLogoUrl("whatsapp"),
    // Meta's Cloud API, not device linking. Linking someone's personal WhatsApp needs a process
    // holding a socket open per customer, and leans on libraries Meta bans accounts for using.
    // The trade is stated in the tagline rather than buried: this is a separate number.
    steps: [
      "At developers.facebook.com, create an app of type Business and add the WhatsApp product to it.",
      "In WhatsApp → API Setup, add the phone number you want the agent to answer on. It has to be a number that isn't already on WhatsApp.",
      "Copy the Phone number ID from that page.",
      "Create a permanent access token: Business Settings → Users → System users → add a system user with access to the app, then Generate token with the whatsapp_business_messaging permission.",
      "In App Settings → Basic, copy the App secret.",
      "Paste all three below and press Connect.",
      "Back in Meta, under WhatsApp → Configuration, edit the webhook: paste the Callback URL and Verify token shown here after you connect, then subscribe to the messages field.",
    ],
    fields: [
      { key: "accessToken", label: "Access token", placeholder: "Permanent access token" },
      { key: "phoneNumberId", label: "Phone number ID", placeholder: "Phone number ID (a long number)" },
      { key: "appSecret", label: "App secret", placeholder: "App secret from App Settings → Basic" },
    ],
    showWebhookUrl: true,
    connectedNote:
      "Message that number on WhatsApp and your agent answers there. The first number to message it becomes its owner - anyone else gets nothing back.",
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

// Off means the page and the Start Here tile are not there at all, rather than present and
// failing — a tile that takes you somewhere broken is worse than a tile that isn't there yet.
//
// DEFAULTS ON NOW, David's call. This was `=== "true"`, so it was off unless an environment
// variable said otherwise, which is the right default for a feature nobody has proven and the
// wrong one for a feature that works: the comment here already said "on in production since
// Telegram was confirmed working end to end", and the flag was the last thing standing between
// that work and the people paying for it.
//
// Inverted rather than deleted so there is still a kill switch: set
// NEXT_PUBLIC_CHANNELS_ENABLED=false to turn it off again.
//
// WORTH KNOWING IF YOU FLIP IT: NEXT_PUBLIC_* is inlined at BUILD time, not read at runtime.
// Changing this variable in Vercel does nothing until the next deploy.
export const CHANNELS_ENABLED = process.env.NEXT_PUBLIC_CHANNELS_ENABLED !== "false";
