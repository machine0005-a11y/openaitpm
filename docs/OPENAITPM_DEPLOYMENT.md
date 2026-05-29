# OpenAITPM Deployment Runbook

This repo is set up so an idea can become a public page at:

```txt
https://openAITpm.com/<idea-name>
```

## Local Page Contract

- Known idea pages live in `src/content/ideas/*.json`.
- Create one with `npm run idea:new -- "My Idea Name"`.
- The dynamic route is `src/app/[ideaName]/page.tsx`.
- Any unknown slug still renders a generated starter page, so a link can exist before custom copy is written.

## Branch to PR Flow

Use the one-command path for normal idea shipping:

```bash
npm run idea:ship -- --push "Investor Update Room"
```

That command creates `idea/investor-update-room`, writes `src/content/ideas/investor-update-room.json`, commits it, and pushes the branch. The push triggers `.github/workflows/idea-pr.yml`.

Manual equivalent:

1. Create an idea branch:

```bash
git checkout -b idea/enterprise-leadership-context-os
```

2. Add or edit the page data:

```bash
npm run idea:new -- "Enterprise Leadership Context OS"
```

3. Commit and push the branch.
4. `.github/workflows/idea-pr.yml` opens or updates a pull request into `main`.
5. The same workflow runs `npm run verify`, so the PR records whether lint, typecheck, tests, and build pass.
6. Vercel creates a preview deployment for the PR when the GitHub repo is connected.
7. After merge, production serves the route from `openAITpm.com/<idea-name>`.

## First-Time GitHub Remote Setup

This local folder currently needs a GitHub remote before the PR loop can run. After creating the correct GitHub repository, connect it once:

```bash
npm run launch:bootstrap -- --push git@github.com:<owner>/<repo>.git
```

To connect the repo, push `main`, create the first idea branch, and trigger the first PR/build path:

```bash
npm run launch:bootstrap -- --push --idea "Investor Update Room" git@github.com:<owner>/<repo>.git
```

Then create idea branches from `main` and push them:

```bash
npm run idea:ship -- --push "Investor Update Room"
```

The branch push is the moment GitHub creates or refreshes the PR and runs the build.

## Launch Readiness Audit

Run this before declaring the publishing loop live:

```bash
npm run launch:audit
```

Use the strict version in release checks:

```bash
npm run launch:audit:strict
```

The audit verifies local repo readiness, idea content, helper scripts, dynamic routes, GitHub workflows, Vercel config, and deployment docs. It intentionally reports `NOT READY` until a real GitHub `origin` remote is configured.

Verify the public route contract directly:

```bash
npm run idea:verify:routes
```

The route verifier checks every `src/content/ideas/*.json` file and prints the public URL that will resolve under `openAITpm.com`.

Preview the PR body generated from checked-in idea routes:

```bash
npm run idea:pr-body -- --all --branch idea/investor-update-room
```

In GitHub Actions the workflow compares the branch against `origin/main` and lists the changed idea URLs in the pull request body.

## Vercel Setup

Create a Vercel project from this GitHub repository.

Use these settings:

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm ci`
- Production branch: `main`
- Pull request previews: enabled

## Domain Setup

In Vercel, add:

- `openAITpm.com`
- `www.openAITpm.com`

Point DNS to Vercel using the records Vercel provides. Vercel commonly asks for an apex `A` record and a `www` `CNAME`, but use the exact records shown in the Vercel domain screen.

## What Still Needs Owner Access

These steps require account-level credentials and cannot be completed purely from the local repo:

- Create or choose the GitHub repository.
- Add this folder as that repository's `origin` remote and push `main`.
- Connect the repository to Vercel.
- Add the `openAITpm.com` domain to Vercel.
- Update DNS at the domain registrar.

## Smoke Test

After Vercel is connected, verify:

```txt
https://openAITpm.com/enterprise-leadership-context-os
https://openAITpm.com/aitpm-family-project-room
https://openAITpm.com/person-moment-music
```

Each route should render the idea page, and each pull request should show a successful build check plus a Vercel preview.
