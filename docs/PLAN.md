# Plan

## Finish Line

By Gate E, I want a user to create a private person-moment, generate a validated MusicSpec, receive playable generated audio from the stub provider, publish only a safe summary, view the moment in a public feed, open `/m/:id`, and download a 1080x1920 story card, proven by green lint/typecheck/tests/build plus the `docs/DEMO.md` checklist.

## Current Status

Gate 0 is complete: foundation scaffold, Prisma/Postgres connection path, verification scripts, CI, and repo operating docs are in place.

## Next 3 Actions

1. Gate 1: add baseline auth and the core Prisma models.
2. Gate 1: implement private moment create/edit/delete screens and server actions.
3. Gate 1: enforce public access through safe summaries only.

## Blockers

- None for Gate 0.
- A real Postgres instance will be needed for Gate 1 persistence verification.

## Decisions Made

- Use Next.js App Router, TypeScript, Tailwind, Prisma, Postgres, zod, Vitest, and ESLint.
- Keep the Prisma schema domain-empty in Gate 0 to avoid implementing Gate 1 early.
- Keep external integrations behind adapters and feature flags.

## What Done Means

- [x] Gate 0 scaffold builds and boots.
- [x] Required docs exist and reflect the current gate.
- [x] Verification commands pass.
- [ ] Gate 1 auth, DB models, moment CRUD, and privacy enforcement.
- [ ] Gate 2 MusicSpec generation and validation.
- [ ] Gate 3 async audio generation and playback.
- [ ] Gate 4 feed, share page, and story card.
- [ ] Gate 5 hardening, deploy runbook, smoke tests, delete flows, monitoring hooks.
