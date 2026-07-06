import { ChatPageClient } from "@/components/chat/ChatPageClient";

// URL grammar: /dashboard/chat (new chat) and /dashboard/chat/<sessionId> (open thread).
// The server treats the optional segment as an opaque string — the client resolves the session
// from the pathname (and switches threads via history.pushState, so the page never remounts).
export default async function ChatPage({ params }: { params: Promise<{ session?: string[] }> }) {
  await params;
  return <ChatPageClient />;
}
