"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Add an agent — for a colleague, or for yourself.
//
// Reworked at David's call after he walked the flow: creating an agent for someone else is an
// INVITATION, so the dialog reads like one. Their email, then a subject and body already
// written and fully editable, then Send — and afterwards you are back on your dashboard,
// because the questionnaire that follows is THEIRS to answer on accept, not yours to be
// dropped into. (The old flow pushed the admin straight into the new agent's questionnaire,
// which was right for a second agent of your own and wrong for every other case.)
//
// Typing your own address still works and skips the compose — there is nobody to write to —
// and it no longer redirects either: the welcome email carries the questionnaire link, and the
// setup banner on the dashboard nags until it is done.
//
// It runs through the SEATS endpoint rather than POST /api/agents, and that is the whole point.
// /api/agents provisions without touching billing, which is right for a rebuild (they are
// already paying for one) and wrong here: another agent is another VPS, and it has to appear on
// the bill the moment it appears anywhere else. Seats bills, provisions, rolls back a failed
// build, assigns the owner, and sends the mail.
export function AddAgentButton({ trigger }: { trigger?: React.ReactNode } = {}) {
  const { current, userEmail, userFirstName } = useWorkspace();
  const { refresh, setActiveId } = useActiveAgent();
  const { busy, run } = useAsyncAction();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [subjectTouched, setSubjectTouched] = useState(false);
  const [bodyTouched, setBodyTouched] = useState(false);
  // An optional promotion code, applied to the one-time agent fee. Validated server-side; a bad
  // one fails the add with a toast rather than charging.
  const [coupon, setCoupon] = useState("");
  // Two presses to charge - see the note in MembersView. The price being on screen is not the
  // same as being asked "charge it?".
  const [chargeArmed, setChargeArmed] = useState(false);

  if (!current) return null;

  const forSelf = email.trim().toLowerCase() === userEmail.trim().toLowerCase();

  // Prefilled but never overwriting something the admin typed. Recomputed as defaults so the
  // preview always has words in it, stored only once edited.
  const defaultSubject = "I set up an AI agent for you";
  const defaultBody =
    `Hi,\n\n` +
    `I've set up your own AI agent for you at ${current.name}. It's already built and running - ` +
    `accept below, choose a password, and a short questionnaire will personalize it to how you work.\n\n` +
    `${userFirstName || ""}`.trimEnd();
  const effectiveSubject = subjectTouched ? subject : defaultSubject;
  const effectiveBody = bodyTouched ? emailBody : defaultBody;

  const disarm = () => {
    setChargeArmed(false);
  };

  const resetAll = () => {
    setEmail("");
    setName("");
    setSubject("");
    setEmailBody("");
    setCoupon("");
    setSubjectTouched(false);
    setBodyTouched(false);
    disarm();
  };

  function submit() {
    if (!current) return;
    if (!email.trim()) {
      toast.error("Enter the email address this agent is for.");
      return;
    }
    if (!chargeArmed) {
      setChargeArmed(true);
      return;
    }
    return run(async () => {
      const res = await apiFetch<{ agent_id: string; invited: boolean }>(
        `/api/workspaces/${current.id}/seats`,
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim() || undefined,
            coupon: coupon.trim() || undefined,
            // Your own address is a deliberate second agent; a colleague's first agent needs
            // no such override, and sending it anyway would defeat the double-charge guard.
            additional: forSelf,
            ...(forSelf
              ? {}
              : { invite_subject: effectiveSubject, invite_body: effectiveBody }),
          }),
        }
      );

      setOpen(false);
      resetAll();
      await refresh();
      if (forSelf && res.agent_id) setActiveId(res.agent_id);
      // Back to the dashboard, both ways - the compose WAS the task. No redirect: the
      // invitee's questionnaire is theirs, and your own arrives by email and setup banner.
      toast.success(
        forSelf
          ? "Your new agent is building - setup link is in your email"
          : `Invitation sent to ${email.trim()}`
      );
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetAll();
      }}
    >
      {/* The default trigger is the labelled button on Settings > My Agents. The sidebar's
          "Your team" row passes its own. */}
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Add agent
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add an agent</DialogTitle>
          <DialogDescription>
            A dedicated agent with its own connections, chat history and credit. Enter a
            colleague&apos;s email to send them an invitation, or your own for a second agent of
            your own.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="seat-email">Who is this agent for?</Label>
          <Input
            id="seat-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              disarm();
            }}
            placeholder="colleague@yourcompany.com"
            autoComplete="off"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="seat-agent-name">Name the agent (optional)</Label>
          <Input
            id="seat-agent-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="They can change this later"
            autoComplete="off"
          />
        </div>

        {/* The invitation, written and editable — David's flow. Subject and body prefilled so
            Send works untouched, editable so it arrives in the admin's voice rather than ours.
            The Accept button is appended by the server, so no edit can lose the link. */}
        {!forSelf && email.trim() && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="seat-subject">Email subject</Label>
              <Input
                id="seat-subject"
                value={effectiveSubject}
                onChange={(e) => {
                  setSubjectTouched(true);
                  setSubject(e.target.value);
                }}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seat-body">Email message</Label>
              <textarea
                id="seat-body"
                value={effectiveBody}
                onChange={(e) => {
                  setBodyTouched(true);
                  setEmailBody(e.target.value);
                }}
                rows={6}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                The &quot;Accept your invitation&quot; button is added under your message
                automatically.
              </p>
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="seat-coupon">Coupon code (optional)</Label>
          <Input
            id="seat-coupon"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Applied to the one-time agent fee"
            autoComplete="off"
          />
        </div>

        {/* The charge, stated before the button that makes it. $449 matches the Basic license
            tier (lib/pricing/catalog.ts) - hardcoded here because the catalog is server-only,
            same as PlanView's SEAT_PRICE. */}
        <div className="rounded-lg border border-dashed bg-secondary/40 p-3 text-sm">
          <p className="font-medium text-foreground">$449 one-time + $189/month hosting</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Each added agent carries a one-time $449 agent license and its own hosting seat,
            pro-rated from today - both on the same invoice.
          </p>
        </div>

        {chargeArmed && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
            <strong>Pressing again charges your card.</strong>{" "}
            <span className="text-muted-foreground">
              $449 once plus $189/month pro-rated from today. The agent builds immediately
              {forSelf ? "" : " and the invitation is sent"}. Cancel costs nothing.
            </span>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              resetAll();
            }}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !email.trim()}>
            {busy
              ? forSelf
                ? "Building..."
                : "Sending..."
              : chargeArmed
                ? "Confirm - charge $449 + $189/mo"
                : forSelf
                  ? "Add agent - $449 + $189/mo"
                  : "Send invitation - $449 + $189/mo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
