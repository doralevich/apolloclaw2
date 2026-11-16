// Blog triage (Donna's audit of Nov 12 2026, CSV approved by David Nov 14 2026).
//
// The posts live in Sanity, so the decisions live here: one list for what is kept live but out
// of search, one map for what 301s into another page. next.config.ts reads BLOG_MERGES, the post
// page reads BLOG_NOINDEX for its robots tag, and the sitemap and blog index drop both sets.
// KEEP and REFRESH rows need no entry. A merge target is always a KEEP or REFRESH page (checked
// when this was written), so no redirect here points at another redirect.

/** Posts that stay live at their URL with robots "noindex, follow" and a self canonical. */
export const BLOG_NOINDEX: readonly string[] = [
  "ai-caddie-us-open-2026",
  "feed-the-beast",
  "fifa-2026-field-guide-ai",
  "fitness-studio-churn-ai-retention",
  "how-to-study-for-finals-with-ai",
  "jill-anniversary-norma-ai-operating-system",
  "new-york-never-stopped-believing",
  "restaurant-ai-never-calls-in-sick",
  "shop-smarter-this-holiday-season-with-ai",
  "we-let-ai-handle-client-onboarding-for-a-month",
  "what-does-your-ai-do-on-memorial-day-weekend",
];

/** Merged posts: slug -> destination path on apolloclaw.ai. The source file stays in Sanity. */
export const BLOG_MERGES: Readonly<Record<string, string>> = {
  "5-things-ai-assistant-can-do": "/blog/5-things-ai-can-do-for-your-business-that-youd-never-think-of",
  "a-real-morning-with-an-ai-agent": "/blog/what-personal-ai-agent-does-daily",
  "accounting-firm-stopped-doing-busywork": "/blog/accounting-firm-month-end-client-updates-ai",
  "ai-agent-intake-process-explained": "/blog/what-ai-intake-does-in-60-seconds",
  "ai-agents-chatbots-copilots-whats-the-difference": "/compare/ai-agent-vs-chatbot",
  "ai-for-accounting-firms-month-end": "/blog/accounting-firm-month-end-client-updates-ai",
  "ai-for-staffing-agencies": "/blog/ai-resume-screening-staffing",
  "ai-intake-personal-injury-law": "/blog/personal-injury-firm-ai-case-automation",
  "ai-joins-google-meet-notes-action-items": "/blog/skill-of-the-week-let-ai-write-your-meeting-recaps",
  "cre-broker-ai-email-triage": "/blog/real-estate-broker-playbook",
  "five-ways-small-businesses-use-ai": "/blog/5-things-ai-can-do-for-your-business-that-youd-never-think-of",
  "freshman-reality-check-what-college-actually-looks-like": "/blog/what-is-a-college-agent",
  "great-ai-great-responsibility": "/blog/ai-approval-workflows-human-oversight",
  "how-a-3-person-law-firm-saved-12-hours-a-week": "/blog/what-three-law-firms-got-back",
  "how-to-land-internship-sophomore-year": "/blog/how-to-land-an-internship-junior-year-if-you-start-freshman-year",
  "i-asked-ai-to-answer-my-business-emails-for-a-week-heres-what-happened": "/blog/the-ai-tool-that-saved-me-3-hours-every-monday-morning",
  "med-spa-ai-booking": "/blog/med-spas-wellness-studios-ai-fill-calendars",
  "month-end-close-done-by-day-2-ai-agent-cpa-firms": "/blog/accounting-firm-month-end-client-updates-ai",
  "property-management-tenant-ai": "/blog/tenant-inquiries-after-hours-ai",
  "qbr-prep-shouldnt-cost-you-a-full-day-per-client": "/blog/client-status-emails-ai",
  "seasonal-email-15-minutes": "/blog/how-to-use-ai-to-write-follow-up-emails-that-actually-get-responses",
  "stop-losing-customers-after-the-first-sale": "/blog/ecommerce-ai-start-gaining-customers",
  "summer-2026-professional-personal-agent": "/blog/what-personal-ai-agent-does-daily",
  "this-private-medical-practice-cut-admin-time-by-25-in-three-weeks": "/blog/medical-practice-no-shows",
  "what-does-it-mean-to-train-ai-on-your-business": "/blog/how-to-train-an-ai-on-your-business-so-it-actually-sounds-like-you",
  "what-i-did-when-anthropic-broke-my-ai-agents": "/blog/claude-max-no-longer-works-with-openclaw",
  "why-law-firms-are-quietly-automating-admin-work": "/blog/what-three-law-firms-got-back",
};

export const isBlogNoindex = (slug: string) => BLOG_NOINDEX.includes(slug);
export const isBlogMerged = (slug: string) => Object.prototype.hasOwnProperty.call(BLOG_MERGES, slug);
