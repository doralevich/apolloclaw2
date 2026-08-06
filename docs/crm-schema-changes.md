# CRM schema changes (the "Brain" project)

`supabase/migrations/` in this repo targets the **dashboard** project
(`tbbzlloiigtepdwoquvy`). The intake route writes somewhere else: the shared CRM/"Brain"
project (`moubzvpffhqvumipbnfj`), which Donna also writes to under `business_id = 'dbdo'`.

Nothing in this repo migrates that database, so schema changes made there leave no trace in
git. This file is that trace. Anything applied to the CRM project gets an entry.

---

## `entities_apolloclaw_email_kind_uniq`

Applied 2026-08-06. One Apollo[Claw] card per email address per kind.

```sql
create unique index if not exists entities_apolloclaw_email_kind_uniq
  on public.entities (kind, lower(btrim(email)))
  where business_id = 'apolloclaw'
    and email is not null
    and btrim(email) <> '';
```

**Why.** `findOrCreateCrmClient` in `app/api/intake/route.ts` searched for a card and created
one when it found nothing. Two submissions landing in the same moment both pass the search and
both insert — a double click on a slow connection is enough. Nothing in the database stopped
them. This index does, and the route now treats the resulting 409 as "use the card that won"
rather than as an error.

**Why it is scoped to `business_id = 'apolloclaw'`.** An unscoped index cannot build:

- `dbdo` holds three case-insensitive duplicate company emails, so the index would fail
  outright unless somebody deleted Donna's rows.
- `dbdo` also holds 42 mixed-case addresses.

Neither is ours to clean up. All 44 apolloclaw rows were already lowercase with no duplicates,
so this built clean and needed no backfill.

**Why `lower(btrim(email))`.** The lookup used to be an exact string match, so
`Dave@Company.com` and `dave@company.com` were two different people: two cards, two deals, a
split history for one prospect. Folding case in the index means a future mixed-case address
cannot slip past a stored lowercase one even if some other caller forgets to normalise.

**Why `kind` is in the key.** One person legitimately has both a `person` card and a `company`
card for the same address — that pairing is by design. What is forbidden is two `company`
cards for one address.

**Verified** by inserting `TEST4@DesignsByDaveO.com` against a stored
`test4@designsbydaveo.com` and confirming Postgres rejected it with `23505`.
