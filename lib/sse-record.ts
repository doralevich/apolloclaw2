// Recording an OpenAI-style chat stream on its way through, for the direct line's saved threads
// (app/api/agents/[id]/agents/[agentId]/chat). Kept apart from the route so it can be exercised
// with plain streams.

/**
 * Pass the gateway's SSE through untouched while collecting the answer's text, then hand the text
 * to `save` once: when the stream ends, errors, or the reader stops it (the Stop button). A
 * stopped answer is saved as far as it got, which is what the person saw.
 */
export function recordAnswer(body: ReadableStream<Uint8Array>, save: (text: string) => Promise<void>): ReadableStream<Uint8Array> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let text = "";
  let finished = false;
  const finish = async () => {
    if (finished) return;
    finished = true;
    await save(text).catch(() => {});
  };
  const take = (chunk: Uint8Array) => {
    buf += decoder.decode(chunk, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const delta = (JSON.parse(data) as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content;
        if (typeof delta === "string") text += delta;
      } catch {
        // A partial line; the next chunk completes it.
      }
    }
  };
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          await finish();
          controller.close();
          return;
        }
        take(value);
        controller.enqueue(value);
      } catch (e) {
        await finish();
        controller.error(e);
      }
    },
    async cancel(reason) {
      await reader.cancel(reason).catch(() => {});
      await finish();
    },
  });
}
