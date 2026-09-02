// admin = full control: workspace settings, billing, invites, agent lifecycle.
// member = day-to-day use: chat, connections, reading usage.
export type Role = "admin" | "member";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  /** The customer's uploaded logo. Null for most workspaces — the dashboard falls back to
   *  the ApolloClaw mark, which is a first-class state rather than a gap. */
  logo_url?: string | null;
}

export interface WorkspaceWithRole extends Workspace {
  role: Role;
}

export interface WorkspaceMember {
  user_id: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Invitation {
  token: string;
  workspace_id: string;
  role: Role;
  created_at: string;
  expires_at: string;
  // Full shareable link, computed server-side (honors NEXT_PUBLIC_SITE_URL).
  url: string;
  /** Who it was sent to. Null for the old copy-a-link invitations, which have no recipient. */
  email: string | null;
  /** A paid agent seat rides on this invitation (built and billed at invite time). */
  with_agent: boolean | null;
}

export interface AgentRow {
  agent37_id: string;
  workspace_id: string;
  name: string | null;
  status: string | null;
  template: string | null;
  // Storefront agent-type id (config/agent-types.ts); null on rows that predate it.
  agent_type: string | null;
  // Public image URL (Supabase Storage upload or an inline data: URI preset), set during
  // onboarding personalization. Null until the customer picks one.
  avatar_url: string | null;
  cpu: number | null;
  memory: number | null;
  disk: number | null;
  created_by: string | null;
  created_at: string;
}

export interface Agent {
  id: string;
  status: string;
  status_reason: {
    code: string;
    message: string;
    operation: string;
    at: number;
  } | null;
  template: string;
  image_ref: string;
  resources: { cpu: number; memory: number; disk: number };
  ports: { port: number; default: boolean; url: string }[];
  user: string | null;
  name: string | null;
  metadata: Record<string, unknown> | null;
  paid_through: number | null;
  past_due: boolean;
  created: number | null;
}

export interface Template {
  name: string;
  scope: "system" | "workspace";
  image_ref: string;
  agents: string[];
  description: string;
  ports: { port: number; default: boolean }[];
  created: number | null;
  updated: number | null;
}

export interface Budget {
  monthly_cap_micros: number;
  monthly_consumed_micros: number;
  monthly_remaining_micros: number;
  monthly_period: string;
  topup_remaining_micros: number;
  updated_at: number | null;
}

export interface Usage {
  period: string;
  total_micros: number;
  by_integration: {
    llm: { cost_micros: number; calls: number; input_tokens: number; output_tokens: number };
    brave: { cost_micros: number; calls: number };
    composio: { cost_micros: number; calls: number };
  };
}

export interface MergedAgent extends AgentRow {
  live_status: string | null;
  status_reason: Agent["status_reason"];
  past_due: boolean;
  ports: Agent["ports"];
  update_available: boolean;
  /**
   * Whether this agent's setup questionnaire has been completed, and whether those answers
   * have been pushed into the running agent. Tracked per agent type, not per workspace.
   *
   * `undefined` means the lookup failed, which is deliberately distinct from `false`: the UI
   * stays quiet rather than telling someone their setup is incomplete when we simply could
   * not tell.
   */
  setup_completed?: boolean;
  setup_injected?: boolean;
}

// ---- Agent37 Agents API (per-instance web chat) ----

// One model the instance's agent can run (GET /v1/models -> data[]). Current Hermes builds report
// the provider slug as `owned_by` ("anthropic"); the older metered build used `provider`
// ("custom:agent37"). Read `owned_by ?? provider` so the switcher groups correctly on either.
export interface AgentModel {
  id: string;
  label: string;
  owned_by?: string;
  provider?: string;
  is_default?: boolean;
  // Vendor to group under in the switcher, set by our own curation (config/chat-models.ts).
  // `owned_by` stays whatever the gateway reported — it is the transport provider and gets
  // sent back on requests — so the display grouping needs its own field rather than
  // overwriting one the API round-trips.
  display_provider?: string;
}

export interface ModelsResponse {
  default_model: string | null;
  default_provider: string | null;
  data: AgentModel[];
}

// One message in a conversation's history (GET /v1/sessions/{id}).
export interface ChatHistoryMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  thinking?: string;
  created_at: number;
}

