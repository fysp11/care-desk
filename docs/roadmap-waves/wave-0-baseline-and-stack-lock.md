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
| `package.json` | Not present. |
| `bun.lock` | Not present. |
| App folders | `apps/api`, `apps/web`, `packages/shared`, and `prisma` are not present. |
| README scripts | README names `bun run dev`, `bun run start`, `bun test`, and `bun run typecheck`, but no package scripts exist yet. |
| Local Bun | `bun --version` returned `1.3.14`. |
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
| Done | Capture current repo baseline. | Main thread | Repo has docs/artifacts but no implementation scaffold. |
| Pending | Finalize workspace scaffold contract. | `.agents/agents/architect.md` | Confirm app layout, scripts, and first checks. |
| Pending | Create root package/workspace files. | Main thread or architect-guided implementation | Use Bun, explicit scripts, no secrets. |
| Pending | Add backend scaffold boundary. | `.agents/agents/backend.md` | Do not implement auth yet; just prepare surface and verification. |
| Pending | Add frontend scaffold boundary. | `.agents/agents/frontend.md` | Do not build UI yet; prepare app boundary and verification. |
| Pending | Add shared contract package placeholder if useful. | Architect/backend/frontend | Keep it minimal; avoid abstraction before contract exists. |
| Pending | Add Prisma placeholder/config decision. | `.agents/agents/backend.md` | Prisma 7 requires extra verification before real schema work. |
| Pending | Align README scripts with actual package scripts. | Main thread | README must not advertise nonexistent commands after wave completion. |
| Pending | Run first scaffold verification. | Main thread | Smallest useful checks: `bun install`, `bun run typecheck`, `bun test` once scripts exist. |

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

- [ ] Relevant requirement files were read for any installed/configured tool.
- [ ] Root `package.json` exists with scripts matching README.
- [ ] Workspace or app package boundaries are explicit.
- [ ] TypeScript configs are explicit and scoped.
- [ ] ESLint/Prettier setup is either present or intentionally deferred.
- [ ] `bun install` succeeds.
- [ ] `bun run typecheck` succeeds or has a documented scaffold limitation.
- [ ] `bun test` succeeds or has a documented scaffold limitation.
- [ ] README setup/run/test commands match actual scripts.
- [ ] No real credentials, `.env*` contents, real patient data, or production
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
