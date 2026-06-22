# Wave 6: Optional Stretch

## Decision

Wave 6 evaluates optional stretch work after the core delivery is stable. It is
not a mandate to add risky scope. A stretch is only worth doing if it improves
reviewability without weakening the verified auth, patient API, frontend, and
documentation slice.

Given the current state, the default posture is conservative: preserve the
verified core, document the stretch backlog, and only implement a tiny safe
addition if it does not require production infrastructure, secrets, cloud
mutation, database migration, or new broad test surfaces.

## Implementation Status

Status: Complete as a docs-only optional-stretch decision.

Wave 6 did not implement optional infrastructure or broaden the app. The
decision is to defer Docker/cloud/PostgreSQL/Prisma/audit/rate limiting/browser
E2E work to explicit backlog items because the core slice is already the
review target, and the Wave 4 build still needs a non-sandbox rerun before
submission.

No production deployment, cloud mutation, Docker mutation, database migration,
production configuration, secrets, or real patient data were introduced.

## Source Alignment

| Source | Applied here |
|---|---|
| `docs/roadmap.md` | Phase 6: Docker Compose, cloud hosting, audit log, rate limiting, richer UI polish after phases 1-5 are stable and verified. |
| `docs/challenge-resolution.md` | Optional work should not threaten the small production-shaped slice. |
| `docs/requirements/docker-compose.md` | Docker Compose is a bonus, not core delivery. |
| `docs/requirements/cloud-hosting.md` | Cloud hosting is optional and should not happen before local proof is stable. |
| `.agents/checklists/implementation-gates.md` | High-risk production/cloud/data changes require explicit approval. |

## Candidate Stretch Assessment

| Candidate | Status | Risk | Decision and reason |
|---|---|---:|---|
| Docker Compose | Deferred | Medium | Defer unless local setup becomes a reviewer blocker; current deterministic in-memory storage makes Compose less useful until PostgreSQL is implemented. |
| Cloud hosting | Deferred | High | Defer; hosting is optional, requires deployment/secrets/config decisions, and should not precede refreshed local build proof. |
| PostgreSQL/Prisma | Deferred | Medium/High | Defer to a dedicated persistence hardening wave; Prisma 7 requires config, generated-client output, driver adapter, migration, seed, error-mapping, and parity-test work. |
| Audit log / soft delete | Deferred | Medium | Defer; this changes patient lifecycle semantics, data model, and UI behavior beyond the verified CRUD slice. |
| Rate limiting | Deferred | Medium | Defer; limits are deployment-profile dependent and not required to prove local auth/RBAC/API correctness. |
| Browser E2E matrix | Deferred | Medium | Defer until the Wave 4 build is rerun outside the sandbox and Playwright/device coverage can be added deliberately. |
| Small delivery polish | Done | Low | Completed as documentation-only clarity: Wave 6 now records the defer decision, verification status, and backlog without changing app behavior. |

## Work Items

| Status | Task | Owner artifact | Notes |
|---|---|---|---|
| Done | Evaluate optional stretch candidates. | Wave 6 worker | Each candidate was assessed against roadmap, challenge resolution, requirement inventory, and implementation gates. |
| Done | Update docs with stretch decision. | Wave 6 worker | This file records the auditable decision; README and roadmap already describe the same cuts. |
| Done | Verify no risky mutation was introduced. | Wave 6 worker | Documentation-only change; no app code, deployment, Docker, cloud, or database behavior changed. |

## Verification Checklist

- [x] Optional stretch candidates were evaluated.
- [x] Any deferral is explicit and tied to risk or current delivery value.
- [x] No cloud deployment, production secrets, production config, or destructive
  database work was introduced.
- [x] No Docker mutation, production config, database migration, or app behavior
  change was introduced.
- [x] Documentation sanity checks are the relevant verification path.
- [x] Code tests/typechecks are not required for this Wave 6 docs-only decision.
- [x] Wave 4 build remains a known follow-up: rerun `bun run build` outside the
  sandbox before submission.

## Optional Stretch Backlog

| Next step | Trigger | Scope guard |
|---|---|---|
| Rerun Wave 4 build outside the sandbox. | Before submission or before adding browser E2E. | Capture build result without changing production config. |
| Add PostgreSQL/Prisma persistence hardening. | After build/test proof is refreshed. | Dedicated wave with Prisma 7 config, migrations, seeds, repository parity tests, and documented rollback plan. |
| Add minimal Docker Compose. | When PostgreSQL is adopted or reviewer setup needs reproducible dependencies. | Local-only Compose with placeholders, no committed secrets, no obsolete top-level `version`. |
| Add browser E2E coverage. | After local build proof is current. | Cover admin/user happy paths and responsive breakpoints; avoid broad device matrix creep. |
| Add audit log or soft delete. | When lifecycle/compliance semantics become in scope. | Define event model, retention behavior, UI semantics, and tests before implementation. |
| Add rate limiting. | When deployment target and traffic profile are known. | Configure per environment; do not hard-code production assumptions. |
| Add cloud hosting. | After local run, tests, build, and secret/config strategy are stable. | Requires explicit approval before deployment or cloud mutation. |

## Exit Criteria

Wave 6 is complete: optional stretch scope is explicitly deferred with a
defensible next-step backlog, and the core delivery remains the stable review
target.

## Intentional Non-Goals

- No production deployment.
- No real secrets or `.env*` contents.
- No cloud mutation.
- No database migration without a dedicated persistence wave.
- No Docker mutation.
- No change to runtime app behavior.