export interface SessionDetail {
  id: string;
  agent: string;
  history: ChatHistoryMessage[];
}

// One conversation in the instance's session list (GET /v1/sessions -> data[]). Current Hermes
// builds carry a server-side `title` (settable via PATCH /v1/sessions/{id}) plus a `preview` of
// the first message and `last_active`/`started_at` timestamps. The rail label is resolved in the
// sessions route as `title || preview`; ordering is by `last_active`. There is no local sessions
// table — the Agents API is the source of truth.
export interface SessionSummary {
  id: string;
  title?: string | null;
  preview?: string | null;
  last_active?: number | null;
  started_at?: number | null;
}

export interface SessionListResponse {
  data: SessionSummary[];
}

// ---- Platform admin god-view (/admin) ----

// One row in the Accounts tab: an auth user plus everything that hangs off them, enough to
// tell a paying customer from a leftover test account without leaving the page.
export interface AdminAccount {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_platform_admin: boolean;
  entitlement: string | null;
  /** When set and in the future, the account is in its post-cancellation grace window. */
  grace_until: string | null;
  workspaces: { id: string; name: string; role: string; member_count: number; agent_count: number }[];
  agents_owned: { agent37_id: string; name: string | null }[];
}

// One row in the Agents tab: the database's view and Agent37's, compared. "ok" means both
// systems agree the agent exists; "ghost" is a database row whose instance is gone; "orphan"
// is an instance with no database row; "unknown" means Agent37 couldn't be reached to judge.
export interface AdminAgentOverview {
  agent37_id: string;
  name: string | null;
  presence: "ok" | "ghost" | "orphan" | "unattributed" | "external" | "unknown";
  live_status: string | null;
  db_status: string | null;
  workspace_id: string | null;
  workspace_name: string | null;
  owner_email: string | null;
  /** Owned by someone other than the workspace owner - an added seat, shown nested. */
  is_member_agent: boolean;
  avatar_url: string | null;
  agent_type: string | null;
  /** Agent37 template the box actually runs, from live truth. Null when Agent37 was unreachable. */
  template: string | null;
  /**
   * For presence "external": the app that owns the instance, read from its `app` metadata
   * stamp (e.g. "college-agent"). Null for everything this app owns or cannot attribute.
   */
  external_app: string | null;
  created_at: string | null;
  /** Set when the agent is soft-deleted (in the trash), null when live. */
  deleted_at: string | null;
  /** When the purge cron may destroy a soft-deleted agent for good. */
  purge_after: string | null;
}

// One row in the all-workspaces table. Counts are computed server-side across every
// tenant via the service-role client (RLS would otherwise hide other people's data).
export interface AdminWorkspaceSummary {
  id: string;
  name: string;
  owner_id: string;
  owner_email: string | null;
  created_at: string;
  member_count: number;
  agent_count: number;
  running_count: number;
  /** The calling platform admin already holds a membership (support access is open). */
  you_are_member: boolean;
  /** The calling admin OWNS this workspace (their own, not a support membership). */
  you_own: boolean;
}

// One instance inside an expanded workspace row, enriched with live agent37 state plus
// per-instance budget/usage (fetched lazily on expand). budget/usage are null when the
// agent37 call fails (e.g. unfunded wallet, instance not yet provisioned).
export interface AdminAgentDetail extends AgentRow {
  live_status: string | null;
  status_reason: Agent["status_reason"];
  past_due: boolean;
  budget: Budget | null;
  usage: Usage | null;
}

// ---- App integrations (managed Composio, per-instance) ----
// Shapes for the Integrations tab, mirroring the v1 control-plane responses under
// /instances/{id}/integrations/* (toolkits search, OAuth connect link, connected accounts).

