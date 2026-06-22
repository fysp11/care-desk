# Roadmap

## Decision

Build a compact, production-shaped vertical slice before any stretch work:
server-side auth/RBAC, patient API behavior, validation, role-aware UI, focused
tests, and documented cuts.

This roadmap follows the alignment docs rather than expanding scope beyond the
3-4 hour case challenge.

## Alignment Inputs

| Source | Roadmap impact |
|---|---|
| `docs/Case Assignment - Patients Management System.md` | Defines the required frontend, backend, API contract, UI states, and deliverables. |
| `docs/challenge-resolution.md` | Sets the delivery thesis: prove risky backend boundaries first and document tradeoffs. |
| `docs/requirements/README.md` | Provides the latest researched library targets and upgrade-risk notes. |
| `.agents/rules/latest-library-implementation.md` | Prevents stale framework/API assumptions during implementation. |
| `.agents/workflows/patient-management-case.md` | Defines the preferred implementation order. |
| `.agents/checklists/implementation-gates.md` | Defines the gates required before a slice is called complete. |

## Success Boundary

The core delivery is complete when the repository can demonstrate:

- Seeded `admin` and `user` accounts with hashed demo passwords.
- JWT login, token expiry behavior, logout, and protected routes.
- Backend-enforced `401` and `403` behavior for patient routes.
- Patient list, details, create, edit, and delete endpoints.
- Search, sort, and pagination for `GET /patients`.
- A repository boundary with PostgreSQL/Prisma-backed patient persistence and no
  unresolved migration ambiguity.
- Client and server validation for patient fields.
- Role-aware UI where `user` can view and `admin` can mutate.
- Loading, empty, error, and failure rollback states.
- Focused API tests plus at least one frontend smoke/manual verification path.
- README setup, run, test, and cut documentation.

## Phase Roadmap

| Phase | Risk | Focus | Done when |
|---|---|---|---|
| 0. Baseline and stack lock | Low | Confirm workspace shape, scripts, package manager, Node/Bun assumptions, and latest-version guardrails. | Skeleton typecheck/test commands exist or documented gaps are explicit. |
| 1. Backend trust boundary | Medium | NestJS API, seeded users, bcrypt password checks, JWT login, auth guard, role guard. | Admin login succeeds, missing/expired token returns `401`, user mutation returns `403`. |
| 2. Patient domain API | Medium | Patient contract, DTO validation, service/repository layer, deterministic demo repository, REST endpoints, normalized errors. | Patient CRUD plus search/sort/pagination are integration-tested; PostgreSQL/Prisma remains a documented hardening step. |
| 3. Frontend workflow | Medium | Next.js app, login, protected patients route, table, form, details view, role-gated actions. | Admin and user flows work against the API with visible loading/error/empty states. |
| 4. Reliability and polish | Medium | Optimistic update rollback, dev-only latency/failure simulation, responsive layout, accessible focus/validation states. | Failure paths are verified and mobile/tablet/desktop layouts remain usable. |
| 5. Delivery defense | Low | README, verification evidence, known cuts, interview defense notes. | A reviewer can clone, run, test, and understand what was intentionally deferred. |
| 6. Optional stretch | Medium/High | Cloud hosting, audit log, rate limiting, richer UI polish. | Only attempted after phases 1-5 are stable and verified. |
| 7. PostgreSQL + Prisma + Compose hardening | Medium | Switch patient persistence to PostgreSQL + Prisma 7 with migrations, seeds, and local Compose setup. | Patient API contract remains intact and tests run against database state. |

## Dependency Order

1. Lock the implementation target from `docs/requirements/`.
2. Implement auth before patient mutations.
3. Implement backend validation before frontend form polish.
4. Implement API tests before broad UI work.
5. Implement frontend role gating after backend RBAC exists.
6. Add simulated failure only after the normal path is stable.
7. Stop feature work before the README and verification evidence are at risk.
8. Run persistence hardening against a local PostgreSQL service (Compose).

## Verification Gates

| Gate | Minimum evidence |
|---|---|
| Version gate | Relevant requirement docs were read and latest researched APIs were used or a downgrade was documented. |
| Auth/RBAC gate | Tests or manual proof for admin success, user `403`, and unauthenticated/expired `401`. |
| Patient API gate | Tests for validation, not-found behavior, search, sort, pagination, and successful mutation. |
| Persistence gate | Patient persistence uses PostgreSQL + Prisma 7 or fails with a documented blocker; deterministic repository contract remains in API behavior. |
| Frontend gate | Manual or automated proof for login, protected route, table states, form validation, details, and role UI. |
| Privacy gate | No real patient data, no real credentials, no `.env*` exposure, no host-specific reusable paths. |
| Delivery gate | README run/test instructions match real commands and all cuts are documented. |

## Agent Dispatch

| Need | Use |
|---|---|
| Architecture or tradeoff planning | `.agents/agents/architect.md` |
| API, database, auth, RBAC, tests | `.agents/agents/backend.md` |
| UI, accessibility, form, table, responsive states | `.agents/agents/frontend.md` |
| Code review and interview-defense review | `.agents/agents/reviewer.md` |
| Repeated workflow context | `.agents/skills/patient-management-case/SKILL.md` |
| Library/version guardrail context | `.agents/skills/latest-library-guard/SKILL.md` |

## Deferred By Default

| Item | Reason | Revisit after |
|---|---|---|
| Cloud hosting | Optional bonus; can consume the timebox without improving core proof. | Local run, tests, and README are stable. |
| PostgreSQL/Prisma implementation | Required target architecture and preferred ORM path; now being implemented in Wave 7 with migrations, seeds, and compose-backed tests. | If local DB is unavailable, defer that test path and keep API contract notes aligned. |
| Refresh tokens/password reset | Product auth lifecycle beyond the prompt's core trust boundary. | JWT login and expiry behavior are verified. |
| Audit log and soft delete | Important for real clinical systems, but changes data model and UI semantics. | CRUD and error semantics are stable. |
| Multi-tenancy | Changes every authorization and data-access path. | Single-tenant RBAC is tested. |
| Rate limiting/caching | Deployment-profile dependent. | Core API correctness is verified. |
| Broad browser/device matrix | Useful but expensive for the timebox. | Primary responsive path is manually verified. |
