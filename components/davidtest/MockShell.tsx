"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { WorkspaceProvider } from "@/components/WorkspaceProvider";
import { ActiveAgentProvider } from "@/components/ActiveAgentProvider";
import { CONNECTION_SETS, SCENARIOS, scenario } from "@/config/davidtest";
import { installMockApi, mockWorkspaceId } from "@/components/davidtest/mock-api";

// Installed here, at import, rather than in an effect: ActiveAgentProvider fetches on its first
// render, so an effect would miss it.
installMockApi();

const subscribeNever = () => () => {};

/** The current query string, read after hydration. The server has no location, and every control
 *  below is a link that changes it, so the whole control bar is derived from this. */
function useSearch(): URLSearchParams {
  const raw = useSyncExternalStore(
    subscribeNever,
    () => window.location.search,
    () => ""
  );
  return new URLSearchParams(raw);
}

/**
 * The frame every /davidtest screen sits in: a control bar, then the real component underneath it
 * inside the real providers.
 *
 * The bar is LINKS, not state. Every control is a full navigation, which remounts the screen
 * below - and that is the point: the connect flow and the chat welcome both do their work on
 * mount, so a control that only changed React state would show a screen that had already decided
 * what to render. Navigation also means every combination is a URL, so a screen worth showing
 * somebody is a link you can send them.
 */
export function MockShell({
  title,
  children,
  controls = [],
}: {
  title: string;
  children: React.ReactNode;
  /** Which control groups this screen actually responds to. */
  controls?: Array<"scenario" | "conns" | "vendor">;
}) {
  const search = useSearch();
  const current = scenario(search.get("s"));

  const href = (key: string, value: string) => {
    const next = new URLSearchParams(search);
    if (value) next.set(key, value);
    else next.delete(key);
    // Dropping the mutated connection set: a control change should start the screen over, not
    // inherit whatever was clicked into existence on the last run.
    return `?${next.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/60 px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Link href="/davidtest" className="text-sm font-semibold underline underline-offset-4">
              davidtest
            </Link>
            <span className="text-sm text-muted-foreground">/ {title}</span>
            <span className="ml-auto rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
              Nothing here is saved
            </span>
          </div>

          {controls.includes("scenario") && (
            <Row label="Answers">
              {SCENARIOS.map((s) => (
                <Chip key={s.id} href={href("s", s.id)} on={current.id === s.id} title={s.note}>
                  {s.label}
                </Chip>
              ))}
            </Row>
          )}
          {controls.includes("conns") && (
            <Row label="Connected">
              {CONNECTION_SETS.map((c) => (
                <Chip key={c.id} href={href("conns", c.id)} on={(search.get("conns") ?? "none") === c.id}>
                  {c.label}
                </Chip>
              ))}
            </Row>
          )}
          {controls.includes("vendor") && (
            <Row label="Guess">
              {[
                // Labelled "Pre-select", not just the vendor name: the screen below has its own
                // Google and Microsoft buttons, and two controls with the same word on them is a
                // confusion this bar can avoid by being specific about what it does.
                { id: "", label: "No guess (asks cold)" },
                { id: "google", label: "Pre-select Google" },
                { id: "microsoft", label: "Pre-select Microsoft" },
              ].map((v) => (
                <Chip key={v.id || "none"} href={href("vendor", v.id)} on={(search.get("vendor") ?? "") === v.id}>
                  {v.label}
                </Chip>
              ))}
            </Row>
          )}

          {controls.includes("scenario") && (
            <p className="text-xs leading-relaxed text-muted-foreground">{current.note}</p>
          )}
        </div>
      </div>

      <WorkspaceProvider
        initialWorkspaces={[
          {
            id: mockWorkspaceId(),
            name: "Test Workspace",
            owner_id: "davidtest",
            created_at: new Date().toISOString(),
            role: "admin",
          },
        ]}
        userId="davidtest"
        userEmail="daveo@designsbydaveo.com"
        userFirstName="David"
        userFullName="David O"
        isPlatformAdmin
      >
        <ActiveAgentProvider>{children}</ActiveAgentProvider>
      </WorkspaceProvider>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  href,
  on,
  title,
  children,
}: {
  href: string;
  on: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        on ? "border-foreground bg-foreground text-background" : "hover:border-foreground/30"
      }`}
    >
      {children}
    </Link>
  );
}
