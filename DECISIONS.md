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

## The build funnels: `/onboard?agent=<slug>` (was `/build/<slug>` until Nov 5, 2026)

Every role agent has a self-serve funnel on ApolloClaw at `/onboard?agent=<slug>`. The
old `/build/<slug>` addresses redirect there; see "The onboarding doors" below.

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

- **Build Your Agent** → `https://www.apolloclaw.ai/onboard?agent=<slug>` (self-serve purchase; the older `/build/<slug>` links redirect)
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
  projects, DNS, domain cutovers, retiring old copies. Plus content that lives outside a
  repo, which today means Sanity - see the blog note further down.
- **Claude owns file contents**: anything inside a repo. Once a repo exists and is
  attached, Claude edits, commits and pushes directly — no copy-paste relay. This includes
  the SEO surface: sitemap, metadata, the `/ai-agents` and `/industries` pages, and the
  marketing copy inside them. Donna does not push to a repo, and AGENTS.md said she did
  until Sep 12, 2026.

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

## Private invite links (retired Nov 5, 2026)

`/agent-invite/<type>` used to provision a live agent with no payment behind a shared
passcode (`AGENT_INVITE_PASSCODE`), for testing and hand-picked users. It is gone: a
free build is now a promotion code at the `/onboard` paywall, which asks for no card at
a zero total ("A zero-total checkout asks for no card", below) and leaves a Stripe record
behind. The old links
redirect to `/onboard?agent=<type>`. The Vercel variable can be deleted.

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

## Sports recruiting rides on the Recruiting Agent

WIN Sports Group (Ira Stahlberger, partner; football players, coaches and professional
golfers) is the first customer whose "recruiting agent" recruits athletes and coaches to
represent, not employees. The Recruiting Agent's questionnaire was built for hiring: job
titles, interview stages, an ATS, EEO. Decided Oct 8, 2026:

- **One agent type, two paths.** The first question of the recruiting deep-dive asks what
  kind of recruiting this is, and every question after it is gated on that answer
  (`lib/recruitingIntake.ts`, `showIf`). The sports path asks about sports, who they sign,
  where prospects come from, who is in the room when a prospect decides, the steps to a
  signed representation agreement, the rules that shape outreach (players association
  certification, NCAA and NIL, state athlete-agent laws, league contact rules), and what
  the agent may do with a prospect on its own. No second agent type, no second funnel:
  the blob, the USER.md section and the three keys the form reads by name are shared.
- **The persona follows the path.** `personaForAgentType` reads the answers, and a sports
  path gets the sports persona (`config/personas.ts`, `recruitingSports`), whose hard
  lines are the sports rules rather than EEO.
- **A second type in a workspace starts from the first type's business answers.**
  `/onboard/<type>` seeds the form from the workspace's newest questionnaire when this
  type has none, so WIN's August answers (company, team, tools, voice) carry into the
  Recruiting Agent's questionnaire and only the deep-dive is typed fresh.
- **How WIN gets theirs:** David, as a platform admin with support access to the
  workspace, opens `/onboard/recruiting?ws=<WIN workspace id>` and fills the
  questionnaire with Ira; submitting it provisions the Recruiting Agent (the admin
  form-first path in `/api/agent-setup`). Lloyd, the generic agent from August, is retired
  once the Recruiting Agent is running. The admin flow was already in place; nothing here
  changes billing.

## SEO rules for titles, descriptions and the sitemap

From Donna's SEO brief of Oct 9, 2026, which David approved the same day:

- **Titles** are 50 to 60 characters, one primary phrase, the brand once at the end as
  "Apollo Claw" (not the bracketed wordmark, which reads as noise in a search result). The
  root template is `%s | Apollo Claw`; a page that sets its own full title includes the suffix
  itself. **Descriptions** are 140 to 160 characters with a reason to click. No dollar amounts
  in either.
- **The home title** is the local phrase, "Apollo Claw | AI Consulting for NYC & Long Island
  Businesses", with the chief-of-staff line in the description. This supersedes the
  hero-matching "Your AI Chief of Staff" title from Sept 27.
- **The sitemap's lastmod is the date the page's content last changed**, kept by hand in
  `app/sitemap.ts` and updated in the same commit as a content change. It was the build time
  on every URL, which Google ignores. Blog posts take their date from Sanity.
- **Blog posts** carry BlogPosting structured data and one brand suffix. Each post's own title
  already ended in the brand and the old template added it again.
- `/agents` redirects to `/ai-agents`, not `/contact`. `/about` stays a permanent redirect to
  `/company` (Next.js sends 308, which Google treats as 301).
- App and account routes stay out of search with `noindex` only. They are not added to
  robots.txt: a crawl block hides the noindex tag from Google.
- The Long Island blog post's rewrite (a how-to that links to the page) and the three new
  articles are Sanity content, Donna's lane; Claude drafts, Donna publishes.

## Open items

