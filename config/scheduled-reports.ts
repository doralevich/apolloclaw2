// Reports we offer to set up for an agent, per type.
//
// THE PROBLEM THIS SOLVES is a blank page. Custom reports lifted the ceiling - anybody can ask for
// anything on a clock - and left the floor exactly where it was: a realtor opens My Schedule,
// sees three generic toggles and an empty box headed "write your own", and writes nothing. The
// feature people say they bought the product for is the one that arrives without being asked, and
// it only arrives if somebody first thinks of it.
//
// OFFERED, NOT CREATED, and that is the whole design. Nothing here exists in the database until
// somebody clicks it. Two reasons, and the second is the expensive one:
//
//   1. An 8am message nobody asked for is how an agent gets muted.
//   2. Every schedule fires a full agent turn. Nothing is connected when an agent is handed over,
//      so a seeded schedule would burn a turn every single morning to deliver into no_channel -
//      real money, per agent, per day, for nothing. Multiply by a fleet.
//
// So these are one click, and the click is the customer's.
//
// The prompts are written the way a customer would write one, because that is exactly what they
// become: a row with a `prompt`, indistinguishable from one typed into the box. They lean on the
// skills the agent already has rather than restating a method - "use your cma-prep skill" is a
// pointer to a document that is already on the box, and repeating its content here would create a
// second copy that drifts from the first.
//
// Brand rule: no em dashes.

import type { ScheduleDays } from "@/lib/schedule-timing";

export type SuggestedReport = {
  /** What it is called, and therefore its identity: the row is saved as `custom:<slug of this>`. */
  title: string;
  /** One line under the title, for someone deciding whether they want it. */
  blurb: string;
  /** The instruction, in the customer's voice. Editable after it is created, like any other. */
  prompt: string;
  hour: number;
  days: ScheduleDays;
};

/**
 * By agent type. An unlisted type gets none, which is the right default: a suggestion nobody
 * thought about for this role is worse than no suggestion, because it arrives with our name on it.
 */
