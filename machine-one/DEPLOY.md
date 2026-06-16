# Historical Reference — Old Railway/OpenAITPM Deployment

This guide predates the active Machine One / ideamuses.com pipeline. It is retained only as historical implementation context and must not drive current deployment, routing, account actions, or reply behavior.

Total time: **~15 minutes from cold start to a real SMS rendering a Claude prototype at https://openaitpm.com/&lt;idea&gt;**.

You will be the one running these commands — I cannot log into your Railway / Twilio / DNS accounts. Each step has the exact CLI command or click path.

---

## Prereqs (have these in tabs)

- Anthropic API key — https://console.anthropic.com/settings/keys
- Twilio console with `+19495089229` already on the account — https://console.twilio.com
- Railway account — https://railway.app
- Your domain registrar dashboard for `openaitpm.com` (Namecheap, Cloudflare, GoDaddy, etc.)
- Gmail App Password for `machine005@gmail.com` — https://myaccount.google.com/apppasswords (2FA must be enabled first)

---

## 1 — Deploy to Railway (5 min)

```bash
# install + login
npm i -g @railway/cli
railway login

cd /Users/machine1/Documents/openaitpm-sms
railway init                       # name the project "openaitpm-sms"
railway up                         # builds the Dockerfile, deploys
```

You'll get a URL like `openaitpm-sms-production.up.railway.app`. Verify it works:

```bash
curl -sf https://openaitpm-sms-production.up.railway.app/health
# → {"ok":true,"ts":...}
```

---

## 2 — Set environment variables in Railway (2 min)

In the Railway dashboard for the project → **Variables** → paste:

```
ANTHROPIC_API_KEY=sk-ant-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+19495089229
PUBLIC_BASE_URL=https://openaitpm.com
GMAIL_USER=machine005@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_NOTIFY_TO=machine005@gmail.com
CLAUDE_MODEL=claude-sonnet-4-6
```

Railway redeploys automatically after each variable is added.

---

## 3 — Attach a persistent volume for `sites/` (1 min)

So generated prototypes survive redeploys:

Railway dashboard → service → **Settings** → **Volumes** → **+ New Volume**
- Mount path: `/app/sites`
- Size: 1 GB (you'll fit ~30,000 prototypes)

---

## 4 — Point openaitpm.com at the deploy (3 min + DNS propagation)

In Railway dashboard → service → **Settings** → **Networking** → **Custom Domain** → enter `openaitpm.com`.

Railway shows you a CNAME target like `xxxxx.up.railway.app`. Copy it.

Go to your registrar's DNS settings for `openaitpm.com` and add:

| Type    | Name | Value                                  | TTL |
|---------|------|----------------------------------------|-----|
| CNAME   | `@`  | `<the railway target>`                 | 300 |
| CNAME   | `www`| `<the railway target>`                 | 300 |

(If your registrar doesn't allow CNAME on the apex `@`, use **ALIAS** or **ANAME** instead. Cloudflare's "CNAME flattening" handles this automatically.)

Verify (may take 1–60 min):

```bash
dig +short openaitpm.com
curl -sf https://openaitpm.com/health
# → {"ok":true,"ts":...}
```

Railway will auto-issue a Let's Encrypt SSL cert once DNS resolves.

---

## 5 — Wire Twilio to the live URL (2 min)

Twilio Console → **Phone Numbers** → **Manage** → **Active Numbers** → click `+1 (949) 508-9229`.

Under **Messaging Configuration**:
- "A message comes in" → **Webhook** → `https://openaitpm.com/webhook/sms`
- HTTP **POST**

Save.

---

## 6 — Test with a real text (1 min)

From any phone, text **+1 (949) 508-9229**:

> a calculator that explains every step

Within 5 seconds: reply "On it. Building your prototype now..."
Within 60 seconds: reply "Live: https://openaitpm.com/calculator-explains-every-step"
Open the URL — working prototype.

Also check `machine005@gmail.com` for the notification email.

---

## Troubleshooting

| Symptom | Where to look |
|---|---|
| Twilio webhook returns 403 | `TWILIO_AUTH_TOKEN` in Railway doesn't match the account. Signature validation rejects it. |
| Texter gets no reply | Railway → Deployments → Logs. Look for `[generate]` lines. |
| Reply says "generation failed" | Almost always `ANTHROPIC_API_KEY` missing or out of credits. Check Anthropic console usage. |
| `/<slug>` 404 even after the success SMS | The persistent volume isn't mounted at `/app/sites`. Add it (step 3). |
| DNS not resolving | `dig openaitpm.com` — if no answer, give it more time or check the registrar saved the records. |

---

## Cost at steady state

- Railway: $5/mo hobby tier covers this easily
- Twilio: ~$1.15/mo for the number + $0.016/SMS round-trip
- Anthropic: ~$0.04/generation (Sonnet 4.6)
- DNS: free at most registrars
- Gmail: free

**Rule of thumb: ~6¢ per text-to-prototype.**
