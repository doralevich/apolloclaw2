import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendMandrillEmail } from "@/lib/email";
import { setMailchimpTags, upsertMailchimpContact } from "@/lib/mailchimp";
import { publicSiteOrigin } from "@/lib/site-url";

// The onboarding email series for cloud-hosted (VPS) customers.
//
// Before this, a buyer got exactly one email — "Your ApolloClaw account is ready", with a
// password link — and then silence. If they closed the tab before finishing the questionnaire,
// nothing ever asked them to come back. If they never set a password, nothing noticed. The
// only signal that a paying customer had stalled was David happening to look.
//
// ─── Why the steps are driven by state, not by a timer ─────────────────────────────────────
//
// A drip that fires on a schedule alone will cheerfully tell somebody to finish a form they
// finished yesterday. That is worse than sending nothing: it says we are not paying attention,
// to a person who just paid us. So every nudge here asks the database what the customer has
// actually done first, and the ones that are no longer relevant are recorded as skipped rather
// than sent. Four things are observable and that is enough:
//
//   signed in          auth.users.last_sign_in_at   (did they ever set a password)
//   questionnaire      agent_setup row              (did they tell us what to build)
//   agent exists       agents row                   (did provisioning land)
//   still a customer   entitlements.status          (did they cancel or refund)
//
// Whether they have connected an app lives in Composio, not here, so nothing gates on it.
//
// ─── Why nobody gets spammed ───────────────────────────────────────────────────────────────
//
// The cron runs hourly, so each step is evaluated ~24 times a day per customer. Three things
// keep that from turning into a mailbox full of the same nudge:
//
//   1. onboarding_emails records every send AND every skip, keyed (email, step). Migration
//      0019. The primary key is the real guarantee.
//   2. At most ONE email per customer per run. Somebody who has been dormant a week gets their
//      backlog an hour apart, not five at once.
//   3. SERIES_LIVE_FROM. Deploying this must not mass-mail every existing customer a welcome
//      series for a purchase they made months ago. Anyone who bought before the cutoff is
//      ignored outright.

/**
 * Purchases before this instant are invisible to the series.
 *
 * Existing customers are already onboarded, or already being handled by David personally.
 * Either way, "Welcome! Here is what is next" about a licence they bought in June would read
 * as a system talking to itself. Raise this if the series is ever re-launched; never lower it.
 */
export const SERIES_LIVE_FROM = new Date("2026-08-06T00:00:00Z");

/** Recorded by the Stripe webhook when it sends the password-setup mail. Never sent from here. */
export const WELCOME_STEP = "welcome";

/**
 * Whether this app still sends the nurture emails itself.
 *
 * Set ONBOARDING_SERIES_SENDS=off in Vercel the moment a Mailchimp journey goes live, and this
 * stops sending while carrying on with the tag sync below. That ordering matters: the tags are
 * what a journey branches on, so they have to keep flowing after the sending moves. Turning
 * this off does NOT touch the Stripe receipt, which is a different email on a different path.
 *
 * Defaults to on. A missing environment variable must never silently stop customer mail — the
 * failure would be invisible, and "nobody got their onboarding" looks identical to "nobody was
 * due" from the outside.
 */
export const SENDS_ENABLED = (process.env.ONBOARDING_SERIES_SENDS || "on").toLowerCase() !== "off";

/**
 * The onboarding state, published to Mailchimp as tags.
 *
 * A Customer Journey can only branch on what Mailchimp knows, and Mailchimp knows nothing about
 * whether somebody finished a questionnaire or ever managed to log in. Without these it could
 * only fire on elapsed time, which is precisely the behaviour worth avoiding: mailing a person
 * to ask them to do a thing they did last Tuesday.
 *
 * Every one of these except ac-customer is monotonic — you cannot un-sign-in — so they are only
 * ever added. ac-customer comes off when an entitlement lapses, otherwise a cancelled customer
 * stays in a journey aimed at people who are still paying.
 */
export const TAGS = {
  customer: "ac-customer",
  signedIn: "ac-signed-in",
  questionnaire: "ac-questionnaire-done",
  agentLive: "ac-agent-live",
} as const;

