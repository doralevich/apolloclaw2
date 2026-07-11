# Apollo[Claw]


Marketing site + self-serve agent dashboard, built on Next.js.

## Running locally

Requires Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Environment variables

Copy `.env.example` to `.env.local` and set the keys below.

### Agent37 (agent provisioning)

- `AGENT37_API_KEY` — funded Agent37 Cloud API key (`sk_live_…`). Get it from <https://www.agent37.com/dashboard/cloud/api-keys>.
- `AGENT37_API_BASE_URL` — optional; defaults to `https://api.agent37.com`.

### Supabase (auth + dashboard data)

- `NEXT_PUBLIC_SUPABASE_URL` — project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon / public key.
- `SUPABASE_SERVICE_ROLE_KEY` — service-role key (server-only; never expose to the client).

### App

- `NEXT_PUBLIC_SITE_URL` — site origin, e.g. `http://localhost:3000`.
- `NEXT_PUBLIC_APP_NAME` — dashboard name shown in the UI.

### Stripe (agent storefront)

- `STRIPE_SECRET_KEY` — Stripe secret key (`sk_test_…` to verify, `sk_live_…` in production).
- `STRIPE_WEBHOOK_SECRET` — signing secret for this deployment's `/api/stripe/webhook` endpoint.

Sync the product/price catalog (idempotent; safe to rerun):

```bash
node scripts/seed-stripe-catalog.mjs --dry-run   # preview
node scripts/seed-stripe-catalog.mjs             # apply
```

or, on a deployed environment, `POST /api/admin/stripe/sync` as a platform admin.

### Supabase CLI only (not read by the app)

Needed only to run database migrations via the `supabase` CLI:

- `SUPABASE_ACCESS_TOKEN`, `DASHBOARD_SUPABASE_REF`, `DASHBOARD_SUPABASE_DB_PASSWORD`.
