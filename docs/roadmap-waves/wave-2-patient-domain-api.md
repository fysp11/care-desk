# Wave 2: Patient Domain API

## Decision

Wave 2 implements the patient backend contract on top of the Wave 1 auth/RBAC
boundary. The API should prove patient CRUD, list query behavior, validation,
and predictable error semantics before the frontend workflow starts.

PostgreSQL is required by the challenge and Prisma is the preferred plus path,
but Prisma 7 is a high-risk surface in this repository. If the implementation
uses a temporary in-memory repository to keep the slice testable, this file
must document the cut and preserve a clear repository boundary for swapping in
PostgreSQL/Prisma.

## Implementation Status

Status: implemented with documented persistence cut.

Wave 2 uses a deterministic in-memory demo repository behind
`InMemoryPatientsRepository` for this slice. PostgreSQL remains the target
persistence layer, but Prisma 7 adoption is intentionally deferred because the
repo requirements flag it as a high-risk ESM/config/driver-adapter surface and
this wave prioritized a verified backend contract.

The next persistence step is to replace the in-memory repository with a
PostgreSQL-backed Prisma 7 implementation that includes:

- `prisma.config.ts` and explicit generated client output path.
- `@prisma/adapter-pg` or an equivalent Prisma 7 driver adapter.
- Patient table migration with unique `email` constraint and sortable indexes
  for `lastName` and `dob`.
- Seed data using only fictional demo patients.
- Repository contract parity tests using the same API integration suite.

## Source Alignment

| Source | Applied here |
|---|---|
| `docs/roadmap.md` | Phase 2: patient contract, DTO validation, service/repository layer, deterministic demo repository, REST endpoints, normalized errors. |
| `docs/challenge-resolution.md` | Patient CRUD, search, sort, pagination, and status semantics are the next backend proof point. |
| `.agents/workflows/patient-management-case.md` | Implement backend patient model, DTOs, repository/service layer, endpoints, and tests before frontend. |
| `.agents/checklists/implementation-gates.md` | Patient API gate is the primary exit gate for this wave. |
| `.agents/rules/latest-library-implementation.md` | Use researched NestJS, PostgreSQL, Prisma, TypeScript, and class-validator guidance. |
| `.agents/agents/backend.md` | Backend role owns patient API, persistence boundary, DTOs, RBAC, and tests. |

## Requirement Files Read

| Requirement | Version target | Wave 2 relevance |
|---|---:|---|
| `docs/requirements/nestjs.md` | `@nestjs/core@11.1.27` | Nest 11, Express 5 query parsing, route/guard behavior. |
| `docs/requirements/typescript.md` | `typescript@6.0.3` | Strict DTO, service, repository, and test types. |
| `docs/requirements/postgresql.md` | PostgreSQL `18.4` | Required persistence target and future local setup. |
| `docs/requirements/prisma.md` | `prisma@7.8.0` | Optional ORM path; high-risk ESM/config/driver-adapter surface. |
| `docs/requirements/class-validator.md` | `class-validator@0.15.1` | Patient body and query validation. |
| `docs/requirements/jwt-auth.md` | `@nestjs/jwt@11.0.2`, `jsonwebtoken@9.0.3` | Reuse Wave 1 guards for protected patient routes. |

## Scope

### Included

- `GET /patients` for admin and user.
- `GET /patients/:id` for admin and user.
- `POST /patients` for admin only.
- `PUT /patients/:id` for admin only.
- `DELETE /patients/:id` for admin only.
- Server DTO validation for patient body fields and list query params.
- Search across first name, last name, email, and phone number.
- Sort by allowlisted fields, including `lastName` and `dob`.
- Page/limit pagination with safe-integer query validation and a safe maximum
  limit.
- Predictable `400`, `401`, `403`, `404`, and `409` behavior.
- Integration tests for admin happy paths, user forbidden mutation,
  validation, not-found, search, sort, and pagination.

### Deferred

- Frontend login and patient UI.
- Optimistic updates and rollback behavior.
- Production secrets and real patient data.
- Cloud hosting and production database operations.
- Broad Prisma 7 adoption if it threatens the verified backend slice.

## Patient Contract

```ts
type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  createdAt: string;
  updatedAt: string;
};
```

Use ISO date strings at the API boundary. Demo seed data must be fictional and
must not include real patient data.

## API Contract

