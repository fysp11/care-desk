# Care Desk

Care Desk is a compact Patients Management case-challenge implementation. It
prioritizes the reviewable vertical slice: backend trust boundaries, patient
CRUD/list behavior, role-aware UI, reliability states, focused tests, and
documented cuts.

See also:

- [Delivery boundary](DELIVERY_BOUNDARY.md)
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
| Reliability | Recoverable list/detail/form failures, optimistic create/edit/delete behavior, and rollback for failed mutations.              |

## Prerequisites

- Node.js 20.19+

The repository is configured for npm workspaces and can be invoked through npm, pnpm, or bun script runners.

## Setup

```bash
npm install
npm run up
```

After dependencies are installed, `npm run up` starts PostgreSQL, applies
migrations, generates the Prisma client, seeds fictional demo data, and starts
the API and web app through Docker Compose.

Stop local services with:

```bash
npm run down
npm run restart
```

## Run Locally

Start the local development stack:

```bash
npm run dev
```

This runs the same bootstrap as `npm run up`, then follows API and web logs.

Service URLs:

- `http://localhost:3001`
- `http://127.0.0.1:3000`
- `http://localhost:3000`

Useful root commands:

```bash
npm run migrate
npm run seed
npm run start
```

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
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

`npm run test`, `npm run test:e2e`, and `npm run up` require Docker Compose and
a reachable local PostgreSQL container. If stale Compose containers point at an
old worktree, recreate them with `npm run down` and `npm run up` before rerunning
browser checks.

## Verification Evidence

| Evidence              | Result                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Workspace tests       | `npm run test` passes: shared scaffold, API integration/unit tests, and web unit tests.          |
| API focused tests     | 53 API tests pass across auth/RBAC, DTO, decorator style, module DI, repository, service, validation, and DB-backed patient API behavior. |
| Typecheck             | `npm run typecheck` passes after Prisma client generation.                                      |
| Web focused tests     | Web unit tests pass, including API client, workflow, schema, session, and reliability.           |
| Browser e2e           | `npm run test:e2e` passes 9 Playwright tests for admin/user workflows.                          |
| Production build      | `npm run build` passes for shared, API, and web.                                                 |

## Known Cuts

| Cut                               | Current decision                                                                                  | Next hardening step                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| PostgreSQL/Prisma                 | In active hardening (Wave 7): patient persistence now uses PostgreSQL + Prisma 7.                 | Keep contract-level assertions stable while verifying migration, seed/reset, and compose DB health. |
| Production secrets/env management | Not included.                                                                                     | Add secret management, rotation, and deployment-specific configuration.                             |
| Cloud hosting                     | Not included.                                                                                     | Deploy only after local build/test proof is refreshed.                                              |
| Docker Compose                    | API + web services are now included in `docker-compose.yml` alongside PostgreSQL. | Keep host/in-container endpoint alignment and health checks aligned as compose hardening continues. |
| Broad browser/device matrix       | Not included.                                                                                     | Keep the focused Playwright admin/user smoke suite; add responsive/device matrix only if requested. |
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
