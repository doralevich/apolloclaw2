// The one place the "book a consultation" destination lives.
//
// The link was hardcoded in ~23 places (every industry page, the agent pages, nav, footer, blog,
// the marketing chatbot, the 404). Switching schedulers meant a site-wide find-and-replace and a
// real chance of missing one. New code imports this; when the destination changes again, it's a
// one-line edit here.
export const SCHEDULE_CONSULT_URL = "https://cal.com/therealdaveo/apollo-claw";

// What the meeting is, for copy that wants to name it.
export const SCHEDULE_CONSULT_LABEL = "AI Strategy Consultation (45 min)";
