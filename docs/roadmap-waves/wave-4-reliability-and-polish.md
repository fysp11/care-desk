# Wave 4: Reliability And Polish

## Decision

Wave 4 hardens the working patient-management flow from Waves 1-3 without
expanding the product surface. The goal is to prove recovery behavior and
usability under failure: simulated latency/failure, rollback for risky
mutations, responsive layout checks, and accessible focus/validation states.

This wave should not introduce production infrastructure, cloud deployment, or
new business features.

## Implementation Status

Status: implemented with a documented build-environment concern.

Wave 4 now adds frontend-only reliability controls and recovery behavior:

- Localhost-only reliability simulation controls on the authenticated patients
  screen.
- Opt-in persisted simulation settings in browser local storage; disabled by
  default and independent of `.env` files or secrets.
- Isolated simulation helper in `apps/web/lib/failure-simulation.ts`.
- List failures preserve the active session and show the existing retry path.
- Detail failures keep the selected row context and expose a retry action.
- Create/edit failures keep the form open and display API-style details.
- Delete uses optimistic row removal and rolls back the list/selection on
  failure with a visible recovery message.
- Focused tests cover simulation controls, API-style simulated failures, detail
  retry decisions, and optimistic delete rollback inputs.

## Source Alignment

| Source | Applied here |
|---|---|
| `docs/roadmap.md` | Phase 4: optimistic update rollback, dev-only latency/failure simulation, responsive layout, accessible focus/validation states. |
| `docs/challenge-resolution.md` | Reliability and UX excellence are part of the compact defensible slice. |
| `.agents/workflows/patient-management-case.md` | Add failure behavior only after normal backend/frontend paths are stable. |
| `.agents/checklists/implementation-gates.md` | Frontend, verification, and privacy gates apply. |
| `.agents/rules/latest-library-implementation.md` | Keep Next.js, React, Tailwind, Zod, and React Hook Form usage current. |
| `.agents/agents/frontend.md` | Frontend role owns UI state, form behavior, responsiveness, and smoke checks. |
| `.agents/agents/reviewer.md` | Reviewer should focus on recovery behavior, accessibility, and challenge-defense gaps. |

## Requirement Files Read

| Requirement | Version target | Wave 4 relevance |
|---|---:|---|
| `docs/requirements/nextjs.md` | `next@16.2.9` | Keep client interactivity contained and build-safe. |
| `docs/requirements/typescript.md` | `typescript@6.0.3` | Preserve strict state and helper contracts. |
| `docs/requirements/tailwind-css.md` | `tailwindcss@4.3.1` | Verify focus rings, table borders, validation states, and responsive behavior. |
| `docs/requirements/zod-react-hook-form.md` | `zod@4.4.3`, `react-hook-form@7.80.0` | Preserve edit-form defaults, dirty state, reset/cancel, and validation mapping. |

## Scope

### Included

- Dev-only latency/failure simulation surfaced through the frontend workflow.
- Failure simulation must be opt-in and local; no production config or secrets.
- Retry and recovery paths for list and detail failures.
- Optimistic or staged mutation feedback with rollback for delete and/or edit
  where practical.
- Visible loading, disabled, focus, validation, and error states for mutation
  workflows.
- Responsive refinements for the table/form/details layout.
- Focused tests or documented smoke evidence for simulated failure and rollback
  behavior.

### Deferred

- Full browser E2E matrix.
- Production observability.
- Rate limiting, caching, or server-side resilience features.
- Audit logs, soft delete, or concurrency-control features.
- Cloud deployment.

## Reliability Contract

| Scenario | Expected behavior |
|---|---|
| List request fails | Error state includes retry and does not clear the last known session. |
| Detail request fails | Details area shows a recoverable error without logging the user out unless the API returns `401`. |
| Create/edit fails | Form remains open, entered values stay recoverable, and server details are visible enough to act on. |
| Delete fails after optimistic removal | Removed row is restored or the list is refreshed and the user sees the failure. |
| Auth failure | Session is cleared and the user returns to login. |
| Simulated failure disabled | Normal workflow remains unchanged. |

