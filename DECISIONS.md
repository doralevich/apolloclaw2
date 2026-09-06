# Decisions

Standing decisions for the Apollo Claw agent line and the per-agent marketing sites.
Written down because they were made across long working sessions and keep coming up.

If a decision here changes, edit this file in the same change that implements it.

---

## Architecture: one site per agent, one funnel for all of them

Each agent gets its **own marketing site, in its own GitHub repo, on its own Vercel
project and domain** (therealestateagent.ai, thecfoagent.ai, theceoagent.ai, ...). They
are edited independently and can look however they need to look.

**All of them funnel into ApolloClaw for the questionnaire and the payment.** The sites
sell; ApolloClaw builds and bills. There is exactly one checkout, one questionnaire
engine, and one provisioning path, no matter which site the customer arrived from.

Why: the sites change often and independently; the money path should not.

## The build funnels: `/build/<slug>`

Every role agent has a self-serve funnel on ApolloClaw at `/build/<slug>`:

| Slug | Agent |
|---|---|
| `real-estate` | The Real Estate Agent |
| `cfo` | The CFO Agent |
| `law` | The Law Agent |
| `ceo` | The CEO Agent |
| `marketing` | The Marketing Agent |
| `sales` | The Sales Agent |
| `recruiting` | The Recruiting Agent |
| `medical` | The Medical Agent |
| `insurance` | The Insurance Agent |

The slug is the customer-facing URL and is deliberately readable (`real-estate`),
separate from the internal agent type id (`realestate`). The map lives in
`lib/buildFunnel.ts` — **adding a funnel for another agent is one line there and
nothing else.**

The flow is the standard `/onboard` lead flow pinned to a type: gate → paywall → Stripe
→ confirm → that agent's questionnaire (with its deep-dive) → provision. The checkout
stamps `agent_type` onto the Stripe session; `/api/onboard/complete` reads it back off
the **paid session** (never the request body) and provisions that type. Plain `/onboard`
sends no type and still provisions the generic license agent, unchanged.

These pages are `noindex` — each agent's own marketing site is the front door, and
should not have to compete with them in search.

### The funnel wears the agent's brand

The first screen names the agent ("Let's Build Your Real Estate Agent."), takes its
accent colour, and shows its mascot to the right of the copy — the same copy-left,
agent-right arrangement as the hero on that agent's own site, so arriving from there
reads as the next page rather than a different company.

`lib/agentBrand.ts` holds the map and **falls back to ApolloClaw red with no mascot**, so
an agent with no artwork still works and simply looks the way the funnel always did.

**Where the colours come from, and the one rule that matters:** sample the hex from the
agent's **wordmark SVG**, never from its mascot. The mascots are shaded 3D renders whose
accent spans dark to lit, and no single point on that range recovers the flat brand hex.
Measured against the three agents whose true value is known from their SVG, sampling the
mascot returns `#2B7A2C` for real estate (true `#0F8743`), `#092A5D` for CFO (true
`#1E305F`) and `#A70403` for CEO (true `#E12E30`) — errors of 64, 29 and 145.

Real estate, CFO and CEO are sampled from SVGs and are correct. The other five are
sampled from mascots, marked provisional in the file, and should be corrected the moment
a wordmark SVG exists for them.

**Mascots must be transparent PNGs.** A JPEG or a flat-white PNG puts a visible box on the
masthead. Cutting a background out afterwards works only on a lossless source: it was
tried on the JPEG mascots and chewed the robots' white bodies to pieces, and it worked
cleanly on the marketing PNG. Ask for a transparent export rather than repairing one.

## Calls to action: always offer both paths

Every marketing site offers **both** options, in every CTA location (nav, hero, pricing
section, closing CTA):

- **Build Your Agent** → `https://www.apolloclaw.ai/build/<slug>` (self-serve purchase)
- **Schedule a Consultation** → the booking link below (custom, scoped engagement)

Rejected alternatives: consult-only (loses self-serve entirely), and build-in-nav-only
(the page then says "priced on a call" while the button leads to a fixed price — an
inconsistency a visitor will notice).

