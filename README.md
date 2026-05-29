# OpenAITPM Idea Launchpad

OpenAITPM is being set up as a GitHub-to-domain idea launcher: checked-in ideas become pages at `openAITpm.com/<idea-name>`.

This repo still keeps the original Gate 0 foundation docs and tests, but the first live product surface is now the dynamic idea route in `src/app/[ideaName]/page.tsx` backed by checked-in idea files.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma 7 with Postgres
- zod
- Vitest
- ESLint

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables:

```bash
cp .env.example .env
```

3. Optional: start Postgres and set `DATABASE_URL` in `.env`.

4. Generate Prisma Client:

```bash
npm run prisma:generate
```

5. Start the app:

```bash
npm run dev -- --port 3001
```

Open `http://localhost:3001`.

The Gate 0 app does not require a running database to build or boot. Database-backed product flows begin in Gate 1.

## OpenAITPM Routes

Known idea pages live in `src/content/ideas/*.json`.

Try:

- `http://localhost:3001/enterprise-leadership-context-os`
- `http://localhost:3001/aitpm-family-project-room`
- `http://localhost:3001/person-moment-music`
- `http://localhost:3001/new-customer-demo-room`

Unknown slugs render a generated starter page, so every `/<idea-name>` path can exist before custom copy is added.

Create a new checked-in idea file:

```bash
npm run idea:new -- "Investor Update Room"
```

That creates `src/content/ideas/investor-update-room.json`, which renders at `/investor-update-room`.

Create the branch, idea file, and commit in one move:

```bash
npm run idea:ship -- "Investor Update Room"
```

After `origin` is connected, use `npm run idea:ship -- --push "Investor Update Room"` to push the branch and trigger the automatic PR/build workflow.

## GitHub to Domain Flow

The workflow in `.github/workflows/idea-pr.yml` runs on pushed non-main branches, opens or updates a pull request into `main`, and then verifies the app with `npm run verify`.

When the GitHub repository is connected to Vercel, PRs get preview builds and merged changes publish to `openAITpm.com/<idea-name>`.

See `docs/OPENAITPM_DEPLOYMENT.md` for the deployment runbook.

Connect the local repo to the real GitHub repository once that repository exists:

```bash
npm run github:connect -- git@github.com:<owner>/<repo>.git
git push -u origin main
```

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Or run the full gate check:

```bash
npm run verify
```

Audit launch readiness for the GitHub-to-domain loop:

```bash
npm run launch:audit
```

## Prisma

The schema is domain-empty in Gate 0 by design. Gate 1 introduces `User`, `Moment`, `MomentSummary`, `AudioAsset`, and `Event`.

Useful commands:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Repo OS

The project operating docs live in `docs/`:

- `PLAN.md`
- `STATE.md`
- `TODO.md`
- `DECISIONS.md`
- `ARCHITECTURE.md`
- `PRIVACY.md`
- `INTEGRATIONS.md`
- `DEMO.md`
- `ECONOMICS.md`
- `OPENAITPM_DEPLOYMENT.md`
