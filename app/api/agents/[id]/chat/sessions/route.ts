import { agent37 } from "@/lib/agent37";
import { requireAgentAccess } from "@/lib/auth";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// How many unlabelled threads to open in order to name them. Each one is a real call to the
// instance that returns a whole transcript, so this is the line between a rail that reads properly
// and a page load that drags. The most recent threads are the ones anyone is looking for, so the
// cap applies after sorting.
const MAX_LABEL_LOOKUPS = 8;

/** First line of a message, tidied into something that fits a sidebar row. */
function labelFrom(content: string): string | null {
  const flat = content.replace(/\s+/g, " ").trim();
  if (!flat) return null;
  return flat.length > 60 ? `${flat.slice(0, 60).trimEnd()}...` : flat;
}

// The thread rail. The Agent37 Agents API is the source of truth — GET /v1/sessions lists every
// conversation on the instance (web chat and any other channel alike); there is no local index
// table.
//
// WHY THIS OPENS SESSIONS. The rail label was `title || preview`, both read off the session list.
// Those fields are Hermes'. On OpenClaw the list carries neither, so every row fell through to the
// client's "New chat" fallback and the rail became a column of identical entries — you could see
// that you had conversations but not tell them apart, which is most of what a rail is for.
//
// So anything still unlabelled gets opened and named after its first message — the same history
// the transcript already loads, and therefore the one part of this we know exists rather than
// assume. Bounded and best-effort: a lookup that fails leaves that row unlabelled rather than
// failing the list.
//
// New threads also title themselves upstream as they are created (see ChatProvider), so over time
// this fallback covers the backlog rather than doing the work every load. It stays either way,
// because whether that PATCH is supported is a property of the build, not something to assume.
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id } = await params;
  await requireAgentAccess(id, "member");

  const { data } = await agent37.listSessions(id);
  const sessions = data
    .map((s) => ({
      session_id: s.id,
      title: s.title?.trim() || s.preview?.trim() || null,
      last_active: s.last_active ?? s.started_at ?? 0,
    }))
    .sort((a, b) => b.last_active - a.last_active);

  const unlabelled = sessions.filter((s) => !s.title).slice(0, MAX_LABEL_LOOKUPS);
  await Promise.all(
    unlabelled.map(async (row) => {
      try {
        const detail = await agent37.getSession(id, row.session_id);
        const first = detail.history?.find((m) => m.role === "user" && m.content?.trim());
        if (first) row.title = labelFrom(first.content);
      } catch {
        // Leave it unlabelled. One row the rail can't name is a smaller problem than a rail that
        // doesn't load.
      }
    })
  );

  return json({ sessions });
});
