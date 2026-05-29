# Decisions

## ADR-0001: Gate-Based Delivery

Decision: Implement the product only through the requested stop-point gates.

Options:

- Build all core flows immediately.
- Ship a verifiable foundation first, then proceed gate by gate.

Rationale:

- The user requested hard stop points.
- Gate 0 should establish a green repo without drifting into auth or music generation.

## ADR-0002: Prisma Schema Starts Domain-Empty

Decision: Keep the Gate 0 Prisma schema connected to Postgres but without app domain models.

Options:

- Add future models early.
- Keep Gate 0 to infrastructure only.

Rationale:

- Gate 1 explicitly owns `User`, `Moment`, `MomentSummary`, `AudioAsset`, and `Event`.
- Avoids partially implemented models with unclear privacy semantics.

## ADR-0003: External Systems Behind Flags and Adapters

Decision: Treat Instagram, music provider APIs, and music library integrations as optional modules.

Options:

- Depend on external approvals and provider readiness.
- Ship adapters and stubs while documenting production paths.

Rationale:

- The core loop must not block on app review or uncertain third-party write access.
