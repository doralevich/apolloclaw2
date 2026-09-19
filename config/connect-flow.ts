import { composioLogoUrl, DEFAULT_INTEGRATION_TOOLKITS } from "@/lib/integration-catalog";

// The guided connect flow: the three connections that decide whether a new agent can do anything,
// asked one at a time, in the order a person would think of them.
//
// WHY THIS EXISTS. Until now a customer finished the build screen, set a password, and landed on
// Home, where one of four tiles said "Connect an app" and led to a catalogue of eighty. Nothing
// anywhere asked them the one question that matters, so the ordinary outcome was an agent that
// could not read an email, see a calendar, or open a file - and an owner with no idea that was
// why it felt useless.
//
// THE ONE QUESTION. Everything here follows from "where is your email". Answer Google and the
// calendar is Google Calendar and the files are Drive; answer Microsoft and Outlook covers mail
// AND calendar in a single grant, with OneDrive for files. So the flow asks once and then stops
// asking - the later steps are a button, not a decision. That is the whole of what makes it fast.
//
// SLUGS ARE NOT GUESSED HERE, same rule as config/integration-rail.ts and for the same reason: a
// slug that is not in the Connections catalogue looks fine on screen and then dead-ends on "Could
// not connect app". Asserted at import time, so a typo is a build failure instead of the first
// thing a new customer meets.

export type VendorId = "google" | "microsoft";

export type ConnectStepKey = "mail" | "calendar" | "files";

export type ConnectStep = {
  key: ConnectStepKey;
  /** The toolkit whose ACTIVE connection satisfies this step. */
  slug: string;
  /** How the app is named on screen. */
  appName: string;
  logo: string;
  /** The heading. The agent is the one asking, so it is first person. */
  heading: string;
  /** One line under the heading, about this app specifically. */
  blurb: string;
  /** WHERE the agent can work once this lands, as a bare noun phrase ("your inbox").
   *  The closing screen strings these into one sentence, so they must not carry their own verb
   *  or their own "and" - two of those in a row read as a run-on. */
  gained: string;
  /**
   * True when the PREVIOUS step's connection already covers this one. Microsoft serves mail and
   * calendar from a single Outlook grant, so there is nothing of its own to connect here - the
   * step exists to say so, because somebody who was promised a calendar question and never got
   * one assumes it was missed.
   */
  coveredByPrevious?: boolean;
  /**
   * Copy for the case where the covering connection was SKIPPED, so there is something to do here
   * after all. Only meaningful alongside coveredByPrevious, and the reason it has to exist: a
   * customer who skips Outlook and then reads "the connection you just made covers both" is being
   * told about a connection that does not exist.
   */
  whenNotCovered?: { heading: string; blurb: string };
  /** Worth having, not the point. Skipping is a normal outcome and the copy says so. */
  optional?: boolean;
};

export type Vendor = {
  id: VendorId;
  /** What people call it out loud, on the chooser button. */
  label: string;
  /** The suite, for prose. */
  suite: string;
  /** Examples under the button, so somebody on a custom domain still recognizes themselves. */
  examples: string;
  /** The tile's logo. The mail app, because mail is what is being asked about. */
  logo: string;
  steps: ConnectStep[];
};

const CATALOG = new Set(DEFAULT_INTEGRATION_TOOLKITS.map((t) => t.slug.toLowerCase()));

function slug(s: string): string {
  if (!CATALOG.has(s.toLowerCase())) {
    throw new Error(
      `connect-flow: "${s}" is not in the Connections catalogue. Add it to ` +
        `lib/integration-catalog.ts first - a slug that isn't there can't be connected, and ` +
        `this flow is the first thing a new customer sees.`
    );
  }
  return s;
}

