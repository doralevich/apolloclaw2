"use client";

import { ChatView } from "@/components/chat/ChatView";
import { ChatProvider } from "@/components/chat/ChatProvider";
import { MockShell } from "@/components/davidtest/MockShell";
import { mockAgentId } from "@/components/davidtest/mock-api";

// The chat welcome state: the agent's opening line and the chip row, both built by the real
// generators from whichever answers the bar above is feeding them.
//
// ChatProvider is not optional. ChatView reads it through useChatContext, which throws rather
// than degrading, so leaving it out is a 500 rather than a missing feature - which is exactly
// what this page did on its first run.
//
// Sending a message is not mocked and will fail. This screen is about the EMPTY state, which is
// the one a new owner meets and the one that could not be seen without buying an agent.
export default function Page() {
  return (
    <MockShell title="Chat welcome" controls={["scenario", "conns"]}>
      <ChatProvider agentId={mockAgentId()}>
        <div className="h-[calc(100vh-9rem)]">
          <ChatView agentId={mockAgentId()} agentName="Sloane" />
        </div>
      </ChatProvider>
    </MockShell>
  );
}
