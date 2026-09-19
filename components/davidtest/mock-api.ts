"use client";

import { buildChips, buildOpener } from "@/config/chat-opening";
import { connectionSet, scenario } from "@/config/davidtest";

// The fetch interceptor behind /davidtest.
//
// Installed at MODULE SCOPE, so it is in place before any provider mounts and asks for anything.
// A useEffect would be too late: ActiveAgentProvider fetches on its first render.
//
// WHAT IT DOES AND DOES NOT TOUCH. It answers exactly the reads the post-build screens make, and
// passes everything else through to the real fetch. Nothing it answers is a write, and no request
// it answers ever leaves the browser, so walking this area cannot create an agent, spend a
// credit, or change a row.
//
// THE ONE PIECE OF STATE is the connection set. It starts from the URL and then MUTATES when a
// Connect button is pressed, which is what makes the connect flow walkable: the real component
// opens a consent tab and polls until the toolkit shows ACTIVE, so flipping this on the click
// makes it advance exactly the way it will in production, on its own timing, through its own
// polling code. Nothing about ConnectFlow knows it is being tested.

const WORKSPACE = "davidtest-ws";
const AGENT = "davidtest-agent";

type MockWindow = Window & {
  __davidtestInstalled?: boolean;
  __davidtestConns?: string[];
};

function params(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

/** The live connection set: the URL's choice, then whatever has been "connected" since. */
function conns(): string[] {
  const w = window as MockWindow;
  if (!w.__davidtestConns) w.__davidtestConns = connectionSet(params().get("conns"));
  return w.__davidtestConns;
}

/** Called by the click handler when a Connect button is pressed. The next poll finds it. */
export function mockConnect(slug: string): void {
  const w = window as MockWindow;
  const next = new Set(conns());
  next.add(slug.toLowerCase());
  w.__davidtestConns = [...next];
}

export function mockAgentId(): string {
  return AGENT;
}

export function mockWorkspaceId(): string {
  return WORKSPACE;
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function agentRow(name: string) {
  return {
    agent37_id: AGENT,
    workspace_id: WORKSPACE,
    name,
    status: "running",
    template: null,
    agent_type: params().get("type") || "apollo",
    avatar_url: null,
    cpu: 2,
    memory: 4096,
    disk: 40,
    created_by: "davidtest",
    created_at: new Date().toISOString(),
    live_status: "running",
    status_reason: null,
    past_due: false,
    ports: [],
    update_available: false,
  };
}

export function installMockApi(): void {
  if (typeof window === "undefined") return;
  const w = window as MockWindow;
  if (w.__davidtestInstalled) return;
  w.__davidtestInstalled = true;

  const real = window.fetch.bind(window);

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(typeof input === "string" ? input : (input as Request).url ?? input);
    const answers = scenario(params().get("s")).answers;
    const name = params().get("name") || "Sloane";

    if (url.includes("/api/agents?workspace=")) {
      return json({ role: "admin", agents: [agentRow(name)] });
    }
    if (url.includes("/integrations/connections")) {
      return json({
        connections: conns().map((slug, i) => ({
          id: `mock-${i}`,
          status: "ACTIVE",
          userId: null,
          toolkitSlug: slug,
          toolkitName: slug,
          authConfigId: null,
          authScheme: "OAUTH2",
          isDisabled: false,
          createdAt: null,
          updatedAt: null,
        })),
      });
    }
    // The two endpoints this whole area exists to exercise. Built by the REAL generators, so what
    // shows here is what config/chat-opening.ts would produce for these answers in production.
    if (url.includes("/connect-plan")) {
      // Deliberately not guessed from the answers: the guess needs the account's email address,
      // which is a server-side read. The picker sets it instead.
      const v = params().get("vendor");
      return json(
        v === "google" || v === "microsoft"
          ? {
              vendor: v,
              reason:
                v === "google"
                  ? "You told us during setup that your email and calendar run on Google Workspace."
                  : "You listed Office 365 in your tech stack.",
            }
          : { vendor: null, reason: null }
      );
    }
    if (url.includes("/opening")) {
      return json({ opener: buildOpener(answers), chips: buildChips(answers), personalized: !!answers });
    }
    // Chat surfaces that would otherwise 404 and noise up the console. Empty is the right answer:
    // this area is about the WELCOME state, which is what an empty history renders.
    if (url.includes("/chat/sessions")) return json({ sessions: [] });
    if (url.includes("/chat/models")) return json({ models: [] });
    if (url.includes("/chat/files")) return json({ files: [] });
    if (url.includes("/channels")) return json({ channels: [] });
    if (url.includes("/checklist")) return json({ items: [], done: [], personalized: !!answers });

    return real(input as RequestInfo, init);
  }) as typeof window.fetch;

  // Connect buttons are plain links to the OAuth redirect route, which for a fake agent id would
  // 404 in a new tab and strand the walkthrough. Swallow the navigation and flip the mock instead,
  // so the flow advances through its own polling rather than through anything written for a test.
  document.addEventListener(
    "click",
    (e) => {
      const anchor = (e.target as HTMLElement)?.closest?.("a[href*='integrations/connect/redirect']");
      if (!anchor) return;
      e.preventDefault();
      const toolkit = new URL((anchor as HTMLAnchorElement).href, window.location.origin).searchParams.get(
        "toolkit"
      );
      if (toolkit) mockConnect(toolkit);
    },
    true
  );
}