export const VENDORS: Record<VendorId, Vendor> = {
  google: {
    id: "google",
    label: "Google",
    suite: "Google Workspace",
    examples: "Gmail, Google Workspace",
    logo: composioLogoUrl("gmail"),
    steps: [
      {
        key: "mail",
        slug: slug("gmail"),
        appName: "Gmail",
        logo: composioLogoUrl("gmail"),
        // NAMES THE APP, and the chooser before it does not. Both screens used to be headed
        // "Let's connect your email", so picking Google appeared to do nothing at all.
        heading: "Let's connect Gmail",
        blurb:
          "Gmail is where most of your work arrives. Connecting it lets me read what comes in, draft replies in your voice, and chase the threads that go quiet.",
        gained: "your inbox",
      },
      {
        key: "calendar",
        slug: slug("googlecalendar"),
        appName: "Google Calendar",
        logo: composioLogoUrl("googlecalendar"),
        heading: "Now your calendar",
        blurb:
          "With your calendar I can see what your week actually looks like, book and move things, and stop offering times you are not free.",
        gained: "your calendar",
      },
      {
        key: "files",
        slug: slug("googledrive"),
        appName: "Google Drive",
        logo: composioLogoUrl("googledrive"),
        heading: "One more: your files",
        blurb:
          "Drive is where the contracts, rate cards and reports live. Without it I can see a file's name and nothing inside it.",
        gained: "your documents",
        optional: true,
      },
    ],
  },
  microsoft: {
    id: "microsoft",
    label: "Microsoft",
    suite: "Microsoft 365",
    examples: "Outlook, Microsoft 365, Office 365",
    logo: composioLogoUrl("outlook"),
    steps: [
      {
        key: "mail",
        slug: slug("outlook"),
        appName: "Outlook",
        logo: composioLogoUrl("outlook"),
        heading: "Let's connect Outlook",
        blurb:
          "Outlook is where most of your work arrives. Connecting it lets me read what comes in, draft replies in your voice, and chase the threads that go quiet. It covers your calendar in the same step.",
        gained: "your inbox",
      },
      {
        // Nothing to connect. Microsoft hands mail and calendar over together, so this step is
        // already finished the moment the one above is - and saying that out loud is the point
        // of keeping it. Silently skipping a step somebody was told to expect reads as a bug.
        key: "calendar",
        slug: slug("outlook"),
        appName: "Outlook",
        logo: composioLogoUrl("outlook"),
        coveredByPrevious: true,
        heading: "Your calendar is already done",
        blurb:
          "Microsoft hands over mail and calendar together, so the connection you just made covers both. Nothing else to do here.",
        whenNotCovered: {
          heading: "Now your calendar",
          blurb:
            "Microsoft hands over mail and calendar in one go, so connecting Outlook here gets me both: what your week looks like, and the inbox you skipped a moment ago.",
        },
        gained: "your calendar",
      },
      {
        key: "files",
        slug: slug("one_drive"),
        appName: "OneDrive",
        logo: composioLogoUrl("one_drive"),
        heading: "One more: your files",
        blurb:
          "OneDrive is where the contracts, rate cards and reports live. Without it I can see a file's name and nothing inside it.",
        gained: "your documents",
        optional: true,
      },
    ],
  },
};

export const VENDOR_LIST: Vendor[] = [VENDORS.google, VENDORS.microsoft];

/** The slugs this flow can connect, for deciding whether somebody has already been through it. */
export const CONNECT_FLOW_SLUGS: string[] = Array.from(
  new Set(VENDOR_LIST.flatMap((v) => v.steps.map((s) => s.slug.toLowerCase())))
);

/** The mail app per vendor, lowercased. Used to recognize a vendor from what is already connected. */
export const MAIL_SLUG: Record<VendorId, string> = {
  google: VENDORS.google.steps[0].slug.toLowerCase(),
  microsoft: VENDORS.microsoft.steps[0].slug.toLowerCase(),
};

// ── Working out which one they are, before asking ──────────────────────────────────────────────
//
// The flow asks anyway. This only decides which button is pre-selected and what the line under it
// says, because "Looks like you're on Google Workspace, you told us during setup" is a much
// shorter road to a connected inbox than a cold choice between two logos.
//
// It never auto-advances. A wrong guess acted on silently connects the wrong account, and the
// wrong account is worse than one extra click.

