# Historical Reference — Old Handoff

This guide predates the active Machine One / ideamuses.com pipeline. It is retained only as historical implementation context and must not drive current routing, reply behavior, setup, or operations.

Everything I could build, I built. Everything that needs your accounts, you need to do. There are exactly **four commands left**.

---

## What's done

- ✅ Express server (`src/server.js`) — SMS webhook with Twilio signature validation, dynamic `/<slug>` route, gallery at `/sites`, landing at `/`, 404 fallback
- ✅ Claude generator (`src/generator.js`) — Anthropic SDK call w/ engineered system prompt, HTML sanitization, persists to `sites/<slug>/index.html` + `meta.json`
- ✅ Slug logic (`src/slug.js`) — URL-safe, stopword-stripped, reserved-path-aware, de-duped
- ✅ Gmail notifier (`src/notify.js`) — Nodemailer via App Password, fire-and-forget
- ✅ CLI test harness (`src/cli-test.js`) — generate without Twilio
- ✅ `npm run live` (`src/live.js`) — boots server + ngrok tunnel + auto-updates Twilio webhook in one shot
- ✅ Setup wizard (`./setup.sh`) — prompts for creds, writes `.env`, runs a real generation
- ✅ Deploy config — `Dockerfile`, `railway.json`, `Procfile`, `.dockerignore`
- ✅ Deploy walkthrough — `DEPLOY.md`
- ✅ Landing page — `public/index.html`
- ✅ **Four pre-built prototypes seeded in `sites/`** so the deployed system has real content on day 1:
  - `habit-tracker-streaks` — Streakly
  - `flashcard-app-sat-vocab-spaced-repetition` — Lexicon (SM-2 spaced repetition)
  - `recipe-finder-only-ingredients-have` — Pantry (50-ingredient matcher)
  - `focus-timer-ambient-sound-time-day` — Hours (12 Web Audio soundscapes)
- ✅ Railway CLI installed globally on this machine (`railway --version` → 4.59.0)
- ✅ Zero npm vulnerabilities (nodemailer was upgraded past the advisory range)

---

## What's left — four commands, ~10 minutes

Run these **in this directory**: `cd /Users/machine1/Documents/openaitpm-sms`

### 1 — Set up local secrets and prove the Claude pipeline (3 min)

```bash
./setup.sh
```

This prompts you for: Anthropic API key (required), Twilio SID/Token (optional now), Gmail App Password (optional now). It writes `.env`, installs deps, and **runs a real Claude generation** with the idea *"a pomodoro timer that tracks deep work blocks across the day"*. If you see a working prototype HTML file, the API path is proven.

### 2 — Deploy to Railway (4 min)

```bash
railway login                                      # opens browser
railway init                                       # name the project "openaitpm-sms"
railway up                                         # builds Dockerfile, deploys
railway domain                                     # gives you a *.up.railway.app URL
```

Then in the Railway dashboard → **Variables**, paste every line from your local `.env`. Railway redeploys automatically.

Also in Railway dashboard → **Settings** → **Volumes** → add a 1 GB volume mounted at `/app/sites` so generated prototypes survive redeploys.

### 3 — Point openaitpm.com at the deploy (1 min + DNS propagation)

In Railway dashboard → **Settings** → **Networking** → **Custom Domain** → `openaitpm.com`. Railway gives you a CNAME target. At your domain registrar, add:

| Type   | Name | Value                         |
|--------|------|-------------------------------|
| CNAME  | `@`  | `<railway CNAME target>`      |
| CNAME  | `www`| `<railway CNAME target>`      |

(Or ALIAS/ANAME if your registrar doesn't allow CNAME on apex.)

### 4 — Wire Twilio webhook to live URL (1 min)

Twilio Console → Phone Numbers → `+1 (949) 508-9229` → Messaging:
- "A message comes in" → **Webhook** → `https://openaitpm.com/webhook/sms`
- HTTP **POST**

---

## How to know it worked

Text any phone → **+1 (949) 508-9229**:

> a calculator that explains every step

Within 5 seconds: SMS reply *"On it. Building your prototype now..."*
Within 60 seconds: SMS reply *"Live: https://openaitpm.com/calculator-explains-every-step"*

Open the URL. Working prototype.

Also check `machine005@gmail.com` for the email notification.

---

## Why I couldn't do these for you

| Step | Why I'm blocked |
|---|---|
| Anthropic API call | This sandbox strips `ANTHROPIC_API_KEY` from subprocess env (verified — `node -e 'console.log(process.env.ANTHROPIC_API_KEY?.length)'` returns 0) |
| `railway login` | Opens a browser to authenticate against *your* Railway account |
| DNS records | Requires login to *your* domain registrar |
| Twilio webhook | Requires login to *your* Twilio account |
| Sending real SMS | I do not have a phone |

Every one of these is "yours-only" by design. There is no Claude-side trick.

---

## Local dev shortcut (no deploy needed)

If you want to test the full SMS loop **before** deploying:

```bash
./setup.sh                # fill in Anthropic, Twilio creds, and NGROK_AUTHTOKEN
npm i @ngrok/ngrok
echo "NGROK_AUTHTOKEN=<your-ngrok-token>" >> .env
npm run live              # boots server + ngrok + auto-updates Twilio webhook
```

Then text the number. Prototype URL will be `https://<ngrok-id>.ngrok.io/<slug>`.
