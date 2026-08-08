const ATTIO_KEY = process.env.ATTIO_API_KEY || "";
const ATTIO_BASE = "https://api.attio.com/v2";

function attioHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ATTIO_KEY}`,
  };
}

// Find or create a Person in Attio by email
async function upsertAttioPerson(email: string, firstName: string, lastName: string): Promise<string | null> {
  try {
    const res = await fetch(`${ATTIO_BASE}/objects/people/records`, {
      method: "PUT",
      headers: attioHeaders(),
      body: JSON.stringify({
        data: {
          values: {
            email_addresses: [{ email_address: email }],
            name: [{ first_name: firstName, last_name: lastName }],
          },
        },
        matching_attribute: "email_addresses",
      }),
    });
    const data = await res.json();
    return data?.data?.id?.record_id || null;
  } catch (err) {
    console.error("[attio] upsertPerson failed:", err);
    return null;
  }
}

// Find or create a Company in Attio
async function upsertAttioCompany(companyName: string): Promise<string | null> {
  if (!companyName) return null;
  try {
    const res = await fetch(`${ATTIO_BASE}/objects/companies/records`, {
      method: "PUT",
      headers: attioHeaders(),
      body: JSON.stringify({
        data: {
          values: {
            name: [{ value: companyName }],
          },
        },
        matching_attribute: "name",
      }),
    });
    const data = await res.json();
    return data?.data?.id?.record_id || null;
  } catch (err) {
    console.error("[attio] upsertCompany failed:", err);
    return null;
  }
}

// Create a Deal in Attio for a new Apollo Claw prospect
export async function createAttioDeal(opts: {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  industry?: string;
  phone?: string;
  referralSource?: string;
}): Promise<string | null> {
  if (!ATTIO_KEY) return null;
  try {
    const personId = await upsertAttioPerson(opts.email, opts.firstName, opts.lastName);
    const companyId = opts.company ? await upsertAttioCompany(opts.company) : null;

    const dealValues: Record<string, unknown> = {
      name: [{ value: `${opts.name} - Apollo Claw` }],
      stage: [{ status: "Prospect" }],
      referral_source: opts.referralSource ? [{ value: opts.referralSource }] : undefined,
      company_name: opts.company ? [{ value: opts.company }] : undefined,
      phone: opts.phone ? [{ value: opts.phone }] : undefined,
      industry: opts.industry ? [{ value: opts.industry }] : undefined,
      onboarding_status: [{ value: "awaiting_intake" }],
    };

    // Remove undefined values
    Object.keys(dealValues).forEach(k => dealValues[k] === undefined && delete dealValues[k]);

    const body: Record<string, unknown> = { data: { values: dealValues } };
    if (personId) {
      (body.data as Record<string, unknown>).associated_people = [{ target_object: "people", target_record_id: personId }];
    }
    if (companyId) {
      (body.data as Record<string, unknown>).associated_company = [{ target_object: "companies", target_record_id: companyId }];
    }

    const res = await fetch(`${ATTIO_BASE}/objects/deals/records`, {
      method: "POST",
      headers: attioHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const dealId = data?.data?.id?.record_id || null;

    // Add to Apollo Claw Pipeline list
    if (dealId) {
      await fetch(`${ATTIO_BASE}/lists/apollo_claw_pipeline/entries`, {
        method: "POST",
        headers: attioHeaders(),
        body: JSON.stringify({
          data: {
            parent_record_id: dealId,
            parent_object: "deals",
          },
        }),
      });
    }

    return dealId;
  } catch (err) {
    console.error("[attio] createDeal failed:", err);
    return null;
  }
}

// Update deal stage when prospect advances
export async function updateAttioDealStage(dealId: string, stage: string, onboardingStatus?: string): Promise<void> {
  if (!ATTIO_KEY || !dealId) return;
  try {
    const values: Record<string, unknown> = {
      stage: [{ status: stage }],
    };
    if (onboardingStatus) {
      values.onboarding_status = [{ value: onboardingStatus }];
    }
    await fetch(`${ATTIO_BASE}/objects/deals/records/${dealId}`, {
      method: "PATCH",
      headers: attioHeaders(),
      body: JSON.stringify({ data: { values } }),
    });
  } catch (err) {
    console.error("[attio] updateDealStage failed:", err);
  }
}

// Find the most recent deal for an email address
export async function findAttioDealByEmail(email: string): Promise<string | null> {
  if (!ATTIO_KEY) return null;
  try {
    const res = await fetch(`${ATTIO_BASE}/objects/deals/records/query`, {
      method: "POST",
      headers: attioHeaders(),
      body: JSON.stringify({
        limit: 1,
        sorts: [{ attribute: "created_at", direction: "desc" }],
        filter: {
          associated_people: {
            email_addresses: { email_address: { "$eq": email } }
          }
        }
      }),
    });
    const data = await res.json();
    return data?.data?.[0]?.id?.record_id || null;
  } catch (err) {
    console.error("[attio] findDealByEmail failed:", err);
    return null;
  }
}

// Add a note to a deal record
export async function addAttioNote(dealId: string, title: string, content: string): Promise<void> {
  if (!ATTIO_KEY || !dealId) return;
  try {
    await fetch(`${ATTIO_BASE}/notes`, {
      method: "POST",
      headers: attioHeaders(),
      body: JSON.stringify({
        data: {
          parent_object: "deals",
          parent_record_id: dealId,
          title,
          format: "plaintext",
          content,
        },
      }),
    });
  } catch (err) {
    console.error("[attio] addNote failed:", err);
  }
}
