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

| Area        | Status                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Auth        | JWT login for seeded demo users, bcrypt-hashed seeded passwords, token expiry handling, logout.                                 |
| RBAC        | Backend guards enforce `401` and `403`; frontend role gating is UX only.                                                        |
| Patient API | Protected list, details, create, update, and delete endpoints with search, sort, pagination, validation, and normalized errors. |
| Frontend    | Next.js patient workflow with login, table, details, admin create/edit/delete, user view-only mode, loading/empty/error states. |
| Validation  | Server DTO validation plus Zod 4 and React Hook Form validation for patient forms.                                              |
| Reliability | Local opt-in latency/failure simulation, recoverable list/detail/form failures, optimistic delete rollback.                     |

## Prerequisites

- Bun 1.3+
- Node.js 20.19+

The repository is configured for Bun workspaces.

## Setup

```bash
bun install
```

For Wave 7 DB-backed persistence verification:

```bash
cp .env.example .env
source .env
bun run compose:up
bun run db:migrate:deploy
bun run db:generate
bun run db:seed
```

Run everything (PostgreSQL + API + web) from compose:

```bash
bun run compose:up
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

| Role  | Email               | Password         |
| ----- | ------------------- | ---------------- |
| Admin | `admin@example.com` | `admin-password` |
| User  | `user@example.com`  | `user-password`  |

## Checks

Run the normal verification commands from the repo root:

```bash
bun run check:quality
bun test
bun run typecheck
bun run mutation
bun run build
```

Run the mutation gate directly when working on the scoped web validation and
workflow tests, DB-free API controller metadata, DTO validation, module DI,
repository, patient service, or validation-pipe slices:

```bash
bun run mutation:dry-run
bun run mutation
bun run mutation:api:controller:dry-run
bun run mutation:api:controller
bun run mutation:api:dto:dry-run
bun run mutation:api:dto
bun run mutation:api:module-di:dry-run
bun run mutation:api:module-di
bun run mutation:api:repository:dry-run
bun run mutation:api:repository
bun run mutation:api:service:dry-run
bun run mutation:api:service
bun run mutation:api:validation:dry-run
bun run mutation:api:validation
```

The StrykerJS gates mutate tested web workflow/schema logic in `apps/web/lib/`,
DB-free API controller metadata, DTO validation, patient module DI, repository
query determinism, patient service logic, validation-pipe error shaping, and the
PostgreSQL-backed API path. Each mutation gate requires a mutation score of at
least 90%. Use `bun run mutation:api:controller`, `bun run mutation:api:dto`,
`bun run mutation:api:module-di`, `bun run mutation:api:repository`, `bun run
mutation:api:service`, or `bun run mutation:api:validation` for fast local API
validation before running the Docker-backed API mutation gate.

`bun run check:quality`, `bun run mutation`, and `bun run mutation:dry-run`
include the PostgreSQL-backed API mutation gate through `db:prepare`, so they
require Docker Compose and a reachable local PostgreSQL container.

`bun run build` may require running outside this sandboxed agent environment.
After Wave 4, the web build is blocked in the sandbox because Turbopack tries
to create a process and bind a port while processing `apps/web/app/globals.css`;
the OS returns `Operation not permitted`. Rerun the build outside the sandbox
before submission.

## Verification Evidence

| Evidence              | Result                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| API focused tests     | DB-free DTO, module DI, repository, and service tests pass locally.                              |
| API typecheck         | Passes locally through `bun run typecheck` after Prisma client generation.                       |
| Web focused tests     | Web unit tests pass locally, including API client, workflow, schema, session, and reliability.   |
| Web typecheck         | Passes locally through `bun run typecheck`.                                                      |
| Focused mutation      | Web, API controller, DTO, module DI, repository, and service gates pass locally at or above 90%. |
| DB-backed API gate    | Requires Docker Compose and local PostgreSQL through `db:prepare`; rerun where Docker is usable. |
| Web build             | Not run in this environment; rerun outside sandbox as needed.                                    |
| Mutation report paths | StrykerJS writes per-gate local reports under `reports/mutation*/`.                              |

## Known Cuts

| Cut                               | Current decision                                                                                  | Next hardening step                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| PostgreSQL/Prisma                 | In active hardening (Wave 7): patient persistence now uses PostgreSQL + Prisma 7.                 | Keep contract-level assertions stable while verifying migration, seed/reset, and compose DB health. |
| Production secrets/env management | Not included.                                                                                     | Add secret management, rotation, and deployment-specific configuration.                             |
| Cloud hosting                     | Not included.                                                                                     | Deploy only after local build/test proof is refreshed.                                              |
| Docker Compose                    | API + web services are now included in `docker-compose.yml` alongside PostgreSQL. | Keep host/in-container endpoint alignment and health checks aligned as compose hardening continues. |
| Browser E2E matrix                | Not included.                                                                                     | Add Playwright coverage for admin/user workflows and responsive breakpoints.                        |
| Audit log and soft delete         | Not included.                                                                                     | Add append-only patient events and archive semantics before clinical use.                           |
| Refresh tokens/password reset     | Not included.                                                                                     | Add a production identity lifecycle if auth scope expands.                                          |
| Multi-tenancy                     | Not included.                                                                                     | Add organization scoping before any multi-customer data model.                                      |

## Interview Defense Notes

- The backend is the trust boundary. Frontend role gating improves UX, but
  patient mutations still depend on server-side guards.
- The timebox favored verified auth, RBAC, validation, patient CRUD, and
  failure recovery over optional infrastructure.
- PostgreSQL/Prisma is the active Wave 7 hardening path. Repo tests are written to
  run against deterministic DB reset behavior and Prisma-backed persistence.
- Demo credentials and demo patients are fixtures only; no real patient data or
  production secrets are part of the delivery.
- AI assistance is treated as implementation acceleration, not ownership
  transfer: the defense is based on code paths, tests, and documented tradeoffs.
