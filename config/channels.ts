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
  /**
   * Blank is allowed, and the connect path works out the value instead.
   *
   * Only WhatsApp's Phone Number ID, and only because discovery resolves it in the ordinary case
   * — one app, one number — and genuinely cannot when an app has several. An optional field is a
   * worse thing to show than no field, so the bar for adding another one is high.
   */
  optional?: boolean;
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
   * SLACK ONLY, now. Telegram never needed it — setWebhook registers the URL for them — and
   * WhatsApp no longer does either, because /{app-id}/subscriptions does the same job at Meta.
   * Slack is the one left with genuinely no API for it: the customer pastes the Request URL into
   * Event Subscriptions and Slack verifies it on the spot.
   *
   * WhatsApp still shows the URL when the automatic path fails, but that is a fallback keyed off
   * the row's state rather than a property of the channel, so it does not belong here.
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
    // Still WRITTEN FOR A REALTOR, not a developer - but the controls do the explaining now, not
    // the prose.
    //
    // This was six long steps, and before that two terse ones. The two were useless to somebody
    // who had never met a bot: they assumed you knew what BotFather is, which one is real, what
    // to type, and that two names get asked for. The six fixed that by spelling it all out - and
    // then BotFatherHelp said the same things again underneath, so the card read every
    // instruction twice. David: "too many instructions, make it simpler."
    //
    // What makes three short lines enough is what sits beside them. "Which BotFather?" is a
    // button that opens the real one. "What do I type?" is a /newbot to copy. "It keeps saying
    // the username is taken" is a suggestion that should be free. "What happens after?" is the
    // "One step left" box with its own button. So each line only has to say what to DO, and the
    // thing to do it with is right there.
    steps: [
      "Open BotFather and send it /newbot.",
      "Name your bot anything, then send it the username below.",
      "Paste the token it sends back.",
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
    //
    // SEVEN STEPS DOWN TO THREE, same move as Telegram's BotFatherHelp: give the customer a
    // real tool instead of four settings pages to click through by hand. The app manifest below
    // (SlackManifestHelp, components/channels/pieces.tsx) sets the bot scopes, the Event
    // Subscriptions Request URL, and the Messages Tab in one paste - the four things steps 1, 2,
    // 5, 6 and 7 used to walk through separately. showWebhookUrl stays on below as the same
    // fallback it has always been, for a workspace whose admin settings block manifest import.
    steps: [
      "Below, click \"Create the Slack app,\" choose \"From an app manifest,\" and pick your workspace. Paste the manifest shown here - it sets the bot scopes, the Request URL, and the Messages Tab all at once.",
      "Click Install to Workspace. Copy the Bot User OAuth Token (starts xoxb-) from OAuth & Permissions and the Signing Secret from Basic Information.",
      "Paste both below and press Connect.",
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
    //
    // SEVEN STEPS DOWN TO FIVE, and the three that went were the worst three. The old list ended
    // "copy the Phone number ID", then "paste all three", then "back in Meta, edit the webhook:
    // paste the Callback URL and Verify token, then subscribe to the messages field" — a return
    // trip into a developer console AFTER the button that reads like the end. Meta has APIs for
    // all of that (see lib/channels/connect.ts), so the connect does it instead.
    //
    // Step 4 asks for two values off one page. The App ID sits directly above the App secret in
    // App Settings → Basic, so it costs one extra copy from a page they were already opening,
    // and it is what lets us call the app-level subscription endpoint at all.
    //
    // TWO PERMISSIONS NOW, not one. whatsapp_business_messaging sends; whatsapp_business_management
    // is what /{waba-id}/subscribed_apps needs. A token with only the first connects fine and then
    // never receives anything, so the missing permission has to be asked for up front rather than
    // diagnosed later.
    steps: [
      "At developers.facebook.com, create an app of type Business and add the WhatsApp product to it.",
      "In WhatsApp → API Setup, add the phone number you want the agent to answer on. It has to be a number that isn't already on WhatsApp.",
      "Create a permanent access token: Business Settings → Users → System users → add a system user with access to the app, then Generate token. Tick BOTH whatsapp_business_messaging and whatsapp_business_management.",
      "In App Settings → Basic, copy the App ID and the App secret. They are on the same page, the ID just above the secret.",
      "Paste the three below and press Connect. That is the end of it - we switch delivery on for you, so there is nothing to paste back into Meta.",
    ],
    fields: [
      { key: "accessToken", label: "Access token", placeholder: "Permanent access token" },
      { key: "appId", label: "App ID", placeholder: "App ID from App Settings → Basic" },
      { key: "appSecret", label: "App secret", placeholder: "App secret from App Settings → Basic" },
      {
        key: "phoneNumberId",
        label: "Phone number ID",
        placeholder: "Phone number ID - only if this app has more than one number",
        optional: true,
      },
    ],
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