## Pricing: the price lives in the funnel, not on the sites

The self-serve price is **not printed on the marketing sites**. The customer sees it in
the checkout, before paying anything. The sites say there are two ways to start and that
custom deployments are scoped and priced during a consultation.

Why: it keeps custom engagements quotable on their own merits instead of being anchored
to the self-serve number.

Self-serve currently runs on the existing bundle checkout (Basic license + monthly
managed hosting, `lib/pricing/catalog.ts`). Per-vertical pricing is possible later; it
would be a catalog entry per agent type.

## Booking link

**`https://cal.com/therealdaveo/apollo-claw`** — cal.com, everywhere.

The old Calendly link (`calendly.com/therealdaveo/apolloai`) is **stale**. If it turns up
on any site, replace it.

## Who owns what: Donna vs Claude

This split exists because we broke it once — the same file was edited from both sides and
changes were applied and reverted twice.

- **Donna owns infrastructure**: the hetzner-4 server, creating GitHub repos, Vercel
  projects, DNS, domain cutovers, retiring old copies.
- **Claude owns file contents**: anything inside a repo. Once a repo exists and is
  attached, Claude edits, commits and pushes directly — no copy-paste relay.

The handoff is: Donna creates the repo and reports its name; Claude attaches it and takes
over the contents.

## Each site wears its own color, sampled from its own wordmark

A site's accent comes from **its own logo SVG**, not from ApolloClaw's red. Both the
CFO and CEO sites shipped wearing `#D72B2B` (the parent brand red) because they were
built from the same template.

| Site | Accent | Source |
|---|---|---|
| therealestateagent.ai | `#0F8743` | wordmark SVG |
| thecfoagent.ai | `#1E305F` | wordmark SVG |
| theceoagent.ai | `#E12E30` | wordmark SVG |

Sample the hex out of the SVG. Do not eyeball it off a JPEG of the wordmark — that was
tried on the real estate site and the guess (`#1B8A3B`) was visibly off the real value.

**A dark brand color is not a drop-in swap.** These templates put the accent on white
grounds *and* on the near-black `grid-dark-section`. A bright accent survives both; a
dark one does not. The CFO navy needed a second tone off the same hue (`#7F98D7`) for
the dark sections, and its primary buttons invert to dark-text-on-light so they still
read as the primary action. Check every accent against both grounds before shipping.

## Site migration runbook (server → repo → Vercel)

The pattern that worked for therealestateagent.ai:

1. Take the **live** `index.html` plus `images/`, `api/`, `robots.txt`, `sitemap.xml`
   off hetzner-4. **Do not bring the `.bak` pile** — those are years of hand-edits.
2. New repo per site: `<sitename>-site` under `doralevich`.
3. Push. Static sites need no build step.
4. Vercel: import the repo, Framework Preset **"Other"** for static sites (Next.js is
   auto-detected and needs `node_modules/` and `.next/` gitignored).
   **If a site later becomes a Next.js app, the preset does not follow it.** The CEO
   site served a 404 for exactly this reason: the project was created when the repo was
   static, so `next build` never ran. Commit a `vercel.json` with
   `{"framework": "nextjs"}` — it takes precedence over the dashboard setting, so the
   fix lives in the repo and needs nobody in the Vercel UI.
5. Vercel → Settings → Domains → add the domain. **Read the A record off the dashboard**
   — it differs per project.
6. At the registrar: **delete** the old A record pointing at hetzner-4
   (`178.156.209.243`) and add Vercel's. Add `www` as a CNAME to `cname.vercel-dns.com`.
   Leaving both A records causes intermittent serving from the wrong host.
7. Confirm Vercel shows **Valid Configuration**.
8. **Retire the hetzner-4 copy** so nobody edits an orphaned file.

