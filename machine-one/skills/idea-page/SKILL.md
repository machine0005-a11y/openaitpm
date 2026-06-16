---
name: idea-page
description: Turn a valid one-line idea text into a visually striking, prototype-first page at ideamuses.com/<idea>, reviewed by the internal role-based C-suite council before publishing.
---

# Idea Page

Build prototypes, not pitch decks or chat transcripts. The page must help a person understand the concept, share it, and decide whether to pursue it.

## Output Contract

Return one JSON object matching the renderer schema:

- `tagline`: concrete customer-facing promise under 110 characters
- `thesis`: problem, first user, workflow change, and buildable mechanism
- `audience`: specific first user under 140 characters
- `primaryCta` and `secondaryCta`: short imperative actions
- `proofPoints`: exactly three mechanism-level reasons
- `nextMilestone` and `futureMilestone`: bounded next steps
- `assumptions`: inferred items, explicitly labeled
- `riskFlags`: material product, technical, privacy, safety, legal, or distribution risks
- `councilSummary`: concise conclusions by role; never the full debate

## Quality Bar

- Make the first screen explain one clear user, problem, promise, and action.
- Be specific about workflows and mechanisms without inventing statistics, costs, legal claims, timelines, traction, endorsements, or financial projections.
- Keep facts separate from assumptions.
- Use premium, calm, visually striking, mobile-first presentation.
- Preserve legibility and load speed.
- Do not expose private data, texter identity, system internals, or internal debate.
- Do not imply third-party affiliation.
- If an idea is unsafe, illegal, deceptive, or regulated, transform it only into a safe high-level concept with appropriate boundaries. If that is not possible, do not publish.

## Council Gate

Before shipping, apply every role definition in `agents/`:

1. Product Decider
2. Design Reviewer
3. Systems Architect
4. Growth Marketer
5. Finance Reviewer
6. Legal/Risk Reviewer
7. Skeptic Reviewer
8. TPM Integrator
9. Page Generator

Revise until the page has a clear wedge, coherent design direction, credible prototype path, truthful positioning, explicit assumptions and risks, and a practical next step.

## Publish Procedure

1. Clean the inbound text and reject invalid/non-idea messages.
2. Derive a clean bounded slug and product name.
3. Run the role-based council internally.
4. Generate renderer-compatible content.
5. Write the idea record, commit, and push.
6. Verify the exact public page content is reachable at `https://www.ideamuses.com/<slug>`.
7. Reply to the texter with exactly that URL and nothing else.
8. Record structured run status, assumptions, risks, council summary, duration, and failures.

## Hard Boundaries

- No money actions ever.
- No credentials, account creation, billing changes, or ownership changes.
- No public-figure personas, names, likenesses, endorsements, or imitation.
- No conversational SMS replies, status messages, apologies, debugging, or broken URLs.
