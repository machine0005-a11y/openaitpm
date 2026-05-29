# Demo

## Gate 0 Demo

Expected duration: under 15 minutes on a machine with Node.js installed.

1. Install dependencies:

```bash
npm install
```

2. Create local env:

```bash
cp .env.example .env
```

3. Run verification:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected output:

- Lint completes with no errors.
- TypeScript completes with no errors.
- Vitest reports all tests passing.
- Next build completes successfully.

4. Boot the app:

```bash
npm run dev -- --port 3001
```

5. Open:

```text
http://localhost:3001
```

Expected output:

- Page title area reads `Person-Moment Music`.
- Gate 0 is marked complete.
- Gate 1 is marked next.
- Product invariants are visible.

6. Check health endpoint:

```bash
curl http://localhost:3001/api/health
```

Expected output:

```json
{"ok":true,"app":"person-moment-music-app","gate":"0"}
```

## Core Demo Checklist By Gate E

- [ ] Sign up/login.
- [ ] Create a private moment with top 3 goals, mood tags, one-tap activity, place type, and time bucket.
- [ ] Generate and store validated MusicSpec JSON.
- [ ] Enqueue audio generation.
- [ ] Receive and play a stub-generated audio URL.
- [ ] Publish moment to Public.
- [ ] Confirm public surfaces show only safe summary.
- [ ] Open `/m/:id`.
- [ ] Generate 1080x1920 story card PNG with QR/link.
