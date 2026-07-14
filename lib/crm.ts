const SUPA_URL = process.env.SUPABASE_URL || "https://moubzvpffhqvumipbnfj.supabase.co";
// Vercel stores this as SUPABASE_SERVICE_ROLE_KEY; keep SUPABASE_SERVICE_KEY as a fallback
// for older/local envs. Without the ROLE name, every CRM write here silently no-ops in prod.
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

function supaHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: SUPA_KEY,
    Authorization: `Bearer ${SUPA_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

// ── Pipeline deals — write directly to Supabase ───────────────────────────────

export async function createPipelineDeal(payload: object): Promise<{ id?: string }> {
  if (!SUPA_KEY) throw new Error("SUPABASE_SERVICE_KEY not set — cannot create pipeline deal");
  const res = await fetch(`${SUPA_URL}/rest/v1/pipeline_deals`, {
    method: "POST",
    headers: supaHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`pipeline_deals insert failed (${res.status}): ${txt}`);
  }
  const result = await res.json();
  return Array.isArray(result) ? result[0] : result;
}

export async function upsertPipelineDeal(email: string, payload: object): Promise<void> {
  if (!SUPA_KEY) {
    console.warn("[upsertPipelineDeal] SUPABASE_SERVICE_KEY not set — skipping");
    return;
  }
  const enc = encodeURIComponent(email);

  // Check if deal already exists
  const existRes = await fetch(
    `${SUPA_URL}/rest/v1/pipeline_deals?contact_email=eq.${enc}&limit=1`,
    { headers: supaHeaders({ Prefer: "return=representation" }) }
  );
  const existing = await existRes.json() as Array<{ id: string }>;

  if (existing.length > 0) {
    // Update in place — include updated_at so timestamps stay current
    const patchRes = await fetch(
      `${SUPA_URL}/rest/v1/pipeline_deals?contact_email=eq.${enc}`,
      {
        method: "PATCH",
        headers: supaHeaders({ Prefer: "return=minimal" }),
        body: JSON.stringify({ ...payload, updated_at: new Date().toISOString() }),
      }
    );
    if (!patchRes.ok) {
      const txt = await patchRes.text();
      throw new Error(`pipeline_deals patch failed (${patchRes.status}): ${txt}`);
    }
  } else {
    await createPipelineDeal({ contact_email: email, ...payload });
  }
}

// ── Find or create entity + companies records so the kanban board renders the card ──
export async function findOrCreateCrmEntity(
  name: string,
  email: string,
  stage: string = "discovery",
  notes: string = ""
): Promise<string | null> {
  if (!SUPA_KEY) return null;
  const enc = encodeURIComponent(email);
  const hdrs = supaHeaders({ Prefer: "return=representation" });
  try {
    // 1. Check for existing entity by email
    const searchRes = await fetch(
      `${SUPA_URL}/rest/v1/entities?kind=eq.company&email=eq.${enc}&business_id=eq.apolloclaw&limit=1`,
      { headers: hdrs }
    );
    const found = await searchRes.json() as Array<{ id: string }>;
    if (Array.isArray(found) && found.length > 0) return found[0].id;

    // 2. Create entity record (the kanban card)
    const createRes = await fetch(`${SUPA_URL}/rest/v1/entities`, {
      method: "POST",
      headers: hdrs,
      body: JSON.stringify({
        kind: "company",
        name,
        email,
        business_id: "apolloclaw",
        status: stage,
        type: "apolloclaw",
        notes: notes || `Apollo Claw lead — stage: ${stage}`,
        referral_source: "apollo_flow",
      }),
    });
    const created = await createRes.json() as Array<{ id: string }>;
    if (!Array.isArray(created) || !created[0]?.id) return null;
    const entityId = created[0].id;

    // 3. Create lean companies record so kanban board renders the card
    await fetch(`${SUPA_URL}/rest/v1/companies`, {
      method: "POST",
      headers: hdrs,
      body: JSON.stringify({
        id: entityId,
        name,
        status: stage,
        type: "apolloclaw",
        business_id: "apolloclaw",
      }),
    });

    // 4. Create a people record so the People section of the CRM card is populated
    await fetch(`${SUPA_URL}/rest/v1/people`, {
      method: "POST",
      headers: hdrs,
      body: JSON.stringify({
        company_id: entityId,
        name,
        email,
      }),
    });

    return entityId;
  } catch (err) {
    console.error("findOrCreateCrmEntity failed:", err);
    return null;
  }
}

// Legacy stubs kept for any remaining callers — now no-ops that log
export async function getCrmToken(): Promise<string> {
  return "supabase-direct-v2";
}

export async function createCrmClient(_token: string, _payload: object) {
  return {};
}

export async function createCrmTask(_token: string, _payload: object) {
  return {};
}
