# Enough Family

A mobile-first intentional-scrolling prototype, isolated from the parent repository's application. It processes optional screenshots in the browser, accepts Instagram links as references only, and creates three deterministic recommendations from user-confirmed context.

## Run
Node 22 or later. From this directory:

```sh
npm test
npm install
npm run dev
```

## Cloudflare

```sh
npm run check:deploy
# Authenticate using the approved Cloudflare flow in the executing environment.
# Confirm the account and Worker-name ownership before deployment.
npm run deploy
```

Wrangler provides the actual public URL after a successful deployment. Verify GET / and GET /health. No account IDs or secrets belong in source control.

## No inflated capability claims
This is not an Instagram integration, scraper, automatic algorithm modifier, device blocker or medical intervention. No user accounts, persistent plans, analytics or image uploads. Screenshot reading uses optional external OCR library downloads, with local pixel processing. The CDN and host may receive request metadata. Public sharing includes no user input.

The interface starts with Screenshot, Sample and Reference Link, then the five Ws and confirmed usage/target values. Unsupported inputs remain unknown instead of being guessed. Sample data is labeled. Potential time recovered is scenario arithmetic, not an efficacy claim.

See CODEX_TASK.md for release checks and AGENTS.md for scoped instructions. Test execution and deployment are pending until confirmed by actual logs.