| Method | Path | Role | Expected behavior |
|---|---|---|---|
| `GET` | `/patients` | Admin/User | Return `{ data, page, limit, total }` with query behavior. |
| `GET` | `/patients/:id` | Admin/User | Return one patient or `404`. |
| `POST` | `/patients` | Admin | Validate body, create patient, return `201`. |
| `PUT` | `/patients/:id` | Admin | Validate body, update patient, return patient. |
| `DELETE` | `/patients/:id` | Admin | Delete patient and return `{ ok: true }`. |

Query defaults:

| Param | Default | Notes |
|---|---:|---|
| `page` | `1` | Positive integer. |
| `limit` | `10` | Positive integer clamped to a safe maximum. |
| `search` | empty | Match first name, last name, email, or phone number. |
| `sortBy` | `lastName` | Allowlisted fields only. |
| `sortDir` | `asc` | `asc` or `desc`. |

## Proposed Backend Shape

```text
apps/api/src/
  patients/
    dto/
      create-patient.dto.ts
      list-patients.dto.ts
      update-patient.dto.ts
    patients.controller.ts
    patients.module.ts
    patients.repository.ts
    patients.service.ts
    types.ts
apps/api/test/
  patients.test.ts
```

Keep the controller thin, the service responsible for status/error semantics,
and the repository responsible for storage/query behavior.

## Work Items

| Status | Task | Owner artifact | Notes |
|---|---|---|---|
| Done | Confirm persistence path for this wave. | `.agents/agents/backend.md` | Used deterministic in-memory repository and documented PostgreSQL/Prisma 7 next step. |
| Done | Add patient domain types and DTOs. | `.agents/agents/backend.md` | Validates required body fields and list query params through class-validator metadata. |
| Done | Add patient repository/service. | `.agents/agents/backend.md` | Includes search, sort, pagination, uniqueness, and not-found semantics. |
| Done | Add protected patient controller/routes. | `.agents/agents/backend.md` | Reuses Wave 1 guards and role metadata on patient routes. |
| Done | Add patient integration tests. | `.agents/agents/backend.md` | Proves admin CRUD, user `403`, missing token `401`, validation `400`, unsafe page query rejection, not-found `404`, conflict `409`, and list behavior. |
| Done | Run verification. | Main thread + verifier subagent | `rtk bun --filter @care-desk/api test` and `rtk bun --filter @care-desk/api typecheck` pass. |

## Subagent Loop

Wave 2 must use:

1. One implementation subagent scoped to backend patient API files and this wave
   file.
2. One verification subagent scoped to changed files, patient API gates, and
   command evidence.

Do not run parallel implementation agents against patient API files. The
contract is tightly coupled enough that one backend owner should land the slice.

## Verification Plan

Before Wave 2 is complete:

- [x] Relevant requirement files were read.
- [x] Persistence decision is documented.
- [x] `GET /patients` supports page, limit, search, sortBy, and sortDir.
- [x] `GET /patients/:id` returns a patient or `404`.
- [x] `POST /patients` validates input and returns `201`.
- [x] `PUT /patients/:id` validates input and returns updated patient.
- [x] `DELETE /patients/:id` returns `{ ok: true }`.
- [x] Unsafe page and limit query values return `400` instead of serializing
  non-finite values.
- [x] `PUT /patients/:id` and `DELETE /patients/:id` return `404` for a
  missing patient id.
- [x] Authenticated `user` mutation returns `403`.
- [x] Missing/invalid token returns `401`.
- [x] Invalid body or query returns `400`.
- [x] Duplicate patient email returns `409` on create and update because email
  uniqueness is enforced.
- [x] Errors follow a predictable `{ code, message, details? }` shape.
- [x] `rtk bun --filter @care-desk/api typecheck` passes.
- [x] `rtk bun --filter @care-desk/api test` passes, including patient API integration tests.
- [x] No real credentials, real patient data, `.env*` contents, or production
  mutations are introduced.

## Exit Criteria

Wave 2 is complete when the backend patient API is protected by the Wave 1
guards, its CRUD/list behavior is integration-tested, and any persistence cut
is explicit enough that Wave 3 can build the UI against a stable contract.

## Intentional Non-Goals

- No frontend patient workflow.
- No optimistic rollback UI.
- No production database migration or cloud resource mutation.
- No real patient data or production secrets.
