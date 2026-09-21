// The one place the "book a consultation" destination lives.
//
// The link was hardcoded in ~23 places (every industry page, the agent pages, nav, footer, blog,
// the marketing chatbot, the 404). Switching schedulers meant a site-wide find-and-replace and a
// real chance of missing one. New code imports this; when the destination changes again, it's a
// one-line edit here.
export const SCHEDULE_CONSULT_URL = "https://cal.com/therealdaveo/dbdo-consultation";

// What the meeting is, for copy that wants to name it.
export const SCHEDULE_CONSULT_LABEL = "AI Strategy Consultation (45 min)";

/**
 * What the button says. David's rule, Sept 21 2026: the CTA is always "Book a Discovery Call".
 *
 * It was "Schedule a Consultation" in the nav, footer and most page CTAs, "Book a Free Call" on
 * /what-we-do and "Schedule Today" in the footer button, which is three names for one meeting.
 * Import this rather than typing it, for the same reason the URL lives here.
 */
export const SCHEDULE_CONSULT_CTA = "Book a Discovery Call";