export const SUGGESTED_REPORTS: Record<string, SuggestedReport[]> = {
  realestate: [
    {
      // FIRST because it is the one that costs money to miss. Everything else here makes a good
      // week; this one stops a deal dying over a date nobody was watching.
      title: "Deal deadlines",
      blurb: "Every deal under contract, what is due in the next seven days, and whose job it is.",
      prompt:
        "Go through every deal I have under contract and use your transaction-timeline skill." +
        " For each one: what is due in the next seven days, the date, and whose job it is -" +
        " mine, my client's, the lender's, title's, or the other agent's. Put anything already" +
        " overdue at the top. Flag the steps I told you my deals usually go wrong at, even if" +
        " they are not due yet. If nothing is due this week, say that in one line.",
      hour: 7,
      days: "weekdays",
    },
    {
      title: "Leads gone quiet",
      blurb: "Who has not heard from you in two weeks, and the message to send them.",
      prompt:
        "List every lead I have not been in contact with for fourteen days or more, oldest" +
        " first, with where they came from and what they last said they wanted. For each one," +
        " draft the next message using your lead-followup skill and my own follow-up cadence." +
        " Do not send anything. If someone should be dropped rather than chased, say so.",
      hour: 8,
      days: "wednesday",
    },
    {
      title: "Listing check",
      blurb: "Days on market, activity since last week, and when it is time to talk about price.",
      prompt:
        "For each of my active listings: days on market, showings and enquiries since last" +
        " Monday, and how it compares to what similar homes in that area are doing. Tell me" +
        " which ones are tracking fine and which ones are not, and for any that are not, what" +
        " you would do about it - price, photos, or something else. Say plainly if you think" +
        " it is time for a price conversation with the seller, and why.",
      hour: 8,
      days: "monday",
    },
    {
      title: "Week's showings",
      blurb: "What is booked this week, and anything without a confirmed time.",
      prompt:
        "List the showings and appointments I have this week in day order, with the property," +
        " who is coming, and the time. Flag any that do not have a confirmed time yet, any" +
        " that are back to back without enough drive time between them, and anything I have" +
        " not confirmed with the other side.",
      hour: 7,
      days: "monday",
    },
    {
      // The one everybody knows they should do and nobody does, which is why it is worth having
      // arrive rather than remembering. Referrals are most agents' best lead source and their
      // least worked one.
      title: "People to reach out to",
      blurb: "Three past clients worth a message this week, and why now.",
      prompt:
        "Pick three people from my past clients and sphere who are worth a message this week," +
        " and tell me why each one now - a purchase anniversary, how much equity they are" +
        " likely sitting on, something that has happened in their neighbourhood, or just how" +
        " long it has been. Draft each message in my voice. Keep them personal and short, and" +
        " do not make any of them about asking for business.",
      hour: 9,
      days: "thursday",
    },
  ],

  // THE LEGAL SET LEANS ON DATES more than the real estate one leans on anything, and that is not
  // a stylistic difference. A missed showing costs a Saturday. A missed notice window renews a
  // contract for a year, and a missed filing deadline can end a matter outright. Three of these
  // five exist because the thing they watch passes silently when nobody looks.
  //
  // Every one of them stops at drafting. None asks the agent to send, file or advise, because the
  // skills they lean on will refuse anyway and a report whose instruction fights its own skill
  // produces an argument instead of a report.
  legal: [
    {
      title: "Deadlines this week",
      blurb: "Every date landing in the next seven days, and whose move it is.",
      prompt:
        "Go through my open matters and use your key-dates skill. List everything due in the" +
        " next seven days: the date, the matter, what has to happen, and whose move it is." +
        " Anything already overdue goes at the top. For a notice window, give me the date I" +
        " need to ACT by, not the date it expires. If nothing is due, say so in one line.",
      hour: 7,
      days: "weekdays",
    },
    {
      // Ninety days rather than seven, and separate from the report above on purpose: a notice
      // window found the week it closes is a window you have already lost. This is the report
      // that exists because auto-renewal is the most expensive clause in commercial contracting.
      title: "Renewals ahead",
      blurb: "Auto-renewals and notice windows opening in the next 90 days.",
      prompt:
        "Look 90 days out across my agreements and list every auto-renewal, notice window and" +
        " termination right coming up. For each: the agreement, the date the window opens and" +
        " closes, what has to be done and how it has to be delivered, and what happens if we" +
        " miss it - including the new term and price. Sort by the date I need to act, not by" +
        " the date it expires.",
      hour: 8,
      days: "monday",
    },
    {
      title: "Sitting with you",
      blurb: "Drafts and reviews waiting on a sign-off, oldest first.",
      prompt:
        "List everything I have drafted or reviewed that is waiting on my sign-off before it" +
        " can move, oldest first. For each: what it is, who is waiting, how long it has been" +
        " sitting, and what happens next once I approve it. Check my stated turnaround and" +
        " flag anything that has already blown it. Do not send anything.",
      hour: 17,
      days: "weekdays",
    },
    {
      title: "Matters gone quiet",
      blurb: "Open matters with no movement in two weeks, and what would unstick each one.",
      prompt:
        "List every open matter with no movement in fourteen days or more, oldest first. For" +
        " each: where it stands, what it is waiting on, and who owes the next move - me, the" +
        " client, or the other side. Say in one line what would unstick it, and draft the" +
        " chaser where a chaser is the answer. Flag any where the delay itself is becoming a" +
        " problem.",
      hour: 8,
      days: "wednesday",
    },
    {
      title: "Intake queue",
      blurb: "What came in, what is still unscoped, and anything that needs a conflicts check.",
      prompt:
        "Use your matter-intake skill on everything that has arrived and not yet been scoped." +
        " For each: who asked, what they want, the deadline and whether it is real. Flag" +
        " anything that still needs a conflicts check, anything where the scope is ambiguous," +
        " and anything that looks outside our practice areas. Rank by my stated turnaround.",
      hour: 8,
      days: "weekdays",
    },
  ],
};

export function suggestedReportsFor(agentTypeId: string | null | undefined): SuggestedReport[] {
  return (agentTypeId && SUGGESTED_REPORTS[agentTypeId]) || [];
}
