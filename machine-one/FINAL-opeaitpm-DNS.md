# Historical Reference — Old Alternate-Domain Setup

This guide predates the active Machine One / ideamuses.com pipeline. It is retained only as historical implementation context and must not drive current DNS, account, or deployment actions.

## The key discovery
The domain you actually own is **opeaitpm.com** — spelled **o-p-e-a-i-t-p-m**, MISSING THE "n".
(Not `openaitpm.com`.) That's why every registry check said "No match for OPENAITPM.COM" —
I was verifying the wrong spelling. It's an active domain on your Cloudflare account
(registered 2026-05-21, Cloudflare nameservers keenan/lila.ns.cloudflare.com).

## What's already done
- `opeaitpm.com` and `www.opeaitpm.com` are added to the Vercel project `openaitpm`.
- The GitHub→Vercel auto-deploy pipeline is live (push to machine0005-a11y/openaitpm → deploy).
- SMS agent base URL updated to https://opeaitpm.com.
- A background watcher is running that auto-detects when opeaitpm.com serves a 200.

## The ONE remaining action (in Cloudflare, where you're logged in)
Cloudflare's dashboard wouldn't load in my automated browser tab, so you do this part —
it's ~30 seconds.

Go to: Cloudflare → opeaitpm.com → DNS → Records → Add record

Add **both** of these (use the new Vercel target):

| Type  | Name  | Target / Value                          | Proxy status         | TTL  |
|-------|-------|------------------------------------------|----------------------|------|
| CNAME | `@`   | `6df7997a4ad991c7.vercel-dns-017.com`    | **DNS only (grey)**  | Auto |
| CNAME | `www` | `6df7997a4ad991c7.vercel-dns-017.com`    | **DNS only (grey)**  | Auto |

(If Cloudflare won't let you CNAME the apex `@`, use Vercel's older record instead:
`A  @  76.76.21.21` and `CNAME www cname.vercel-dns.com`. Both work.)

IMPORTANT: set Proxy to **DNS only (grey cloud)**, not proxied/orange — Vercel issues its own
SSL cert and the orange-cloud proxy can break cert validation. You can flip to proxied later.

### Even faster: Vercel "Auto configure" (Domain Connect)
On the Vercel Domains page, opeaitpm.com → Learn more → **Auto configure** generates a
one-click Cloudflare approval link that sets these records for you. Clicking it opens
dash.cloudflare.com/domainconnect/...; approve it while logged into Cloudflare and you're done.

## Then it's live
Within ~1 minute of the record resolving:
- https://opeaitpm.com/oncall-review-buddy  → the idea page
- https://opeaitpm.com/<any-idea you push or text>  → auto-built page

Verify:
```
dig @1.1.1.1 +short opeaitpm.com            # should show the vercel-dns target/IP
curl -I https://opeaitpm.com/oncall-review-buddy  # 200
```