// One app in the searchable catalog (a Composio "toolkit").
export interface IntegrationToolkit {
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  enabled: boolean;
  isNoAuth: boolean;
  authSchemes: string[];
}

// `nextCursor`/`totalItems` are paging metadata; the tab only renders the first page of `items`.
export interface IntegrationToolkitsResult {
  items: IntegrationToolkit[];
  nextCursor: string | null;
  totalItems: number;
}

// Composio's connected-account shape. `status` is "ACTIVE" once the OAuth handshake completes;
// `isDisabled` marks a revoked link. Every field is present but values may be null.
export interface IntegrationConnection {
  id: string;
  status: string;
  userId: string | null;
  toolkitSlug: string | null;
  toolkitName: string | null;
  authConfigId: string | null;
  authScheme: string | null;
  isDisabled: boolean;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface IntegrationConnectionsResult {
  connections: IntegrationConnection[];
}

// POST /integrations/connect — `redirectUrl` is the app's OAuth sign-in to open in a new tab;
// the connection flips to ACTIVE once the user finishes there (we poll connections for it).
export interface IntegrationConnectResult {
  toolkit: string;
  connectedAccountId: string;
  redirectUrl: string;
}

// ── Channels ────────────────────────────────────────────────────────────────────────────────
//
// Where the agent can be talked to, as opposed to what it can reach (that's Integrations
// above). A channel is the customer's OWN account or bot — their WhatsApp, their Telegram bot,
// an app in their Slack workspace — so the agent answers them and nobody else.
//
// THE WIRE SHAPES BELOW ARE PROVISIONAL. See the banner over the channel methods in
// lib/agent37.ts: they were written against the flows in the product screenshots, not against a
// spec, because the Agent37 API host isn't reachable from the build environment. Anything the
// runtime actually returns wins over this.

// Discord was here as a fourth, permanently "coming soon" — it delivers direct messages over a
// gateway socket rather than a webhook, and there is nothing on Vercel to hold a socket open. A
// card that has advertised a thing we aren't building is worse than a shorter list, so it's gone.
export type ChannelId = "whatsapp" | "telegram" | "slack";

export type ChannelState =
  // Live: the agent is listening and will answer here.
  | "connected"
  // Started but unfinished — a QR waiting to be scanned, an OAuth tab still open.
  | "pending"
  | "disconnected"
  // The credential stopped working (token revoked, device unlinked). Distinct from
  // disconnected: the customer set this up once and wants to know it broke.
  | "error";

export interface Channel {
  channel: ChannelId;
  state: ChannelState;
  /** Human-readable "connected as": a phone number, @botname, or workspace name. */
  account?: string | null;
  /** Why it's in an error state, when the runtime says. */
  message?: string | null;
  /**
   * For WhatsApp: the token Meta echoes when the customer saves the callback URL.
   *
   * The one value here that IS shown to the browser, because the setup cannot be completed
   * without pasting it into Meta's console. It authenticates a one-time handshake and grants
   * nothing else — unlike the access token and app secret, which never leave the server.
   */
  verifyToken?: string | null;
  updatedAt?: number | null;
}

export interface ChannelsResult {
  channels: Channel[];
}

// A public port: one HTTPS URL for one port of one instance, reachable with no credential, that
// keeps working until deleted. The way an external service (Telegram, a payment processor) gets
// a permanent address to POST to, since none of them will ever send our sk_live_ key.
//
// Verified against docs.agent37.com/docs/agents-api/public-ports.
export interface PublicPort {
  port: number;
  /** With no prefix this is a 20-char random slug, and the URL itself is the only credential. */
  url: string;
  /** The same URL mirrored under each active custom domain; empty until one is active. */
  domain_urls: string[];
  /** Echoes the requested prefix, or null for a slug URL. */
  prefix: string | null;
  /** Unix SECONDS (not ms, unlike the gateway's response timestamps). */
  created: number;
}