- **CEO lead capture: resolved, closed Oct 5, 2026.** The broken `app/api/lead/route.ts`
  in `theceoagent-site` (shelled out to `mail`, which Vercel lacks) was moved to Resend,
  then Mandrill, then dropped altogether on Sep 6, 2026 (commit 870c3af there: "the sites
  sell and hand off; ApolloClaw does the capturing"). The agent sites now have no form and
  no server code. Every CTA goes to `apolloclaw.ai/build/<slug>` (contact step, then
  straight to Stripe checkout) or to the cal.com consultation, and the contact pages list
  hello@apolloclaw.ai and the phone number. Every satellite's build slug resolves in
  `lib/buildFunnel.ts`. This entry stayed open for a month after the fix because nobody
  came back to close it, which is the usual way a stale open item survives.
- **Retire the hetzner-4 copies** of the CFO and CEO sites, so nobody edits an orphaned
  file. Step 8 of the runbook; the real estate copy is already retired.
- **Privacy and terms: resolved, closed Oct 5, 2026.** Every agent site (all ten, not
  three) got real policy text on Sep 6 to 8, 2026, written against what each site does:
  no forms, no accounts, outbound CTAs to Apollo Claw and cal.com, Vercel server logs, and
  Google Analytics 4 behind a consent banner on nine sites (Marketing runs no analytics
  and its policy says "collects nothing" instead). Terms cover the website only and point
  at the Apollo Claw agreement for the product, with a per-site "not professional advice"
  section. Neither page has been reviewed by a lawyer; each file says so in its comment.
  Audited Oct 5: every site's analytics and consent setup matches its policy text.
- **The blog.** See the site structure section above: it needs a Sanity content type
  before there is anything to wire up.

## One Organization node, referenced by @id (Oct 12, 2026)

The SEO brief's second PR. The root layout used to render three top-level business blocks
(Organization, ProfessionalService, LocalBusiness) under two different names, and twelve pages
each inlined their own `provider: { "@type": "Organization", ... }`. A crawler saw up to fifteen
organizations per page.

The rules from here:

- The business is ONE node, in `app/layout.tsx`, typed `ProfessionalService` (which is a
  LocalBusiness, which is an Organization) with `@id` `https://apolloclaw.ai/#organization`
  (`ORG_ID` in `lib/seo.ts`). A `WebSite` node sits beside it.
- Any other structured data that names the business as `provider` or `publisher` spreads
  `ORG_REF` from `lib/seo.ts`. It never restates the name, address or phone.
- A city or region landing page (NYC, Long Island) is a `Service` provided by that node, with
  its own `areaServed`. It is never a second ProfessionalService with its own address.
- `areaServed` lists places only. Customer segments ("Universities", "Enterprise") are not places
  and were removed.
- `FAQPage` markup goes only on a page that renders those same questions and answers. The
  personal injury page marked up a list it never showed; that block is gone. The questions
  remain on /faq.
- Every static page's title fits 60 characters and its description 140 to 160, measured on the
  rendered HTML, not the source (the template adds " | Apollo Claw"). Use-case pages carry a
  separate `metaDescription` in `config/useCases.ts`, because the on-page description runs long.
  The audit script lives in the PR that set this; rerun it before touching metadata at scale.

## The home page: who the agents are for, and where they run (Oct 19, 2026)

David's final call closing the SEO brief, overriding the Oct 9 title. The H1 is, exactly,
"Custom AI Agents, Built for Your Business". The line under it: "Apollo Claw designs, builds and
runs private AI agents for individuals and departments at businesses and law firms. Each one
runs on a Mac Mini on your network or a private virtual server, working across the tools you
already use." The title tag is "Custom AI Agents Built for Your Business | Apollo Claw"; the
meta description, Open Graph and Twitter tags, and the root layout's defaults carry the subline
trimmed to fit a snippet.

Two wording rules that came with it:

- An agent is built for one person or one department. Never "a client", and no client names
  anywhere on the site.
- Site-wide, the hosting is a "private server". Where a page describes how an agent is hosted,
  say "a Mac Mini on your network or a private virtual server". The hosting is never described
  as the customer's own server: the VPS is ours to provision, and only the Mac Mini is theirs.

/pricing is a real page: indexed, in the sitemap, with a self-referencing canonical, and with
no dollar amount in its title or description (prices live on the page; no page prints one in a
title, description or structured data). The /cost-estimator and /agents redirects stay as they are.

## Dates, breadcrumbs, llms.txt and one robots file (Oct 19, 2026)

The schema and technical group of the SEO brief's follow-up. The rules:

- A page's structured data carries a real `dateModified`: the day its words last changed, kept
  by hand beside the page (`UPDATED` or `EFFECTIVE` constants, ISO YYYY-MM-DD) the same way
  app/sitemap.ts keeps `changed`. Metadata and style edits leave it alone. The policy pages
  show "Effective" and, when later, "Last updated"; the accessibility and security pages show
  "Last updated". `components/PageDates.tsx` renders both the node and the line.
- David is one Person node in app/layout.tsx (`PERSON_ID`). The business names him as founder,
  blog posts as author, /company as its subject, all by reference. The business node carries no
  `priceRange`.
- Breadcrumbs are structured data only, from the path, in `components/seo/Breadcrumbs.tsx` for
  the agent, industry and use-case pages, and in the blog post page for posts. A visible trail
  is a design decision David has yet to make.
- /llms.txt is a route (app/llms.txt/route.ts): what the site is, who an agent is for, where it
  runs, and the pages that answer what. No prices, no client names.
- robots.txt has one source: app/robots.ts. The copy in public/ is gone; a public file and a
  route for the same path is how two robots files disagree.

## The category pillar and the comparison pages (Oct 19, 2026)

Group 2 of the SEO brief's follow-up, David's page list. /ai-agent-for-business is the category
pillar: what an agent for a business is, who it is for (one person or one department), where it
runs (a Mac Mini on your network or a private virtual server), the four steps, and cards to the
pages beneath it. Three comparison pages sit under /compare and link back to it through their
breadcrumbs: Mac Mini vs private virtual server, AI agent vs chatbot, AI consultant vs in house.
Each one argues the other side honestly, because a buyer who is sent to the right thing comes
back.

Rules for these and any page like them:

- No dollar amount anywhere on the page, no client name anywhere on the site. Comparisons are in
  time, roles and what you keep.
- The comparison table's facts match the Security page line for line. Change one, change both.
- FAQPage markup only on a page that renders its FAQs (the `faq` section of SeoLanding).
- All new copy is approved by David before merge; the PR goes up as a draft and he marks it ready.

components/SeoLanding.tsx gained three section types for this: `compare` (a two-column table),
`faq` (details and summary, with the FAQPage node built from the same list) and `links` (hub
cards). Any later landing page can use them.

## The legal cluster under the law firms hub (Oct 19, 2026)

Group 3 of the SEO brief's follow-up. /industries/law-firms is the hub, and four practice pages
sit beneath it: family law, estate planning, immigration and commercial litigation. Each one is
the same Law Agent set up for one practice (intake questions, checklists, the calendar), and
each links to its siblings, to the hub, to the personal injury page and to /ai-agents/legal. The
hub gained a "Practice Areas" section that links down to all of them.

- One template, components/PracticeAreaPage.tsx, and one data object per page. The cluster list
  (LAW_CLUSTER) lives in the template so the hub and every practice page draw their cards from
  the same place. Adding a practice is one page file and one line in that list.
- Breadcrumbs for a practice page run Home, Industries, Law Firms, the practice. The one
  depth-three case in components/seo/Breadcrumbs.tsx.
- The price line on the hub and on the personal injury page is gone. They were the two legal
  pages touched in this group; six other industry and agent pages still print the starting price
  from config/agent-plans.ts, and the law hub's shared FAQ answer prints it too. Whether the
  site-wide rule is "no dollar amounts outside /pricing" is David's call, and the rest changes
  when he makes it.
- Hosting on these pages reads "a Mac Mini on your network or a private virtual server reserved
  for your firm". The agent is for the firm, set up by one person or one department at the firm;
  the client of a law firm is the firm's client, and is only ever referred to that way.
- The testimonials on the hub were left as they were, per the standing rule.
- All copy is approved by David before merge; the PR goes up as a draft and he marks it ready.

## /pricing is the only page that prints a dollar amount (Oct 19, 2026)

David's call after the legal cluster went up. The "Plans start at $49 a month with no setup fee"
line on the insurance, real estate, medical, CEO Agent, Law Agent and CFO Agent pages now reads
"month to month with setup included" with the link to /pricing beside it, the same line the law
firms hub and the personal injury page got in the legal cluster PR. The shared FAQ answer to
"How much does it cost?" (PRICING_FAQ_ANSWER in config/agent-plans.ts) names no number either;
it points to the pricing page. STARTING_PRICE is gone with its last reader.

Why: a price lives in one place, so a price change is one edit, and a visitor always reads the
current one. The plans on /pricing and /create-an-agent still read from config/agent-plans.ts.

The case-study descriptors ("$400M AUM", "$180M in premiums", "$40M revenue") went the next
day, Oct 20, at David's call: they now describe the customer by kind and place ("Independent RIA,
New York", "General contractor, Long Island"). The quotes, roles and results are as they were.

## The home page subline and meta description (Oct 25, 2026)

David picked the "Who We Are" body text for both: "We handle the infrastructure, workflows,
training, deployment, and ongoing support, so your team can focus on the work that needs human
judgment." The hero subline carries it word for word. The meta description, Open Graph and
Twitter text, and the root layout default carry it with the company named in place of "We", so
the snippet stands alone in a results page. The H1 and title from Oct 19 stay. The hosting
sentence (Mac Mini on your network or a private virtual server) stays on /security, /enterprise,
the comparison page and the FAQ; it is no longer the subline.

## The pricing page is hidden (Oct 26, 2026)

David's call: "hide it for now." /pricing redirects to /contact with a temporary 307 (one entry
in next.config.ts), so the URL keeps pointing at a human and Google is told the move is not
permanent. The page file stays in the tree and the build still renders it; delete the redirect
entry and it is back. Every link to it came off in the same commit: the nav item, the "See Plans
and Pricing" link in the home page's final CTA, "See every plan" on the eight industry and agent
pages (their line now ends "Book a consultation for a custom build"), the dashboard's "See all
plans", the create-an-agent page's "See full pricing", the onboarding form's custom-build link
(now /contact), the sitemap entry and the llms.txt line. The shared FAQ answer points to a call
instead of the page. The Oct 19 rule stands: no dollar amount outside the pricing page, which now
means none on the public site; /create-an-agent still prints the plan cards because it is the
purchase page.

