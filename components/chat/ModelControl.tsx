"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { DEFAULT_CHAT_MODEL_LABEL } from "@/config/chat-models";
import { ModelMenu } from "./ModelMenu";
import { useChatModels } from "./useChatModels";
import { findModel, prettyModelLabel } from "./types";

interface Props {
  /** The instance whose model list to offer (GET /api/agents/{id}/chat/models). */
  agentId: string;
  /** The selected model id, or null while riding the default. */
  model: string | null;
  disabled?: boolean;
  onChange: (model: string | null, provider: string | null) => void;
}

// The model pill, in one place for both composers.
//
// It lived inside ChatComposer, which is the main chat's composer and the only one a box with a
// single agent ever shows. A box with several agents chats over the direct line instead
// (DirectAgentChat), whose composer had no pill at all, so on David's own box the model menu
// showed for the instant before the roster loaded and was gone once it did (Oct 5, 2026). Both
// composers now render this.
//
// Shown once the instance reports at least one model. It stays hidden until the list resolves.
// If the call returns nothing (fetch failed, or an instance that reports no models) the menu is
// replaced by a static pill naming the product default, so the customer can always see which
// model they are on.
export function ModelControl({ agentId, model, disabled, onChange }: Props) {
  const { groups, defaultModel, loading } = useChatModels(agentId);

  // Memoized so the controlled textarea's per-keystroke re-renders don't re-scan the groups.
  const totalModels = useMemo(() => groups.reduce((n, g) => n + g.models.length, 0), [groups]);
  const defaultLabel = useMemo(() => {
    const def = findModel(groups, defaultModel);
    return def ? prettyModelLabel(def.label) : loading ? "Loading…" : DEFAULT_CHAT_MODEL_LABEL;
  }, [groups, defaultModel, loading]);

  if (totalModels >= 1) {
    return (
      <ModelMenu
        groups={groups}
        model={model}
        defaultModel={defaultModel}
        defaultLabel={defaultLabel}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }
  if (loading) return null;
  return (
    <span
      title={`Model: ${DEFAULT_CHAT_MODEL_LABEL}. This agent's model list could not be loaded, so the product default is shown and there is nothing to switch to right now.`}
      className="inline-flex h-8 max-w-[12rem] items-center gap-1.5 rounded-full bg-secondary/70 px-3 text-xs font-medium text-muted-foreground"
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{DEFAULT_CHAT_MODEL_LABEL}</span>
    </span>
  );
}
