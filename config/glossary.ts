// What the words mean.
//
// The Credits page had been using "credits", "allowance", "cap", "top-up", "balance" and
// "calls" as though they were one word. Two of them reset every month, two never do, and one
// is a count rather than an amount of money. Somebody deciding whether to spend $250 should
// not have to infer that from the layout.
//
// Written for the person paying: no micros, no markup, no runtime. Lives in config/ rather
// than inside a component because two pages render it — the Guide in full, and the Credits
// page as a collapsible — and a definition that differs between them is worse than none.

export interface GlossaryTerm {
  term: string;
  definition: string;
  /** Shown on the Credits page's inline version. The rest are Guide-only, so the collapsible
   *  beside the balance stays about money rather than becoming the whole manual. */
  onCreditsPage?: boolean;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Credits",
    definition:
      "Money your agent spends to do things. Every answer it gives, every search it runs, and every action it takes in one of your tools costs a little. Credits are how that gets paid for.",
    onCreditsPage: true,
  },
  {
    term: "Monthly allowance",
    definition:
      "The $25 of usage included with your hosting each month. It refills on the 1st, and whatever you haven't used doesn't carry over. For most people this covers the whole month on its own.",
    onCreditsPage: true,
  },
  {
    term: "Available balance",
    definition:
      "What your agent can spend right now: whatever is left of this month's allowance, plus any credits you've bought. This is the number that matters — when it hits zero, your agent stops answering.",
    onCreditsPage: true,
  },
  {
    term: "Spent this month",
    definition:
      "What has come out of the monthly allowance since the 1st. Purchased credits are spent only after the allowance is used up, so this number is the honest read on whether $25 is enough for how you work.",
    onCreditsPage: true,
  },
  {
    term: "Top-up",
    definition:
      "Credits you buy on top of the allowance. They don't expire and they don't reset — buy $50 in March and it's still there in July if you haven't used it.",
    onCreditsPage: true,
  },
  {
    term: "A call",
    definition:
      "One request your agent makes: asking the model a question, running one web search, or taking one action in a connected app. A single reply to you is usually several calls, which is why the counts are higher than the number of things you asked for.",
    onCreditsPage: true,
  },
  {
    term: "LLM",
    definition:
      "The thinking. This is the model reading your question, working out what to do, and writing the answer — normally the biggest line on your bill, and the one that grows with longer conversations and bigger documents.",
    onCreditsPage: true,
  },
  {
    term: "Search",
    definition:
      "Looking things up on the live web, for anything the model can't know from training alone — today's news, current prices, a company that launched last month.",
    onCreditsPage: true,
  },
  {
    term: "Tools",
    definition:
      "Doing things in the apps you've connected: sending an email, creating a calendar event, updating a record in your CRM. Cheap per call, and the part that actually saves you time.",
    onCreditsPage: true,
  },
  {
    term: "Low balance warning",
    definition:
      "An email when your available balance drops below a line you choose. It exists because an agent that has run out doesn't announce it — it just stops being useful.",
    onCreditsPage: true,
  },
  {
    term: "Auto-recharge",
    definition:
      "Optional. When your balance falls below your chosen line, we buy the pack you picked and charge the card you last used, so your agent doesn't stop mid-week. We email you every time it happens, and three declined charges in a row switches it off.",
    onCreditsPage: true,
  },
  {
    term: "Your agent",
    definition:
      "A private machine that belongs to you alone. It isn't a shared account with a different personality bolted on — it has its own storage, its own memory of your business, and nobody else's data is anywhere near it.",
  },
  {
    term: "Integrations",
    definition:
      "The apps you've connected — email, calendar, CRM and so on. Connecting one is what turns your agent from something that gives advice into something that does the work.",
  },
  {
    term: "Setup questionnaire",
    definition:
      "The form you filled in when you bought. It's where your agent learned your business, your priorities and how you write. You can redo it any time, and everything it knows updates from your new answers.",
  },
  {
    term: "Model",
    definition:
      "Which AI does the thinking. Claude Sonnet 5 by default, which suits almost everything. Switching to a bigger one costs more per answer; switching to a smaller one is faster and cheaper.",
  },
];

/** The subset shown inline on the Credits page — money words only. */
export const CREDITS_GLOSSARY = GLOSSARY.filter((t) => t.onCreditsPage);