export type VendorGuess = {
  vendor: VendorId | null;
  /** Why, in the customer's own terms. Shown on the chooser. Null when nothing gave it away. */
  reason: string | null;
};

/** The questionnaire keys that ask this outright. Personal assistants and CEOs get the question;
 *  the other role deep-dives ask about their own software instead. */
const EMAIL_ANSWER_KEYS = ["email_platform", "email_tool"];

/** Tech Stack checkboxes that name a MAIL system. Teams and Meet are deliberately not here - they
 *  say where somebody holds meetings, not where their mail is, and a CFO on Gmail who also sits
 *  in Teams all day would be guessed wrong by them. */
const STACK_MAIL: Record<string, VendorId> = {
  "google mail": "google",
  "office 365": "microsoft",
};

const CONSUMER_DOMAINS: Record<string, VendorId> = {
  "gmail.com": "google",
  "googlemail.com": "google",
  "outlook.com": "microsoft",
  "hotmail.com": "microsoft",
  "hotmail.co.uk": "microsoft",
  "live.com": "microsoft",
  "live.co.uk": "microsoft",
  "msn.com": "microsoft",
};

/** Which vendor a free-text answer names, or null when it names both or neither. "Both" is a real
 *  option on those dropdowns and the honest response to it is to ask. */
function vendorFromText(raw: string): VendorId | null {
  const s = raw.toLowerCase();
  const google = s.includes("google") || s.includes("gmail");
  const microsoft = s.includes("microsoft") || s.includes("outlook") || s.includes("office");
  if (google === microsoft) return null;
  return google ? "google" : "microsoft";
}

/** The first value found for `key`, checking the top level and each role's details blob. Role
 *  answers are nested one level down under e.g. personalDetails, and which blob it is depends on
 *  the agent - so look in all of them rather than hardcoding the mapping a second time. */
function findAnswer(answers: Record<string, unknown>, key: string): string | null {
  const top = answers[key];
  if (typeof top === "string" && top.trim()) return top.trim();
  for (const value of Object.values(answers)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const nested = (value as Record<string, unknown>)[key];
    if (typeof nested === "string" && nested.trim()) return nested.trim();
  }
  return null;
}

/**
 * Guess the customer's email suite from what we already know about them.
 *
 * Three sources, strongest first: what they answered when we asked outright, what they ticked on
 * the Tech Stack page, and the address on their own account. The last is the weakest and the
 * reason says so, because a Gmail address on a business that runs Outlook is a real thing.
 */
export function guessVendor(
  answers: Record<string, unknown> | null,
  accountEmail: string | null
): VendorGuess {
  if (answers) {
    for (const key of EMAIL_ANSWER_KEYS) {
      const value = findAnswer(answers, key);
      if (!value) continue;
      const vendor = vendorFromText(value);
      // A "Both" or "Other" answer is a real answer and it is not one of these two. Stop here
      // rather than falling through to a weaker signal that would contradict what they said.
      if (!vendor) return { vendor: null, reason: null };
      return {
        vendor,
        reason: `You told us during setup that your email and calendar run on ${VENDORS[vendor].suite}.`,
      };
    }

    const comms = answers.commsTools;
    if (Array.isArray(comms)) {
      const hits = new Set<VendorId>();
      let label = "";
      for (const entry of comms) {
        if (typeof entry !== "string") continue;
        const vendor = STACK_MAIL[entry.trim().toLowerCase()];
        if (vendor) {
          hits.add(vendor);
          label = entry.trim();
        }
      }
      if (hits.size === 1) {
        const vendor = [...hits][0];
        return { vendor, reason: `You listed ${label} in your tech stack.` };
      }
    }
  }

  const domain = (accountEmail || "").trim().toLowerCase().split("@")[1];
  const fromDomain = domain ? CONSUMER_DOMAINS[domain] : undefined;
  if (fromDomain) {
    return {
      vendor: fromDomain,
      reason: `The address on your account is ${domain}. Pick the other one if your work email is somewhere else.`,
    };
  }

  return { vendor: null, reason: null };
}
