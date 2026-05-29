# Integrations

## MusicGenProvider

Gate 3 will introduce:

- `MusicGenProvider` interface.
- `StubProvider` for deterministic real playable audio files.
- Production provider adapter behind `MUSICGEN_PROVIDER`.

Production path:

1. Confirm official provider API stability and terms.
2. Add provider credentials to environment variables.
3. Map validated MusicSpec fields to provider request format.
4. Store returned audio in the storage adapter.
5. Keep raw journal text out of provider requests.

## LLM Planner

Gate 2 will use a general-purpose model only to produce strict MusicSpec JSON.

Environment:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Fallback:

- If the LLM fails or returns invalid JSON, use activity-based defaults.

## Storage

Gate 3 starts with local storage:

- `STORAGE_DRIVER=local`
- `LOCAL_STORAGE_ROOT=./storage`

Production path:

- Use S3-compatible storage with `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY`.
- Use signed URLs where required by privacy rules.

## Optional External Surfaces

- Instagram SSO: optional behind `INSTAGRAM_SSO_ENABLED`.
- Spotify export/deep-link: optional behind `SPOTIFY_EXPORT_ENABLED`.
- Apple Music export/deep-link: optional behind `APPLE_MUSIC_EXPORT_ENABLED`.
- YouTube Music export/deep-link: optional behind `YOUTUBE_MUSIC_EXPORT_ENABLED`.
