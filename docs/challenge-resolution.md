# Patients Management Case Resolution

## Decision

Build a compact full-stack patient-management slice that proves the risky
parts first: authentication, server-side RBAC, patient validation, paginated
data access, usable admin workflows, and clear failure behavior.

This is intentionally not a broad product build. The 3-4 hour answer should
show senior judgment by shipping the trust boundary and documenting the cuts.

## Scope

| Area | Included | Deferred |
|---|---|---|
| Auth | Mock JWT login, expiry, hashed seeded users, logout, protected routes | Signup, password reset, refresh tokens, external identity provider |
| RBAC | `admin` can mutate patients; `user` can view only; backend guards enforce access | Fine-grained permissions, multi-tenant policy |
| Patients | List, search, sort, pagination, details, create, edit, delete | Bulk actions, imports, advanced filters |
| UI | Responsive admin console with loading, empty, error, and role-gated action states | Dark mode, advanced animations, brand-heavy polish |
| Reliability | DTO validation, normalized API errors, optimistic edit/delete rollback, simulated latency/failure | Full observability stack, retry orchestration, rate limiting |
| Tests | API integration tests for auth/RBAC/validation plus focused UI smoke tests | Broad mutation testing, exhaustive browser matrix |

## Architecture

```text
apps/web
  Next.js + TypeScript
  login, protected layout, patients table, patient form, details view

apps/api
  NestJS + TypeScript
  auth module, patients module, guards, DTOs, services, repository boundary

packages/shared
  shared patient and API contract types when useful

current shipped persistence
  PostgreSQL-backed Prisma 7 patient repository with fictional fixtures

next persistence hardening
  PostgreSQL + Prisma 7 schema, migrations, indexes, and seed flow
```

The backend is the source of truth. The frontend may hide admin-only actions,
but every mutation must still pass server-side authorization.

Wave 2 shipped the patient API contract behind a repository boundary. Wave 7
adds PostgreSQL-backed Prisma 7 persistence with explicit schema, migration, and
seed behavior while preserving the same API contract semantics.

## Data Model

This is the logical domain model used by the API contract. The shipped slice
represents it through the patient repository boundary; database constraints and
migrations belong to the PostgreSQL/Prisma hardening step.

### `users`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID/string | Primary key |
| `email` | string | Unique login identifier |
| `passwordHash` | string | Seeded demo users only |
| `role` | `admin` or `user` | Included in JWT claims and checked server-side |
| `createdAt` | datetime | Audit-oriented metadata |
| `updatedAt` | datetime | Enables future concurrency checks |

### `patients`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID/string | Surrogate clinical identifier |
| `firstName` | string | Required |
| `lastName` | string | Required, sortable/searchable |
| `email` | string | Demo uniqueness if required; not a clinical identifier |
| `phoneNumber` | string | Validated display/contact field |
| `dob` | date | Required, sortable |
| `createdAt` | datetime | Basic traceability |
| `updatedAt` | datetime | Future optimistic concurrency hook |

## API Contract

Use the assignment contract, with predictable query and error behavior.

| Method | Path | Role | Behavior |
|---|---|---|---|
| `POST` | `/auth/login` | Any | Return `{ token, user: { email, role } }` for seeded users |
| `GET` | `/patients` | Admin/User | Return `{ data, page, limit, total }` with search/sort/pagination |
| `GET` | `/patients/:id` | Admin/User | Return one patient or `404` |
| `POST` | `/patients` | Admin | Validate body, create patient, return `201` |
| `PUT` | `/patients/:id` | Admin | Validate body, update patient, return patient |
| `DELETE` | `/patients/:id` | Admin | Delete for demo prompt compatibility, return `{ ok: true }` |

Query parameters for `GET /patients`:

| Param | Default | Notes |
|---|---:|---|
| `page` | `1` | Positive integer |
| `limit` | `10` | Clamp to a safe maximum |
| `search` | empty | Match first name, last name, email, or phone |
| `sortBy` | `lastName` | Allowlisted fields only |
| `sortDir` | `asc` | `asc` or `desc` |

