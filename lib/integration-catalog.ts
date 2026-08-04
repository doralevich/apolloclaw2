import type { IntegrationToolkit } from "@/lib/types";

// Composio serves a logo per toolkit slug at a fixed URL scheme. Shared so the catalog below and
// the marketing globe resolve logos the same way.
export function composioLogoUrl(slug: string) {
  return `https://logos.composio.dev/api/${slug}`;
}

function toolkit(
  slug: string,
  name: string,
  description: string,
  authSchemes: string[] = ["OAUTH2"]
): IntegrationToolkit {
  return {
    slug,
    name,
    description,
    logo: composioLogoUrl(slug),
    enabled: true,
    isNoAuth: false,
    authSchemes,
  };
}

// Static first-paint catalog for Browse, organized into Composio-style categories so the
// grid reads as a store, not a wall. Live Agent37/Composio search still runs for typed
// queries, and "Show more apps" pages through the full remote catalog.
//
// SLUGS MUST MATCH Composio's toolkit slugs exactly (docs.composio.dev/toolkits/<slug>) —
// a wrong slug means a broken logo AND a failed connect. Note the inconsistent naming
// upstream: googledrive/googlecalendar are unseparated but one_drive/microsoft_teams use
// underscores. Verify against the docs before adding entries.
//
// NO CHAT APPS HERE. Slack, Discord, WhatsApp and Telegram are deliberately absent: where you
// talk to your agent is a different question from what your agent can reach, and answering both
// on one screen is what made this page hard to scan. Connections is for the tools an agent acts
// on — mail, files, calendars, CRM. Don't add a messaging app back to this list.

export type IntegrationCategory = { title: string; toolkits: IntegrationToolkit[] };

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    title: "Email & calendar",
    toolkits: [
      toolkit("gmail", "Gmail", "Gmail is Google's email service."),
      toolkit("googlecalendar", "Google Calendar", "Google Calendar helps manage schedules and events."),
      toolkit("outlook", "Outlook", "Outlook is Microsoft's email and calendar platform."),
      toolkit("calendly", "Calendly", "Calendly schedules meetings without the back-and-forth."),
    ],
  },
  {
    title: "Files & docs",
    toolkits: [
      toolkit("googledrive", "Google Drive", "Google Drive stores and shares cloud files."),
      toolkit("googledocs", "Google Docs", "Google Docs is a collaborative document editor."),
      toolkit("googlesheets", "Google Sheets", "Google Sheets is a cloud spreadsheet tool."),
      toolkit("one_drive", "OneDrive", "OneDrive for Microsoft 365 cloud files."),
      toolkit("dropbox", "Dropbox", "Dropbox for cloud file storage and team sharing."),
      toolkit("box", "Box", "Box for secure cloud file storage and sharing."),
    ],
  },
  {
    title: "Tasks & projects",
    toolkits: [
      toolkit("googletasks", "Google Tasks", "Google Tasks helps track tasks and to-dos."),
      toolkit("todoist", "Todoist", "Todoist keeps tasks and to-do lists organized."),
      toolkit("notion", "Notion", "Notion centralizes notes, docs, wikis, and tasks."),
      toolkit("trello", "Trello", "Trello organizes projects on kanban boards."),
      toolkit("asana", "Asana", "Asana tracks team tasks, deadlines, and projects."),
      toolkit("airtable", "Airtable", "Airtable merges spreadsheets with databases."),
      toolkit("linear", "Linear", "Linear tracks issues and product work."),
      toolkit("jira", "Jira", "Jira tracks bugs, issues, and project work."),
    ],
  },
  {
    title: "Meetings",
    toolkits: [
      toolkit("zoom", "Zoom", "Zoom for client calls, team meetings, and webinars."),
      toolkit("googlemeet", "Google Meet", "Google Meet for video calls and meetings."),
      toolkit("microsoft_teams", "Microsoft Teams", "Microsoft Teams for meetings and team chat."),
    ],
  },
  {
    title: "Sales & marketing",
    toolkits: [
      toolkit("hubspot", "HubSpot", "HubSpot manages CRM, marketing, and sales workflows."),
      toolkit("linkedin", "LinkedIn", "LinkedIn for networking, hiring, and your company's presence."),
      toolkit("youtube", "YouTube", "YouTube hosts and manages video content."),
      toolkit("twitter", "Twitter", "Twitter connects posts, profiles, and social data."),
      toolkit("reddit", "Reddit", "Reddit hosts communities and discussion threads."),
    ],
  },
  {
    title: "Design & code",
    toolkits: [
      toolkit("canva", "Canva", "Canva for presentations, social graphics, and marketing assets."),
      toolkit("figma", "Figma", "Figma supports collaborative design workflows."),
      toolkit("github", "GitHub", "GitHub is a code hosting platform."),
      toolkit("supabase", "Supabase", "Supabase is an open-source backend platform.", ["API_KEY"]),
    ],
  },
  {
    title: "Research & agent tools",
    toolkits: [
      toolkit("perplexityai", "Perplexity AI", "Perplexity AI provides conversational answer search.", ["API_KEY"]),
      toolkit("codeinterpreter", "Code Interpreter", "Code Interpreter runs Python and data analysis tasks.", []),
      toolkit("serpapi", "SerpApi", "SerpApi provides real-time search results.", ["API_KEY"]),
      toolkit("firecrawl", "Firecrawl", "Firecrawl automates web crawling and extraction.", ["API_KEY"]),
      toolkit("tavily", "Tavily", "Tavily offers search and data retrieval for agents.", ["API_KEY"]),
    ],
  },
];

// Flat view of the curated catalog — instant client-side filtering searches this.
export const DEFAULT_INTEGRATION_TOOLKITS: IntegrationToolkit[] = INTEGRATION_CATEGORIES.flatMap(
  (c) => c.toolkits
);

// slug -> category title, so a card can name its own category when it turns up outside its
// section (search results, the flat "all apps" grid). Undefined for anything that came from
// the remote catalog rather than the curated list above.
const CATEGORY_BY_SLUG = new Map<string, string>(
  INTEGRATION_CATEGORIES.flatMap((c) => c.toolkits.map((t) => [t.slug.toLowerCase(), c.title] as const))
);

export function categoryForSlug(slug: string): string | undefined {
  return CATEGORY_BY_SLUG.get(slug.toLowerCase());
}

// Pinned at the top of Browse. Order here is display order; slugs must exist in the catalog
// above.
//
// This was a fifteen-item "Favorites" list, which is not a shelf — it was most of the curated
// catalogue reprinted above itself, so it told you nothing about where to start. It is now one
// idea: mail, calendar, files. Those are the three things that change whether an agent can do
// anything at all, and every one of them is a connection you make once and never think about.
//
// The messaging half of this shelf is gone with the chat apps (see the note above the catalog).
// Microsoft Teams came off the pin with them rather than standing alone as the sole survivor of
// a group that no longer exists; it is still in Meetings. Notion, Zoom, HubSpot, LinkedIn,
// Sheets, Asana and Trello likewise stay in their own categories — good apps, but none of them
// is the first connection anyone should make.
export const ESSENTIAL_INTEGRATION_SLUGS: string[] = [
  "gmail",
  "outlook",
  "googlecalendar",
  "googledrive",
  "one_drive",
  "dropbox",
];
