# Code Readiness Architecture Analysis

## Decision

| Field | Value |
|---|---|
| Recommendation | Ready for senior case-test submission with documented caveats |
| Scope | Codebase architecture, maintainability, verification, and AI-generated anti-pattern risk |
| Risk classification | High by GitNexus change-detection breadth; mitigated by full test/type/build/e2e verification |
| Production-code changes | Small NestJS decorator-style, feature-first auth layout, and local script cleanup; no feature expansion |
| Out of scope | Stryker/mutation-depth remediation by request |
| Main concern | The page is not a super page today; `usePatientWorkflow` is the first workflow hotspot to decompose after characterization tests |

The codebase is defensible for a senior full-stack case test. It has a clear
backend trust boundary, meaningful API and frontend tests, PostgreSQL-backed
persistence, and a compact UI flow. It is not production-ready without further
work on runtime config, validation parity, direct frontend hook coverage, and
workflow decomposition.

## 1. Baseline

| Area | Evidence |
|---|---|
| Repository structure | Bun workspace with `apps/api`, `apps/web`, and `packages/shared` |
| Stack | NestJS 11, Next.js 16, Prisma 7, PostgreSQL, TypeScript 6, Bun 1.3.14 |
| Test framework | Bun tests for API/web/shared; Playwright e2e under `apps/web/e2e` |
| Build system | Root `bun run build` delegates to shared, API, and web builds |
| Type checking | Root `bun run typecheck` generates Prisma client then checks shared/API/web |
| Linting | Root `bun run lint` aliases `bun run typecheck`; no separate lint rule set observed |
| Architecture tooling | `.agents/scripts/check-architecture-policy.sh`; architecture skill/rules under `.agents` |
| GitNexus | Refreshed with `--pdg --embeddings`: 3,201 nodes, 5,302 edges, 89 flows |
| CI workflows | No `.github` workflow directory observed in this worktree |
| Generated code | Prisma client under `apps/api/src/generated`; Next output under `apps/web/.next`; GitNexus index under `.gitnexus` |

Initial command results:

| Command | Result | Notes |
|---|---|---|
| `rtk proxy bun --filter @care-desk/api test` | Failed in sandbox | Database connection to `127.0.0.1:5432` blocked by sandbox |
| `rtk proxy bun run migrate` | Passed with escalation | PostgreSQL container healthy; Prisma migration already applied; Prisma client generated |
| `rtk proxy bun run seed` | Passed with escalation | Fictional demo data seeded |
| `rtk proxy bun --filter @care-desk/api test` | Passed with escalation | 54 pass, 0 fail |
| `rtk proxy bun run test` | Passed with escalation | shared 1 pass, API 54 pass, web 70 pass |
| `rtk proxy bun run typecheck` | Passed | Prisma generated; shared/API/web typechecks passed |
| `rtk proxy bun run build` | Passed with escalation | shared/API/web production builds passed |
| `rtk proxy bash .agents/scripts/check-architecture-policy.sh` | Passed | Architecture policy files and AGENTS guardrails valid |
| `rtk proxy bun run test:e2e` | Initially failed, then passed | Initial failure came from stale Compose containers mounted from an old worktree; after recreating the stack, 9 Playwright tests passed |

## 2. Findings

