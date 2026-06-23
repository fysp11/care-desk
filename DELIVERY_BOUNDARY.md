# Delivery Boundary

## Goal

This submission is meant to prove senior full-stack judgment on the Patients
Management case: choose the risky core, implement it cleanly, verify it, and
document the cuts. The app should demonstrate that the backend is the trust
boundary, the patient workflow is usable end-to-end, and the code is
maintainable enough to defend in a follow-up interview.

## Main User Flow

Admin signs in, views the patients table, searches/sorts/paginates records,
opens a patient, creates or edits a patient with validation, and sees the list
recover cleanly from loading/error states. A user signs in with view-only
permissions and can inspect records without mutation controls; direct mutation
API calls still return `403`.

## Prioritized Scope

Must-have:

- Mock JWT login for seeded `admin` and `user` accounts.
- Token expiry handling, protected routes, and logout.
- Backend-enforced RBAC for patient mutations.
- Patient list with search, sort, pagination, loading, empty, and error states.
- Patient details, create, edit, and delete paths.
- Server DTO validation, predictable error bodies, and status semantics.
- Client form validation for the assignment fields.
- Optimistic mutation feedback with rollback for the main workflow.
- PostgreSQL/Prisma-backed patient persistence with local seed data.
- Focused API and frontend tests that protect auth, RBAC, validation, contract,
  and workflow behavior.
- README instructions for setup, run, checks, and intentional cuts.

Should-have only if cheap:

- Local Docker Compose for PostgreSQL/API/web.
- Dev-only latency/failure simulation to show resilience.
- Focused browser smoke coverage for admin/user workflows.
- Architecture notes that explain why the slice is intentionally small.

Explicit non-goals:

- Cloud hosting.
- Real identity provider, signup, password reset, refresh tokens, or production
  secrets management.
- Multi-tenant data model, organization scoping, or fine-grained permissions.
- Clinical audit log, soft delete/archive policy, imports, bulk actions, or
  advanced filtering.
- Broad observability, caching, rate limiting, or retry orchestration.
- Dark mode, brand-heavy polish, large dashboard surfaces, or feature breadth
  beyond the patient management workflow.
- Broad mutation testing or exhaustive browser/device matrix.

## Tradeoffs

- Auth is realistic enough to prove the trust boundary, but still demo-local:
  seeded users and a mock JWT secret are intentionally not production identity
  management.
- The UI favors a quiet admin workflow over visual novelty, because the case is
  about a reliable patient-management slice.
- Frontend role gating is treated as UX only. The backend remains authoritative.
- PostgreSQL and Prisma are included because they directly strengthen backend
  depth, but production deployment and secret rotation are deferred.
- The app keeps a single primary patient workflow instead of adding dashboard,
  analytics, import, or admin-management screens.
- The current page composes views rather than owning all logic. The main
  maintainability risk is future growth in the patient workflow hook, which
  should be decomposed only with characterization tests.

## Definition of Done

- [x] The main case concern is explicitly addressed: secure patient management
  with role-aware access.
- [x] The primary admin/user flow works end-to-end.
- [x] The backend enforces `401`/`403`; frontend role gating is not the security
  boundary.
- [x] Patient list, details, create, edit, delete, validation, and error states
  are present.
- [x] Scope is intentionally narrow and defensible.
- [x] There are no major features unrelated to the case.
- [x] Architecture is simple enough to explain quickly.
- [x] Code avoids large mixed-responsibility pages and keeps workflow growth
  under review.
- [x] Critical behavior has meaningful API/frontend tests.
- [x] README explains how to run, test, and evaluate the app.
- [x] Tradeoffs and deferred work are documented.

Evidence: `bun run test`, `bun run typecheck`, `bun run build`, and
`bun run test:e2e` passes after recreating the local Compose
stack from the current worktree. The e2e suite covers admin CRUD/search/edit,
details, failure recovery, user view-only mode, direct user mutation `403`,
session persistence/logout, denied storage, and unauthorized-session recovery.