Avoid cross-site asset hotlinks (one site was loading its founder headshot from
another's domain). Each site keeps its own assets.

## Private invite links (no payment)

`/agent-invite/<type>` provisions a live agent with no payment, for testing and
hand-picked users. One shared passcode in `AGENT_INVITE_PASSCODE` (Vercel env) unlocks
every link; it **fails closed** if unset. `/real-estate-invite` redirects into it.

This is separate from the paid funnels and is not linked from any marketing site.

## Admin

The admin god-view is **two tabs**, not three:

- **Customers** — the account is the spine, so a registered person with no workspace
  still appears and the license levers live where the person does. Expands to the
  per-workspace instance detail and support actions.
- **Fleet** — the database-vs-Agent37 reconciliation, as a flat filterable list. This is
  where a record with no live instance, or a live instance still billing with no record,
  gets caught.

## Where the three sites stand

All three are migrated, on Vercel, serving, and now **multi-page Next.js apps**. Each has
its own repo, its own accent color, and both-paths CTAs into its `/build/<slug>` funnel.

| Site | Repo | Funnel |
|---|---|---|
| therealestateagent.ai | `doralevich/therealestateagent-site` | `/build/real-estate` |
| thecfoagent.ai | `doralevich/thecfoagent-site` | `/build/cfo` |
| theceoagent.ai | `doralevich/theceoagent-site` | `/build/ceo` |

The CEO divergence is resolved: the **live Next.js app is authoritative**, and its source
now lives in the repo. The stale static `index.html` is gone.

## The site structure: marketing layer only

All three sites use the same page structure, modelled on thecollegeagent.ai's **marketing
layer**. What was explicitly *not* copied is that site's product layer (its own auth,
Stripe, Supabase, dashboard and provisioning). The college agent has one because it is a
separate product; the role agents are one product sold under different brands, and
duplicating checkout three times would mean three Stripe integrations to keep in sync and
customers who never appear in ApolloClaw's Customers and Fleet tabs.

```
/                        home
/how-it-works            what it does, the timeline, what it connects to
/what-is-an-agent        agent vs chatbot, and why private matters
/faq                     the full question list
/about                   the founder story
/contact                 consult, email, phone
/for-<audience> x4       the segmented pages
/privacy /terms /thank-you    noindex
/robots.txt /sitemap.xml      generated from the audience list
```

**The four audience pages are the point.** One page cannot argue to a solo agent and a
45-agent brokerage, or to a controller and a sponsor-backed CFO, without going vague.

| Site | Audiences |
|---|---|
| Real Estate | solo agents, teams, brokerages, property managers |
| CFO | CFOs, controllers, PE-backed companies, multi-entity finance |
| CEO | founders, executives, chiefs of staff, owner-operators |

Two conventions make the next site cheap:

- Content that appears on more than one page (capabilities, timeline, testimonials, FAQs)
  lives in **`lib/content.ts`**, so the home page and the interior pages cannot drift.
- The audience pages are **data in `lib/audiences.ts`** behind one shared component.
  Adding a fifth audience is an entry, not a page, and the sitemap picks it up.

Colors are tailwind tokens (`brand`, `brand-tint`, `ground`) rather than hexes in a
stylesheet, so the same components render on all three sites.

**Not yet built: the blog.** thecollegeagent.ai's is Sanity-backed (project `elj68qgu`,
dataset `production`, with a fallback posts file). Adding `/blog` to an agent site needs a
content type and posts in Sanity first, which is Donna's lane.

## Open items

- **CEO lead capture is broken.** `app/api/lead/route.ts` in `theceoagent-site` shells out
  to the `mail` binary with `execSync`. That binary existed on hetzner-4 and does not
  exist on Vercel, so every submission fails silently. It also interpolates the visitor's
  name into a shell command unescaped. Needs a real transport (Resend, the ApolloClaw API,
  or Attio) — the choice is open.
- **Retire the hetzner-4 copies** of the CFO and CEO sites, so nobody edits an orphaned
  file. Step 8 of the runbook; the real estate copy is already retired.
- **Privacy and terms are placeholders on all three sites.** They say so honestly rather
  than inventing policy text, but they need real text before the sites take real traffic.
- **The blog.** See the site structure section above: it needs a Sanity content type
  before there is anything to wire up.
