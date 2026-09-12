<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Git Workflow — MANDATORY
Before writing a single line of code, run:
```
git pull origin main
```
`main` moves between sessions. David merges pull requests and also pushes to it directly, and work from other Claude sessions lands there too. A session that starts from a stale checkout writes against code that is already gone. Pull first, every session, no exceptions.

This used to say Donna pushes SEO and content changes here. She does not. Per DECISIONS.md ("Who owns what: Donna vs Claude") she owns infrastructure - servers, repos, Vercel projects, DNS, domain cutovers - and Sanity content; Claude owns everything inside a repo. Corrected Sep 12, 2026, after the two files were found to contradict each other. The instruction was always right; only the reason was wrong, which is the kind of error that survives for a long time because following it still works.

Deploy is manual: David merges to main and deploys from Vercel dashboard. Do not attempt to trigger deploys.
