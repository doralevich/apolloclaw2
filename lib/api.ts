/** An error the API described, with the machine-readable parts kept. */
export interface ApiFetchError extends Error {
  /** The API's `error.code`, e.g. "external_domain". Absent if the response carried none. */
  code?: string;
  status: number;
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const body = (data as { error?: { message?: string; code?: string } })?.error;
    // The message is what every existing caller reads, so it stays exactly where it was.
    // `code` and `status` ride along because some failures are not failures: a caller that
    // needs to tell "that address is outside your company, confirm?" from "that broke" can
    // only do it by code, and matching on the prose would break the first time it is reworded.
    const err = new Error(body?.message || `Request failed (${res.status})`) as ApiFetchError;
    err.status = res.status;
    if (body?.code) err.code = body.code;
    throw err;
  }
  return data as T;
}

// Pull the API's { error: { message } } off a non-ok Response for the manual fetch callers
// (streaming / multipart bodies that can't go through apiFetch), falling back to a status code.
export async function readApiError(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
  return body?.error?.message || `${fallback} (${res.status})`;
}