| ID | Sev | Conf | Location | Evidence | Impact | Proposed remediation | Status |
|---|---|---:|---|---|---|---|---|
| F1 | P1 | High | `apps/api/src/patients/dto/*.ts`, `apps/web/lib/patient-schema.ts` | Phone/date validation differs across API and web. Web allows future-date rejection and different phone lengths than API. | Client/server acceptance can drift; users can see inconsistent validation behavior. | Centralize patient validation constants/contracts or add cross-layer parity tests before consolidation. | Deferred; changes public validation semantics |
| F2 | P1 | High | `apps/web/hooks/use-auth-session.ts`, `apps/web/hooks/use-patient-workflow.ts` | Tests cover pure workflow helpers but not the critical hooks directly. | Session restoration, auth-failure recovery, optimistic rollback, and overlapping async actions remain under-protected. | Add hook-focused tests with controlled storage, fetch, confirm, and deferred promises. | Deferred; recommended next batch |
| F3 | P1 | High | `apps/api/src/auth/jwt.constants.ts`, `apps/api/src/auth/demo-users.ts` | JWT secret and demo credentials are hard-coded in source. | Acceptable for this local case, but unsafe as production config and easy to accidentally reuse. | Move auth config to validated env and gate demo users to local/dev profile. | Documented non-goal for case; production blocker |
| F4 | P2 | High | `apps/web/hooks/use-patient-workflow.ts` | One hook owns query state, list/detail fetches, form mode, optimistic create/edit/delete, auth failure, errors, and confirmation. | Future changes have broad blast radius; this is the likely AI-amplified god-hook risk. | Split into list/query, selection/details, mutations/rollback, and confirmation boundary after tests. | Deferred; guarded in `AGENTS.md` |
| F5 | P2 | High | `apps/web/app/page.tsx` | The page composes all major panels and high-level branches, but delegates behavior to hooks/components. | Not a super page today; can become one if logic starts landing in the route component. | Keep route/page composition-only; extract session/workspace shells only when behavior grows. | Guardrail added |
| F6 | P2 | High | `apps/api/src/patients/types.ts`, `apps/web/lib/types.ts`, `packages/shared/src/index.ts` | Patient/list contracts are duplicated while shared exports only `UserRole`. | Contract drift risk between backend and frontend. | Promote stable patient/list/error contracts into `packages/shared` in a focused batch. | Deferred |
| F7 | P2 | Medium | `apps/web/hooks/use-patient-workflow.ts` | Async list/detail/mutation paths have no request-version or abort guard. | Late responses can overwrite newer UI state during rapid interactions. | Add stale-response tests, then request sequencing or abort handling. | Deferred |
| F8 | P2 | Medium | `apps/api/src/main.ts`, `apps/web/lib/api.ts`, `apps/api/src/prisma.service.ts`, `prisma/seed.ts` | Localhost/runtime constants are distributed across app startup and client API code. | Deployment friction and environment drift. | Introduce validated runtime config before production deployment. | Deferred |
| F9 | P2 | High | `apps/api/src/patients/patients.repository.ts::delete` | Repository tests cover list/create/update mapping but not delete semantics directly. | Low-level delete behavior could regress while service tests use mocks. | Add repository tests for one-row delete, no-row delete, and DB error propagation. | Deferred |
| F10 | P3 | High | `apps/api/test/scaffold.test.ts`, `apps/web/test/scaffold.test.ts`, `packages/shared/test/scaffold.test.ts` | Scaffold tests assert only `true`. | Keeps commands wired but adds little behavioral confidence. | Replace shared scaffold with a real shared contract test once shared contracts are promoted. | Partially accepted; shared scaffold is transitional |

## 3. Implemented Batches

| Batch | Objective | Files changed | Responsibility moved | Dependency change | Tests added/updated | Verification |
|---|---|---|---|---|---|---|
| B1 | Establish delivery boundary for the case-test submission | `DELIVERY_BOUNDARY.md`, `README.md` | None | None | None | `README.md` link and run command checked by review |
| B2 | Prevent future super-page/god-hook drift | `AGENTS.md`, `docs/code-readiness-architecture-analysis.md` | None; guidance/report only | None | None | Architecture policy passed |
| B3 | Keep root workspace test command executable | `packages/shared/test/scaffold.test.ts`, `README.md` | None | None | Added shared scaffold test | `bun run test` passed |
| B4 | Refresh code-intelligence metadata | `.gitignore`, `AGENTS.md`, `CLAUDE.md` | None | `.gitnexus/` ignored | None | GitNexus analysis passed with `--pdg --embeddings` |
| B5 | Replace manual NestJS metadata plumbing with declaration-site decorators in touched API modules | App/auth/patient modules, controllers, guards, services, DTOs, and style test | Decorator ownership moves back to class/member declarations | Removes manual `Reflect.defineMetadata` and direct decorator invocation in source | Added `nest-decorator-style` guardrail test; updated auth metadata expectations | Targeted API tests and full `bun run test` passed |
| B6 | Align auth with feature-first NestJS structure | `apps/api/src/auth/dto`, `decorators`, `guards`, `types`; auth/patient imports and tests | Auth DTOs, guards, decorators, and types now live under cohesive feature subfolders | Moves auth internals without global layer-first folders or route behavior changes | Reused auth/RBAC and patient metadata/API tests | Focused API tests and `bun run typecheck` passed |
| B7 | Simplify root developer scripts | `package.json`, `docker-compose.yml`, `apps/web/playwright.config.ts`, `README.md` | Local setup choreography moves behind `bun run up` | Removes root Stryker and legacy `db:*`/`compose:*` command clutter from the evaluator path | Reused full workspace and Playwright checks | `bun run up`, `bun run test`, `bun run test:e2e`, `bun run build`, and `bun run typecheck` passed |

Production behavior remains aligned with the case contract. The code cleanup
keeps NestJS route/guard/validation metadata at declaration sites and preserves
the public auth role shape used by tests and browser flow.

## 4. Before-And-After Evidence

