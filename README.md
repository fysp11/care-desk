# Care Desk

Care Desk is a compact Patients Management case-challenge implementation. It
prioritizes the reviewable vertical slice: backend trust boundaries, patient
CRUD/list behavior, role-aware UI, reliability states, focused tests, and
documented cuts.

See also:

- [Challenge resolution](docs/challenge-resolution.md)
- [Roadmap](docs/roadmap.md)
- [Wave 5 delivery defense](docs/roadmap-waves/wave-5-delivery-defense.md)

## What Shipped

| Area | Status |
|---|---|
| Auth | JWT login for seeded demo users, bcrypt-hashed seeded passwords, token expiry handling, logout. |
| RBAC | Backend guards enforce `401` and `403`; frontend role gating is UX only. |
| Patient API | Protected list, details, create, update, and delete endpoints with search, sort, pagination, validation, and normalized errors. |
| Frontend | Next.js patient workflow with login, table, details, admin create/edit/delete, user view-only mode, loading/empty/error states. |
| Validation | Server DTO validation plus Zod 4 and React Hook Form validation for patient forms. |
| Reliability | Local opt-in latency/failure simulation, recoverable list/detail/form failures, optimistic delete rollback. |

## Prerequisites

- Bun 1.3+
- Node.js 20.19+

The repository is configured for Bun workspaces.

## Setup

```bash
bun install
```

## Run Locally

Start the API:

```bash
bun run dev:api
```

The API listens on:

- `http://localhost:3001`

Start the web app in a second terminal:

```bash
bun run dev:web
```

Next dev serves the web app on:

- `http://127.0.0.1:3000`
- `http://localhost:3000`

## Demo Login Fixtures

These credentials are public local fixtures only. They are not production
credentials and are not read from secret files.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `admin-password` |
| User | `user@example.com` | `user-password` |

## Checks

Run the normal verification commands from the repo root:

```bash
bun test
bun run typecheck
bun run build
```

`bun run build` may require running outside this sandboxed agent environment.
After Wave 4, the web build is blocked in the sandbox because Turbopack tries
to create a process and bind a port while processing `apps/web/app/globals.css`;
the OS returns `Operation not permitted`. Rerun the build outside the sandbox
before submission.

## Verification Evidence

| Evidence | Result |
|---|---|
| API tests | Passed, 23 API tests. |
| API typecheck | Passed after the Wave 4 CORS/reliability work. |
| Web tests | Passed, 19 web tests. |
| Web typecheck | Passed. |
| Web build | Passed in Wave 3 with sandbox escalation. |
| Wave 4 build | Blocked in sandbox by Turbopack process/port permission; rerun outside sandbox before submission. |

## Known Cuts

| Cut | Current decision | Next hardening step |
|---|---|---|
| PostgreSQL/Prisma | Deferred behind the repository boundary; current patient data uses deterministic demo storage. | Replace the repository with PostgreSQL and Prisma 7, add migrations, indexes, seeds, and parity tests. |
| Production secrets/env management | Not included. | Add secret management, rotation, and deployment-specific configuration. |
| Cloud hosting | Not included. | Deploy only after local build/test proof is refreshed. |
| Docker | Not included. | Add minimal Compose for API/web/PostgreSQL if deployment or reviewer setup needs it. |
| Browser E2E matrix | Not included. | Add Playwright coverage for admin/user workflows and responsive breakpoints. |
| Audit log and soft delete | Not included. | Add append-only patient events and archive semantics before clinical use. |
| Refresh tokens/password reset | Not included. | Add a production identity lifecycle if auth scope expands. |
| Multi-tenancy | Not included. | Add organization scoping before any multi-customer data model. |

## Interview Defense Notes

- The backend is the trust boundary. Frontend role gating improves UX, but
  patient mutations still depend on server-side guards.
- The timebox favored verified auth, RBAC, validation, patient CRUD, and
  failure recovery over optional infrastructure.
- PostgreSQL/Prisma is the clearest next hardening step. The current repository
  boundary keeps that replacement isolated and testable.
- Demo credentials and demo patients are fixtures only; no real patient data or
  production secrets are part of the delivery.
- AI assistance is treated as implementation acceleration, not ownership
  transfer: the defense is based on code paths, tests, and documented tradeoffs.