To bring it back: delete the /pricing redirect, restore the sitemap line with a fresh date, the
llms.txt line, the nav item and the links above, and point the FAQ answer at the page again.

## AIO and schema: dates, bylines, FAQ blocks, breadcrumbs (Oct 27, 2026)

David's task list, done in one PR from a fresh branch off main.

- /company, /ai-agents, /ai-consulting-long-island and /industries/law-firms carry a visible
  "Last updated: Month D, YYYY" line and "By David Oralevich, Founder". One constant per page
  (UPDATED) drives the visible line and the WebPage node's dateModified through
  components/PageDates.tsx, so the two can never disagree, and app/sitemap.ts carries the same
  day. The home page carries dateModified in its WebPage node with no visible line. A byline
  also sets David as the WebPage's author by reference.
- BreadcrumbList on /company and /ai-consulting-long-island, inline, because
  components/seo/Breadcrumbs.tsx only handles two-level paths. /industries/law-firms already had
  one from that component.
- FAQPage with visible, matching Q&A on /ai-agents, /company and /ai-consulting-long-island:
  FLEET_FAQS, COMPANY_FAQS and LONG_ISLAND_FAQS in config/faqs.ts, rendered on their page and on
  /faq. Real buyer questions: how a private agent differs from ChatGPT Enterprise, where the
  data lives, how long a build takes, who supports it, what happens after launch. No prices.
