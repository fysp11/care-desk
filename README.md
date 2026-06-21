# Care Desk

A minimal Bun + TypeScript starter for a care desk service.

## Case Challenge Context

This project is for the Aster Pulse patient-management case challenge. The
strongest framing is a small production-shaped vertical slice: backend
authorization, validation, and failure behavior should be real, while UI polish
is useful but intentionally bounded.

Resolution doc: [docs/challenge-resolution.md](docs/challenge-resolution.md)

### Delivery Thesis

- Lead with the secure vertical slice.
- Treat the backend as the trust boundary; UI gating is only a usability layer.
- Use contract-first checks for risky behavior such as auth, validation, and
  state transitions.
- Name explicit cuts and the next hardening step for each one.
- Use AI-assisted development only when backed by external checks and manual
  ownership of the result.

### Defense Points To Prepare

| Area | Position |
|---|---|
| RBAC | Server-side authorization is authoritative; `401` and `403` behavior should be clear. |
| Validation | Client validation is for fast feedback; server validation is authoritative. |
| Persistence | Prefer real constraints and seeded users over purely in-memory behavior when time allows. |
| Concurrency | Last-write-wins is acceptable for a timebox if documented; optimistic concurrency is the next step. |
| Delete semantics | Demo delete can satisfy the prompt, but real clinical workflows likely need archive, retention, and audit behavior. |
| Scope control | Stop feature work early enough to verify, document tradeoffs, and explain what was intentionally left out. |

## Requirements

- Bun 1.3+

## Scripts

- `bun run dev` starts the service in watch mode.
- `bun run start` starts the service once.
- `bun test` runs the test suite.
- `bun run typecheck` checks TypeScript types.

## API

- `GET /` returns service metadata.
- `GET /health` returns health status.
- `GET /tickets` returns starter care desk tickets.
