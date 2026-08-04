"use client";

import { useActiveAgent } from "@/components/ActiveAgentProvider";
import { ChatProvider } from "@/components/chat/ChatProvider";

// Bridges the active agent into ChatProvider at the dashboard level.
//
// A separate component because app/dashboard/layout.tsx is a Server Component and can't call
// useActiveAgent. Keyed by agent so switching agents remounts the provider with a clean thread
// list rather than briefly showing another agent's conversations.
export function DashboardChatProvider({ children }: { children: React.ReactNode }) {
  const { active } = useActiveAgent();
  const agentId = active?.agent37_id ?? null;
  return (
    <ChatProvider key={agentId ?? "none"} agentId={agentId}>
      {children}
    </ChatProvider>
  );
}
