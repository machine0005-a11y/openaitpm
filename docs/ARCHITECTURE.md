# Architecture

## Boundaries

- `src/app`: Next.js App Router pages and route handlers.
- `src/lib/db`: Prisma client and database boundary.
- `src/lib/foundation`: Gate 0 product constants used by the shell and tests.
- `prisma`: Prisma schema and migrations.
- `docs`: Operating-system docs updated each gate.
- `test`: Vitest checks for repo invariants and unit behavior.

## Current Gate 0 Flow

```mermaid
flowchart LR
  Browser["Browser"] --> App["Next.js App Router"]
  App --> Health["/api/health"]
  App --> Docs["Repo OS docs"]
  Prisma["Prisma Client"] --> Postgres["Postgres via DATABASE_URL"]
```

## Target Core Flow By Gate E

```mermaid
flowchart TD
  User["User"] --> Auth["Auth"]
  Auth --> Moment["Person-Moment CRUD"]
  Moment --> Privacy["Server privacy enforcement"]
  Moment --> Planner["LLM MusicSpec planner"]
  Planner --> Schema["zod schema validation"]
  Schema --> Queue["Async audio job"]
  Queue --> Provider["MusicGenProvider adapter"]
  Provider --> Audio["Playable audio asset"]
  Moment --> Feed["Moment feed"]
  Moment --> Share["Public share page"]
  Share --> Card["1080x1920 story card"]
```

## Data Flow Rules

- Raw journal text is stored only on private user-owned moment records.
- Public surfaces read from safe summaries, not raw moment input.
- Music generation receives MusicSpec JSON, not raw private journal text.
- Audio provider implementations sit behind an adapter.
