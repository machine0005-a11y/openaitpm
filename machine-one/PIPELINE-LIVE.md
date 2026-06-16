# Historical Reference — Old OpenAITPM Pipeline

This guide predates the active Machine One / ideamuses.com pipeline. It is retained only as historical implementation context and must not drive current routing, reply behavior, domain selection, or operations.

## What works right now (verified)

**Push code to GitHub → openaitpm site auto-updates.** Verified end to end:
I pushed a new file `src/content/ideas/push-to-deploy-proof.json`, and within seconds it was live (with its unique content, not a fallback) at:
- https://openaitpm.vercel.app/push-to-deploy-proof

The whole chain, all automatic after a `git push`:
```
git push  →  GitHub (machine0005-a11y/openaitpm)  →  Vercel GitHub App detects push
          →  runs `npm run build`  →  deploys  →  live at openaitpm.vercel.app/<idea>
```

### Live pages (all HTTP 200, real content)
- https://openaitpm.vercel.app/  (home)
- https://openaitpm.vercel.app/oncall-review-buddy
- https://openaitpm.vercel.app/calculator-explains-every-step
- https://openaitpm.vercel.app/a-meal-planner-that-builds-a-grocery-list-from-your-week
- https://openaitpm.vercel.app/a-personal-crm-that-reminds-you-to-follow-up-with-friends
- https://openaitpm.vercel.app/push-to-deploy-proof

### Accounts / wiring
- GitHub repo: **github.com/machine0005-a11y/openaitpm** (your machine0005@gmail.com account)
- GitHub push auth: a Personal Access Token (`openaitpm-autodeploy`, repo+workflow, 30-day) is stored in the macOS keychain, so the SMS daemon can `git push` non-interactively.
- Vercel: account created via GitHub OAuth, GitHub App installed, project `openaitpm` imported, auto-deploy on push to `main` is ON.

### How to add a new idea page (3 ways, all auto-deploy)
1. **Text it** to +1 (949) 508-9229 — the SMS agent writes the JSON, commits, pushes; Vercel deploys.
2. **Locally:** `cd ~/Documents/New\ project && npm run idea:new -- "My Idea" && git add -A && git commit -m "idea" && git push`
3. **On GitHub:** add a file in `src/content/ideas/<slug>.json` in the web UI.

## The ONE thing left — openaitpm.com itself

`openaitpm.com` is **not registered to anyone** (whois: "No match"). I added it (and www) as a domain target in the Vercel project, so it's pre-wired — but a domain has to be **purchased** before it can point anywhere, and buying it is a payment I'm not allowed to make for you.

To finish:
1. Buy `openaitpm.com` (Vercel's own "Buy" button on the Domains page is one click, or any registrar).
2. If bought elsewhere, set DNS:
   - `A` record `@` → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`
   (Vercel shows the exact records under Domains → openaitpm.com → "Invalid Configuration → Learn more".)
3. Vercel validates automatically; the site goes live at openaitpm.com/<idea> with HTTPS.

Until then, **openaitpm.vercel.app/<idea>** is the public production URL and is fully live.

## SMS daemon status
- `reader.sh` runs inside Terminal (which has Full Disk Access) → reads incoming texts → /tmp/openaitpm-inbox.json
- `agent-loop.mjs` reads that, generates the idea page, commits, pushes → Vercel deploys → texts back the live URL
- Base URL now set to https://openaitpm.vercel.app (swap to https://openaitpm.com once the domain is live)
