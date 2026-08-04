"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  Copy,
  FolderOpen,
  LayoutDashboard,
  MoreHorizontal,
  Play,
  RotateCw,
  Square,
  Terminal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { isTransitional } from "@/lib/format";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { portsForTemplate, type PortName } from "@/config/agents";
import type { MergedAgent, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ConfirmDialog";

// The "open a port in a new tab" quick actions — identical button, varying port/icon/label.
// Only rendered for ports the agent's template actually serves (portsForTemplate).
const PORT_ACTIONS: ReadonlyArray<{
  name: PortName;
  Icon: typeof LayoutDashboard;
  label: string;
  aria: string;
}> = [
  { name: "dashboard", Icon: LayoutDashboard, label: "Open the dashboard", aria: "Open dashboard" },
  { name: "files", Icon: FolderOpen, label: "Open file browser", aria: "Open file browser" },
  { name: "terminal", Icon: Terminal, label: "Open terminal", aria: "Open terminal" },
];

export function AgentActionsMenu({
  agent,
  role,
  isPlatformAdmin,
  onChanged,
}: {
  agent: MergedAgent;
  role: Role;
  isPlatformAdmin: boolean;
  onChanged: () => void;
}) {
  const isAdmin = role === "admin";
  const running = agent.live_status === "running";
  const transitional = isTransitional(agent.live_status);
  const ports = portsForTemplate(agent.template);

  // Control UI, file browser and terminal are root access to the box, and they used to render
  // for any workspace member. They are indispensable to us and hazardous to a customer: the
  // file browser is two clicks from deleting SOUL.md, after which the agent forgets who it is
  // and its owner has no way to know why. Platform admins only — a different gate from `role`,
  // which is the CUSTOMER's admin, and who owning the agent does not make a sysadmin.
  const portActions = isPlatformAdmin
    ? PORT_ACTIONS.filter(({ name }) => ports[name] !== undefined)
    : [];

  const [deleting, setDeleting] = useState(false);
  const [opening, setOpening] = useState<number | null>(null);
  const { busy, run } = useAsyncAction();

  function action(path: string, msg: string) {
    return run(async () => {
      await apiFetch(`/api/agents/${agent.agent37_id}/${path}`, { method: "POST" });
      toast.success(msg);
      onChanged();
    });
  }

  async function openPort(port: number) {
    setOpening(port);
    try {
      const { url } = await apiFetch<{ url: string }>(
        `/api/agents/${agent.agent37_id}/signed-url`,
        { method: "POST", body: JSON.stringify({ port }) }
      );
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOpening(null);
    }
  }

  async function copyDashboardUrl() {
    if (ports.dashboard === undefined) return;
    const toastId = toast.loading("Preparing dashboard URL…");
    try {
      // Same signed URL "Open the dashboard" uses — already carries the #token= fragment.
      const { url } = await apiFetch<{ url: string }>(
        `/api/agents/${agent.agent37_id}/signed-url`,
        { method: "POST", body: JSON.stringify({ port: ports.dashboard }) }
      );
      await navigator.clipboard.writeText(url);
      toast.success("Dashboard URL copied to clipboard", { id: toastId });
    } catch (e) {
      toast.error((e as Error).message, { id: toastId });
    }
  }

  async function remove() {
    await apiFetch(`/api/agents/${agent.agent37_id}`, { method: "DELETE" });
    toast.success("Agent deleted");
    onChanged();
  }

  return (
    <>
      <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-center gap-2">
        {portActions.map(({ name, Icon, label, aria }) => (
          <Tooltip key={name}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                disabled={!running || opening === ports[name]}
                onClick={() => openPort(ports[name]!)}
                aria-label={aria}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}

        {isAdmin && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                disabled={!running || busy}
                onClick={() => action("restart", "Restarting")}
                aria-label="Restart this agent"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restart this agent</TooltipContent>
          </Tooltip>
        )}

        {isAdmin && agent.update_available && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-amber-400 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                disabled={transitional || busy}
                onClick={() => action("update", "Updating")}
                aria-label="Update agent (update available)"
              >
                <ArrowDownToLine className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Update available — roll to the latest image</TooltipContent>
          </Tooltip>
        )}

        {isAdmin && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    disabled={busy}
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>More actions</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="min-w-[12rem]">
              {ports.dashboard !== undefined && (
                <>
                  <DropdownMenuItem disabled={!running} onClick={copyDashboardUrl}>
                    <Copy />
                    Copy dashboard URL
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {running ? (
                <DropdownMenuItem onClick={() => action("stop", "Stopping")}>
                  <Square />
                  Stop agent
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => action("start", "Starting")}>
                  <Play />
                  Start agent
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
                <Trash2 />
                Delete agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      </TooltipProvider>

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete agent?"
        description="This permanently deletes the agent and its data. This cannot be undone."
        confirmText="Delete"
        destructive
        onConfirm={remove}
      />
    </>
  );
}
