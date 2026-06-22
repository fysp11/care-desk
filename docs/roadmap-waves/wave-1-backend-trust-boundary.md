# Wave 1: Backend Trust Boundary

## Decision

Wave 1 implements the first real backend security slice: seeded demo users,
password hashing, JWT login, token expiry, authentication guard, role guard,
and a protected probe route that proves `401` and `403` behavior before patient
CRUD exists.

Patient persistence and patient CRUD stay in Wave 2. The point of this wave is
to make the backend trust boundary real and testable before building data
workflows on top of it.

## Source Alignment

| Source | Applied here |
|---|---|
| `docs/roadmap.md` | Phase 1: seeded users, bcrypt password checks, JWT login, auth guard, role guard. |
| `.agents/workflows/patient-management-case.md` | Backend first; prove auth/RBAC before UI or patient mutation work. |
| `.agents/checklists/implementation-gates.md` | Auth/RBAC gate is the primary exit gate for this wave. |
| `.agents/rules/latest-library-implementation.md` | Use researched versions and avoid stale Nest/JWT/bcrypt examples. |
| `.agents/agents/backend.md` | Backend role owns auth, RBAC, guards, DTOs, and tests. |

## Requirement Files Read

| Requirement | Version target | Wave 1 relevance |
|---|---:|---|
| `docs/requirements/nestjs.md` | `@nestjs/core@11.1.27` | Nest 11, Express 5 behavior, guard/middleware order. |
| `docs/requirements/typescript.md` | `typescript@6.0.3` | Explicit configs and strict DTO/service types. |
| `docs/requirements/jwt-auth.md` | `@nestjs/jwt@11.0.2`, `jsonwebtoken@9.0.3` | JWT login, expiry, algorithm pinning, `401` behavior. |
| `docs/requirements/bcrypt.md` | `bcrypt@6.0.0` | Seeded password hashing and login comparison. |
| `docs/requirements/class-validator.md` | `class-validator@0.15.1` | Login DTO validation and predictable `400` behavior. |

## Scope

### Included

- `POST /auth/login`.
- Seeded in-memory demo users with bcrypt password hashes.
- JWT payload containing `sub`, `email`, and `role`.
- Explicit JWT algorithm and expiry.
- Auth guard that returns `401` for missing, invalid, or expired tokens.
- Role guard that returns `403` for authenticated users without the required
  role.
- Protected auth probe route for tests.
- Integration tests proving admin success, user `403`, missing token `401`,
  malformed token `401`, forged token `401`, expired token `401`, and invalid
  login validation.

### Deferred

- Patient model and patient CRUD.
- PostgreSQL and Prisma persistence.
- Refresh tokens, password reset, signup, external identity providers.
- Frontend login UI.
- Real credentials or production secret management.

## Proposed Backend Shape

```text
apps/api/src/
  app.module.ts
  auth/
    auth.controller.ts
    auth.module.ts
    auth.service.ts
    current-user.decorator.ts
    demo-users.ts
    jwt-auth.guard.ts
    login.dto.ts
    roles.decorator.ts
    roles.guard.ts
    types.ts
  common/
    validation.ts
```

The seeded user store should remain intentionally small and replaceable by
Wave 2 persistence work.

## API Contract

### `POST /auth/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "demo-password"
}
```

Response:

```json
{
  "token": "<jwt>",
  "user": {
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

Expected failures:

| Case | Status |
|---|---:|
| Invalid body | `400` |
| Wrong credentials | `401` |
| Missing token on protected route | `401` |
| Expired/invalid token on protected route | `401` |
| Authenticated user missing required role | `403` |

## Demo Credentials

Use non-secret demo credentials and keep them out of `.env*` files:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `admin-password` |
| User | `user@example.com` | `user-password` |

These are public test fixtures only, not real credentials.

## Work Items

| Status | Task | Owner artifact | Notes |
|---|---|---|---|
| Done | Add auth dependencies. | `.agents/agents/backend.md` | Pinned `@nestjs/jwt@11.0.2`, `jsonwebtoken@9.0.3`, `bcrypt@6.0.0`, `class-validator@0.15.1`, and supporting packages. |
| Done | Add validation pipe setup. | `.agents/agents/backend.md` | Invalid login body returns `400` with `VALIDATION_ERROR`. |
| Done | Add seeded demo users. | `.agents/agents/backend.md` | bcrypt hashes are used for public demo users. |
| Done | Add login DTO/controller/service. | `.agents/agents/backend.md` | Returns token and role only; no signup. |
| Done | Add JWT auth guard. | `.agents/agents/backend.md` | HS256 algorithm and 15-minute expiry are explicit. |
| Done | Add role decorator/guard. | `.agents/agents/backend.md` | Authenticated `user` receives `403` on admin probe. |
| Done | Add protected probe endpoint. | `.agents/agents/backend.md` | `/auth/probe/me` and `/auth/probe/admin` prove auth/RBAC before patient routes. |
| Done | Add integration tests. | `.agents/agents/backend.md` | Covers `200`, `400`, `401`, `403`, expiry, malformed tokens, and wrong-secret forged tokens. |
| Done | Run verification. | Main thread + verifier subagent | Local `bun run typecheck`, `bun test`, and unsandboxed `bun run build` passed before verifier dispatch. |

## Subagent Loop

Wave 1 must use:

1. One implementation subagent scoped to backend auth/RBAC files.
2. One verification subagent after implementation, scoped to changed files,
   auth/RBAC gates, and command evidence.

The main thread coordinates, integrates results, and reruns repo checks.

## Verification Plan

Before Wave 1 is complete:

- [x] `POST /auth/login` succeeds for seeded admin credentials.
- [x] `POST /auth/login` succeeds for seeded user credentials.
- [x] Invalid login body returns `400`.
- [x] Wrong credentials return `401`.
- [x] Missing token on protected route returns `401`.
- [x] Malformed token on protected route returns `401`.
- [x] Wrong-secret forged token on protected route returns `401`.
- [x] Expired token on protected route returns `401`.
- [x] Authenticated `user` on admin-only protected route returns `403`.
- [x] Authenticated `admin` on admin-only protected route succeeds.
- [x] JWT algorithm and expiry are explicit.
- [x] Password hashes are used for seeded users.
- [x] `bun run typecheck` passes.
- [x] `bun test` passes.
- [x] `bun run build` passes when run outside the sandbox; Next/Turbopack
  still needs unsandboxed process/port-binding permissions in this environment.
- [x] No real credentials, real patient data, `.env*` contents, or production
  mutations are introduced.

## Exit Criteria

Wave 1 is complete when the backend can prove auth and role enforcement without
patient routes. Wave 2 can then build patient CRUD on top of the same guards
instead of inventing authorization during data-access work.

## Intentional Non-Goals

- No patient CRUD.
- No database persistence.
- No frontend login page.
- No refresh token or production identity workflow.