const HOUR = 60 * 60 * 1000;

type Customer = {
  email: string;
  firstName: string;
  purchasedAt: Date;
  userId: string | null;
  hasSignedIn: boolean;
  hasQuestionnaire: boolean;
  /** Slug for /onboard/<type>, from the provisioned agent. Null before provisioning lands. */
  agentType: string | null;
  hasAgent: boolean;
};

type Step = {
  id: string;
  /** Earliest this may go out, measured from the purchase. */
  afterHours: number;
  /**
   * True when this step no longer has anything to say — they already did the thing. Recorded
   * as skipped so it can never fire later, even if they undo whatever it was.
   */
  skipIf?: (c: Customer) => boolean;
  /**
   * False means "not yet, ask again next hour". Unlike skipIf this does NOT burn the step, so
   * a customer who takes three weeks to get going still receives it when they are ready.
   */
  waitFor?: (c: Customer) => boolean;
  subject: (c: Customer) => string;
  body: (c: Customer, origin: string) => string;
};

// ─── Shared shell ───────────────────────────────────────────────────────────────────────────
// One wrapper so five emails cannot drift into five designs. Inline styles only: every mail
// client strips <style> blocks, and a stylesheet that gets stripped is a plain-text email
// wearing a suit.

const NAVY = "#0B1729";
const RED = "#D72B2B";
const GREY = "#6b7280";

function button(href: string, label: string): string {
  return (
    `<p style="margin:26px 0"><a href="${href}" style="display:inline-block;background:${RED};` +
    `color:#fff;font-weight:700;padding:14px 30px;border-radius:6px;text-decoration:none">${label}</a></p>`
  );
}

function shell(inner: string): string {
  return (
    `<div style="font-family:sans-serif;color:${NAVY};font-size:15px;line-height:1.7;max-width:560px">` +
    inner +
    `<hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0 16px">` +
    // Said plainly because it is true: this is a short, finite setup sequence, not a
    // newsletter. Somebody who knows it ends is far less likely to mark it as spam.
    `<p style="color:${GREY};font-size:12px">You are getting this because you bought an ` +
    `Apollo[Claw] licence. These are setup emails and they stop once you are up and running. ` +
    `Reply to this message any time and it reaches David directly.</p>` +
    `</div>`
  );
}

/**
 * Where this customer's questionnaire lives.
 *
 * Two different journeys end up here. A per-agent buyer has an agent provisioned and fills in
 * the logged-in form at /onboard/<type>. A cloud licence buyer (flow: onboard_license) has no
 * agent at all — that checkout deliberately does not provision one — and their questionnaire
 * is the lead-mode form at plain /onboard, which is also where Stripe returns them. So the
 * fallback is /onboard rather than the dashboard: for the licence cohort it is not a fallback
 * at all, it is the correct address.
 */
function setupUrl(c: Customer, origin: string): string {
  return c.agentType ? `${origin}/onboard/${c.agentType}` : `${origin}/onboard`;
}

// ─── The series ─────────────────────────────────────────────────────────────────────────────
// Order is the send order. The sweep walks this list and stops at the first step that is not
// yet due, so a step can never overtake the one before it.