- The Client Results section on /industries/law-firms links to a hand-built post,
  /blog/what-three-law-firms-got-back: three firms by practice type, no names, no figures in
  dollars, no head counts or cities.
- Primary-source links (ABA Formal Opinion 512, the NY State Bar AI guidance) were left out:
  the build environment cannot reach americanbar.org or nysba.org, so neither URL could be
  opened and confirmed, and the rule is to verify before linking.
- sameAs on the Organization: LinkedIn, Crunchbase (David's URL) and designsbydaveo.com.
  Clutch and GoodFirms wait for URLs David sends; none could be verified from here.
- One ProfessionalService node per page, declared once in app/layout.tsx and referenced by
  @id everywhere else; no priceRange. Checked on every changed page in the PR's verification.

## The Google Analytics measurement id (Oct 27, 2026)

The site reports into G-54RFVNJSSN, the id in the gtag snippet GA showed David when his property
said "Google tag isn't detected". The constant had been switched to G-4ZR38XGEME on Oct 6 in the
belief that it was the apolloclaw.ai stream, so for three weeks the tag fired correctly into a
stream nobody watched. Rule: the id in app/layout.tsx is whatever GA Admin shows for the property
David opens, and the snippet GA offers settles any disagreement. There is one constant for the
loader and the config call so they cannot diverge.

## A fresh agent's first message (Nov 5, 2026)

Every demo run through /onboard launched the agent and lost the first message: the chat
answered "Instance not found" the moment the build screen let the visitor in, and the same
message went through a minute later. Agent37 reports an instance "running" when the container
is up; the agent's own chat host (https://{id}.agent37.app) comes up some time after, and the
build screen was entering Chat on the first signal. Two changes:

- The build screen waits for the chat host. /api/agents/{id}/ready (logged-in flow) and the
  `ready` field of /api/onboard/status (license flow) probe the host's /v1/models
  (lib/instance-ready.ts), and the screen shows "Warming up" between "Starting it up" and the
  dashboard. The slow-path cap moved from four minutes to six.
- The chat route retries for a young agent. For fifteen minutes after an agent's row is
  created, a reply that reads as not-ready (the edge's "Instance not found", a 502/503/504, a
  connection failure) is retried on a schedule of about a minute, and if it is still not there
  the visitor reads "Your agent is still starting up. Give it a minute and send that again."
  An older agent's errors pass through unchanged, because for it "Instance not found" means
  what the admin fleet page says it means: the instance is gone.

## A zero-total checkout asks for no card (Nov 5, 2026)

David demos /onboard with his own 100% promotion code and Stripe still asked for a card every
time. On a subscription checkout Stripe collects a payment method whatever the first invoice
comes to, unless the session says the card is optional. Both checkout routes now set
payment_method_collection to "if_required": a code that brings the total to zero shows no card
field, and the webhook, the account email and the provisioning run exactly as for a paid
checkout. A paying customer still enters a card. The promotion code stays private; a test agent
is deleted from the admin fleet page afterwards so the VPS stops billing.

## The onboarding doors (Nov 5, 2026)

David: "I think we have too many options, and they get confusing." There were nine
addresses that built or set up an agent, all feeding one questionnaire:

| Was | Did | Now |
|---|---|---|
| `/onboard` | paid build of the Apollo Agent | **stays**: the one paid door |
| `/build/<slug>` | paid build of one role agent | redirects to `/onboard?agent=<slug>` |
| `/agent-build/apollo` | paid build of the Apollo Agent, again | redirects to `/onboard` |
| `/agent-invite`, `/agent-invite/<type>` | passcode-gated free build of a role agent | redirect to `/onboard` and `/onboard?agent=<type>` |
| `/real-estate-invite` | the same, for one role | redirects to `/onboard?agent=real-estate` |
| `/white-glove-onboarding` | done-for-you intake, no payment | **stays**: the one done-for-you door |
| `/legal-onboarding`, `/cfo-onboarding`, `/recruiting-onboarding` | the same intake with the role hard-coded | redirect to `/white-glove-onboarding?agent=<slug>` |

**Two doors, one parameter.** Each door takes `?agent=<slug>` (`lib/buildFunnel.ts`: the
readable slugs, `law`, `real-estate`, `cfo`, plus `apollo`; a type id is accepted too, so
Stripe's return trip and the retired invite links resolve). Without it the door opens on a
picker (`components/onboard/AgentPicker.tsx`) and the choice lands in the URL, so every
link that already named its agent skips the picker: the agent sites' "Build Your Agent",
the `AgentHero` button, a link David hands a prospect.

**Why the free build went away rather than the paid one.** The invite system existed
because the only other way to stand up an agent was to pay. Since the paywall asks for no
card at a zero total, a promotion code does what the passcode did, with a Stripe record
and no second gate to maintain. Anyone who holds that code gets a free agent, which was
also true of the passcode.

**Why the old addresses redirect instead of 404.** They are printed in mailers, on the
agents' own sites (`therealestateagent.ai` and the rest still link `/build/<slug>`) and in
links David has handed out. A 308 keeps every one of them landing; the sites can update
their CTA when they are next touched. The request's own query (`?pay=`, `?name=`) rides
along on the redirect.

**What did not move.** `/onboard/[agent]` is the post-checkout setup for a signed-in
customer, a step rather than a door; `/setup` and `/pre-call` are the same. `/hello` is
an intro page with a booking link, `/get-started` and `/demo` book a call or talk to
Donna, `/create-an-agent` is the mailer's landing page, and `/davidtest` is the admin
walkthrough. None of them builds an agent, so none of them was in the count.

## The build screen that would not finish (Nov 5, 2026)

The first build after "Warming up" shipped (earlier today) sat on that step until David
refreshed; the agent was there and answered. Two causes, both fixed:

- **The progress poll was rate-limited into silence.** `/api/onboard/status` shared the
  assistant's bucket of 30 requests an hour. The build screen polls every five seconds,
  so the bucket ran dry two and a half minutes into the first build, and stayed dry for
  the next demo in the same hour. Every poll after that was a 429, which the screen reads
  as "still building". It now has its own bucket (`LIMITS.build_status`, 600 an hour),
  sized for the poll it serves.
- **The readiness probe was too strict.** It wanted a 200 with a model list from
  `/v1/models`. Any other reply from a live host kept the screen waiting. It now counts
  any reply that is not the edge's "no route yet" as ready.

And a ceiling, so neither of these can strand anyone again: once the agent has been
"running" for 90 seconds, the screen enters Chat whether or not the probe agrees. The
chat route retries a not-ready reply on its own for a young agent, so going in a little
early costs a "still starting up" message at worst.

## Email, calendar, then where to message you: the first three screens (Nov 5, 2026)

The build screen hands off to `/dashboard/connect` again, in the shape of the college
agent's integration onboarding, which David called excellent: "Which do you use for
email?" with Google and Microsoft tiles, "Would you like to set up your calendar?" with
both calendars as tiles, then "Where should I message you?" Three screens, a step counter
on each, "Skip for now" and "I'll do this later" under every choice, and one closing line
saying all of it is a click away in Connections.

What moved to make that true:

- `POST_BUILD_LANDING` is `/dashboard/connect` (it was Chat from Sept 29).
- The files step (Drive, OneDrive) left the guided flow. Four asks on a first run is one
  too many; files stay in Connections.
- The calendar step carries `choices`: the other vendor's calendar, offered beside the
  expected one, because the email answer is a strong guess at the calendar and not a
  certainty. Any one connected satisfies the step. Outlook's "already covered" state
  stays, since one Microsoft sign-in really does cover both.
- Copy moved closer to the college agent's: "Connect Gmail", "So I can flag what needs a
  reply", "So I know where you have to be, what is due, and when you have time".

**Texting (SMS, iMessage) is not a channel yet.** David asked to research it. SMS is
Twilio with A2P 10DLC registration for a US business number (brand and campaign vetting,
days to approve) or a verified toll-free number. iMessage has no official API: Apple
Messages for Business is inbound-only through an approved provider, a managed iMessage
API such as Sendblue sends real blue bubbles from a dedicated number, and a self-hosted
bridge such as BlueBubbles needs a Mac that stays on, which a Mac Mini deployment already
has. Third-party guides describe OpenClaw running both an SMS webhook channel and an
iMessage bridge; that has to be confirmed against the Agent37 image before it is offered
as a fourth tile.
## The questionnaire, simpler and smarter (Nov 5, 2026)

David walked the application and asked for a pass. What changed, and why:

- **The industry dropdown is alphabetical**, "Other" last. It was in the order the
  branches were written, which read as random to anyone scanning for their own.
- **Monthly Revenue is gone** from "Your Business", for every flow. Nothing downstream
  decided anything on it. Team Size and Years in Business now share the row. The Law
  Agent's `hideRevenue` opt-out went with it, since there is nothing left to hide.
- **Industry software moved to the Tech Stack page.** Every industry page used to carry a
  "Primary tool" dropdown, one page before the Tech Stack page asked about tools again.
  Each branch now declares `stack` in `lib/industryConfig.ts`: a logo-tile section (or a
  type-in question) rendered at the top of the Tech Stack page and saved into the same
  industry_details blob. Where the industry section covers a generic one (a realtor's
  CRM, a CPA's accounting software), `stackSkip` hides the generic tiles; **Legal** gets
  the Law Agent's whole stack page (`LEGAL_STACK`) and none of the generic ones. The
  store platform stays required for e-commerce, as it was. `lib/agent-files.ts` reads
  these into TOOLS.md, which the "Primary tool" answer never reached: it only ever landed
  in USER.md's industry dump.
- **USER.md prints the question, not the key.** The Industry Deep-Dive section used to
  print snake_case keys with the underscores swapped out ("Ehr System: Epic").
  `industryFieldLabel()` looks the label up from the branch.
- **"Where You Are With AI" asks about AI.** Behind "Yes" it used to open three paragraphs
  asking for a review of past projects. It now asks which tools (ChatGPT, Claude, Gemini,
  Copilot, Perplexity, Grok, Zapier / Make, custom, Other), a 1 to 5 comfort scale, and
  the processes worth keeping. Those three reach AGENTS.md's "How they decide" section in
  place of the old trust score and prose. The 1 to 10 "How much do you trust technology
  to handle critical tasks?" scale is gone; "How does your team feel about implementing
  our new program?" stays.
- **Final Details has an open box**, "Anything else we should know?", above the file
  drop. Saved as `anythingElse`, printed into USER.md.

**Still asked, and worth keeping:** "Your Voice" (two questions) is what AGENTS.md's
voice section is built from; cut it and every agent writes in the persona's default
voice. "What does winning look like" feeds "How they'll judge whether you're working" in
the same file.

**Not done, pending David's call:** industry-specific task lists on "What your agent
should take on". The industry page already asks "Biggest bottleneck" in that industry's
words, and the generic page asks it again in generic words; the clean version is to ask
once, on the "take on" page, using the industry's list. That changes what `aiGoals`
holds, which the chat opener and checklist read by exact string, so it is a deliberate
change rather than a tidy-up.

## Signed in the moment they pay (Nov 5, 2026)

The college agent's post-checkout, brought over: Stripe returns the buyer to
`/api/onboard/post-checkout`, which signs them in (a magic link minted and verified
server-side, cookies set on the redirect) and sends them to a skippable "set your
password" stop, then to their questionnaire at `/onboard/<type>?ws=…&paid=1`, inside their
account. The questionnaire's submit provisions the agent, the build screen runs without a
password form, and the connect flow follows.

Before this, the questionnaire ran on a public page against the checkout session as a
token, and the password came last, on the build screen. Two things made that worse than
the college agent's order: ten pages of questions with nothing to come back to if the tab
closed, and a password screen at the end of the longest part.

**The session id crosses the line once.** `lib/license-session.ts` says a checkout session
id must never open the dashboard. This route is the one place it does, under the two
constraints `/api/onboard/set-password` already used: an account that has ever signed in
is sent to `/login` instead, and the id is spent on first use through
`license_password_claims`. A leaked or replayed id gets a login page.

**The plan is what allows the first build.** `/api/agent-setup` provisions for a customer
when the workspace's plan has room for another agent (`lib/agent-plan.ts`), the same rule
the dashboard's Create an Agent applies. The webhook records the plan and stops.

**The old path stays wired.** Every failure in the new route (webhook not landed, cookies
refused, link not minted) falls back to `/onboard?paid=1&session_id=…`, which still runs
the questionnaire on the session token and sets the password on the build screen. In-flight
checkouts from before the deploy return there directly.

## The questionnaire, one question at a time (Nov 5, 2026)

The second of the two things David asked for after seeing the college agent's intake. At
`/onboard/<type>` (where checkout now lands the buyer, signed in) the questionnaire is
asked one question at a time: the agent's face and name, one question in large type, one
control, Back and Continue, a progress bar for the whole and a "Your business · 2 of 6"
line for the section. Every answer is saved as it lands (`PUT /api/agent-setup/draft`),
so a closed tab or a refresh resumes at the same question.

**Same answers, new asking.** `lib/intake-questions.ts` walks the pages
`components/onboard/OnboardingForm.tsx` renders and turns each field into a question,
in the same order, with the same role and industry rules (dropped pages, the role's own
deep-dive and stack sections, `coversScope`, `businessDescField`). Its `toPayload()`
produces the object the form's `buildData()` sends, byte for byte, so `/api/agent-setup`,
USER.md, TOOLS.md and the intake email are untouched. The industry and role branches
were already data; the generic pages are listed once, in that file.

**Where drafts live.** In `agent_setup`, the row the finished questionnaire lands in,
with `intakeStep` inside the answers. One place answers live, and the page's existing
pre-fill reads a draft the same way it reads a finished questionnaire. The draft route
provisions nothing; only the final submit does.

**What the ten-page form still does.** Lead mode (`/onboard`'s free intake), the
white-glove links and the demo walkthrough, and `?classic=1` on `/onboard/<type>` for
comparison. Two things the form asks that the conversation does not yet: the file upload
on Final Details (Connections and chat can take files later) and a second company. Both
are rare on a first run and both can come back as questions.

## The two smaller questionnaire ideas (Nov 5, 2026)

Both from David's walk through the application, done after the conversational intake landed:

- **"What should I take off your plate first?" carries the industry's own tasks.** Every
  industry page asked "Biggest bottleneck" in that trade's words, and the take-on page
  asked the same thing again in generic words. It is asked once now: the industry's list
  first, then the generic one, on the take-on page. The picks that came from the industry
  list are still saved under the industry's own key, so USER.md's industry section reads
  as before. The chat opener and the checklist already handle a task they do not
  recognize (a keyword pass, then a plain "Hand over <task>" row), which is what made
  this safe. Recognized by key (`_bottlenecks`, `agent_focus`), see `takeOnField()`.
- **"What does winning look like" takes up to two.** A priority rather than everything
  ticked, so the agent knows what it is being judged on.

Both apply to the conversational intake and to the ten-page form.

## The College Agent sells through ApolloClaw (Nov 5, 2026)

David's call, on the question of what to do with the college agent's branding: "let's make
this a simpler infrastructure." thecollegeagent.ai ran its own checkout, Stripe webhook,
Supabase project, auth, questionnaire, provisioning, dashboard and admin, a second copy of
everything ApolloClaw has. It had zero customers at the cutover.

**What the college site is now.** A storefront, like every other agent's site
(Architecture, above): landing pages, blog, demo sandbox, ambassador pages. Its "Build"
button lands on `/onboard?agent=college`. Everything behind a sign-in runs here: the same
checkout, auto sign-in, conversational questionnaire, build, connect flow and dashboard
every other agent uses. The college site's own backend is retired in a follow-up PR in that
repo, with redirects from `/build`, `/login`, `/dashboard` and `/setup`.

**Pricing: the three student tiers, unchanged.** Essentials $25, Plus $50, Pro $100 a month
(`COLLEGE_PLANS`, config/agent-plans.ts), with the AI allowance each carried on the college
site. They are sold only in the college funnel and never appear on `/pricing`,
`/create-an-agent`, the terms page or a business dashboard's upgrade cards:
`plansForAgentType` and `plansBeside` pick the family by the agent. Fresh Stripe catalog
keys (`apollo_college_*`): reusing the college site's lookup keys would have let the seed
move a live price out from under its checkout. Annual billing is not sold here yet. Run the
Stripe catalog sync once after this deploys.

**The questionnaire.** The student flow is a role intake (lib/collegeIntake.ts,
`ROLE_INTAKES.college`): who they are, their semester, and how the agent works with them.
The business pages drop out, same as the Personal Agent. The college site's class builder,
majors dropdown, school typeahead and résumé upload became text questions; the résumé goes
in through Files once the agent exists.

**The persona** (config/personas.ts `college`) carries two boundaries that matter more for
a student than for any other buyer: the work they hand in is theirs, and real distress gets
a person (campus counseling, 988) before anything else. The same lines are the role's fixed
guard, so they reach the agent's own instructions whatever the questionnaire says.

**The box keeps Claude Code.** The college site's image was Hermes plus the Claude Code
CLI, so a student could open the terminal, type `claude` and sign in with their own account
("I like to have it"). The replacement (template/college/Dockerfile) is the stock OpenClaw
box plus Claude Code, registered as `apollo-college`, so provisioning and the file layout
are the same as every other agent. Until Donna publishes and registers that image, the type
provisions the stock box through its alias. The old `college-agent` Hermes template stays
registered for the boxes it owns.

**Hidden for now, David's call.** The ambassador program. Referral codes still apply at
checkout, but crediting the ambassador, the clearing window and payouts lived in the
college site's webhook and tables. Port it to ApolloClaw only if it comes back.

**On the picker, last.** The college slug was first left off `/onboard`'s picker, so a
business buyer would never be offered a college agent. David looked for it there on Nov 10
and expected it, so it is listed after the business agents (`LAST_SLUGS`,
lib/buildFunnel.ts). `internal` still keeps it out of the dashboard's create-agent modal,
which is for a business adding a second agent. The nav row for it still goes to
thecollegeagent.ai, which is its marketing page.

## Agent37 key on instance hosts goes in X-Agent37-Key (Nov 9, 2026)

Agent37 (Vishnu) asked every customer to stop sending the API key to instance hosts
(`*.agent37.app`, including `<id>-<port>` hosts) as `Authorization: Bearer` and send it as
`X-Agent37-Key` instead; the bearer form stops working on instance hosts later this year.
The hosting API, `api.agent37.com`, keeps the bearer.

Two places changed: `instanceFetch` in lib/agent37.ts (chat, files, the readiness probe and
everything else that talks to a box's Agents API), and the "apikey" way through the edge in
lib/gateway-chat.ts. The latter now also sends the gateway's own token in `Authorization`,
which the header split frees up. The sandbox exec host and scripts/multi-agent-test.mjs
already used the new header. The college repo's instance calls already did too.

## The student questionnaire, second pass (Nov 10, 2026)

David, after building a college agent through the new path:

- **"What classes are you taking this semester?" is the class-by-class builder again.** The
  first port made it one text box; the college site had asked for each class's name, course
  number, and every day and time it meets, with extra blocks for a lab or a discussion
  section. "It was much more detailed." Rebuilt as a field type, `classes`
  (components/onboard/ClassListInput.tsx), used by both questionnaires. Stored one line per
  class ("Marketing 301 (MKT 301): Mon / Wed 10:00 AM - 10:50 AM and Fri 1:30 PM - 3:20 PM"),
  so USER.md and the intake email print it with no change.
- **"What does a great semester look like?" is gone.** The agent's "how they'll judge whether
  you're working" line is left out for students, the same as for the Personal Agent.
- **The College Agent is on the `/onboard` picker**, last (see the Nov 5 entry above).
- **Every agent's checkout opens on its three plans.** A role agent's funnel used to preset
  Solo and go straight to Stripe. David bought a CEO Agent that way and found the college
  funnel, which shows its three plans, the better experience: "This should be for all the
  agents." Solo leads for a role agent, Plus for the college agent, Team on plain
  `/onboard`. A plan picked on `/pricing` (`?plan=`) still goes straight to checkout.


## Technical Setup is one page, without the corporate section (Nov 10, 2026)

David: remove the "Corporate / Enterprise Setup" part of the Technical Setup page (`/setup`),
put the rest on one page, and say "Email" rather than "Business Email".

The corporate section held an IT contact, known network restrictions, a checklist for IT, and
pre-written emails to a Google Workspace or Microsoft 365 admin. It is gone. The two steps,
"Your Setup" and "Credentials", are one form with one submit, which sends what the old second
step sent ("apollo_setup_2": the CRM deal at deployment_ready, the credentials encrypted for
Super Admin, the summary email, the Telegram ping). The Telegram bot username is suggested
live from the assistant's name and the email until the client types their own. The endpoint
still accepts the old first step and still prints IT contact fields, so a tab left open on the
old page submits cleanly.

## "Warming up" waits 30 seconds at most (Nov 10, 2026)

David: the build screen's "Warming up, so your first message gets an answer" step was the slow
part of building a college agent, whose box was created and written within 4 seconds. The
step waits for Agent37 to connect the agent's chat host and enters the dashboard regardless
after a ceiling, which was 90 seconds and is now 30 (`WARMING_CAP_MS`,
components/onboard/BuildScreen.tsx). Nothing is lost by entering early: the chat route quietly
retries a first message for up to about 55 seconds while the host comes up, and only then says
the agent is still starting up.

## Podcast clip cards are drawn, not YouTube frames (Nov 10, 2026)

The podcast clips were cut vertically from a title card laid out wide, so every frame of every
clip, and so every YouTube thumbnail of one, reads "o [Claw] st" instead of "Apollo [Claw]
Podcast". Two attempts to frame YouTube's image differently could not show words the clip
never had (David: "still not seeing the podcasts look correct"). A podcast clip's card on
`/podcast` is now the podcast's title card drawn in code (`ClipArt`,
components/podcast/PodcastParts.tsx): the clip's number, the wordmark, "Podcast", the clip
title with a red cursor, and a red waveform. A clip is a podcast clip when its YouTube title
ends "| David Oralevich"; its number comes from `CLIP_NUMBERS` in lib/podcast.ts, read off the
clips' own frames. The college promos keep their YouTube frame in a centred vertical strip.
The share image for a clip page is still YouTube's thumbnail.

## Technical Setup: Tavily out, a second Telegram account in (Nov 10, 2026)

David: remove section 06 (Tavily) from `/setup`, and add "Do you need an additional Telegram
account?" with a plus sign that opens a section for a second account.

- **Tavily is gone from the page.** The endpoint still reads `tavily_api_key` if an old tab
  sends one, and the field stays in the encrypted list for submissions already stored.
- **The second account** opens from a button under the Telegram section: who it is for, a
  username suggested from that name (seeded apart from the first so the two never collide),
  the bot token and the username. Opened means wanted, so its token and username are required
  and must differ from the first's; closing it clears it and sends nothing. The token is a
  secret like the first (`telegram_bot_token_2` in `BYO_SECRET_FIELDS`, stored encrypted for
  Super Admin), and the summary email, CRM notes and Attio note list it as given or not.

## Intake questions sit on a white card and run full width (Nov 10, 2026)

David: make the question go across, for every question, and put the question on a white card
with a 1px #DDDDDD border, 10px corners and 20px padding.

- **The card** (`ConversationalIntake.tsx`) holds everything that belongs to one question: the
  agent's name, the question, its help line, the answer, Back / Continue and "Skip this one".
  The section label stays above it and "Saves as you go" below. The column widened from 640 to
  680 so the content inside the padding keeps roughly its old width.
- **Full width.** The heading used `text-wrap: balance`, which splits even a short question
  into two half-width lines. It is now `pretty`, which fills each line and only avoids a lone
  last word, at 24-32px (was 26-38px) so the usual questions fit one line on desktop. On a
  phone they wrap where the width ends.

## CEO Agent intake: five questions out, two reworded, one moved, mascot shown whole (Nov 10, 2026)

David, walking the CEO Agent intake:

- **Removed as repeats** of the Your Business page a few questions earlier: "What's your role?"
  (`title`, repeats "What is your role there?") and "How big is the organization you run?"
  (`team_size`, repeats "How big is the team?").
- **Removed as unneeded:** "Which recurring meetings do you run or sit in?"
  (`recurring_meetings`) and "How many emails land in your inbox on a typical day?"
  (`inbox_reality`). No code read them; they only became deep-dive rows in USER.md, and the
  agent reads both from the calendar and mailbox once connected.
- Records already holding any of the four keep them; the summary still lists them.
- **Renamed:** "Describe your business in a few sentences." is now "Describe your Business",
  in David's words.
- **"Always check with me first before it..."** (`guardrails`) is off the form too: "This is
  assumed." Its whole list is now the CEO entry's fixed `standardGuard`, so every CEO agent's
  Boundaries section carries all of it, the way the Law and Personal Agents already work.
- **"What do you want your agent to own?"** on every role agent; each used to name the role
  ("your CEO agent", "your Law Agent").
- **"What should it tackle first?"** moves to the end of every role agent's intake, just
  before "Anything else", under its own "Where to start" heading. Same key, same payload.
- **The agent's face above each question** is larger (52px). A chosen photo fills its circle
  as before; the agent's own mascot, a full standing figure, is shown whole at 60px tall with no
  circle, because a circle either cut its arms off or shrank it to a speck.
