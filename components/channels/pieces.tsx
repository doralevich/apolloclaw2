"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ChannelDef } from "@/config/channels";
import type { ChannelId } from "@/lib/types";

// The parts of channel setup that are the same wherever it is drawn.
//
// These lived inside components/ChannelsView.tsx, which was the only place a channel could be set
// up. The guided connect flow now sets one up too, and a second copy of the BotFather suggestion
// or the "one step left" nudge is a second thing to keep true - the kind of split that had the
// lead form posting to /api/chat differently from the rest of Donna for months. One copy, two
// renderers, and the numbered steps and field lists stay in config/channels.ts where they were.

/** One labelled value with a copy button.
 *
 * The webhook URL and WhatsApp's verify token are both things the customer has to paste into
 * somebody else's console, and getting either subtly wrong by hand-retyping is a setup that fails
 * with no explanation. */
export function CopyableValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Couldn't copy - select the text and copy it manually."));
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border bg-muted/50 px-3 py-2 text-xs">
          {value || "…"}
        </code>
        <Button variant="outline" size="sm" onClick={copy} disabled={!value}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

/** The inbound URL for this agent.
 *
 * Built from window.location.origin rather than a server value, so it is always the host the
 * customer is actually looking at - pasting a production URL into Slack or Meta from a preview
 * deploy would send their messages somewhere they didn't expect. */
export function WebhookUrl({ agentId, channel }: { agentId: string; channel: ChannelId }) {
  // window doesn't exist during the server render, so the origin is read through
  // useSyncExternalStore: empty on the server, real after hydration, and no state written from an
  // effect to get there.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
  const url = origin ? `${origin}/api/channels/${channel}/${agentId}` : "";
  return <CopyableValue label={channel === "whatsapp" ? "Callback URL" : "Request URL"} value={url} />;
}

/** The old WhatsApp setup, kept for when the new one cannot run.
 *
 * Connecting WhatsApp now registers the callback URL and switches delivery on through Meta's own
 * APIs, so in the ordinary case none of this is on screen. It comes back when that fails - most
 * often a token minted without whatsapp_business_management, which sends fine and receives
 * nothing - and then these are the two values that finish the job by hand.
 *
 * Deliberately NOT presented as an error. Nothing is broken and no work has been lost; there is
 * one step left and here is what it needs. The sentence above it comes from the row, so it says
 * what Meta actually refused rather than a guess written here. */
export function ManualDelivery({
  agentId,
  channel,
  verifyToken,
}: {
  agentId: string;
  channel: ChannelId;
  verifyToken: string;
}) {
  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        In Meta, open WhatsApp → Configuration and edit the webhook. Paste these two in, then
        subscribe to the <span className="font-mono">messages</span> field.
      </p>
      {/* Both, together, in this order - it is the order Meta's own form asks for them, and
          these two being on separate parts of the card is what made the old setup easy to do
          half of. */}
      <WebhookUrl agentId={agentId} channel={channel} />
      <CopyableValue label="Verify token" value={verifyToken} />
    </div>
  );
}

