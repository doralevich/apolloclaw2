"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { composioLogoUrl } from "@/lib/integration-catalog";
import { isActiveConnection } from "@/lib/useChecklist";
import type { IntegrationConnection } from "@/lib/types";

// The first thing a new agent needs and the one thing nobody does.
//
// Nothing is connected when an agent is handed over. Every integration waits for the customer to
// go and find it, so a brand-new agent can talk, search and remember, and cannot see a single
// thing about its owner's actual week. Four of the five procedure skills we ship - the daily
// brief, meeting prep, the end-of-day summary, weekly planning - need a calendar on their FIRST
// step. On a fresh agent all of them stop there.
//
// Home already had a "Connect an app" tile. It competes with three others and it opens a
// catalogue of thirty-six, which is a fine place to browse and a bad place to be told what to do
// first. This says the one thing: connect a calendar.
//
// A PROMPT, NOT A GATE, deliberately. It sits above the tiles until something is connected, then
// it is gone for good - and "Not now" hides it for anyone who genuinely does not want it. An
// onboarding step nobody can skip is how a customer who just paid ends up unable to reach the
// product they bought.
//
// WHY NOT A STEP IN THE PAID FLOW. That was the original plan and this is better: the payment ->
// questionnaire -> build path is the most expensive thing in the product to get wrong, the agent
// does not exist yet while they are in it (so there is nothing to connect TO), and a prompt here
// reaches every customer who already has an agent rather than only the next one.

/** Calendar first, because that is what the skills actually stop on. Mail second, and only
 *  Gmail: Outlook's toolkit covers both, so it appears once rather than in both rows. */
const OPTIONS = [
  { slug: "googlecalendar", label: "Google Calendar", kind: "calendar" },
  { slug: "outlook", label: "Outlook", kind: "calendar and mail" },
  { slug: "gmail", label: "Gmail", kind: "mail" },
] as const;

const DISMISS_KEY = "apolloclaw-connect-prompt-dismissed";

function dismissedFor(agentId: string): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return raw ? (JSON.parse(raw) as unknown[]).includes(agentId) : false;
  } catch {
    return false;
  }
}

export function ConnectFirstPrompt({ agentId, agentName }: { agentId: string; agentName: string }) {
  // Three states, and "unknown" is not the same as "nothing connected". Rendering the prompt
  // before the answer arrives would flash it at every customer who has already connected
  // something, on every single page load.
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const check = useCallback(() => {
    if (dismissedFor(agentId)) return;
    apiFetch<{ connections: IntegrationConnection[] }>(`/api/agents/${agentId}/integrations/connections`)
      .then((res) => setShow(!res.connections.some(isActiveConnection)))
      // A failed lookup means we do not know, and we do not nag on a guess.
      .catch(() => setShow(false));
  }, [agentId]);

  useEffect(() => {
    check();
    // The OAuth round trip finishes in another tab, so nothing here would learn it happened.
    // Coming back to this tab is the signal - the same trick the checklist uses.
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [check]);

  async function connect(slug: string, label: string) {
    setBusy(slug);
    try {
      const res = await apiFetch<{ redirectUrl?: string }>(
        `/api/agents/${agentId}/integrations/connect`,
        { method: "POST", body: JSON.stringify({ toolkit: slug }) }
      );
      if (!res.redirectUrl) throw new Error(`${label} did not return a sign-in link.`);
      window.location.assign(res.redirectUrl);
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(null);
    }
  }

  function dismiss() {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      const list = raw ? (JSON.parse(raw) as unknown[]) : [];
      localStorage.setItem(DISMISS_KEY, JSON.stringify([...list.filter((x) => x !== agentId), agentId]));
    } catch {
      // Storage disabled. The prompt comes back next load, which is the harmless direction.
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/[0.03] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CalendarClock className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">{agentName} can&apos;t see your week yet</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Connect a calendar and it can brief you on your day, prep you for meetings, and tell you
            what slipped. Without one it can still talk, search and remember - it just has to ask
            you what&apos;s on.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {OPTIONS.map((o) => (
              <Button
                key={o.slug}
                variant="outline"
                className="bg-card"
                disabled={busy !== null}
                onClick={() => connect(o.slug, o.label)}
              >
                {busy === o.slug ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={composioLogoUrl(o.slug)} alt="" className="size-4 rounded-sm" />
                )}
                {o.label}
                <span className="text-xs font-normal text-muted-foreground">{o.kind}</span>
              </Button>
            ))}
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={dismiss}
              className="cursor-pointer text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
