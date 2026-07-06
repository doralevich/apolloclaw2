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
    title: "Meetings & chat",
    toolkits: [
      toolkit("zoom", "Zoom", "Zoom for client calls, team meetings, and webinars."),
      toolkit("googlemeet", "Google Meet", "Google Meet for video calls and meetings."),
      toolkit("microsoft_teams", "Microsoft Teams", "Microsoft Teams for meetings and team chat."),
      toolkit("slack", "Slack", "Slack is a channel-based messaging platform."),
      toolkit("discord", "Discord", "Discord for community and team conversations."),
      toolkit("whatsapp", "WhatsApp", "WhatsApp for messaging customers and contacts."),
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

// Pinned at the top of Browse under a "Favorites" heading — the apps a business workspace
// connects first. Order here is display order. Edit freely; slugs must exist in the catalog above.
export const FAVORITE_INTEGRATION_SLUGS: string[] = [
  "gmail",
  "googlecalendar",
  "outlook",
  "googledrive",
  "one_drive",
  "dropbox",
  "notion",
  "slack",
  "microsoft_teams",
  "zoom",
  "hubspot",
  "linkedin",
  "googlesheets",
  "asana",
  "trello",
];
