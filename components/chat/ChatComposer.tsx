"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Loader2, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { AttachButton, AttachmentTray } from "./Attachments";
import { EffortMenu } from "./EffortMenu";
import { ModelMenu } from "./ModelMenu";
import type { ChatAttachments } from "./useChatAttachments";
import { useChatModels } from "./useChatModels";
import { findModel, prettyModelLabel, type ChatSettings } from "./types";
import type { SendSettings } from "./useChat";

interface Props {
  agentId: string;
  isStreaming: boolean;
  // Attachment state is owned by ChatView (so the whole pane is a drop zone) and passed in.
  att: ChatAttachments;
  onSend: (text: string, settings: SendSettings) => void;
  onStop: () => void;
  // Prominent welcome-state composer (vs the compact docked composer).
  large?: boolean;
  focusToken?: number;
  /** Text to drop into the box, from a Shortcuts or Start Here link (?q=). Deliberately not
   *  auto-sent: the customer sees what they're about to ask, and most of these want a name or
   *  a document swapped in first. */
  prefill?: string;
  /** Bumped when the same prefill is picked again — see the note where it's applied. */
  prefillToken?: number;
}

export function ChatComposer({
  agentId,
  isStreaming,
  att,
  onSend,
  onStop,
  large = false,
  focusToken = 0,
  prefill,
  prefillToken,
}: Props) {
  const [text, setText] = useState("");

  // model + provider are always chosen together (one selection); effort is independent. Group
  // them as the composer's outgoing ChatSettings so send is just `{ ...settings, files }`.
  const [settings, setSettings] = useState<ChatSettings>({ model: null, provider: null, reasoningEffort: null });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { groups, defaultModel, loading } = useChatModels(agentId);

  useEffect(() => {
    if (focusToken === 0) return;
    const frame = requestAnimationFrame(() => textareaRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [focusToken]);

  // Arriving from Shortcuts or Start Here with ?q= set. Adjusted during render rather than in
  // an effect — React's own pattern for "a prop changed, derive state from it" — so the box is
  // never briefly empty before the text appears. Only fills an EMPTY box, so a draft already
  // in progress is never overwritten.
  //
  // The token exists for the chips under the composer: two clicks of the SAME chip are two
  // separate requests to fill the box, and comparing on the text alone would treat the second as
  // already applied. Keyed on both, so re-picking after clearing the box works.
  const [appliedPrefill, setAppliedPrefill] = useState<string | undefined>(undefined);
  const prefillKey = prefill ? `${prefillToken ?? 0}:${prefill}` : undefined;
  if (prefillKey && prefillKey !== appliedPrefill) {
    setAppliedPrefill(prefillKey);
    if (!text) setText(prefill!);
  }

  useEffect(() => {
    if (!prefill) return;
    const frame = requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      // Caret at the end: several shortcuts finish with a [placeholder] to swap out, and
      // landing at position 0 means selecting past your own text to reach it.
      el.setSelectionRange(el.value.length, el.value.length);
    });
    return () => cancelAnimationFrame(frame);
  }, [prefill]);

  // The model switcher is a persistent control, shown once the instance reports at least one model
  // (the older metered gateway exposes a single "default"; current builds expose the full catalog).
  // It stays hidden until the list resolves and hides if the call returns nothing (e.g. fetch
  // failed) — the agent default still runs, and there's no appear-then-vanish flicker. Memoized so
  // the controlled textarea's per-keystroke re-renders don't re-scan the model groups.
  const totalModels = useMemo(() => groups.reduce((n, g) => n + g.models.length, 0), [groups]);
  const defaultLabel = useMemo(() => {
    const def = findModel(groups, defaultModel);
    return def ? prettyModelLabel(def.label) : loading ? "Loading…" : "Default";
  }, [groups, defaultModel, loading]);

  const canSend = (text.trim().length > 0 || att.hasFiles) && !att.blocksSend && !isStreaming;

  const grow = (el: HTMLTextAreaElement) => {
    const minHeight = large ? 76 : 44;
    const maxHeight = large ? 180 : 160;
    el.style.height = "auto";
    el.style.height = `${Math.max(minHeight, Math.min(el.scrollHeight, maxHeight))}px`;
  };

  const submit = () => {
    if (isStreaming) return;
    const trimmed = text.trim();
    if ((!trimmed && !att.hasFiles) || att.blocksSend) return;
    const attachments = att.takeAttachments();
    onSend(trimmed, { ...settings, files: attachments.map((a) => a.path), attachments });
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // During IME composition (CJK input), Enter commits the candidate — don't send. keyCode 229
    // covers older browsers that report Enter without the isComposing flag.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      className={cn(
        // The composer is the one control on this screen, so it carries the accent rather than
        // waiting to be focused before it looks like anything. Focus deepens it instead of
        // introducing it.
        // Softer, and closer to the box.
        //
        // It was a 34px navy bloom thrown 10px down, which on a white page pooled into the gap
        // above the suggestion chips and read as a smudge rather than a lift. Half the blur, half
        // the offset, and carried at 12% opacity instead of full-strength primary — enough to say
        // the composer sits above the page, not enough to look like something spilled.
        "mx-auto w-full rounded-[20px] border border-primary/30 bg-card shadow-[0_4px_16px_-8px_color-mix(in_srgb,var(--color-primary)_12%,transparent)] transition-[border-color,box-shadow] focus-within:border-primary/50 focus-within:shadow-[0_6px_20px_-8px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]",
        large ? "max-w-2xl" : "max-w-3xl"
      )}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          grow(e.target);
        }}
        onKeyDown={onKeyDown}
        onPaste={att.handlePaste}
        rows={1}
        placeholder="Ask anything..."
        className={cn(
          "w-full resize-none bg-transparent px-5 pb-2 pt-4 text-foreground placeholder:text-muted-foreground focus:outline-none",
          // 16px on phones — anything smaller makes iOS Safari zoom-and-pan the page when
          // the composer is focused (and it can stay panned after the keyboard closes).
          large
            ? "min-h-[76px] max-h-[180px] text-base leading-6 sm:text-[15px]"
            : "min-h-[44px] max-h-[160px] text-base leading-relaxed sm:text-sm"
        )}
      />
      <AttachmentTray files={att.files} onRemove={att.removeFile} onRetry={att.retryFile} />
      <div className="flex items-center gap-2 px-3 pb-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <AttachButton onFiles={att.addFiles} disabled={isStreaming} />
          {totalModels >= 1 && (
            <ModelMenu
              groups={groups}
              model={settings.model}
              defaultModel={defaultModel}
              defaultLabel={defaultLabel}
              disabled={isStreaming}
              onChange={(model, provider) => setSettings((s) => ({ ...s, model, provider }))}
            />
          )}
          <EffortMenu
            value={settings.reasoningEffort}
            disabled={isStreaming}
            onChange={(reasoningEffort) => setSettings((s) => ({ ...s, reasoningEffort }))}
          />
        </div>
        <div className="ml-auto flex shrink-0 items-center">
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop response"
              title="Stop response"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80"
            >
              <Square className="h-3 w-3" fill="currentColor" strokeWidth={0} />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send message"
              title="Send message"
              // The gradient, not the flat foreground: this is the button the whole screen is
              // arranged around, and it was the same ink as the body text.
              className="brand-gradient inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-sm shadow-primary/30 transition-shadow hover:shadow-md hover:shadow-primary/40 disabled:opacity-30 disabled:shadow-none"
            >
              {att.uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