// Telegram usernames must be globally unique and end in "bot", so "step 1: create a bot" is in
// practice a guessing game against every name already taken. Somebody non-technical hits three
// rejections from BotFather and concludes the product is broken.
//
// This does not automate it - Telegram has no API for creating a bot, and no way to pre-fill a
// message to BotFather, so the customer really does have to have that conversation. What it does
// is remove the two things they can get wrong: it opens BotFather directly rather than leaving
// them to search a name they might mistype (there are impersonator accounts), and it offers a
// name derived from their own agent, which is far likelier to be free than "assistant_bot".
export function BotFatherHelp({ agentName, seed }: { agentName?: string | null; seed: string }) {
  // Telegram's rules: 5-32 characters, letters digits and underscores only, must end in "bot".
  // Suffixed with a short tail because the clean form of any name is usually already taken, and a
  // suggestion that gets rejected is worse than no suggestion.
  //
  // The tail is DERIVED FROM THE AGENT ID, not random. Math.random() here would be impure in
  // render and, worse, would differ between the server and client passes - so the suggestion
  // would visibly change on hydration and again on every re-render, which is no way to treat a
  // value somebody is about to copy. Hashing the agent id gives the same four characters every
  // time for this agent and different ones for the next.
  const suggestion = useMemo(() => {
    const base = (agentName || "apollo").replace(/[^a-zA-Z0-9]/g, "").slice(0, 18) || "apollo";
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const tail = h.toString(36).slice(0, 4).padStart(4, "0");
    return `${base}_${tail}_bot`;
  }, [agentName, seed]);

  // Controls only, in the order the steps above use them. This block used to open with a
  // paragraph repeating those steps in different words, so the card said everything twice.
  //
  // Both links used to be `text-primary` with an underline only on hover - and in the dashboard
  // --color-primary is near-black, so on screen they were plain bold text nobody knew to click.
  // BotFather is the main action here, so it is a real button; the download link is secondary
  // and gets a permanent underline.
  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/* `?start=` is not decoration: a bare t.me/BotFather often opens a landing page or a
            chat list on desktop and the web client. The payload makes it open the BotFather chat
            with a START button every time. It still cannot send /newbot for them - Telegram's
            deep links stop at /start - which is why /newbot sits right below as a copy. */}
        <Button asChild size="sm">
          <a href="https://t.me/BotFather?start=newbot" target="_blank" rel="noopener noreferrer">
            Open BotFather in Telegram
          </a>
        </Button>
        {/* For someone who has never had Telegram, the button above lands on a page telling them
            to get the app. telegram.org/dl is Telegram's own link and picks the right store for
            the device, so one link covers iPhone, Android and desktop. */}
        <span className="text-xs text-muted-foreground">
          No Telegram yet?{" "}
          <a
            href="https://telegram.org/dl"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-2"
          >
            Get it here
          </a>
        </span>
      </div>
      <CopyableValue label="Send it this" value="/newbot" />
      <CopyableValue label="Then this username" value={suggestion} />
    </div>
  );
}

// Slack has no deep link like BotFather's - creating an app is always a form on
// api.slack.com. What it DOES have is an app manifest: one JSON blob that sets the bot scopes,
// the Event Subscriptions Request URL, and the Messages Tab all at once, instead of a customer
// clicking through four separate settings pages by hand. The receiver already answers Slack's
// url_verification challenge unsigned (see app/api/channels/slack/[agentId]/route.ts), which is
// exactly what lets the Request URL verify itself the moment the manifest is imported - before
// there is any signing secret to check it against.
//
// SAFETY NET, NOT A REPLACEMENT: showWebhookUrl stays on for Slack (config/channels.ts), so if a
// workspace's admin settings block manifest creation, or Slack drops one field on import, the
// same Request URL is still shown below for a manual paste into Event Subscriptions - the same
// fallback this channel has always had.
function slackManifest(agentName: string | null | undefined, requestUrl: string): string {
  const name = (agentName || "Apollo Claw").slice(0, 35);
  return JSON.stringify(
    {
      display_information: { name },
      features: {
        bot_user: { display_name: name, always_online: true },
        app_home: {
          home_tab_enabled: false,
          messages_tab_enabled: true,
          // false = NOT read-only, i.e. the customer can actually send it a message. Same
          // switch the old manual steps had you tick by hand under App Home.
          messages_tab_read_only_enabled: false,
        },
      },
      oauth_config: { scopes: { bot: ["chat:write", "im:history"] } },
      settings: {
        event_subscriptions: { request_url: requestUrl, bot_events: ["message.im"] },
        org_deploy_enabled: false,
        socket_mode_enabled: false,
        token_rotation_enabled: false,
      },
    },
    null,
    2
  );
}

