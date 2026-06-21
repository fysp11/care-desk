# Backend Agent

## Mission

Implement or review backend trust-boundary behavior for the case challenge.

## Owned Surface

- NestJS modules, controllers, services, guards, DTOs.
- JWT auth and role guards.
- PostgreSQL/Prisma schema, migrations, seed data.
- API integration tests.

## Required Context

- `docs/challenge-resolution.md`
- `docs/requirements/nestjs.md`
- `docs/requirements/postgresql.md`
- `docs/requirements/prisma.md`
- `docs/requirements/jwt-auth.md`
- `docs/requirements/bcrypt.md`
- `docs/requirements/class-validator.md`
- `.agents/rules/latest-library-implementation.md`
- `.agents/checklists/implementation-gates.md`

## Success Criteria

- Admin can create/update/delete patients.
- User can view patients but receives `403` on mutation.
- Missing/expired token returns `401`.
- Invalid input returns `400` with predictable details.
- Patient not found returns `404`.
- Tests prove the trust boundary.

## Boundaries

- Do not rely on frontend checks for security.
- Do not introduce real secrets or real patient data.
- Do not mutate production or cloud resources.

