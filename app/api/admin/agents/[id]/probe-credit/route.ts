import { requirePlatformAdmin } from "@/lib/admin";
import { json, route } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

const BASE = (process.env.AGENT37_API_BASE_URL || "https://api.agent37.com").replace(/\/$/, "");

// TEMP admin diagnostic: discover HOW purchased credit is added on this Agent37 build.
//
// The budget PATCH accepts a write but never sets credit_remaining_micros, so credit must go
// through some other path. Rather than guess-and-deploy, GET a set of candidate paths (read-only,
// safe) and report each status: 404 means the path doesn't exist, 405/200/401 means it DOES (405 =
// wrong method, so it's a POST target). That narrows the real endpoint to something we can wire up.
// Platform-admin only. Removed once the credit path is known.
const CANDIDATES = [
  "/budget",
  "/credit",
  "/credits",
  "/topup",
  "/topups",
  "/budget/topup",
  "/budget/topups",
  "/budget/credit",
  "/budget/credits",
  "/wallet",
  "/wallet/topup",
];

export const GET = route(async (_request: Request, { params }: Ctx) => {
  await requirePlatformAdmin();
  const { id } = await params;
  const key = process.env.AGENT37_API_KEY;

  const probes = await Promise.all(
    CANDIDATES.map(async (suffix) => {
      const path = `/v1/instances/${id}${suffix}`;
      try {
        const res = await fetch(`${BASE}${path}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          cache: "no-store",
        });
        const body = (await res.text()).slice(0, 200);
        return { path: suffix, status: res.status, allow: res.headers.get("allow"), body };
      } catch (e) {
        return { path: suffix, status: 0, error: e instanceof Error ? e.message : String(e) };
      }
    })
  );

  return json({ agent37_id: id, base: BASE, probes });
});
