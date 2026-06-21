# Wave 0: Baseline And Stack Lock

## Decision

Wave 0 establishes the repository shape and implementation contract before
feature work starts. It should leave the project ready for backend-first
implementation without making unresolved framework, script, or verification
assumptions.

## Source Alignment

| Source | Applied here |
|---|---|
| `docs/roadmap.md` | Phase 0: confirm workspace shape, scripts, package manager, Node/Bun assumptions, and latest-version guardrails. |
| `.agents/workflows/patient-management-case.md` | Orient first, then plan; do not begin broad coding without a slice plan. |
| `.agents/rules/latest-library-implementation.md` | Use latest researched versions from `docs/requirements/` or document any downgrade. |
| `.agents/checklists/implementation-gates.md` | Apply version, verification, and privacy gates before calling the wave complete. |
| `.agents/agents/architect.md` | Use a scoped architect pass for layout, contract, tests, cuts, and version risks. |

## Current Baseline Evidence

Checked on 2026-06-21.

| Item | Current state |
|---|---|
| Repository contents | Docs and agent artifacts only. No app source tree yet. |
| `package.json` | Present with Bun workspaces and root scripts. |
| `bun.lock` | Present after `bun install`. |
| App folders | `apps/api`, `apps/web`, `packages/shared`, and `prisma` are present. |
| README scripts | README scripts match root package scripts. |
| Local Bun | `bun --version` returned `1.3.14`. |
| Local Node | `node --version` returned `v22.22.3`, satisfying the Node 20.19+ floor. |
| Version inventory | `docs/requirements/README.md` is present with latest researched targets. |
| Roadmap file | `docs/roadmap.md` is persisted separately and should remain editable while wave files evolve. |

## Wave Goal

Create a minimal, explicit scaffold contract for the case implementation:

- Root workspace/package setup using Bun.
- Separate backend, frontend, shared, and Prisma surfaces.
- Explicit TypeScript configuration boundaries.
- Initial script names that match README expectations.
- First verification commands, even if they only prove scaffold health.
- Documented version targets and downgrade rules before dependency install.

## Proposed Workspace Shape

```text
apps/
  api/
    src/
    test/
  web/
    app/
    components/
    lib/
packages/
  shared/
    src/
prisma/
  schema.prisma
docs/
  roadmap-waves/
```

This matches the alignment docs while preserving a small vertical-slice path:
backend trust boundary first, then frontend integration.

## Stack Targets

Use `docs/requirements/README.md` as the source of truth for current targets.

| Surface | Target from requirements inventory | Wave 0 action |
|---|---:|---|
| Package/runtime | Bun `1.3+`; local check found `1.3.14` | Use Bun scripts and lockfile. |
| Node baseline | Node 20.19+ implied by Next.js, NestJS, and ESLint notes | Set or document a Node 20.19+ expectation. |
| Frontend | Next.js `16.2.9`, TypeScript `6.0.3` | Scaffold only after reading `nextjs.md` and `typescript.md`. |
| Backend | NestJS `11.1.27`, TypeScript `6.0.3` | Scaffold only after reading `nestjs.md` and `typescript.md`. |
| Database | PostgreSQL `18.4`, Prisma `7.8.0` | Treat Prisma setup as high-risk and verify config shape. |
| Validation/auth | JWT, bcrypt, class-validator, Zod + React Hook Form | Defer implementation to later waves, but reserve dependency surfaces. |
| Styling | Tailwind `4.3.1`, shadcn CLI `4.11.0` | Defer component generation until frontend wave. |
| Tooling | ESLint `10.5.0`, Prettier `3.8.4` | Use flat ESLint config and pinned Prettier when scaffolding. |

## Work Items

| Status | Task | Owner artifact | Notes |
|---|---|---|---|
| Done | Capture current repo baseline. | Main thread | Repo began as docs/artifacts only. |
| Done | Finalize workspace scaffold contract. | `.agents/agents/architect.md` | App layout, scripts, and first checks are captured here. |
| Done | Create root package/workspace files. | Main thread | Uses Bun workspaces, explicit scripts, no secrets. |
| Done | Add backend scaffold boundary. | `.agents/agents/backend.md` | NestJS API shell only; no auth or patient API yet. |
| Done | Add frontend scaffold boundary. | `.agents/agents/frontend.md` | Next.js app shell only; no login or patient workflow yet. |
| Done | Add shared contract package placeholder if useful. | Main thread | Minimal `UserRole` type only, to prove package boundary. |
| Done | Add Prisma placeholder/config decision. | `.agents/agents/backend.md` | Prisma 7 is deferred until persistence can be verified as a slice. |
| Done | Align README scripts with actual package scripts. | Main thread | README no longer advertises unimplemented endpoints. |
| Done | Run first scaffold verification. | Main thread | `bun install`, `bun run typecheck`, `bun test`, and `bun run build` passed. |

## Subagent Split

Use scoped subagents when executing Wave 0 tasks:

| Subagent | Context to provide | Output expected |
|---|---|---|
| Architect | This wave file, `docs/roadmap.md`, `docs/challenge-resolution.md`, `.agents/rules/latest-library-implementation.md` | Final scaffold plan, dependency boundaries, first verification command. |
| Backend | This wave file plus backend-related requirement docs | Backend scaffold proposal or implementation limited to API package setup. |
| Frontend | This wave file plus frontend-related requirement docs | Frontend scaffold proposal or implementation limited to web package setup. |
| Reviewer | This wave file, changed scaffold files, `.agents/checklists/implementation-gates.md` | Findings on stale APIs, overlapping scopes, missing scripts, or verification gaps. |

Parallelize only after the architect contract is clear. Backend and frontend
scaffold work may run in parallel if their write sets are separate.

## Verification Plan

Before Wave 0 is complete:

- [x] Relevant requirement files were read for any installed/configured tool.
- [x] Root `package.json` exists with scripts matching README.
- [x] Workspace or app package boundaries are explicit.
- [x] TypeScript configs are explicit and scoped.
- [x] ESLint/Prettier setup is intentionally deferred to avoid spending the
  scaffold wave on non-blocking tooling.
- [x] `bun install` succeeds.
- [x] `bun run typecheck` succeeds.
- [x] `bun test` succeeds.
- [x] `bun run build` succeeds when run outside the sandbox; the sandboxed
  attempt failed because Next/Turbopack/PostCSS hit an internal
  process/port-binding restriction.
- [x] README setup/run/test commands match actual scripts.
- [x] No real credentials, `.env*` contents, real patient data, or production
  mutations are introduced.

## Exit Criteria

Wave 0 is complete when a future agent can start Wave 1 without first guessing:

- Which package manager to use.
- Which app folders own backend, frontend, shared types, and Prisma.
- Which versions or version docs govern the implementation.
- Which commands prove the scaffold is healthy.
- Which cuts remain intentional.

## Intentional Non-Goals

- No auth, RBAC, patient API, or UI workflow implementation.
- No real database migration beyond a documented local scaffold decision.
- No cloud hosting or deployment.
- No real secrets or real patient data.