| Signal | Before | After |
|---|---|---|
| GitNexus index | 3,090 symbols / 5,061 relationships / 84 flows in docs | 3,201 symbols / 5,302 relationships / 89 flows after reindex |
| Delivery boundary | Not present at repo root | `DELIVERY_BOUNDARY.md` defines goal, flow, scope, tradeoffs, DoD |
| Root test command docs | README suggested raw `bun test`, which also sweeps unintended specs/files | README now points to repo-defined `bun run test` |
| Shared workspace test | `@care-desk/shared test` had no meaningful test file and failed with no tests found | Transitional scaffold keeps `bun run test` wired |
| Super-page guardrail | General architecture invariants only | `AGENTS.md` now explicitly constrains page components and workflow hooks |
| Production tests | Not proven in this pass initially | `bun run test` passed: shared 1, API 54, web 70 |
| Type/build | Not proven in this pass initially | `bun run typecheck` and `bun run build` passed |
| Browser e2e | Not proven | `bun run test:e2e` passes 9 Playwright tests after recreating stale Compose services |

## 5. Validation

| Command | Result |
|---|---|
| `rtk proxy /Users/fysp/.bun/bin/gitnexus analyze --pdg --embeddings` | Passed after explicit embedding approval |
| `rtk proxy bun install --frozen-lockfile` | Passed |
| `rtk proxy bun run db:generate` | Passed |
| `rtk proxy bun run migrate` | Passed with escalation |
| `rtk proxy bun run seed` | Passed with escalation |
| `rtk proxy bun --filter @care-desk/shared test` | Passed |
| `rtk proxy bun --filter @care-desk/api typecheck` | Passed |
| `rtk proxy bun --filter @care-desk/api test` | Passed with escalation after DB access allowed |
| `rtk proxy bun --filter @care-desk/api test test/nest-decorator-style.test.ts test/auth.test.ts test/auth-controller-metadata.test.ts test/validation.test.ts` | Passed |
| `rtk proxy bun --filter @care-desk/web typecheck` | Passed |
| `rtk proxy bun --filter @care-desk/web test` | Passed |
| `rtk proxy bun run test` | Passed with escalation |
| `rtk proxy bun run typecheck` | Passed |
| `rtk proxy bun run build` | Passed with escalation |
| `rtk proxy bash .agents/scripts/check-architecture-policy.sh` | Passed |
| `rtk proxy bun run test:e2e` | Passed after Compose recreation |
| `mcp__gitnexus.detect_changes({ scope: "unstaged" })` | High risk: 55 changed symbols, 15 affected execution flows |

E2E diagnosis and resolution:

- Initial `docker compose ps` showed existing `api`, `web`, and `postgres`
  containers from a stale worktree path.
- Initial `curl http://127.0.0.1:3001/patients` returned `401`, expected for a
  protected route; initial `curl http://localhost:3000` returned `500`.
- `docker compose restart web` failed because the old container referenced a
  deleted mount source.
- `bun run down` and `bun run up` recreated services from the
  current worktree without removing volumes.
- After recreation, `curl http://localhost:3000` returned `200` and
  `curl http://127.0.0.1:3001/patients` returned `401`.
- `bun run test:e2e` then passed 9 browser tests covering
  admin CRUD/search/edit/details/delete, user view-only mode, direct mutation
  `403`, failure retry, session persistence/logout, denied storage, and
  unauthorized-session recovery.

## 6. Guardrails Added

- `AGENTS.md` now explicitly states that route/page components should compose
  views and delegate workflow/state instead of concentrating fetching,
  validation, auth policy, mutation orchestration, and rendering.
- `AGENTS.md` now states that hooks should own cohesive workflows and should be
  split when query, selection, mutation, and confirmation concerns gain
  unrelated reasons to change.
- `README.md` now points evaluators at `DELIVERY_BOUNDARY.md`.
- `README.md` now uses the repo-defined `bun run test` command instead of raw
  `bun test`.

## 7. Remaining Risks

| Risk | Reason for deferral | Recommended next batch |
|---|---|---|
| Validation parity | Fixing it may alter API or UI acceptance behavior. | Add cross-layer contract tests, then consolidate constants/contracts. |
| Frontend hook coverage | Direct hook tests need a deliberate test harness and controlled async promises. | Add tests for session bootstrap, auth failure, optimistic rollback, stale responses, and double-submit/delete. |
| `usePatientWorkflow` concentration | Splitting without tests would create more risk than it removes. | Decompose after hook characterization tests pass. |
| Demo auth/config | The assignment scope intentionally uses mock auth. | Move secrets/users/CORS/base URLs to validated env before production-like use. |
| Shared contracts unused | Shared package currently only proves workspace shape. | Promote stable patient/list/error contracts into `packages/shared`; replace scaffold test with real contract tests. |
| Playwright e2e environment sensitivity | Stale Compose containers can point at deleted worktrees and return `500`. | Recreate local Compose services from the active worktree before browser verification. |

Do not claim the repository is free of all antipatterns. The useful conclusion is narrower: the core case-test architecture is sound, the largest AI-generated-code risk is known and documented, and the next refactors have clear test prerequisites.
