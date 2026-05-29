# TODO

## Completed

### Gate 0: Foundation + Repo OS

Acceptance criteria:

- [x] Next.js App Router scaffold exists.
- [x] Tailwind is configured.
- [x] Prisma is configured for Postgres.
- [x] lint, typecheck, test, and build scripts exist.
- [x] Required repo operating-system docs exist.
- [x] README and `.env.example` support local setup.
- [x] App boots locally.

## Now

### Gate 1: Auth + DB + Moment CRUD + Privacy

Acceptance criteria:

- User can sign up/login without external approvals.
- Prisma models exist for `User`, `Moment`, `MomentSummary`, `AudioAsset`, and `Event`.
- User can create, edit, and delete a private person-moment.
- Visibility supports `private`, `friends`, and `public`.
- Public endpoints return only safe summaries and never raw journal text.

## Next

### Gate 2: MusicSpec Contract

Acceptance criteria:

- zod MusicSpec schema exists.
- Planner endpoint returns strict JSON.
- Valid MusicSpec is persisted to the moment.
- Invalid planner output is rejected and replaced with activity-based defaults.

### Gate 3: Async Audio + StubProvider

Acceptance criteria:

- Generation endpoint enqueues a job.
- Worker processes jobs.
- MusicGenProvider interface exists.
- StubProvider writes a deterministic playable audio file.
- AudioAsset is persisted and playable in the UI.

### Gate 4: Feed + Share

Acceptance criteria:

- Mine and Public feed pages exist.
- Ranking v0 combines recency with activity/time/place compatibility.
- `/m/:id` respects privacy and exposes only safe summary content.
- `/api/story/:id.png` returns a 1080x1920 PNG with a QR/link to the share page.

### Gate 5: Hardening + Deploy

Acceptance criteria:

- Generation endpoints have rate limiting.
- Delete moment and delete account flows exist.
- Storage notes cover local and S3-compatible production storage.
- Monitoring hooks and robust error handling are documented and wired.
- Smoke test script passes.
- README supports a new environment setup in under 15 minutes.

## Deferred

- Instagram SSO behind `INSTAGRAM_SSO_ENABLED`.
- Spotify, Apple Music, and YouTube Music export/deep-link modules.
- Real MusicGen provider implementation behind the `MusicGenProvider` adapter.
- Following graph and friend-only feed expansion.