Error shape:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed.",
  "details": {}
}
```

Keep standard status semantics:

| Status | Use |
|---:|---|
| `400` | Invalid input or query params |
| `401` | Missing, invalid, or expired token |
| `403` | Authenticated user lacks required role |
| `404` | Patient not found |
| `409` | Demo uniqueness conflict if email uniqueness is enforced |
| `500` | Unexpected server error |

## Frontend UX

Primary screens:

1. Login page with validation, auth error state, and expiry handling.
2. Patients table with search, sort, pagination, skeleton loading, empty state,
   and error retry.
3. Patient create/edit form with client validation and optimistic update.
4. Patient details view as a modal or page.
5. View-only user experience where mutation controls are hidden or disabled
   with clear affordance.

Design posture:

- Quiet clinical admin console, not a marketing page.
- Clear hierarchy, legible tables, restrained motion, visible focus states.
- Responsive table behavior: horizontal overflow or stacked rows on small
  screens.
- Semantic colors for success, warning, error, and neutral states.

## Test Strategy

Prioritize tests that defend the trust boundary.

| Test | Why |
|---|---|
| Admin login then `POST /patients` succeeds | Proves the happy-path tracer |
| User login then `POST /patients` returns `403` | Proves backend RBAC |
| Missing/expired token returns `401` | Proves auth boundary |
| Invalid patient body returns `400` with details | Proves server validation |
| `GET /patients` supports pagination/search/sort | Proves contract used by UI |
| UI hides admin actions for `user` role | Proves role-aware UX, not security |
| Optimistic edit/delete rolls back on simulated failure | Proves failure UX |

## Implementation Order

1. Scaffold the monorepo or app folders for Next.js and NestJS.
2. Add seeded `admin` and `user` accounts with hashed demo passwords.
3. Build `POST /auth/login`, token expiry, auth guard, and role guard.
4. Add the patient contract, DTO validation, repository boundary, deterministic
   demo repository, and service methods.
5. Build patient API endpoints and integration tests for RBAC and validation.
6. Build login, protected routes, patients table, form, details view, and
   role-gated actions.
7. Add simulated latency/failure behind a dev-only flag and wire rollback
   behavior.
8. Reserve the final pass for checks, README instructions, and cut
   documentation.

### Next Persistence Hardening

Replace the deterministic demo repository with PostgreSQL and Prisma 7 after
the verified slice:

- Add `prisma.config.ts`, generated client output, and a Prisma 7 driver
  adapter.
- Add schema and migrations for users and patients, including patient email
  uniqueness and sortable indexes for `lastName` and `dob`.
- Add seed data using only fictional demo users and patients.
- Reuse the existing API integration suite as repository parity coverage.

## Defensible Cuts

| Cut | Reason | Next Step |
|---|---|---|
| Cloud hosting | Local reproducibility and test evidence are higher signal in the timebox | Deploy after setup and tests are stable |
| Full audit log | Changes schema, UI, retention, and compliance assumptions | Add append-only patient events before real clinical use |
| Multi-tenancy | Tenant scope affects every query and guard | Add organization model and tenant-aware data access |
| Refresh tokens/password reset | Auth lifecycle product work is outside the core slice | Add when identity management is in scope |
| PostgreSQL/Prisma implementation | Wave 7 introduces Prisma 7 persistence hardening under PostgreSQL with migration/schema and seeded reset flow | Migration/schema parity is implemented; environment/network constraints currently block full end-to-end verification in this sandbox |
| Rate limiting/caching | Depends on deployment and traffic profile | Add after observing real usage patterns |
| Broad mutation testing | Useful but too expensive for 3-4 hours | Run focused mutation checks on RBAC and validation later |

## Interview Defense

Use this as the short defense:

> I optimized for a small production-shaped slice. The backend is the trust
> boundary, with real RBAC, validation, status semantics, and test coverage for
> risky behavior. The UI is usable and responsive, but intentionally bounded.
> I cut broader product features so I could verify the core workflow, document
> tradeoffs, and own every generated or assisted line in the follow-up.
