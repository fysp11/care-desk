# Wave 7: PostgreSQL/Prisma + Docker Compose

## Decision

Wave 7 transitions patient persistence from the deterministic in-memory repository
to PostgreSQL-backed Prisma 7, and adds a minimal Docker Compose path for local
reproducible dependencies. This is the first persistence hardening pass and is
treated as medium-risk because it changes ordering, ID behavior, and error mapping
across all patient CRUD paths.

## Source Alignment

| Source | Applied here |
|---|---|
| `docs/roadmap.md` | Phase 7 now defines the PostgreSQL + Prisma + compose hardening scope after the verified core slice. |
| `.agents/checklists/implementation-gates.md` | Version, Patient API, and Verification gates still apply; this wave adds database/infrastructure checks. |
| `.agents/rules/latest-library-implementation.md` | Uses latest researched Prisma/Compose requirements and guardrails. |
| `docs/requirements/postgresql.md` | Required relational database target, version-aware operational posture. |
| `docs/requirements/prisma.md` | Prisma 7 migration/driver-adapter expectations and ORM guardrails. |
| `docs/requirements/docker-compose.md` | Minimal Compose pattern and no-opinionated local dependency setup. |

## Scope

### Included

- Add Prisma schema/modeling for patients under `prisma/schema.prisma`.
- Add Prisma migrations for baseline patient persistence.
- Add Prisma client bootstrap + service with `prisma 7.8.0` and Postgres driver adapter.
- Replace patient repository with Prisma-backed repository while preserving the API contract.
- Add deterministic seed + reset path for API tests (`demo` patients).
- Add `docker-compose.yml` and `.env.example` to run PostgreSQL locally.
- Update Wave 6/roadmap/readme wording so this wave is explicit and no longer
  purely deferred.

### Excluded

- User table persistence/migration (keep seeded auth users as-is for this slice).
- Full blue/green deployment or cloud host migration.
- Browser E2E matrix and production-grade infra tuning.
- Non-essential DB extras (audit logging, soft-delete, replication, CDC) until the
  repository contract is stable under compose-backed runs.

## Work Items

| Status | Task | Owner artifact | Notes |
|---|---|---|---|
| Done | Add Prisma schema, migration SQL, and client config files. | `prisma/schema.prisma` (and `prisma/migrations/*`) | Use explicit generation output, no implicit client assumptions. |
| Done | Add PostgreSQL-backed repository and service integration. | `apps/api/src/patients/*` | Preserve sorting/search/pagination contract and error semantics. |
| Done | Add deterministic reset/seed path used by API tests. | `apps/api/test/patients.test.ts` and seed helper in repository. | Maintains existing API test intent with DB-backed storage. |
| Done | Add Docker Compose + env examples for local PostgreSQL. | `docker-compose.yml`, `.env.example` | Avoid committing secrets; placeholders only. |
| Done | Update wave/roadmap/readme references to reflect this wave start. | `docs/roadmap.md`, `README.md` | Prevent stale “deferred forever” wording. |

## Verification Checklist

- [ ] Prisma schema and baseline migration files are present for the `Patient` model.
- [ ] Patient CRUD/list behavior is preserved (`VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`) under PostgreSQL-backed repository contract.
- [ ] Deterministic seed/reset path is idempotent and test-safe.
- [ ] API tests pass with `DATABASE_URL` configured to local PostgreSQL.
- [ ] `docker compose up -d` (or `bun run compose:up`) produces runnable PostgreSQL, API, and web services with a clear DB/API/web contract in docs.
- [ ] README and docs reflect whether compose path is prerequisite for persistence tests.

Current known verification blockers:

- Prisma packages could not be installed in this environment due blocked registry
  network access, so Prisma-generated client code is not present locally yet.
- Docker socket access is restricted in this environment, so runtime compose startup
  is not verifiable from this agent session.

## Exit Criteria

Wave 7 is complete when patient API behavior is maintained with PostgreSQL-backed
persistence and when compose-based local setup is documented as the path to run and
verify that behavior reliably.