export const STEPS: Step[] = [
  {
    // The orientation email. Deliberately an hour behind the receipt rather than alongside it:
    // two emails landing together get read as one, and the one that survives is the receipt.
    id: "whats_next",
    afterHours: 1,
    subject: () => "Here is what happens next",
    body: (c, origin) =>
      shell(
        `<h2 style="color:${NAVY}">Welcome${c.firstName ? `, ${c.firstName}` : ""}.</h2>` +
        `<p>Your agent is being set up. There are three things between here and it being useful, ` +
        `and only the first one needs you today.</p>` +
        `<p style="margin:22px 0 6px"><strong>1. Tell it about your business.</strong></p>` +
        `<p style="margin:0;color:${GREY};font-size:14px">This is the questionnaire. It is the ` +
        `longest part and it is the part everything else is built from, so it is worth doing ` +
        `properly rather than quickly. Twenty minutes, and you can leave and come back.</p>` +
        `<p style="margin:22px 0 6px"><strong>2. Connect the apps it works in.</strong></p>` +
        `<p style="margin:0;color:${GREY};font-size:14px">Gmail, Calendar, Drive, whatever you ` +
        `live in. An agent with no connections can talk about your work. One with connections ` +
        `can do it.</p>` +
        `<p style="margin:22px 0 6px"><strong>3. Ask it something real.</strong></p>` +
        `<p style="margin:0;color:${GREY};font-size:14px">Not a test question. Something you ` +
        `were going to have to do anyway. That is the fastest way to find out where it helps.</p>` +
        button(setupUrl(c, origin), "Start the questionnaire") +
        `<p style="color:${GREY};font-size:13px">Stuck at any point, reply to this email.</p>`
      ),
  },

  {
    // Only reaches people who have not filled it in. Two days is long enough that it does not
    // feel like nagging and short enough that the purchase is still fresh.
    id: "finish_questionnaire",
    afterHours: 48,
    skipIf: (c) => c.hasQuestionnaire,
    subject: () => "Your agent is waiting on one thing",
    body: (c, origin) =>
      shell(
        `<h2 style="color:${NAVY}">One thing left${c.firstName ? `, ${c.firstName}` : ""}.</h2>` +
        `<p>Your agent is provisioned and running, but it has not been told anything about your ` +
        `business yet, so it is a general assistant rather than yours.</p>` +
        `<p>The questionnaire is what changes that. It asks how you work, who you serve, how you ` +
        `sound in writing, and what you want taken off your plate. Everything the agent does ` +
        `afterwards is built from those answers.</p>` +
        button(setupUrl(c, origin), "Pick up where you left off") +
        `<p style="color:${GREY};font-size:13px">If something in it did not make sense, tell me ` +
        `which question and I will answer it directly. That is usually faster than guessing.</p>`
      ),
  },

  {
    // Never signed in. Their account exists and is paid for, and they cannot get into it.
    // Worth its own email, because the receipt's password link has probably expired by now.
    id: "set_password",
    afterHours: 72,
    skipIf: (c) => c.hasSignedIn,
    subject: () => "You have not been able to get in yet",
    body: (_c, origin) =>
      shell(
        `<h2 style="color:${NAVY}">Let us get you into your dashboard.</h2>` +
        `<p>Your account is paid for and ready, but it has never been signed into, which usually ` +
        `means the password link in your receipt expired before you got to it. That link is ` +
        `short-lived on purpose.</p>` +
        `<p>Getting a fresh one takes a moment: go to the login page and choose ` +
        `<strong>Forgot password?</strong>. It will email you a new link straight away.</p>` +
        button(`${origin}/login`, "Go to the login page") +
        `<p style="color:${GREY};font-size:13px">If that does not work, reply to this email and ` +
        `I will sort it out manually. You should not have to fight for something you have paid for.</p>`
      ),
  },

  {
    // The "you are set up, now get value" email. waitFor rather than skipIf: somebody who takes
    // three weeks to fill the questionnaire should still get this once they do, not lose it.
    id: "getting_the_most",
    afterHours: 24 * 7,
    waitFor: (c) => c.hasQuestionnaire && c.hasSignedIn,
    subject: () => "Three things people forget their agent can do",
    body: (_c, origin) =>
      shell(
        `<h2 style="color:${NAVY}">You are set up. Now the useful part.</h2>` +
        `<p>Most people use an agent for about a third of what it can do, because the other two ` +
        `thirds are not obvious. These are the three that surprise people most.</p>` +
        `<p style="margin:22px 0 6px"><strong>It can message you first.</strong></p>` +
        `<p style="margin:0;color:${GREY};font-size:14px">Scheduled skills mean it can open the ` +
        `conversation, not just answer. A morning brief, an end-of-day summary, a weekly plan.</p>` +
        `<p style="margin:22px 0 6px"><strong>It can work where you already are.</strong></p>` +
        `<p style="margin:0;color:${GREY};font-size:14px">It does not have to live in the ` +
        `dashboard. Connect a chat channel and it answers where you already spend your day.</p>` +
        `<p style="margin:22px 0 6px"><strong>It reads your actual files and mail.</strong></p>` +
        `<p style="margin:0;color:${GREY};font-size:14px">Once Drive and Gmail are connected, ` +
        `"what did we agree with them in March" stops being a search and starts being a question.</p>` +
        button(`${origin}/dashboard/guide`, "Open the guide") +
        `<p style="color:${GREY};font-size:13px">If it is not earning its keep yet, reply and ` +
        `tell me what you were hoping it would take off you. That is useful to me either way.</p>`
      ),
  },
];

