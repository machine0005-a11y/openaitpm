# Machine One — ideamuses.com Pipeline

Machine One turns valid inbound idea texts sent to `+1 949-508-9229` into reachable prototype pages at `https://www.ideamuses.com/<slug>`. Guests receive exactly two fixed-shape replies: an immediate "I'm building" ack, then one plain-text URL — sent only after the page is verified live.

John Lou is the human, owner, source of truth, and final authority.

## Active Loop

```text
SMS reader → parser/valid-idea gate → Machine One orchestrator
→ internal role-based C-suite council → page generator
→ dynamic production route → exact-page reachability check
→ instant build-ack iMessage … → URL iMessage once verified live
```

## Active Components

- `reader.sh`: reads recent Messages data from a Terminal process with Full Disk Access.
- `run.sh`: supervisor that keeps the reader and orchestrator alive.
- `src/agent.mjs`: daemon entrypoint.
- `src/lib/messages.mjs`: inbox parsing and valid-idea gate.
- `src/lib/agent.mjs`: orchestration, safe retry, failure alerting, and ack-then-URL delivery.
- `src/lib/council.mjs`: loads the internal role-based council.
- `agents/*.md`: role definitions for the internal council.
- `src/lib/generate.mjs`: council-reviewed page-content generation with deterministic fallback.
- `src/lib/visual.mjs`: optional GPT Image hero generation with a durable local asset and graceful fallback.
- `src/lib/publish.mjs`: writes the local idea record and verifies the exact public dynamic route.
- `src/lib/sms.mjs`: fixed-shape guest replies (build ack + URL only) and concise owner alerts.
- `src/lib/records.mjs`: structured private run records.
- `skills/idea-page/SKILL.md`: page quality, safety, and publishing contract.

## Council

The internal council uses role-based agents only:

- Product Decider
- Design Reviewer
- Systems Architect
- Growth Marketer
- Finance Reviewer
- Legal/Risk Reviewer
- Skeptic Reviewer
- TPM Integrator
- Page Generator

The council separates facts from assumptions, keeps debate private, avoids invented claims, and blocks or safely transforms unsafe concepts.

## Communication Contract

- Texters receive exactly one generated URL and nothing else.
- Invalid/non-idea messages receive no reply.
- Failed runs receive no texter reply.
- Safe failures retry once, then alert John with the exact failing component.
- A URL is not sent until the exact generated page content is reachable.

## Generated Hero Visuals

Every idea page has a rich built-in visual composition. When `OPENAI_API_KEY`
is set, the pipeline also uses `gpt-image-2` to generate a unique hero image,
writes it to `public/ideas/<slug>/hero.webp`, and ships it with the page before
the reachability check.

Optional overrides are `OPENAI_IMAGE_MODEL` and `OPENAI_IMAGE_QUALITY`.

## Observability

- Supervisor log: `/tmp/openaitpm-supervisor.log`
- Reader log: `/tmp/openaitpm-reader.log`
- Orchestrator log: `/tmp/openaitpm-agent.log`
- Structured run history: `/tmp/ideamuses-runs.jsonl`
- Cursor/state: `/tmp/openaitpm-agent-state.json`

## Hard Boundaries

- No autonomous money movement. Machine One may design monetization, pricing, invoices, checkout, Stripe, billing, and revenue workflows, but John must manually perform every real financial action outside Machine One.
- No financial credentials, financial account creation, billing execution, or ownership changes.
- No destructive commands without John’s approval.
- No public-figure personas or imitation.
- No private-data leakage or cross-texter data mixing.
- No conversational, status, apology, or debug replies to texters.

## Deprecated Context

Old OpenAITPM, alternate-domain, Twilio/Railway, tunnel, paywall, and conversational-reply guides are historical references only. They do not define the active Machine One pipeline.