export function SlackManifestHelp({ agentId, agentName }: { agentId: string; agentName?: string | null }) {
  // Same reasoning as WebhookUrl: read through useSyncExternalStore so the manifest carries the
  // host the customer is actually looking at, empty until hydration rather than a server guess.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
  const requestUrl = origin ? `${origin}/api/channels/slack/${agentId}` : "";
  const manifest = useMemo(() => slackManifest(agentName, requestUrl), [agentName, requestUrl]);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard
      .writeText(manifest)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Couldn't copy - select the text below and copy it manually."));
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button asChild size="sm">
          <a href="https://api.slack.com/apps?new_app=1" target="_blank" rel="noopener noreferrer">
            Create the Slack app
          </a>
        </Button>
        <span className="text-xs text-muted-foreground">
          Choose &ldquo;From an app manifest&rdquo; and pick your workspace.
        </span>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Then paste this manifest</p>
        <pre className="max-h-48 overflow-auto rounded-lg border bg-muted/50 px-3 py-2 text-[11px] leading-relaxed">
          <code>{manifest || "…"}</code>
        </pre>
        <Button variant="outline" size="sm" onClick={copy} disabled={!requestUrl}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy manifest"}
        </Button>
      </div>
    </div>
  );
}

// The iPhone/Android home-screen steps, shared between the guided connect flow (ChannelStep's
// "Apollo Claw" tile) and the standing Channels page (ChannelsView) - one copy of the words, two
// renderers, same reason config/channels.ts's `steps` arrays are not retyped per surface.
export const APOLLO_CLAW_IPHONE_STEPS = [
  "Open this dashboard in Safari, not another browser - Chrome on iPhone doesn't offer this.",
  "Tap the Share icon in the toolbar - the square with an arrow pointing up.",
  'Scroll down the list and tap "Add to Home Screen".',
  'Tap "Add" in the top right. The icon lands wherever your other apps are.',
];

export const APOLLO_CLAW_ANDROID_STEPS = [
  "Open this dashboard in Chrome.",
  "Tap the three dots in the top right.",
  'Tap "Add to Home screen" or "Install app" - the wording varies by Android version.',
  'Confirm by tapping "Add" or "Install".',
];

/** The Telegram deep link that binds the bot to its owner, or null when we cannot build one.
 *
 * ?start=setup rather than a bare ?start: the payload is what makes Telegram reliably show the
 * START button instead of an empty chat, and the receiver treats any /start the same way. */
export function telegramStartUrl(def: ChannelDef, account: string | null): string | null {
  const username = def.id === "telegram" && account?.startsWith("@") ? account.slice(1) : null;
  return username ? `https://t.me/${username}?start=setup` : null;
}

// The credential landed; the channel still answers nobody. This is the nudge that closes it.
//
// Every channel binds its owner from the FIRST message sent to it, which means a customer who
// pastes a token and walks away owns a channel that works for no one. The old card called that
// "Connected", so there was nothing on screen to suggest otherwise.
//
// Telegram gets a button rather than a sentence, because it is the one where we hold enough to
// build the link: connectTelegram stores the bot's @username from getMe, and https://t.me/<name>
// opens that exact chat in the app.  Slack and WhatsApp have no equivalent - the customer has to
// find the app or dial the number themselves - so they get the plain instruction.
//
// Not an error state. Nothing has gone wrong; the setup is simply one step from done, and the
// tone says so.
export function FinishLinking({ def, account }: { def: ChannelDef; account: string | null }) {
  const url = telegramStartUrl(def, account);

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/40">
      <p className="text-sm font-medium text-amber-900 dark:text-amber-200">One step left</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-200/90">
        {url ? (
          <>
            Send {account} a message and it becomes yours. Nobody else who finds the bot gets an
            answer after that.
          </>
        ) : (
          <>
            Message {account ?? `your ${def.name}`} and it becomes yours. Nobody else gets an
            answer after that.
          </>
        )}
      </p>
      {url && (
        <div className="mt-3 space-y-2">
          <Button asChild size="sm">
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open {account} in Telegram
            </a>
          </Button>
          {/* Telegram is mostly a phone app and this page is mostly opened on a desktop, so the
              button alone strands anyone whose Telegram is not on this machine. A copyable link
              they can send themselves covers it.

              A QR would be nicer and is deliberately not here: every QR service is somebody
              else's server, this repo has no encoder, and img-src does not allow one. Handing a
              third party the bot usernames of paying customers to save one paste is not a trade
              worth making quietly. */}
          <CopyableValue label="Or send yourself this link" value={url} />
        </div>
      )}
    </div>
  );
}
