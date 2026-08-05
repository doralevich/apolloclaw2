import { agent37 } from "@/lib/agent37";
import { requireAgentAccess } from "@/lib/auth";
import { getTitles, setDerivedTitle } from "@/lib/chat/titles";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// How many unnamed threads to open in order to name them. Each one is a real call to the instance
// that returns a whole transcript, so this is the line between a rail that reads properly and a
// page load that drags. The most recent threads are the ones anyone is looking for, so the cap
// applies after sorting.
//
// This is a one-time cost per thread, not per load: what it derives gets stored.
const MAX_LABEL_LOOKUPS = 8;

/** First line of a message, tidied into something that fits a sidebar row. */
function labelFrom(content: string): string | null {
  const flat = content.replace(/\s+/g, " ").trim();
  if (!flat) return null;
  return flat.length > 60 ? `${flat.slice(0, 60).trimEnd()}...` : flat;
}

// The thread rail. The instance is the source of truth for WHICH conversations exist — GET
// /v1/sessions lists every one, web chat and channels alike — and chat_session_titles holds the
// one thing it can't: what they're called.
//
// WHY A LOCAL TABLE. The rail labelled each row `title || preview`, both read off the session
// list. Those are Hermes' fields; we run OpenClaw, whose list carries neither and whose PATCH
// /v1/sessions/{id} isn't implemented. So renaming failed and every row read "New chat" — a rail
// that showed you had conversations without letting you tell them apart.
//
// Three sources, in order: a stored title (typed by the customer, or derived once and kept), then
// whatever the instance offers in case a build does carry it, then the thread's first message.
// That last one costs a call, so it's capped and its result is written back — a thread gets read
// for its name once, not on every load.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const { data } = await agent37.listSessions(id);
  const stored = await getTitles(
    id,
    data.map((s) => s.id)
  );

  const sessions = data
    .map((s) => ({
      session_id: s.id,
      title: stored.get(s.id) || s.title?.trim() || s.preview?.trim() || null,
      last_active: s.last_active ?? s.started_at ?? 0,
    }))
    .sort((a, b) => b.last_active - a.last_active);

  const unnamed = sessions.filter((s) => !s.title).slice(0, MAX_LABEL_LOOKUPS);
  await Promise.all(
    unnamed.map(async (row) => {
      try {
        const detail = await agent37.getSession(id, row.session_id);
        const first = detail.history?.find((m) => m.role === "user" && m.content?.trim());
        const label = first ? labelFrom(first.content) : null;
        if (!label) return;
        row.title = label;
        // Derived, so it yields to anything the customer typed.
        await setDerivedTitle(id, row.session_id, label);
      } catch {
        // Leave it unnamed. One row the rail can't label is a smaller problem than a rail that
        // doesn't load.
      }
    })
  );

  return json({ sessions });
});
