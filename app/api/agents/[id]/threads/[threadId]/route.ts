import { requireAgentAccess } from "@/lib/auth";
import { deleteThread, getThread, getThreadMessages, renameThread } from "@/lib/agent-threads";
import { ApiError, json, readJson, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string; threadId: string }> };

// One direct-line conversation, only ever the signed-in person's own.
//
//   GET                the thread and its messages, in order
//   PATCH { title }    rename it
//   DELETE             delete it and its messages

async function ownThread(id: string, threadId: string) {
  const { user } = await requireAgentAccess(id, "member");
  const thread = await getThread(id, user.id, threadId);
  if (!thread) throw new ApiError(404, "not_found", "That conversation is not here.");
  return thread;
}

export const GET = route(async (_request: Request, { params }: Ctx) => {
  const { id, threadId } = await params;
  const thread = await ownThread(id, threadId);
  return json({ thread, messages: await getThreadMessages(thread.id) });
});

export const PATCH = route(async (request: Request, { params }: Ctx) => {
  const { id, threadId } = await params;
  const thread = await ownThread(id, threadId);
  const body = await readJson<{ title?: unknown }>(request);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) throw new ApiError(400, "invalid_request", "Give the chat a name.");
  if (!(await renameThread(thread.id, title))) throw new ApiError(500, "rename_failed", "Couldn't rename that chat.");
  return json({ ok: true });
});

export const DELETE = route(async (_request: Request, { params }: Ctx) => {
  const { id, threadId } = await params;
  const thread = await ownThread(id, threadId);
  if (!(await deleteThread(thread.id))) throw new ApiError(500, "delete_failed", "Couldn't delete that chat.");
  return json({ ok: true });
});