## Proposed Implementation Surface

```text
apps/web/
  app/page.tsx
  lib/api.ts
  lib/workflow.ts
  lib/failure-simulation.ts
  test/
    workflow.test.ts
    failure-simulation.test.ts
```

The exact shape may differ, but keep simulation logic isolated from ordinary
API request and UI state code.

## Work Items

| Status | Task | Owner artifact | Notes |
|---|---|---|---|
| Done | Add dev-only failure/latency simulation. | `.agents/agents/frontend.md` | Local opt-in only; no env secrets or committed config. |
| Done | Add mutation failure recovery. | `.agents/agents/frontend.md` | Delete is optimistic and rolls back on failure with a visible action error. |
| Done | Preserve form values and server details on failure. | `.agents/agents/frontend.md` | Form remains mounted; simulated save failures expose API-style details. |
| Done | Refine responsive/focus/disabled states. | `.agents/agents/frontend.md` | Added local controls, recoverable detail action, and disabled retry states without redesigning the UI. |
| Done | Add focused reliability tests. | `.agents/agents/frontend.md` | Covers simulation controls, retry decisions, simulated API details, and delete rollback inputs. |
| Done with concern | Run verification. | Main thread + verifier subagent | Web tests and typecheck pass; build is blocked by sandboxed Turbopack process/port permissions and escalation is currently unavailable. |

## Subagent Loop

Wave 4 must use:

1. One implementation subagent scoped to reliability/polish files and this wave
   file.
2. One verification subagent scoped to changed files, reliability gates, and
   command evidence.

Do not run parallel implementation agents against the same frontend state
surface. The simulation, mutation state, and table/form behavior are coupled.

## Verification Plan

Before Wave 4 is complete:

- [x] Relevant frontend requirement files were read.
- [x] Failure simulation is opt-in/local and can be disabled.
- [x] List failure path has retry and preserves session.
- [x] Detail failure path shows a recoverable error.
- [x] Create/edit failure path keeps the form recoverable.
- [x] Delete failure path restores or refreshes state and shows an error.
- [x] Auth failure still clears session.
- [x] Responsive layout remains usable on narrow and desktop widths.
- [x] Focus, disabled, loading, validation, and error states remain visible.
- [x] Focused tests or smoke evidence cover failure simulation and recovery.
- [x] `rtk bun --filter @care-desk/web test` passes.
- [x] `rtk bun --filter @care-desk/web typecheck` passes.
- [x] `rtk bun --filter @care-desk/web build` passes or an environment blocker
  is documented.
- [x] No real credentials, real patient data, `.env*` contents, or production
  mutations are introduced.

Auth-failure behavior was left on the existing Wave 3 path: `401` responses
still flow through `ApiAuthError`, invoke `handleAuthFailure`, clear stored
session state, and return the user to login.

## Verification Evidence

- `rtk bun --filter @care-desk/web test`: passed, 19 tests across 6 files,
  51 assertions.
- `rtk bun --filter @care-desk/web typecheck`: passed.
- `rtk bun --filter @care-desk/api typecheck`: passed.
- `rtk bun --filter @care-desk/web build`: failed in the sandbox because
  Turbopack tried to create a process and bind a port while processing
  `apps/web/app/globals.css`; the OS returned `Operation not permitted`.
- Escalated build rerun is currently unavailable in this session, so build
  remains unverified after Wave 4. Wave 3's production build passed before
  these reliability changes.

## Exit Criteria

Wave 4 is complete when the normal frontend workflow still passes verification
and at least one simulated failure path proves visible recovery plus rollback or
refresh-backed correction.

## Intentional Non-Goals

- No production observability stack.
- No full browser automation matrix.
- No deployment or cloud mutation.
- No new patient-domain features beyond reliability behavior.
