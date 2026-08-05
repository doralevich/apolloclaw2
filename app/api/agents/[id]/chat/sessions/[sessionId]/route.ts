import { agent37, Agent37Error } from "@/lib/agent37";
import { requireAgentAccess } from "@/lib/auth";
import { deleteTitle, normalizeTitle, setTitle } from "@/lib/chat/titles";
import { ApiError, json, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string; sessionId: string }> };

// Full conversation history for a thread (source of truth lives on the instance).
export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id, sessionId } = await params;
  await requireAgentAccess(id, "member");
  return json(await agent37.getSession(id, sessionId));
});

// Rename a thread.
//
// This used to be PATCH /v1/sessions/{id} on the instance and nothing else, which meant renaming
// worked only on builds that store a title. OpenClaw doesn't, so every rename came back "not
// supported on this agent build yet" and the rail rolled the name straight back.
//
// The name is ours to keep now: it lands in chat_session_titles, which is the table the rail
// reads first. The upstream call still happens, because a build that DOES hold a title should
// have it — the difference is that it is no longer what the feature depends on. A 404/405 there
// is the expected answer on OpenClaw, not a failure to report.
export const PATCH = route(async (request: Request, { params }: Ctx) => {
  const { id, sessionId } = await params;
  await requireAgentAccess(id, "member");

  // `derived` marks the automatic naming a new thread does from its first message, as opposed to
  // a person typing one. Only the second kind is protected from being re-derived later, so the
  // distinction has to survive the request rather than be guessed from the string.
  const { title, derived } = await readJson<{ title?: string; derived?: boolean }>(request);
  const clean = normalizeTitle(title ?? "");
  if (!clean) throw new ApiError(400, "invalid_request", "title is required");

  // Ours first: if this throws, the rename genuinely didn't happen and the rail should roll back.
  await setTitle(id, sessionId, clean, !derived);

  // Only for a real rename. A derived name is a label we chose, and pushing it upstream on every
  // new conversation would be a call that reliably 404s on this runtime for no gain.
  if (!derived) {
    try {
      await agent37.renameSession(id, sessionId, clean);
    } catch (e) {
      // Anything other than "this build has no titles" is worth having in the logs, but none of it
      // changes what the customer sees — the name is already stored.
      if (!(e instanceof Agent37Error && (e.status === 404 || e.status === 405))) {
        console.warn("[chat] upstream rename failed", { sessionId, error: (e as Error).message });
      }
    }
  }

  return json({ id: sessionId, title: clean, renamed: true });
});

// Delete a conversation on the instance, and forget its name.
//
// Upstream first: if the instance refuses, the thread still exists and dropping its title would
// leave a live conversation labelled "New chat" for no reason.
export const DELETE = route(async (_request: Request, { params }: Ctx) => {
  const { id, sessionId } = await params;
  await requireAgentAccess(id, "member");

  const result = await agent37.deleteSession(id, sessionId);
  await deleteTitle(id, sessionId);
  return json(result);
});