// ─── The sweep ──────────────────────────────────────────────────────────────────────────────

export type SweepResult = {
  considered: number;
  tagged: number;
  sendsEnabled: boolean;
  sent: Array<{ email: string; step: string }>;
  skipped: Array<{ email: string; step: string }>;
  failed: Array<{ email: string; step: string; error: string }>;
};

/**
 * Publish each customer's onboarding state to Mailchimp, and send at most one due email.
 *
 * Two jobs, deliberately in one pass, because they need exactly the same expensive lookup.
 *
 * The tag sync runs for EVERY Stripe customer regardless of when they bought, because a
 * Mailchimp journey should be able to target the whole book, not just people who arrived
 * after this feature did. Sending stays behind SERIES_LIVE_FROM, because mailing a June
 * customer a welcome sequence is a different and much worse mistake.
 *
 * Best-effort throughout. A customer whose lookup, tag, or send fails is logged and left for
 * the next hour rather than aborting the run — one bad row must not stop everybody else's mail.
 */
export async function sweepOnboardingEmails(): Promise<SweepResult> {
  const db = createAdminClient();
  const origin = publicSiteOrigin();
  const result: SweepResult = {
    considered: 0,
    tagged: 0,
    sendsEnabled: SENDS_ENABLED,
    sent: [],
    skipped: [],
    failed: [],
  };

  // Every Stripe customer, cancelled ones included: a lapsed entitlement has to take the
  // ac-customer tag back off, or a journey keeps addressing somebody who has left.
  const { data: ents, error } = await db
    .from("entitlements")
    .select("email, user_id, created_at, status, source")
    .eq("source", "stripe");
  if (error) throw new Error(`entitlement scan failed: ${error.message}`);
  if (!ents?.length) return result;

  for (const ent of ents) {
    const email = (ent.email || "").trim().toLowerCase();
    if (!email) continue;
    try {
      const customer = await loadCustomer(db, email, ent.user_id, new Date(ent.created_at));
      const active = ent.status === "active";

      // 1. Publish state to Mailchimp, for everyone, every run. Tags are idempotent, so
      //    re-asserting them hourly costs one request and keeps the audience self-healing
      //    after any failed write.
      //
      //    Upsert first, always. Tagging is a POST to /members/<hash>/tags, which 404s if the
      //    contact is not in the audience — and a Stripe buyer need never have been: the
      //    audience is currently populated by the intake, setup, and Calendly routes, none of
      //    which a straight licence purchase touches. Without this line the entire sync would
      //    404 for exactly the people it exists to serve.
      await upsertMailchimpContact(email, customer.firstName, "");
      await setMailchimpTags(
        email,
        [
          ...(active ? [TAGS.customer] : []),
          ...(customer.hasSignedIn ? [TAGS.signedIn] : []),
          ...(customer.hasQuestionnaire ? [TAGS.questionnaire] : []),
          ...(customer.hasAgent ? [TAGS.agentLive] : []),
        ],
        active ? [] : [TAGS.customer]
      );
      result.tagged += 1;

      // 2. Sending. Skipped entirely once Mailchimp owns the journeys, and never applies to
      //    customers from before the cutoff or to anyone no longer paying.
      if (!SENDS_ENABLED) continue;
      if (!active) continue;
      if (new Date(ent.created_at) < SERIES_LIVE_FROM) continue;

      result.considered += 1;

      const { data: doneRows } = await db
        .from("onboarding_emails")
        .select("step")
        .eq("email", email);
      const done = new Set((doneRows ?? []).map((r) => r.step));

      const ageHours = (Date.now() - customer.purchasedAt.getTime()) / HOUR;

      for (const step of STEPS) {
        if (done.has(step.id)) continue;
        // Steps are in send order, so the first one that is not due yet ends this customer's
        // run. Nothing overtakes the step before it.
        if (ageHours < step.afterHours) break;

        if (step.skipIf?.(customer)) {
          await record(db, email, step.id);
          result.skipped.push({ email, step: step.id });
          continue;
        }
        if (step.waitFor && !step.waitFor(customer)) continue;

        const ok = await sendMandrillEmail({
          to: email,
          toName: customer.firstName || email,
          subject: step.subject(customer),
          html: step.body(customer, origin),
        });
        if (ok) {
          // Recorded only on a confirmed send. A Mandrill failure leaves the step unrecorded
          // so the next run retries it, which is the right way round: a missing onboarding
          // email is a worse outcome than a duplicate one.
          await record(db, email, step.id);
          result.sent.push({ email, step: step.id });
        } else {
          result.failed.push({ email, step: step.id, error: "mandrill rejected" });
        }
        // One per customer per run, whatever happened.
        break;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[onboarding-series] customer failed:", email, message);
      result.failed.push({ email, step: "-", error: message });
    }
  }

  return result;
}

async function record(
  db: ReturnType<typeof createAdminClient>,
  email: string,
  step: string
): Promise<void> {
  const { error } = await db.from("onboarding_emails").upsert({ email, step }, { onConflict: "email,step" });
  if (error) console.error("[onboarding-series] could not record step:", email, step, error.message);
}

/** Everything the steps need to decide whether they still have something to say. */
async function loadCustomer(
  db: ReturnType<typeof createAdminClient>,
  email: string,
  userId: string | null,
  purchasedAt: Date
): Promise<Customer> {
  let firstName = "";
  let hasSignedIn = false;

  if (userId) {
    const { data } = await db.auth.admin.getUserById(userId);
    const u = data?.user;
    hasSignedIn = Boolean(u?.last_sign_in_at);
    const meta = (u?.user_metadata ?? {}) as Record<string, unknown>;
    firstName = String(meta.first_name || meta.firstName || "").trim();
  }

  // Two ways to have finished the questionnaire, and a licence buyer only ever hits the
  // second. The dashboard form writes agent_setup; the lead-mode form at /onboard posts to
  // /api/intake, which writes the milestone (migration 0020) precisely so this check works.
  const { count: milestoneCount } = await db
    .from("onboarding_milestones")
    .select("email", { count: "exact", head: true })
    .eq("email", email)
    .eq("milestone", "questionnaire");
  let hasQuestionnaire = (milestoneCount ?? 0) > 0;

  let hasAgent = false;
  let agentType: string | null = null;

  if (userId) {
    const { data: ws } = await db.from("workspaces").select("id").eq("owner_id", userId);
    const ids = (ws ?? []).map((w) => w.id);
    if (ids.length) {
      const { count: setupCount } = await db
        .from("agent_setup")
        .select("workspace_id", { count: "exact", head: true })
        .in("workspace_id", ids);
      hasQuestionnaire = hasQuestionnaire || (setupCount ?? 0) > 0;

      // agent_type doubles as the /onboard/<slug> the questionnaire lives at, so the newest
      // agent both proves provisioning landed and supplies the link.
      const { data: agents } = await db
        .from("agents")
        .select("agent_type, created_at")
        .in("workspace_id", ids)
        .order("created_at", { ascending: false })
        .limit(1);
      if (agents?.length) {
        hasAgent = true;
        agentType = agents[0].agent_type ?? null;
      }
    }
  }

  return { email, firstName, purchasedAt, userId, hasSignedIn, hasQuestionnaire, agentType, hasAgent };
}
