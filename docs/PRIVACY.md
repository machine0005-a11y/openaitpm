# Privacy

## Invariants

- Raw journal text is private by default.
- Public content must be safe summary only.
- Privacy is enforced server-side.
- UI hiding is never the only enforcement layer.
- Logs must not include auth tokens or raw journal text.

## Gate 0 Status

- No raw journal text is collected.
- No auth tokens are collected.
- No public share routes exist.

## Gate 1 Rules To Implement

- `private`: only the owner can read the moment and raw fields.
- `friends`: owner and approved audience can read safe summary; raw journal text remains owner-only unless explicitly designed otherwise.
- `public`: public endpoints return safe summary, public metadata, and public audio references only.
- Moment delete removes DB records and associated local assets where implemented.

## Data Minimization

- Keep moment inputs scoped to top goals, moods, activity, place type, time bucket, and optional private journal text.
- Persist MusicSpec separately from raw text.
- Public share cards use safe summary and share URL only.
