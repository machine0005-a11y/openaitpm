# Historical Reference — Old OpenAITPM DNS Setup

This guide predates the active Machine One / ideamuses.com pipeline. It is retained only as historical implementation context and must not drive current DNS, account, or deployment actions.

Status check (from the .com registry, authoritative):
**openaitpm.com is not registered yet** — `whois whois.verisign-grs.com openaitpm.com` returns "No match".
So the Cloudflare order is still processing or didn't finalize. Once it shows in your Cloudflare
dashboard as an active domain, do the 2 DNS records below and it goes live automatically
(Vercel project `openaitpm` already has openaitpm.com + www added as domains).

## In Cloudflare → openaitpm.com → DNS → Records, add:

| Type  | Name | Value                    | Proxy status        |
|-------|------|--------------------------|---------------------|
| A     | `@`  | `76.76.21.21`            | **DNS only (grey)** |
| CNAME | `www`| `cname.vercel-dns.com`   | **DNS only (grey)** |

Important: set both to **DNS only** (grey cloud, not orange/proxied). Vercel issues its own
SSL cert and needs to see the origin directly; Cloudflare's proxy in front of it can cause
cert-validation loops. You can switch to proxied later if you want Cloudflare's CDN, but get it
working DNS-only first.

## Then
1. In Vercel → Project openaitpm → Settings → Domains, openaitpm.com will flip from
   "Invalid Configuration" to "Valid Configuration" within a minute or two.
2. Visit https://openaitpm.com/oncall-review-buddy — should load the idea page.

## Verify from terminal
```
whois -h whois.verisign-grs.com openaitpm.com    # should NO LONGER say "No match"
dig @1.1.1.1 +short A openaitpm.com               # should show 76.76.21.21
curl -I https://openaitpm.com/oncall-review-buddy # should be 200
```

A background watcher is already running on this Mac that auto-detects the moment the domain
registers + resolves + serves, and reports it.

## Alternative (simplest): point Cloudflare's *nameservers* — skip if using records above
If you'd rather let Vercel manage DNS, you can instead set openaitpm.com's nameservers to
Vercel's (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) at the registrar. But since the domain is
in Cloudflare, the 2-record approach above is the path of least resistance.
