export type Role = "admin";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
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
